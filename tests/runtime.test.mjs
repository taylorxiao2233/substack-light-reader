import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../src/runtime.js', import.meta.url), 'utf8');
const context = vm.createContext({ URL });
vm.runInContext(source, context);
const runtime = context.SubstackLightReader;
const surfaceSelector = '.main.use-theme-bg, .single-post-container';

class Events {
  listeners = new Map();
  addEventListener(name, listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set());
    this.listeners.get(name).add(listener);
  }
  removeEventListener(name, listener) { this.listeners.get(name)?.delete(listener); }
  emit(name) { for (const listener of this.listeners.get(name) || []) listener(); }
  get listenerCount() { return [...this.listeners.values()].reduce((sum, listeners) => sum + listeners.size, 0); }
}

class Clock {
  time = 0;
  nextId = 1;
  tasks = new Map();
  setTimeout = (callback, delay) => this.add(callback, delay, false);
  setInterval = (callback, delay) => this.add(callback, delay, true);
  clearTimeout = (id) => this.tasks.delete(id);
  clearInterval = (id) => this.tasks.delete(id);
  add(callback, delay, repeat) {
    const id = this.nextId++;
    this.tasks.set(id, { callback, due: this.time + delay, delay, repeat });
    return id;
  }
  advance(ms) {
    const deadline = this.time + ms;
    while (true) {
      const next = [...this.tasks.entries()].filter(([, task]) => task.due <= deadline).sort((a, b) => a[1].due - b[1].due)[0];
      if (!next) break;
      const [id, task] = next;
      this.time = task.due;
      if (task.repeat) task.due += task.delay;
      else this.tasks.delete(id);
      task.callback();
    }
    this.time = deadline;
  }
}

class Element {
  attrs = new Map();
  style = { backgroundColor: 'rgba(0, 0, 0, 0)', backgroundImage: 'none' };
  vars = {};
  parentElement = null;
  isSurface = false;
  constructor(tagName, parent = null) { this.tagName = tagName.toUpperCase(); this.parentElement = parent; }
  getAttribute(name) { return this.attrs.get(name) ?? null; }
  setAttribute(name, value) { this.attrs.set(name, String(value)); }
  removeAttribute(name) { this.attrs.delete(name); }
  matches(selector) { return selector === surfaceSelector && this.isSurface; }
  querySelector() { return null; }
  closest(selector) {
    for (let node = this; node; node = node.parentElement) if (node.tagName.toLowerCase() === selector) return node;
    return null;
  }
}

function fixture({ host = 'example.substack.com', background = 'rgb(15, 16, 17)', theme = true, cdn = true, platform = false, surface = true, enabled = true } = {}) {
  const document = new Events();
  const window = new Events();
  const clock = new Clock();
  const location = new URL(`https://${host}/p/example`);
  const html = new Element('html');
  const head = new Element('head', html);
  const body = new Element('body', html);
  const main = new Element('main', body);
  main.isSurface = true;
  main.style.backgroundColor = background;
  if (theme) main.vars = { '--web_bg_color': '#111111', '--print_on_web_bg_color': '#eeeeee' };
  const resource = new Element('script');
  resource.setAttribute('src', 'https://substackcdn.com/bundle.js');
  const link = new Element('a');
  link.setAttribute('href', 'https://substack.com/app');
  Object.assign(document, { documentElement: html, head, body, defaultView: window, baseURI: location.href, readyState: 'complete', surface: surface ? main : null });
  document.querySelector = (selector) => selector === surfaceSelector ? document.surface : null;
  document.querySelectorAll = (selector) => selector.includes('substackcdn.com') ? (cdn ? [resource] : []) : (platform ? [link] : []);
  let styleReads = 0;
  window.getComputedStyle = (element) => {
    styleReads += 1;
    return {
      ...element.style,
      backgroundColor: html.getAttribute(runtime.ROOT_ATTRIBUTE) && element.isSurface ? '#fbfaf7' : element.style.backgroundColor,
      getPropertyValue: (name) => element.vars[name] || ''
    };
  };
  const observers = [];
  window.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe(_target, options) { this.connected = true; this.options = options; }
    disconnect() { this.connected = false; }
    emit(records) { if (this.connected) this.callback(records); }
  };
  Object.assign(window, { setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout, setInterval: clock.setInterval, clearInterval: clock.clearInterval });
  const controller = runtime.createController({ document, location, window, enabled });
  return {
    document, window, clock, location, html, head, body, main, resource, observers, controller,
    mutate(records) { observers.at(-1)?.emit(records); clock.advance(60); },
    styleReads: () => styleReads
  };
}

test('route guard rejects non-publication hosts, management and payment routes', () => {
  const excluded = [
    'https://substack.com/', 'https://www.substack.com/p/example', 'https://support.substack.com/hc/en-us',
    'https://on.substack.com/p/news', 'https://foo.api.substack.com/', 'https://pages.substack.com/',
    'https://example.substack.com/dashboard', 'https://example.substack.com/publish/post/1',
    'https://letters.example.com/settings/account', 'https://example.substack.com/checkout?plan=yearly',
    'https://example.substack.com/subscribe', 'https://example.substack.com/sign-in',
    'https://example.substack.com/p/example/edit', 'https://example.substack.com/p/example/preview',
    'https://example.substack.com/%64ashboard', 'https://example.substack.com/%zz',
    'http://example.substack.com/p/example', 'file:///article.html'
  ];
  for (const url of excluded) assert.equal(runtime.isAllowedLocation(url), false, url);
  for (const url of ['https://example.substack.com/', 'https://example.substack.com/p/dashboard-of-life', 'https://letters.example.com/archive']) {
    assert.equal(runtime.isAllowedLocation(url), true, url);
  }
});

test('dark ordinary blogs do not qualify from color or a Substack link alone', () => {
  for (const setup of [
    { host: 'ordinary.example', theme: false, cdn: false, platform: true },
    { host: 'ordinary.example', theme: true, cdn: false, platform: false },
    { host: 'ordinary.example', theme: false, cdn: true },
    { host: 'ordinary.example', surface: false }
  ]) {
    const f = fixture(setup);
    f.controller.start();
    assert.equal(f.controller.getStatus().applied, false);
    assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
    f.controller.stop();
  }
});

test('a custom-domain publication requires independent platform evidence and a native theme', () => {
  const f = fixture({ host: 'letters.example.com' });
  f.controller.start();
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), 'letters.example.com');
  assert.equal(f.controller.getStatus().state, 'dark');
  f.controller.stop();
});

test('lookalike CDN domains cannot serve as platform evidence', () => {
  const f = fixture({ host: 'ordinary.example' });
  f.resource.setAttribute('src', 'https://substackcdn.com.attacker.example/bundle.js');
  f.controller.start();
  assert.equal(f.controller.getStatus().applied, false);
  f.controller.stop();
});

test('light publications stay intact, including after startup retries', () => {
  const f = fixture({ background: '#fafafa' });
  f.controller.start();
  f.clock.advance(11000);
  assert.equal(f.controller.getStatus().state, 'light');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  f.controller.stop();
});

test('loading documents can acquire their publication surface later', () => {
  const f = fixture({ surface: false });
  f.document.readyState = 'loading';
  f.controller.start();
  assert.equal(f.controller.getStatus().state, 'pending');
  f.document.surface = f.main;
  f.document.readyState = 'interactive';
  f.document.emit('DOMContentLoaded');
  f.clock.advance(60);
  assert.equal(f.controller.getStatus().applied, true);
  f.controller.stop();
});

test('a late dark theme is detected instead of caching an initial light verdict', () => {
  const f = fixture({ background: '#fff' });
  f.controller.start();
  f.clock.advance(11000);
  f.main.style.backgroundColor = 'rgb(16 16 16)';
  f.mutate([{ type: 'attributes', target: f.main, attributeName: 'style' }]);
  assert.equal(f.controller.getStatus().applied, true);
  f.controller.stop();
});

test('applying our light CSS never makes the controller misclassify its original theme', () => {
  const f = fixture();
  f.controller.start();
  f.mutate([{ type: 'attributes', target: f.html, attributeName: 'style' }]);
  f.clock.advance(11000);
  assert.equal(f.controller.getStatus().applied, true);
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), f.location.hostname);
  assert.equal(f.observers[0].options.attributeFilter.includes(runtime.ROOT_ATTRIBUTE), false);
  f.controller.stop();
});

test('pushState-style navigation to a settings route restores the native theme without any DOM mutation', () => {
  const f = fixture();
  f.controller.start();
  f.location.pathname = '/settings';
  f.clock.advance(500);
  assert.equal(f.controller.getStatus().state, 'unsupported');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  f.location.pathname = '/p/example';
  f.clock.advance(500);
  assert.equal(f.controller.getStatus().applied, true);
  f.controller.stop();
});

test('SPA replacement with a light reading surface drops the previous dark verdict', () => {
  const f = fixture();
  f.controller.start();
  const next = new Element('main', f.body);
  next.isSurface = true;
  next.vars = f.main.vars;
  next.style.backgroundColor = '#ffffff';
  f.document.surface = next;
  f.location.pathname = '/p/new-article';
  f.mutate([{ type: 'childList', target: f.body, addedNodes: [next], removedNodes: [f.main] }]);
  assert.equal(f.controller.getStatus().state, 'light');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  f.controller.stop();
});

test('SPA navigation can reuse a surface and install a light theme after the URL changes', () => {
  const f = fixture();
  f.controller.start();
  f.location.pathname = '/p/next-article';
  f.clock.advance(500);
  assert.equal(f.controller.getStatus().applied, true);
  f.main.style.backgroundColor = '#ffffff';
  f.mutate([{ type: 'attributes', target: f.main, attributeName: 'style' }]);
  assert.equal(f.controller.getStatus().state, 'light');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  f.controller.stop();
});

test('a native theme change on the same URL invalidates the remembered dark verdict', () => {
  const f = fixture();
  f.controller.start();
  f.main.style.backgroundColor = '#ffffff';
  f.mutate([{ type: 'attributes', target: f.html, attributeName: 'class' }]);
  assert.equal(f.controller.getStatus().state, 'light');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  f.main.style.backgroundColor = '#161616';
  f.mutate([{ type: 'attributes', target: f.html, attributeName: 'class' }]);
  assert.equal(f.controller.getStatus().applied, true);
  f.controller.stop();
});

test('disabling through the entrypoint removes the theme and all runtime observation', () => {
  const f = fixture();
  f.controller.start();
  f.controller.setEnabled(false);
  assert.equal(f.controller.getStatus().state, 'disabled');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  assert.equal(f.observers[0].connected, false);
  assert.equal(f.clock.tasks.size, 0);
  assert.equal(f.document.listenerCount + f.window.listenerCount, 0);
  f.controller.setEnabled(true);
  assert.equal(f.controller.getStatus().applied, true);
  assert.equal(f.observers.filter((observer) => observer.connected).length, 1);
  f.controller.stop();
  assert.equal(f.clock.tasks.size, 0);
  assert.equal(f.document.listenerCount + f.window.listenerCount, 0);
});

test('an initially disabled preference never flashes the light theme or starts observers', () => {
  const f = fixture({ enabled: false });
  f.controller.start();
  assert.equal(f.controller.getStatus().state, 'disabled');
  assert.equal(f.html.getAttribute(runtime.ROOT_ATTRIBUTE), null);
  assert.equal(f.observers.length, 0);
  assert.equal(f.clock.tasks.size, 0);
  f.controller.stop();
});

test('steady-state URL checks and unrelated subtree mutations do not repeatedly scan styles', () => {
  const f = fixture({ background: '#fff' });
  f.controller.start();
  f.clock.advance(11000);
  const reads = f.styleReads();
  const paragraph = new Element('p', f.main);
  for (let index = 0; index < 100; index += 1) {
    f.mutate([{ type: 'childList', target: paragraph, addedNodes: [new Element('span', paragraph)], removedNodes: [] }]);
  }
  f.clock.advance(60000);
  assert.equal(f.styleReads(), reads);
  f.controller.stop();
});

test('transparent backgrounds composite with their ancestors rather than being mistaken for black', () => {
  const f = fixture({ background: 'rgba(0, 0, 0, 0)' });
  f.body.style.backgroundColor = '#ffffff';
  f.controller.start();
  assert.equal(f.controller.getStatus().state, 'light');
  f.body.style.backgroundColor = 'rgb(10 10 10)';
  f.mutate([{ type: 'attributes', target: f.body, attributeName: 'style' }]);
  assert.equal(f.controller.getStatus().applied, true);
  f.controller.stop();
});

test('nearly transparent black does not override the white background underneath', () => {
  const f = fixture({ background: 'rgb(0 0 0 / 2%)' });
  f.body.style.backgroundColor = '#fff';
  f.controller.start();
  assert.equal(f.controller.getStatus().state, 'light');
  f.controller.stop();
});

test('wide-gamut dark colors work while unknown image backgrounds are conservatively skipped', () => {
  const f = fixture({ background: 'color(display-p3 0.06 0.06 0.06 / 1)' });
  f.controller.start();
  assert.equal(f.controller.getStatus().applied, true);
  f.controller.stop();
  f.main.style.backgroundImage = 'linear-gradient(white, black)';
  f.controller.start();
  assert.equal(f.controller.getStatus().applied, false);
  assert.equal(f.controller.getStatus().reason, 'unknown-background');
  f.controller.stop();
});

test('color parser supports computed CSS colors and rejects invalid values', () => {
  assert.deepEqual(Array.from(runtime.parseColor('rgb(100% 0% 0% / 50%)')), [255, 0, 0, 0.5]);
  assert.deepEqual(Array.from(runtime.parseColor('#0000')), [0, 0, 0, 0]);
  assert.deepEqual(Array.from(runtime.parseColor('color(srgb 1 1 1)')), [255, 255, 255, 1]);
  const p3 = runtime.parseColor('color(display-p3 1 1 1)');
  assert.ok(runtime.luminance(p3) > 0.99);
  for (const value of ['var(--background)', 'rgb(bad)', 'rgb(1 2)', '', null]) assert.equal(runtime.parseColor(value), null);
});
