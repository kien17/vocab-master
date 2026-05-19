# 📚 Hướng dẫn cài đặt Vocab Master

## ⚡ Cài đặt nhanh (Quick Start)

### Bước 1: Chuẩn bị Supabase

1. Truy cập [supabase.com](https://supabase.com) và đăng nhập
2. Tạo project mới
3. Vào **SQL Editor** → chạy file `database.sql`
4. Vào **Settings → API**:
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Bước 2: Chuẩn bị Google Gemini API

1. Truy cập [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Bấm **"Get API Key"** → **"Create API key in new project"**
3. Copy API Key → `GEMINI_API_KEY`

### Bước 3: Cài đặt Web App

```bash
cd web-app
npm install
```

Tạo file `.env.local` (copy từ `.env.example`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Chạy app:
```bash
npm run dev
```

Mở: [http://localhost:3000](http://localhost:3000)

### Bước 4: Cài đặt Chrome Extension

1. Mở `chrome://extensions/`
2. Bật **"Developer mode"** (góc phải trên)
3. Click **"Load unpacked"**
4. Chọn folder `extension/`
5. Xong! Extension sẽ xuất hiện trên toolbar

## 🔧 Cấu hình chi tiết

### Supabase

#### Lấy Project URL & Keys
```
Settings → API → 
- Project URL (NEXT_PUBLIC_SUPABASE_URL)
- anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- service_role (SUPABASE_SERVICE_ROLE_KEY)
```

#### Tạo Database
```sql
-- SQL Editor → Run file database.sql
-- Sẽ tạo:
-- ✅ vocabulary (từ vựng)
-- ✅ user_progress (tiến độ học)
-- ✅ Indexes & Triggers
```

### Gemini API

#### Bật API
1. [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Chọn project hoặc tạo mới
4. Enable Generative AI API
5. Copy key

### Chrome Extension

#### Cấu hình URL API
Mở `extension/background.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change khi deploy
```

## 🚀 Deploy (Production)

### Deploy Web App trên Vercel

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
cd web-app
vercel

# Hoặc kết nối GitHub:
# 1. Push code lên GitHub
# 2. Vercel Dashboard → Import → Select repo
# 3. Add Environment Variables
# 4. Deploy
```

#### Environment Variables trên Vercel
```
NEXT_PUBLIC_SUPABASE_URL = https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ...
GEMINI_API_KEY = AIzaSy...
NEXT_PUBLIC_API_URL = https://your-app.vercel.app
```

### Update Chrome Extension

Sau khi deploy, cập nhật `extension/background.js`:
```javascript
const API_BASE_URL = 'https://your-app.vercel.app';
```

Sau đó reload extension trên `chrome://extensions/`.

## 🧪 Test

### Test Web App
1. Mở [http://localhost:3000](http://localhost:3000)
2. Bạn sẽ thấy trang chủ (hiện "Hoàn thành!" vì chưa có từ)

### Test Chrome Extension
1. Mở bất kỳ trang web nào (ví dụ: [bbc.com](https://bbc.com))
2. Bôi đen một từ (ví dụ: "hello")
3. Click chuột phải → **"Lưu cụm từ vào Vocab Master"**
4. Nên thấy thông báo ✅ Thành công
5. Check database trên Supabase Dashboard:
   - Vào **Table Editor**
   - Click `vocabulary` → Xem dữ liệu mới

### Test API
```bash
# Terminal - Test add-word
curl -X POST http://localhost:3000/api/add-word \
  -H "Content-Type: application/json" \
  -d '{"word":"test","userId":"user_123"}'

# Test review-words
curl http://localhost:3000/api/review-words?userId=user_123
```

## 🐛 Troubleshooting

### Extension không lưu được từ
**Nguyên nhân:** API URL sai hoặc server không chạy
**Giải pháp:**
1. Kiểm tra `npm run dev` có chạy không
2. Kiểm tra `extension/background.js` có URL đúng không
3. Mở F12 Console → xem lỗi gì
4. Reload extension

### Gemini API trả về lỗi
**Nguyên nhân:** API Key sai hoặc không enable API
**Giải pháp:**
1. Kiểm tra API Key trong `.env.local`
2. Vào [Google Cloud Console](https://console.cloud.google.com) → Enable Generative AI
3. Kiểm tra quota/limit

### Supabase Connection Error
**Nguyên nhân:** URL hoặc Keys sai
**Giải pháp:**
1. Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` có format đúng không
2. Kiểm tra Keys có hợp lệ không (copy lại)
3. Kiểm tra Supabase project có active không

### Database Query Error
**Nguyên nhân:** Schema chưa tạo
**Giải pháp:**
1. Vào Supabase Dashboard → SQL Editor
2. Copy toàn bộ content từ `database.sql`
3. Run
4. Kiểm tra `Table Editor` → có tables không

## 📋 Checklist cài đặt

- [ ] Supabase project được tạo
- [ ] database.sql được chạy trên Supabase
- [ ] Lấy được Supabase URL & Keys
- [ ] Google Gemini API Key được tạo
- [ ] .env.local được tạo đầy đủ
- [ ] `npm install` hoàn thành
- [ ] `npm run dev` chạy được
- [ ] Chrome Extension được load unpacked
- [ ] Test extension: Bôi đen + Save từ
- [ ] Kiểm tra database có dữ liệu mới

## ✅ Khi mọi thứ xong

1. ✅ Mở web app: [http://localhost:3000](http://localhost:3000)
2. ✅ Bôi đen từ trên web → lưu với extension
3. ✅ Xem flashcard trên web app
4. ✅ Ôn tập và đánh giá mức độ
5. ✅ Kiểm tra thống kê

**Chúc bạn thành công! 🚀**
