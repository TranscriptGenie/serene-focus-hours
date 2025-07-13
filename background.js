
// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Deep Focus extension installed');
});

// Handle alarms for timer persistence
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusTimer') {
    // Timer tick - could be used for notifications or other background tasks
    console.log('Focus timer tick');
  }
});

// Handle storage changes to sync between popup instances
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.timerState) {
    // Timer state changed - could trigger notifications or badge updates
    const newState = changes.timerState.newValue;
    if (newState && newState.isRunning) {
      // Timer is running - could set badge or create alarm
      chrome.action.setBadgeText({ text: '●' });
      chrome.action.setBadgeBackgroundColor({ color: '#4C8066' });
    } else {
      // Timer stopped
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

// Optional: Handle tab updates to persist timer across browser sessions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Could be used to maintain timer state across tab changes
});
