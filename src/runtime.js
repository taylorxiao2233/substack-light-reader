/* Shared, dependency-free runtime for the extension and userscript. */
(() => {
  'use strict';

  const ROOT_ATTRIBUTE = 'data-substack-light';
  const SURFACE_SELECTOR = '.main.use-theme-bg, .single-post-container';
  const RESERVED_SUBDOMAINS = Object.freeze([
    'www', 'support', 'on', 'pages', 'status', 'api', 'app', 'admin', 'cdn',
    'reader', 'go', 'help', 'developers', 'community', 'link', 'links', 'email'
  ]);
  const BLOCKED_PATH_PREFIXES = Object.freeze([
    'dashboard', 'publish', 'publisher', 'editor', 'edit', 'settings', 'account',
    'sign-in', 'signin', 'sign-up', 'signup', 'login', 'logout', 'auth', 'oauth',
    'checkout', 'subscribe', 'payment', 'payments', 'billing', 'api', 'embed',
    'inbox', 'chat', 'welcome', 'confirm', 'unsubscribe', 'verify', 'redirect'
  ]);

  function asURL(value) {
    try { return new URL(typeof value === 'string' ? value : value.href); }
    catch { return null; }
  }

  // This is a route guard, not a permission grant. The entrypoint's host list
  // limits where the runtime is loaded, including custom publication domains.
  function isAllowedLocation(value) {
    const url = asURL(value);
    if (!url || url.protocol !== 'https:') return false;
    const host = url.hostname.toLowerCase();
    if (host === 'substack.com') return false;
    if (host.endsWith('.substack.com')) {
      const prefix = host.slice(0, -'.substack.com'.length);
      if (prefix.includes('.') || RESERVED_SUBDOMAINS.includes(prefix)) return false;
    }
    let segments;
    try { segments = decodeURIComponent(url.pathname).toLowerCase().split('/').filter(Boolean); }
    catch { return false; }
    if (BLOCKED_PATH_PREFIXES.includes(segments[0])) return false;
    // An article route can also open an editor rather than a reading surface.
    if (segments[0] === 'p' && ['edit', 'preview'].includes(segments[2])) return false;
    return true;
  }

  const clamp = (value, max = 1) => Math.min(max, Math.max(0, value));
  const linear = (value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const encoded = (value) => value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055;
  const component = (value, scale) => value.endsWith('%') ? Number(value.slice(0, -1)) * scale / 100 : Number(value);

  // Returns sRGB [r, g, b, alpha], or null for an unsupported color. Keeping
  // alpha lets transparent backgrounds be resolved against their ancestors.
  function parseColor(input) {
    if (typeof input !== 'string') return null;
    const color = input.trim().toLowerCase();
    if (color === 'transparent') return [0, 0, 0, 0];
    if (color === 'white') return [255, 255, 255, 1];
    if (color === 'black') return [0, 0, 0, 1];
    const hex = color.match(/^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/);
    if (hex) {
      let digits = hex[1];
      if (digits.length <= 4) digits = [...digits].map((digit) => digit + digit).join('');
      return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16))
        .concat(digits.length === 8 ? parseInt(digits.slice(6), 16) / 255 : 1);
    }
    const rgb = color.match(/^rgba?\(([^)]+)\)$/);
    const wide = color.match(/^color\((srgb|display-p3)\s+([^)]+)\)$/);
    if (!rgb && !wide) return null;
    const values = (rgb ? rgb[1] : wide[2]).trim().split(/[\s,/]+/);
    if (values.length < 3 || values.length > 4 || values.some((part) => !/^[+-]?(?:\d*\.)?\d+%?$/.test(part))) return null;
    const scale = rgb ? 255 : 1;
    let channels = values.slice(0, 3).map((part) => clamp(component(part, scale), scale) / scale);
    const alpha = values.length === 4 ? clamp(component(values[3], 1)) : 1;
    if (wide?.[1] === 'display-p3') {
      const [r, g, b] = channels.map(linear);
      channels = [
        1.224745 * r - 0.224904 * g - 0.000000 * b,
        -0.042058 * r + 1.042081 * g + 0.000000 * b,
        -0.019642 * r - 0.078655 * g + 1.098537 * b
      ].map((channel) => clamp(encoded(channel)));
    }
    return channels.map((channel) => channel * 255).concat(alpha);
  }

  function luminance(color) {
    const [r, g, b] = color.slice(0, 3).map((value) => linear(value / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function hasExternalHost(document, selector, attributes, testHost) {
    const elements = document.querySelectorAll(selector);
    // Inspect only relevant resource/link attributes, never text or form values.
    for (let index = 0; index < Math.min(elements.length, 40); index += 1) {
      for (const attribute of attributes) {
        const value = elements[index].getAttribute(attribute);
        if (!value) continue;
        try { if (testHost(new URL(value, document.baseURI).hostname)) return true; }
        catch { /* A malformed resource is not a platform signal. */ }
      }
    }
    return false;
  }

  function classifyDocument({ document, location, getComputedStyle = globalThis.getComputedStyle }) {
    if (!isAllowedLocation(location)) return { isPublication: false, reason: 'excluded-route', surface: null };
    const surface = document.querySelector(SURFACE_SELECTOR);
    if (!surface) return { isPublication: false, reason: 'missing-publication-surface', surface: null };
    const styles = [surface, document.documentElement].filter(Boolean).map((element) => getComputedStyle(element));
    const theme = styles.some((style) => [
      '--web_bg_color', '--print_on_web_bg_color', '--cover_bg_color'
    ].filter((name) => Boolean(style.getPropertyValue(name).trim())).length >= 2);
    const cdn = hasExternalHost(document,
      'script[src*="substackcdn.com"], link[href*="substackcdn.com"], img[src*="substackcdn.com"]',
      ['src', 'href'], (host) => host === 'substackcdn.com' || host.endsWith('.substackcdn.com'));
    const generator = /\bsubstack\b/i.test(document.querySelector('meta[name="generator"]')?.getAttribute('content') || '');
    const platform = hasExternalHost(document,
      'a[href*="substack.com"]', ['href'], (host) => host === 'substack.com' || host.endsWith('.substack.com'));
    const standardHost = asURL(location).hostname.endsWith('.substack.com');
    const isPublication = standardHost ? (theme || cdn || generator) : (theme && (cdn || generator || platform));
    return {
      isPublication,
      reason: isPublication ? 'publication' : 'insufficient-platform-signals',
      surface,
      signals: { standardHost, theme, cdn, generator, platform }
    };
  }

  function detectDarkness(surface, getComputedStyle) {
    const layers = [];
    for (let element = surface, depth = 0; element && depth < 24; element = element.parentElement, depth += 1) {
      const style = getComputedStyle(element);
      // A picture or gradient can determine the apparent surface color. Avoid
      // claiming a solid-color reading theme when its brightness is unknown.
      if (style.backgroundImage && style.backgroundImage !== 'none') return null;
      const color = parseColor(style.backgroundColor);
      if (color) {
        layers.push(color);
        if (color[3] >= 0.999) break;
      }
    }
    if (!layers.length) return null;
    let resolved = [255, 255, 255];
    for (const layer of layers.reverse()) {
      resolved = resolved.map((channel, index) => layer[index] * layer[3] + channel * (1 - layer[3]));
    }
    return luminance(resolved) < 0.32;
  }

  function createController(options = {}) {
    const document = options.document || globalThis.document;
    const location = options.location || globalThis.location;
    const window = options.window || document.defaultView || globalThis;
    const getComputedStyle = options.getComputedStyle || window.getComputedStyle.bind(window);
    const Observer = options.MutationObserver || window.MutationObserver;
    const scheduleTimeout = options.setTimeout || window.setTimeout.bind(window);
    const cancelTimeout = options.clearTimeout || window.clearTimeout.bind(window);
    const scheduleInterval = options.setInterval || window.setInterval.bind(window);
    const cancelInterval = options.clearInterval || window.clearInterval.bind(window);
    let enabled = options.enabled !== false;
    let started = false;
    let observer = null;
    let urlTimer = null;
    let queuedEvaluation = null;
    let loadingTimers = [];
    let rememberedSurface = null;
    let rememberedURL = '';
    let applied = false;
    let verdictStale = false;
    let state = 'stopped';
    let reason = 'not-started';
    const urlKey = () => {
      const url = asURL(location);
      return url ? url.origin + url.pathname + url.search : '';
    };

    function removeTheme() {
      document.documentElement?.removeAttribute(ROOT_ATTRIBUTE);
      applied = false;
    }

    function evaluate() {
      if (!started || !enabled) return;
      const currentURL = urlKey();
      if (!isAllowedLocation(location)) {
        removeTheme();
        rememberedSurface = null;
        rememberedURL = currentURL;
        state = 'unsupported';
        reason = 'excluded-route';
        return;
      }
      const currentSurface = document.querySelector(SURFACE_SELECTOR);
      if (currentURL !== rememberedURL || currentSurface !== rememberedSurface) {
        removeTheme();
        rememberedURL = currentURL;
        rememberedSurface = currentSurface;
      }
      if (verdictStale) {
        // A SPA can keep the same element and change its native theme later.
        // Remove our override before sampling the underlying page again.
        removeTheme();
        verdictStale = false;
      }
      // Our CSS changes the computed background. Keep the original verdict
      // until navigation replaces the reading surface or changes the URL.
      if (applied && document.documentElement.getAttribute(ROOT_ATTRIBUTE) === location.hostname) return;
      const classification = classifyDocument({ document, location, getComputedStyle });
      if (!classification.isPublication) {
        removeTheme();
        state = document.readyState === 'loading' ? 'pending' : 'unsupported';
        reason = classification.reason;
        return;
      }
      const dark = detectDarkness(classification.surface, getComputedStyle);
      if (dark === true) {
        document.documentElement.setAttribute(ROOT_ATTRIBUTE, location.hostname);
        applied = true;
        state = 'dark';
        reason = 'dark-publication';
      } else {
        removeTheme();
        state = dark === null ? 'pending' : 'light';
        reason = dark === null ? 'unknown-background' : 'already-light';
      }
    }

    function queueEvaluation() {
      if (!started || !enabled || queuedEvaluation !== null) return;
      queuedEvaluation = scheduleTimeout(() => {
        queuedEvaluation = null;
        evaluate();
      }, 60);
    }

    function onMutations(records) {
      if (urlKey() !== rememberedURL) { queueEvaluation(); return; }
      for (const record of records) {
        const target = record.target;
        if (record.type === 'attributes') {
          if (target === document.documentElement || target === document.body || target === rememberedSurface || target.matches?.(SURFACE_SELECTOR)) {
            verdictStale = true;
            queueEvaluation();
            return;
          }
        } else if (target === document.documentElement || target === document.head || target === document.body || target.closest?.('head')) {
          verdictStale = true;
          queueEvaluation();
          return;
        } else {
          for (const node of [...(record.addedNodes || []), ...(record.removedNodes || [])]) {
            if (node === rememberedSurface || node.matches?.(SURFACE_SELECTOR) || node.querySelector?.(SURFACE_SELECTOR)) {
              verdictStale = true;
              queueEvaluation();
              return;
            }
          }
        }
      }
    }

    function attach() {
      if (observer) return;
      observer = new Observer(onMutations);
      // Attribute filters intentionally exclude our own marker, preventing a
      // mutation loop. Text changes, typing, and hover states are not observed.
      observer.observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
      document.addEventListener('DOMContentLoaded', queueEvaluation);
      document.addEventListener('load', queueEvaluation, true); // Includes late stylesheet loads.
      window.addEventListener('pageshow', queueEvaluation);
      window.addEventListener('popstate', queueEvaluation);
      window.addEventListener('hashchange', queueEvaluation);
      // pushState in the page's JS world cannot reliably be patched by an
      // isolated content script. This timer only compares the URL; it does not
      // inspect the page unless it changes, and is removed while disabled.
      urlTimer = scheduleInterval(() => { if (urlKey() !== rememberedURL) evaluate(); }, 500);
      loadingTimers = [100, 500, 1500, 4000, 10000].map((delay) => scheduleTimeout(queueEvaluation, delay));
    }

    function detach() {
      observer?.disconnect();
      observer = null;
      if (urlTimer !== null) cancelInterval(urlTimer);
      if (queuedEvaluation !== null) cancelTimeout(queuedEvaluation);
      urlTimer = null;
      queuedEvaluation = null;
      loadingTimers.forEach(cancelTimeout);
      loadingTimers = [];
      document.removeEventListener('DOMContentLoaded', queueEvaluation);
      document.removeEventListener('load', queueEvaluation, true);
      window.removeEventListener('pageshow', queueEvaluation);
      window.removeEventListener('popstate', queueEvaluation);
      window.removeEventListener('hashchange', queueEvaluation);
    }

    function getStatus() {
      return { enabled, applied, state, reason, hostname: location.hostname };
    }

    function start() {
      if (started) return getStatus();
      started = true;
      if (enabled) { attach(); evaluate(); }
      else { removeTheme(); state = 'disabled'; reason = 'user-disabled'; }
      return getStatus();
    }

    function setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) {
        detach();
        removeTheme();
        rememberedSurface = null;
        state = started ? 'disabled' : 'stopped';
        reason = 'user-disabled';
      } else if (started) { attach(); evaluate(); }
      return getStatus();
    }

    function stop() {
      started = false;
      detach();
      removeTheme();
      rememberedSurface = null;
      rememberedURL = '';
      verdictStale = false;
      state = 'stopped';
      reason = 'stopped';
      return getStatus();
    }

    return Object.freeze({ start, setEnabled, getStatus, stop });
  }

  globalThis.SubstackLightReader = Object.freeze({
    ROOT_ATTRIBUTE, RESERVED_SUBDOMAINS, BLOCKED_PATH_PREFIXES,
    createController, isAllowedLocation, classifyDocument, parseColor, luminance
  });
})();
