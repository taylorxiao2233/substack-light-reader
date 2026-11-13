// Simulated publication URL for this local, self-authored fixture only.
const fixtureLocation = { href: 'https://artandbiz.substack.com/p/local-fixture', hostname: 'artandbiz.substack.com' };
const controller = SubstackLightReader.createController({ document, location: fixtureLocation, window });
controller.start();

function inspect() {
  const colors = Object.fromEntries(['tip', 'name', 'muted', 'menu-text', 'hover-text'].map(id => {
    const element = document.getElementById(id);
    return [id, { color: getComputedStyle(element).color, parentBackground: getComputedStyle(element.parentElement).backgroundColor }];
  }));
  const live = document.getElementById('late-tip');
  if (live) colors.late = { color: getComputedStyle(live).color, parentBackground: getComputedStyle(live.parentElement).backgroundColor };
  document.getElementById('status').textContent = JSON.stringify({ ...controller.getStatus(), colors, outlineFill: getComputedStyle(document.getElementById('outline')).fill }, null, 2);
}
document.getElementById('check').onclick = inspect;
document.getElementById('toggle').onclick = () => { controller.setEnabled(!controller.getStatus().enabled); inspect(); };
document.getElementById('route').onclick = () => {
  fixtureLocation.href = fixtureLocation.href.includes('/dashboard') ? 'https://artandbiz.substack.com/p/local-fixture' : 'https://artandbiz.substack.com/dashboard';
  // Exercise the real runtime's navigation listener without accessing a live account.
  window.dispatchEvent(new Event('popstate'));
  setTimeout(inspect, 90);
};
document.getElementById('late').onclick = () => {
  if (document.getElementById('late-tip')) return;
  const portal = document.createElement('div');
  portal.setAttribute('data-radix-popper-content-wrapper', '');
  portal.innerHTML = '<div class="dark-theme"><div class="elevatedTheme-fixture"><div class="bg-primary-fixture panel"><span id="late-tip" class="color-primary-fixture">Late tooltip</span></div></div></div>';
  document.getElementById('cards').appendChild(portal);
  inspect();
};
inspect();
