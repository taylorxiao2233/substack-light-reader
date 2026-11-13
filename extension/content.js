(() => {
  'use strict';
  const controller = globalThis.SubstackLightReader.createController({
    document, location, window, enabled: false
  });
  controller.start();
  let changeCount = 0;

  chrome.storage.local.get({ enabled: true }).then(({ enabled }) => {
    if (changeCount === 0) controller.setEnabled(enabled !== false);
  }).catch(() => {
    // Fail closed if Chrome cannot read the user's saved choice.
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) {
      changeCount++;
      controller.setEnabled(changes.enabled.newValue !== false);
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'slr:set-enabled') {
      changeCount++;
      controller.setEnabled(message.enabled === true);
      sendResponse(controller.getStatus());
    } else if (message?.type === 'slr:get-status') {
      sendResponse(controller.getStatus());
    }
  });
})();
