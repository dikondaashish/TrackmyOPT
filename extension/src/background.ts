// Background service worker for TrackMyOPT
console.log('TrackMyOPT background service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('TrackMyOPT extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  sendResponse({ status: 'ok' });
  return true;
});

