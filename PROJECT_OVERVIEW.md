# 📋 Project Overview & Quick Start

## ✨ Tổng quan Vocab Master

**Vocab Master** là ứng dụng web full-stack hiện đại để học từ vựng tiếng Anh bằng **Spaced Repetition Algorithm** (Lặp lại ngắt quãng), giúp người học đạt **IELTS 7.5+**.

### 🎯 Tính năng chính

✅ **Lưu từ từ bất kỳ web nào** qua Chrome Extension  
✅ **Flashcard đục lỗ (Cloze)** để ôn tập hiệu quả  
✅ **5 mức độ học tập** (Level 1-5) như MochiMochi  
✅ **AI tự động sinh dữ liệu** (Gemini API)  
✅ **Thống kê tiến độ** rõ ràng  
✅ **Responsive UI** đẹp mắt  

---

## 📁 Cấu trúc dự án

```
vocab-master/
│
├── 📂 web-app/ (Next.js 14)
│   ├── 📂 app/
│   │   ├── page.js          ⭐ Trang chủ (flashcard)
│   │   ├── layout.js        ⭐ Layout chính
│   │   ├── globals.css      📝 CSS toàn cục
│   │   └── 📂 api/
│   │       ├── add-word/
│   │       ├── update-progress/
│   │       └── review-words/
│   │
│   ├── 📂 components/
│   │   ├── ReviewCard.js    ⭐ Component flashcard
│   │   └── Stats.js         📊 Thống kê
│   │
│   ├── 📂 lib/
│   │   ├── supabase.js      🔌 Supabase client
│   │   ├── gemini.js        🤖 Gemini API
│   │   └── spaced-repetition.js  🧠 Algorithm
│   │
│   ├── .env.local           🔐 (Tạo từ .env.example)
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── 📂 extension/ (Chrome Extension V3)
│   ├── manifest.json        📋 Manifest
│   ├── background.js        🔧 Service Worker
│   ├── content.js           📝 Content Script
│   ├── popup.html           🎨 Popup UI
│   └── popup.js             Popup Logic
│
├── 📄 database.sql          📦 SQL schema
├── 📄 README.md             📚 Tài liệu chính
├── 📄 SETUP.md              🚀 Hướng dẫn cài đặt
├── 📄 API.md                🔌 API documentation
├── 📄 SPACED_REPETITION.md  🧠 Thuật toán giải thích
└── 📄 TROUBLESHOOTING.md    🆘 Khắc phục lỗi
```

---

## 🚀 Cài đặt nhanh (5 phút)

### 1️⃣ Chuẩn bị Supabase

```bash
# A. Tạo project: supabase.com
# B. SQL Editor → chạy database.sql
# C. Settings → API → Copy URL & Keys
```

Cần:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2️⃣ Chuẩn bị Gemini API

```bash
# A. Truy cập: aistudio.google.com/app/apikey
# B. Get API Key
# C. Copy key
```

Cần:
- `GEMINI_API_KEY`

### 3️⃣ Cài đặt Web App

```bash
cd web-app

# Copy .env.example → .env.local & điền keys
cp .env.example .env.local

# Install dependencies
npm install

# Run dev server
npm run dev
```

✅ Mở: http://localhost:3000

### 4️⃣ Cài đặt Extension

```bash
# A. chrome://extensions/
# B. Developer mode ON
# C. Load unpacked → chọn folder extension/
# D. Xong!
```

---

## 🎮 Hướng dẫn sử dụng

### Lưu từ mới
1. Bôi đen từ trên web
2. Click chuột phải → "Lưu cụm từ vào Vocab Master"
3. Nhận notification ✅

### Ôn tập
1. Mở http://localhost:3000
2. Xem câu đục lỗ
3. Bấm để xem đáp án
4. Chọn: ❌ Quên | 😕 Khó nhớ | ✅ Dễ
5. Tiếp tục với từ tiếp theo

---

## 🔧 Tech Stack

| Phần | Công nghệ |
|-----|-----------|
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini API |
| Extension | Manifest V3, Vanilla JS |
| Deployment | Vercel |

---

## 📚 Tài liệu

| File | Nội dung |
|------|---------|
| **README.md** | 📚 Tài liệu chính (đầy đủ) |
| **SETUP.md** | 🚀 Hướng dẫn cài đặt chi tiết |
| **API.md** | 🔌 API endpoints documentation |
| **SPACED_REPETITION.md** | 🧠 Giải thích thuật toán SR |
| **TROUBLESHOOTING.md** | 🆘 Khắc phục lỗi |

---

## 🧪 Test nhanh

### Test Extension
```bash
# 1. Mở bất kỳ web nào
# 2. Bôi đen "test"
# 3. Phải phải → Lưu
# 4. Xem notification ✅
```

### Test API
```bash
curl -X POST http://localhost:3000/api/add-word \
  -H "Content-Type: application/json" \
  -d '{"word":"aberration","userId":"user_test"}'
```

### Test Database
```
1. Supabase Dashboard
2. Table Editor
3. Click "vocabulary"
4. Xem có dữ liệu không
```

---

## 📊 Spaced Repetition Algorithm

**5 Levels:**
| Level | Khoảng ôn tập | Trạng thái |
|-------|------------|-----------|
| 1 | 1 ngày | Mới/Quên |
| 2 | 3 ngày | Khó nhớ |
| 3 | 7 ngày | Bình thường |
| 4 | 14 ngày | Dễ |
| 5 | 30 ngày | Thành thạo ✨ |

**Logic:**
- **Quên** → Level = 1, Review ngay
- **Khó** → Level giữ nguyên, Review +1 ngày
- **Dễ** → Level +1, Review +7-30 ngày

---

## 🌐 Deployment

### Deploy to Vercel

```bash
# 1. Cài Vercel CLI
npm i -g vercel

# 2. Deploy
cd web-app
vercel

# 3. Add environment variables trên Vercel dashboard
# 4. Update API_BASE_URL in extension/background.js
# 5. Reload extension
```

---

## 📋 Danh sách files tạo được

### ✅ Web App (Next.js)
- [x] `package.json` - Dependencies
- [x] `.env.local` - Environment variables
- [x] `.env.example` - Template
- [x] `app/page.js` - Trang chủ
- [x] `app/layout.js` - Layout chính
- [x] `app/globals.css` - CSS toàn cục
- [x] `app/api/add-word/route.js` - API thêm từ
- [x] `app/api/update-progress/route.js` - API cập nhật
- [x] `app/api/review-words/route.js` - API lấy từ
- [x] `components/ReviewCard.js` - Flashcard component
- [x] `components/Stats.js` - Stats component
- [x] `lib/supabase.js` - Supabase client
- [x] `lib/gemini.js` - Gemini API
- [x] `lib/spaced-repetition.js` - SR algorithm
- [x] `tailwind.config.js` - Tailwind config
- [x] `postcss.config.js` - PostCSS config
- [x] `next.config.js` - Next.js config
- [x] `.eslintrc.json` - ESLint config
- [x] `.gitignore` - Git ignore

### ✅ Extension (Manifest V3)
- [x] `manifest.json` - Manifest V3
- [x] `background.js` - Service Worker
- [x] `content.js` - Content Script
- [x] `popup.html` - Popup UI
- [x] `popup.js` - Popup Logic

### ✅ Documentation
- [x] `database.sql` - SQL schema
- [x] `README.md` - Main documentation
- [x] `SETUP.md` - Setup guide
- [x] `API.md` - API documentation
- [x] `SPACED_REPETITION.md` - Algorithm explanation
- [x] `TROUBLESHOOTING.md` - Troubleshooting guide
- [x] `PROJECT_OVERVIEW.md` - This file

---

## 🎯 Luồng hoạt động

### Scenario 1: Lưu từ mới

```
Extension (Bôi đen từ)
  ↓ Right-click → Save
background.js
  ↓ POST /api/add-word
  
Next.js API
  ├─ Receive word
  ├─ Call Gemini API
  ├─ Save to vocabulary table
  └─ Create progress record (Level 1)
  
Extension
  ↓ Show notification ✅
```

### Scenario 2: Ôn tập từ

```
User opens localhost:3000
  ↓
app/page.js
  ├─ GET /api/review-words
  └─ Display words for today
  
User sees flashcard
  ├─ Cloze sentence
  ├─ Click to show answer
  ├─ Choose difficulty
  
ReviewCard component
  ├─ POST /api/update-progress
  └─ Calculate new level/date
  
Show next word
```

---

## 🔐 Bảo mật

✅ `.env.local` trong `.gitignore`  
✅ Service role key chỉ dùng server-side  
✅ Anon key dùng client-side  
✅ RLS Policies (tuỳ chọn - có trong database.sql)  

---

## 📈 Tiến bộ dự án

### Phase 1: ✅ Done (MVP)
- Thêm từ via extension
- Ôn tập flashcard
- Spaced Repetition
- Thống kê cơ bản
- Deploy ready

### Phase 2: 📋 Next (v2.0)
- [ ] Supabase Auth
- [ ] User profiles
- [ ] Import/Export
- [ ] Customizable categories
- [ ] Mobile app (React Native)
- [ ] Quiz mode
- [ ] Text-to-Speech
- [ ] Detailed statistics
- [ ] Dark mode
- [ ] Notifications

---

## 🆘 Gặp vấn đề?

### 📖 Đọc tài liệu
1. Kiểm tra phần tương ứng trong **README.md**
2. Xem chi tiết trong **SETUP.md**
3. Tìm giải pháp trong **TROUBLESHOOTING.md**

### 🔍 Debug
1. Mở **F12 Console** (Browser)
2. Xem **Extension Console** (`chrome://extensions/`)
3. Check **Terminal logs** (npm run dev)
4. Query **Supabase directly**

### 💬 Liên hệ
- Supabase support
- Google Cloud support
- GitHub Issues
- Discord communities

---

## 🎓 Học thêm

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [Tailwind CSS](https://tailwindcss.com)
- [Spaced Repetition Research](https://en.wikipedia.org/wiki/Spaced_repetition)

---

## 🚀 Bắt đầu ngay

```bash
# 1. Prepare Supabase & Gemini API keys
# 2. cd web-app && cp .env.example .env.local
# 3. Fill in environment variables
# 4. npm install
# 5. npm run dev
# 6. Load extension on chrome://extensions/
# 7. Test: Right-click → Save word
# 8. Open http://localhost:3000 → Review!
```

**Chúc bạn học tập hiệu quả! 🚀📚✨**

---

**Câu hỏi?** → Xem **TROUBLESHOOTING.md** hoặc **README.md**
**Cần deploy?** → Xem hướng dẫn trong **SETUP.md**
**API help?** → Xem **API.md**
