/**
 * Vocab Master - Chrome Extension Service Worker (Background Script)
 * Manifest V3
 */

const API_BASE_URL = 'https://vocab-master-ruddy.vercel.app';
const SELECTED_TEXT_STORAGE_KEY = 'selectedSearchText';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Vocab Master] Extension installed');
  chrome.contextMenus.create({
    id: 'save-word',
    title: '📚 Lưu cụm từ vào Vocab Master',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'save-word') {
    const selectedText = info.selectionText?.trim();
    if (!selectedText) {
      console.warn('No text selected');
      return;
    }

    try {
      await chrome.storage.local.set({ [SELECTED_TEXT_STORAGE_KEY]: selectedText });
      await chrome.action.openPopup();
    } catch (error) {
      console.warn('[Vocab Master] Could not open popup, opening search page instead.', error);
      const searchUrl = `${API_BASE_URL}/search?query=${encodeURIComponent(selectedText)}`;
      chrome.tabs.create({ url: searchUrl });
    }
  }
});

async function sendMessageToTab(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      resolve(response);
    });
  });
}

async function getAppUserId() {
  try {
    const tabs = await chrome.tabs.query({ url: 'https://vocab-master-ruddy.vercel.app/*' });
    for (const tab of tabs) {
      const response = await sendMessageToTab(tab.id, { action: 'getUserId' });
      if (response?.userId) {
        return response.userId;
      }
    }
  } catch (error) {
    console.error('[Vocab Master] Could not sync userId from app tab:', error);
  }
  return null;
}

async function saveWordToDatabase(word, sourceUrl) {
  try {
    const stored = await chrome.storage.local.get('userId');
    let userIdToUse = stored.userId;

    if (!userIdToUse) {
      userIdToUse = await getAppUserId();
    }

    if (!userIdToUse) {
      userIdToUse = 'user_' + Date.now();
    }

    await chrome.storage.local.set({ userId: userIdToUse });

    console.log(`[Vocab Master] Saving word: "${word}" with userId: ${userIdToUse}`);

    const response = await fetch(`${API_BASE_URL}/api/add-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word,
        userId: userIdToUse
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log('[Vocab Master] Word saved successfully:', data);
      await chrome.storage.local.set({
        lastSavedWord: {
          word,
          timestamp: new Date().toISOString(),
          sourceUrl
        }
      });
    } else {
      console.error('[Vocab Master] Error response:', data);
    }
  } catch (error) {
    console.error('[Vocab Master] Error saving word:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveWord') {
    saveWordToDatabase(request.word, sender.url);
    sendResponse({ status: 'success' });
  } else if (request.action === 'requestAppUserId') {
    getAppUserId().then(userId => sendResponse({ userId }));
    return true; // Keep channel open for async response
  }
});
