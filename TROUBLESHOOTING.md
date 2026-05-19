# 🔧 Troubleshooting Guide - Vocab Master

## ❌ Vấn đề phổ biến & Cách giải quyết

---

## 1. Extension không hoạt động

### Triệu chứng
- Không thấy context menu "Lưu cụm từ"
- Click lưu nhưng không có phản ứng

### Kiểm tra danh sách

#### ✓ Bước 1: Kiểm tra Extension đã được load
```
1. Mở chrome://extensions/
2. Tìm "Vocab Master - Lưu từ vựng IELTS"
3. Xem có bật (toggle ON) không
4. Reload extension button
```

#### ✓ Bước 2: Kiểm tra API URL
```javascript
// File: extension/background.js
// Dòng ~3
const API_BASE_URL = 'http://localhost:3000';
// Kiểm tra URL có đúng không
```

#### ✓ Bước 3: Kiểm tra Web App chạy
```bash
# Terminal
npm run dev
# Xem có "Local: http://localhost:3000" không
```

#### ✓ Bước 4: Check Console Error
```
1. Extension page → chrome://extensions/
2. Vocab Master → Details
3. Inspect views → service_worker
4. Xem Console tab có error không
```

### Giải pháp

**Nếu vẫn không thấy context menu:**
```javascript
// Add debug log vào background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('[DEBUG] Extension installed');
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'save-word',
      title: '📚 Lưu cụm từ vào Vocab Master',
      contexts: ['selection']
    });
    console.log('[DEBUG] Context menu created');
  });
});
```

**Reload extension:**
```
1. chrome://extensions/
2. Tìm Vocab Master
3. Click Reload button
```

---

## 2. Lỗi kết nối API

### Triệu chứng
- Lỗi: "Cannot connect to server"
- Notification: "❌ Lỗi kết nối"

### Nguyên nhân

| Nguyên nhân | Dấu hiệu | Giải pháp |
|------------|---------|---------|
| Web app không chạy | Không thể truy cập localhost:3000 | `npm run dev` |
| URL API sai | API response error 404/502 | Kiểm tra `API_BASE_URL` |
| CORS error | Browser console: CORS blocked | Add CORS headers |
| Firewall | Timeout | Check firewall settings |

### Giải pháp

**Kiểm tra web app chạy:**
```bash
# Terminal
cd web-app
npm run dev

# Nên thấy
# > ready - started server on 0.0.0.0:3000
```

**Kiểm tra API_BASE_URL:**
```javascript
// extension/background.js - Line 3
const API_BASE_URL = 'http://localhost:3000';

// Nếu deploy, thay bằng:
const API_BASE_URL = 'https://your-app.vercel.app';
```

**Test API manually:**
```bash
curl -X POST http://localhost:3000/api/add-word \
  -H "Content-Type: application/json" \
  -d '{"word":"test","userId":"user_123"}'

# Nên thấy response (không phải error)
```

---

## 3. Database Connection Error

### Triệu chứng
- Console error: "Missing Supabase environment variables"
- API error: "Cannot connect to database"

### Nguyên nhân
- `.env.local` missing
- Environment variables sai
- Supabase project không active

### Giải pháp

**Bước 1: Kiểm tra .env.local tồn tại**
```bash
# web-app folder
ls -la .env.local  # Linux/Mac
dir .env.local     # Windows

# Nếu không tồn tại, tạo từ .env.example
cp .env.example .env.local
```

**Bước 2: Lấy đúng keys từ Supabase**
```
Supabase Dashboard → Settings → API
- NEXT_PUBLIC_SUPABASE_URL = Project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY = anon public key
- SUPABASE_SERVICE_ROLE_KEY = service_role secret
```

**Bước 3: Lấy Gemini API Key**
```
https://aistudio.google.com/app/apikey
- GEMINI_API_KEY = Your API Key
```

**Bước 4: Restart dev server**
```bash
# Kill server (Ctrl+C)
# Restart
npm run dev
```

**Bước 5: Test connection**
```javascript
// In app/page.js, thêm:
useEffect(() => {
  supabase.from('vocabulary').select('count').then(res => {
    console.log('[DEBUG] Supabase connection:', res);
  });
}, []);
```

---

## 4. Gemini API Error

### Triệu chứng
- Error: "Could not call Gemini API"
- API response: "Invalid API key"

### Nguyên nhân
- API Key invalid
- Gemini API not enabled
- Quota exceeded

### Giải pháp

**Kiểm tra API Key:**
```
1. https://aistudio.google.com/app/apikey
2. Copy key lại (đảm bảo đầy đủ)
3. Paste vào .env.local
4. Restart server
```

**Enable Gemini API:**
```
1. Google Cloud Console
2. Search "Generative AI API"
3. Enable it
4. Create API key
```

**Check API quota:**
```
1. Google Cloud Console
2. APIs & Services → Credentials
3. Check quota limits
4. Monitor usage
```

**Test Gemini API:**
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "Hello"}]}]
  }'
```

---

## 5. Chrome Extension Popup không hiển thị

### Triệu chứng
- Click extension icon → không thấy popup
- Popup trống trắng

### Nguyên nhân
- popup.html có lỗi
- popup.js error

### Giải pháp

**Kiểm tra Console Extension:**
```
1. chrome://extensions/
2. Vocab Master → Details
3. Inspect views → popup
4. Console tab → xem error
```

**Kiểm tra popup.html:**
```html
<!-- popup.html phải có -->
<script src="popup.js"></script>
```

**Kiểm tra popup.js:**
```javascript
// popup.js phải khởi tạo đúng
document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] Popup loaded');
  // ... code
});
```

**Reset popup:**
```
1. Unload extension (chrome://extensions)
2. Delete popup cache
3. Reload extension
```

---

## 6. Từ không được lưu vào database

### Triệu chứng
- Extension nhận được notification ✅ thành công
- Nhưng từ không xuất hiện trong database

### Nguyên nhân
- API response success nhưng database error
- Database table không tồn tại
- RLS policy chặn INSERT

### Giải pháp

**Bước 1: Kiểm tra table tồn tại**
```
1. Supabase Dashboard
2. Table Editor
3. Xem có bảng vocabulary & user_progress không
```

**Bước 2: Chạy SQL schema**
```sql
-- SQL Editor
-- Paste toàn bộ database.sql
-- Run
```

**Bước 3: Kiểm tra RLS Policy**
```sql
-- Disable RLS temporarily (để test)
ALTER TABLE vocabulary DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

-- Sau đó enable lại và set đúng policy
```

**Bước 4: Check API logs**
```bash
# Terminal - kiểm tra console
npm run dev

# Xem có error gì trong logs không
```

---

## 7. ReviewCard không hiển thị từ

### Triệu chứng
- App.page mở thành công
- Nhưng không thấy flashcard

### Nguyên nhân
- Không có từ trong wordsForToday
- Component không render

### Giải pháp

**Kiểm tra dữ liệu:**
```javascript
// app/page.js - Add debug
useEffect(() => {
  if (!userId) return;
  const fetchWords = async () => {
    // ... fetch code
    console.log('[DEBUG] Words for today:', response.data.words_for_today);
  };
  fetchWords();
}, [userId]);
```

**Kiểm tra database:**
```sql
-- Supabase SQL Editor
SELECT COUNT(*) FROM vocabulary;
SELECT COUNT(*) FROM user_progress;
```

**Tạo dữ liệu test:**
```sql
INSERT INTO vocabulary (word, phonetic, meaning, example_sentence, cloze_sentence)
VALUES ('test', '/test/', 'test', 'This is a test.', 'This is a ___.');

-- Get vocab_id từ result, rồi insert vào user_progress
INSERT INTO user_progress (user_id, vocab_id, learning_level, next_review_date)
VALUES ('user_123456', 'vocab_id_here', 1, NOW());
```

---

## 8. Lỗi Build / Deploy

### Triệu chứng
- `npm run build` fail
- Deploy to Vercel fail

### Nguyên nhân
- Syntax error
- Missing dependencies
- Environment variables

### Giải pháp

**Check syntax:**
```bash
npm run lint
# Fix errors
```

**Install missing dependencies:**
```bash
npm install
```

**Test build locally:**
```bash
npm run build
npm start
```

**Check Vercel logs:**
```
1. Vercel Dashboard
2. Select project
3. Deployments → Click failed deploy
4. Xem Build logs
```

---

## 9. Performance Issues

### Triệu chứng
- App chậm
- Flashcard lag
- API response slow

### Nguyên nhân
- N+1 query
- Missing indexes
- Large dataset

### Giải pháp

**Add database indexes:**
```sql
-- database.sql đã có indexes
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review_date);
```

**Optimize queries:**
```javascript
// Sử dụng select() chính xác, không lấy tất cả
const { data } = await supabase
  .from('user_progress')
  .select('id, learning_level, next_review_date, vocabulary(id, word, cloze_sentence)')
  .eq('user_id', userId)
  .lte('next_review_date', now);
```

**Check query time:**
```sql
EXPLAIN ANALYZE
SELECT * FROM user_progress
WHERE next_review_date <= NOW()
ORDER BY next_review_date ASC;
```

---

## 10. localhost:3000 Connection Refused

### Triệu chứng
- Error: "Connection refused"
- Cannot reach http://localhost:3000

### Nguyên nhân
- Dev server không chạy
- Port 3000 đã bị chiếm

### Giải pháp

**Kiểm tra dev server:**
```bash
# Terminal
npm run dev

# Nếu không thấy "ready - started server", quay lại bước cài đặt
```

**Kiểm tra port:**
```bash
# Windows - Check port 3000
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill process
kill -9 PID (hoặc taskkill /PID PID /F)
```

**Chạy trên port khác:**
```bash
PORT=3001 npm run dev
```

---

## 🆘 Khi đã thử hết

1. **Clear cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **Check logs:**
   - Browser console (F12)
   - Terminal logs
   - Supabase logs

3. **Search issue:**
   - GitHub issues
   - Stack Overflow
   - Discord communities

4. **Contact support:**
   - Supabase support
   - Google Cloud support
   - Chrome extension forum

---

## 📋 Debug Checklist

- [ ] Extension loaded on `chrome://extensions/`
- [ ] Dev server running on `localhost:3000`
- [ ] `.env.local` exists with all keys
- [ ] Supabase tables created (via database.sql)
- [ ] Gemini API key is valid
- [ ] No CORS errors in browser console
- [ ] API endpoints responding correctly (curl test)
- [ ] Database has test data
- [ ] ReviewCard renders with data

---

**Need more help? Check individual section above!** 🚀
