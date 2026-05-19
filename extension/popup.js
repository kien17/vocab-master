const API_BASE_URL = 'http://localhost:3000';
const SELECTED_TEXT_STORAGE_KEY = 'selectedSearchText';

function storageGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
}
function storageSet(items) {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadLastSavedWord();
  loadSelectedTextSearch();

  document.getElementById('searchBtn').addEventListener('click', () => doSearch());
  document.getElementById('searchQuery').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('quickAddBtn').addEventListener('click', () => quickAdd());
  document.getElementById('openAppBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: API_BASE_URL });
  });
  document.getElementById('toggleManualBtn').addEventListener('click', () => {
    const form = document.getElementById('manualForm');
    form.classList.toggle('hidden');
    document.getElementById('toggleManualBtn').textContent =
      form.classList.contains('hidden') ? '+ Thêm thủ công' : '− Ẩn form thủ công';
  });
  document.getElementById('manualSaveBtn').addEventListener('click', () => saveManualWord());
});

async function doSearch() {
  const query = document.getElementById('searchQuery').value.trim();
  if (!query) { showStatus('Nhập từ hoặc cụm từ để tra.', 'error'); return; }
  await searchDictionary(query);
}

async function quickAdd() {
  const query = document.getElementById('searchQuery').value.trim();
  if (!query) { showStatus('Nhập từ trước khi thêm nhanh.', 'error'); return; }
  await saveWord(query);
}

async function searchDictionary(query) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/dictionary?query=${encodeURIComponent(query)}`);
    const data = await resp.json();
    if (!resp.ok) { showStatus(data.error || 'Không thể tìm kiếm.', 'error'); return; }
    renderResults(data.results || []);
  } catch (e) {
    console.error('Search error:', e);
    showStatus('Lỗi khi tìm kiếm. Thử lại.', 'error');
  }
}

function renderResults(results) {
  const container = document.getElementById('searchResults');
  container.innerHTML = '';
  if (!results || results.length === 0) {
    container.innerHTML = '<p style="text-align:center;font-size:12px;color:#9ca3af;padding:16px 0;">Không tìm thấy kết quả.</p>';
    return;
  }

  results.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = htmlForItem(item);
    container.appendChild(card);

    card.querySelector('.btn-save')?.addEventListener('click', () => saveWord(item.word));
    card.querySelectorAll('.btn-audio').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (url) playAudio(url);
      });
    });
  });
}

function htmlForItem(item) {
  const audioHtml = [];
  if (item.audio_us) audioHtml.push(`<button class="btn btn-audio" data-url="${item.audio_us}">🔊 US</button>`);
  if (item.audio_uk) audioHtml.push(`<button class="btn btn-audio" data-url="${item.audio_uk}">🔊 UK</button>`);

  let meaningsHtml = '';
  if (item.meanings && item.meanings.length > 0) {
    meaningsHtml = '<div class="meanings-list">';
    item.meanings.forEach((m) => {
      const cls = m.partOfSpeech === 'short' ? 'pos short' : 'pos';
      meaningsHtml += `<div class="m-item"><span class="${cls}">[${m.partOfSpeech === 'short' ? 'NGHĨA CHÍNH' : m.partOfSpeech}]</span> ${m.definition}</div>`;
    });
    meaningsHtml += '</div>';
  }

  return `
    <div class="word-row">
      <span class="word">${item.word}</span>
      ${item.aiGenerated ? '<span class="badge">AI</span>' : ''}
    </div>
    <div class="phonetic">${item.phonetic || '---'}</div>
    <div class="meaning-main">${item.meaning || ''}</div>
    ${meaningsHtml}
    ${item.example_sentence ? `<div class="example">VD: ${item.example_sentence}</div>` : ''}
    <div class="actions">
      ${audioHtml.join('')}
      <button class="btn btn-save">+ Lưu từ</button>
    </div>
  `;
}

function playAudio(audioUrl) {
  if (!audioUrl) return;
  const urls = audioUrl.split('|').filter(Boolean);
  if (urls.length === 0) return;
  let i = 0;
  const next = () => {
    if (i >= urls.length) return;
    const a = new Audio(urls[i]);
    a.onended = () => { i++; next(); };
    a.onerror = () => { i++; next(); };
    a.play().catch(() => { i++; next(); });
  };
  next();
}

async function getOrCreateUserId() {
  const stored = await storageGet(['userId']);
  if (stored.userId) return stored.userId;

  const resp = await chrome.runtime.sendMessage({ action: 'requestAppUserId' });
  if (resp?.userId) {
    await storageSet({ userId: resp.userId });
    return resp.userId;
  }

  const newId = `user_${Date.now()}`;
  await storageSet({ userId: newId });
  return newId;
}

async function saveWord(word) {
  try {
    const userId = await getOrCreateUserId();
    const resp = await fetch(`${API_BASE_URL}/api/add-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, userId })
    });
    const data = await resp.json();
    if (!resp.ok) { showStatus(data.error || 'Không thể lưu từ.', 'error'); return; }

    const savedAt = new Date().toISOString();
    const ls = { word, timestamp: savedAt };
    await storageSet({ lastSavedWord: ls });
    updateLastSavedWord(ls);
    showStatus(`Đã lưu: ${word}`, 'success');
  } catch (e) {
    console.error('Save error:', e);
    showStatus('Lỗi khi lưu từ.', 'error');
  }
}

async function saveManualWord() {
  const word = document.getElementById('word').value.trim();
  const phonetic = document.getElementById('phonetic').value.trim();
  const meaning = document.getElementById('meaning').value.trim();
  const example = document.getElementById('example').value.trim();

  if (!word || !meaning) { showStatus('Từ và nghĩa là bắt buộc.', 'error'); return; }

  try {
    const userId = await getOrCreateUserId();
    const resp = await fetch(`${API_BASE_URL}/api/vocabulary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word,
        phonetic: phonetic || '',
        meaning,
        example_sentence: example || '',
        cloze_sentence: example ? example.replace(new RegExp(`\\b${word}\\b`, 'gi'), '___') : '',
        userId
      })
    });
    const data = await resp.json();
    if (!resp.ok) { showStatus(data.error || 'Không thể lưu từ.', 'error'); return; }

    document.getElementById('word').value = '';
    document.getElementById('phonetic').value = '';
    document.getElementById('meaning').value = '';
    document.getElementById('example').value = '';

    const savedAt = new Date().toISOString();
    const ls = { word, timestamp: savedAt };
    await storageSet({ lastSavedWord: ls });
    updateLastSavedWord(ls);
    showStatus(`Đã lưu: ${word}`, 'success');
  } catch (e) {
    console.error('Manual save error:', e);
    showStatus('Lỗi khi lưu từ.', 'error');
  }
}

async function loadLastSavedWord() {
  const stored = await storageGet(['lastSavedWord']);
  updateLastSavedWord(stored.lastSavedWord);
}

async function loadSelectedTextSearch() {
  const stored = await storageGet([SELECTED_TEXT_STORAGE_KEY]);
  const text = stored[SELECTED_TEXT_STORAGE_KEY]?.trim();
  if (!text) return;

  chrome.storage.local.remove(SELECTED_TEXT_STORAGE_KEY);
  document.getElementById('searchQuery').value = text;
  await searchDictionary(text);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'searchSelectedText' && request.text) {
    const q = request.text.trim();
    if (q) {
      document.getElementById('searchQuery').value = q;
      searchDictionary(q);
    }
    sendResponse({ status: 'ok' });
  }
});

function updateLastSavedWord(ls) {
  const el = document.getElementById('lastSaved');
  if (!ls) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = `
    <span><span class="word">${ls.word}</span> <span class="time">— ${new Date(ls.timestamp).toLocaleString('vi-VN')}</span></span>
    <span style="font-size:10px;color:#6b7280;cursor:pointer;" id="clearLastSaved">✕</span>
  `;
  document.getElementById('clearLastSaved')?.addEventListener('click', () => {
    storageSet({ lastSavedWord: null });
    el.style.display = 'none';
  });
}

function showStatus(msg, type = 'success') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = `status show ${type}`;
  setTimeout(() => el.classList.remove('show'), 3000);
}
