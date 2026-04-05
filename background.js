chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "performSweep") {
    chrome.storage.local.get(["allowedLinks"], (data) => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.url && !isAllowed(tab.url, data.allowedLinks)) {
            chrome.tabs.remove(tab.id);
          }
        });
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.storage.local.get(["isActive", "allowedLinks"], (data) => {
    if (data.isActive && changeInfo.url && !isAllowed(changeInfo.url, data.allowedLinks)) {
      chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
    }
  });
});

function isAllowed(url, allowedList) {
  if (!url.startsWith('http') || allowedList.length === 0) return true; 
  try {
    const currentOrigin = new URL(url).origin;
    return allowedList.some(link => {
      try { return new URL(link).origin === currentOrigin; }
      catch { return url.includes(link); } // Fallback for partial strings
    });
  } catch { return false; }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "focusTimer") {
    chrome.storage.local.set({ isActive: false });
  }
});