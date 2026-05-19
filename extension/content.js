/**
 * Content Script - Tạo giao diện hỗ trợ người dùng
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getUserId') {
    const userId = localStorage.getItem('userId') || null;
    sendResponse({ userId });
  }
});

console.log('[Vocab Master Content Script] Loaded successfully');
