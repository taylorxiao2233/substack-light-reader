// Executed inside the build's local wrapper; no helper is exposed to the page.
const controller = runtime.createController({ document, location, window, enabled: true });
if (runtime.isAllowedLocation(location.href)) {
  const style = document.createElement('style');
  style.id = 'substack-light-reader-style';
  style.textContent = themeCSS;
  const attach = () => {
    if (!document.documentElement) return;
    if (!document.getElementById(style.id)) document.documentElement.appendChild(style);
    controller.start();
  };
  if (document.documentElement) attach();
  else document.addEventListener('DOMContentLoaded', attach, { once: true });
}
