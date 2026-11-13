(() => {
  'use strict';
  const zh = (chrome.i18n.getUILanguage() || 'en').startsWith('zh');
  const strings = zh ? {
    title: '亮色阅读', label: '开启自动亮色阅读', scope: '此开关对所有支持的阅读页面生效。',
    local: '仅本地处理 · 无追踪', active: '已应用亮色阅读主题。', off: '已关闭，保留网页原始主题。',
    light: '当前页面已是亮色，无需转换。', waiting: '自动转换已开启，正在识别阅读页面。',
    blocked: '此页面不在阅读范围内，不会修改。', refresh: '自动转换已开启，请刷新文章以加载新版。',
    error: '暂时无法读取设置，请关闭后重新打开。'
  } : {
    title: 'Light Reader', label: 'Enable automatic light reading', scope: 'The switch applies to all supported reading pages.',
    local: 'Local-only · no tracking', active: 'Light reading theme applied.', off: 'Off. The original theme is preserved.',
    light: 'This page is already light. No changes needed.', waiting: 'Automatic mode is on. Checking this reading page.',
    blocked: 'This page is outside the reading scope and will not be changed.', refresh: 'Automatic mode is on. Refresh the article to load this version.',
    error: 'Settings could not be read. Please reopen this popup.'
  };
  document.documentElement.lang = zh ? 'zh-CN' : 'en';
  const toggle = document.getElementById('theme-toggle');
  const status = document.getElementById('status');
  document.getElementById('title').textContent = strings.title;
  document.getElementById('scope').textContent = strings.scope;
  document.getElementById('local').textContent = strings.local;
  document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version} · beta`;
  toggle.setAttribute('aria-label', strings.label);
  let activeTab;

  function render(page) {
    if (!toggle.checked) status.textContent = strings.off;
    else if (!page) status.textContent = strings.refresh;
    else if (page.applied) status.textContent = strings.active;
    else if (page.state === 'light') status.textContent = strings.light;
    else if (['unsupported', 'blocked'].includes(page.state)) status.textContent = strings.blocked;
    else status.textContent = strings.waiting;
  }

  async function initialize() {
    const [{ enabled }, tabs] = await Promise.all([
      chrome.storage.local.get({ enabled: true }),
      chrome.tabs.query({ active: true, currentWindow: true })
    ]);
    toggle.checked = enabled !== false;
    activeTab = tabs[0];
    if (!globalThis.SubstackLightReaderSites.isSupportedURL(activeTab?.url) ||
        !globalThis.SubstackLightReader.isAllowedLocation(activeTab?.url)) {
      status.textContent = strings.blocked;
      return;
    }
    toggle.disabled = false;
    const page = await chrome.tabs.sendMessage(activeTab.id, { type: 'slr:get-status' }).catch(() => null);
    render(page);
  }

  toggle.addEventListener('change', async () => {
    toggle.disabled = true;
    const previous = !toggle.checked;
    try {
      await chrome.storage.local.set({ enabled: toggle.checked });
      const page = await chrome.tabs.sendMessage(activeTab.id, { type: 'slr:set-enabled', enabled: toggle.checked }).catch(() => null);
      render(page);
    } catch {
      toggle.checked = previous;
      status.textContent = strings.error;
    } finally { toggle.disabled = false; }
  });
  initialize().catch(() => { status.textContent = strings.error; });
})();
