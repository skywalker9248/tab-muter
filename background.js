chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'MUTE_TAB') {
    const { tabId, duration } = msg;
    const endTime = Date.now() + duration * 1000;
    chrome.tabs.update(tabId, { muted: true });
    chrome.storage.session.set({ [`mute_${tabId}`]: endTime });
    // alarms require delayInMinutes; use minimum 1/60 min (~1s) floor
    chrome.alarms.create(`unmute_${tabId}`, { delayInMinutes: duration / 60 });
    sendResponse({ success: true, endTime });

  } else if (msg.type === 'UNMUTE_TAB') {
    const { tabId } = msg;
    chrome.tabs.update(tabId, { muted: false });
    chrome.storage.session.remove(`mute_${tabId}`);
    chrome.alarms.clear(`unmute_${tabId}`);
    sendResponse({ success: true });

  } else if (msg.type === 'GET_STATE') {
    const { tabId } = msg;
    chrome.storage.session.get(`mute_${tabId}`, (result) => {
      sendResponse({ endTime: result[`mute_${tabId}`] ?? null });
    });
    return true; // keep channel open for async response
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('unmute_')) return;
  const tabId = parseInt(alarm.name.replace('unmute_', ''), 10);
  chrome.tabs.update(tabId, { muted: false }).catch(() => {});
  chrome.storage.session.remove(`mute_${tabId}`);
});
