# Vocab Master - Ứng dụng học từ vựng IELTS

Một ứng dụng web full-stack hiện đại giúp học từ vựng tiếng Anh bằng **Spaced Repetition Algorithm** (Lặp lại ngắt quãng).

## 🎯 Mục tiêu

- Giúp người học đạt **IELTS 7.5+**
- Ôn tập từ vựng theo lịch khoa học (5 mức độ)
- Tích hợp Chrome Extension để lưu từ trực tiếp từ web
- Sử dụng AI (Gemini) để sinh dữ liệu từ vựng tự động

## 🛠 Tech Stack

### Backend & Frontend
- **Framework:** Next.js 14 (App Router)
- **CSS:** Tailwind CSS
- **Deployment:** Vercel

### Database & Backend Services
- **Database:** Supabase (PostgreSQL)
- **AI API:** Google Gemini API

### Browser Extension
- **Manifest:** V3
- **Language:** Vanilla JavaScript, HTML/CSS

## 📁 Cấu trúc thư mục

```
vocab-master/
├── web-app/                          # Next.js Web Application
│   ├── app/
│   │   ├── page.js                  # 🏠 Trang chủ (hiển thị flashcard)
│   │   ├── layout.js                # Layout chính
│   │   ├── globals.css              # Styles toàn cục
│   │   └── api/
│   │       ├── add-word/            # API: Thêm từ mới
│   │       │   └── route.js
│   │       ├── update-progress/     # API: Cập nhật tiến độ
│   │       │   └── route.js
│   │       └── review-words/        # API: Lấy từ cần ôn tập hôm nay
│   │           └── route.js
│   ├── components/
│   │   ├── ReviewCard.js            # 📇 Component Flashcard
│   │   └── Stats.js                 # 📊 Component Thống kê
│   ├── lib/
│   │   ├── supabase.js              # Khởi tạo Supabase client
│   │   ├── gemini.js                # Gọi Gemini API
│   │   └── spaced-repetition.js     # Logic Spaced Repetition
│   ├── .env.local                   # 🔐 Biến môi trường
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── .gitignore
│
├── extension/                        # Chrome Extension
│   ├── manifest.json               # 📋 Manifest V3
│   ├── background.js               # 🔧 Service Worker
│   ├── content.js                  # 📝 Content Script
│   ├── popup.html                  # 🎨 Popup UI
│   ├── popup.js                    # Popup Logic
│   └── README.md
│
├── database.sql                     # 📦 SQL Schema cho Supabase
└── README.md
```

## 🚀 Cài đặt & Chạy

### 1. Chuẩn bị môi trường

#### Yêu cầu
- Node.js 18+
- npm hoặc yarn
- Tài khoản Supabase
- Google Gemini API Key

#### Bước 1: Clone & Cài đặt

```bash
cd vocab-master/web-app
npm install
```

#### Bước 2: Tạo Database

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com)
2. Tạo project mới
3. Vào SQL Editor → chạy file `database.sql`
4. Copy `Project URL` và `Anon Key` từ Settings → API

#### Bước 3: Lấy Gemini API Key

1. Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Tạo API Key
3. Copy key

#### Bước 4: Cấu hình .env.local

```bash
# web-app/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

GEMINI_API_KEY=your-gemini-api-key-here

NEXT_PUBLIC_APP_NAME=Vocab Master
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Chạy Web App

```bash
cd web-app
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### 3. Cài đặt Chrome Extension

1. Mở `chrome://extensions/`
2. Bật **Developer mode** (góc trên phải)
3. Click **Load unpacked**
4. Chọn folder `extension/`
5. Extension sẽ hiển thị trên toolbar

## 💡 Cách sử dụng

### Lưu từ mới

1. **Trên bất kỳ trang web nào:**
   - Bôi đen một cụm từ
   - Click chuột phải → **"Lưu cụm từ vào Vocab Master"**
   - Từ sẽ được gửi đến API

2. **Phía Backend (API):**
   - Nhận cụm từ
   - Gọi Gemini API để lấy: phiên âm, nghĩa, ví dụ, câu đục lỗ
   - Lưu vào database
   - Tạo progress với level 1

### Ôn tập từ vựng

1. Mở [http://localhost:3000](http://localhost:3000)
2. Xem **flashcard** với câu đục lỗ
3. Bấm để xem đáp án (từ gốc, phiên âm, nghĩa, ví dụ)
4. Đánh giá mức độ khó:
   - **❌ Quên:** Về level 1, ôn lại hôm nay
   - **😕 Khó nhớ:** Giữ nguyên level, ôn lại ngày mai
   - **✅ Dễ:** Tăng level, ôn lại sau (level × 2) ngày

## 📊 Spaced Repetition Algorithm

5 mức độ học tập (giống MochiMochi):

| Level | Trạng thái | Khoảng ôn tập |
|-------|-----------|---------------|
| 1 | Mới/Quên lại | 1 ngày |
| 2 | Khó nhớ | 3 ngày |
| 3 | Bình thường | 7 ngày |
| 4 | Dễ | 14 ngày |
| 5 | Rất dễ (Thành thạo) | 30 ngày |

### Logic cập nhật:
- **Quên:** level = 1, next_review = NOW()
- **Khó nhớ:** level không đổi, next_review = TODAY + 1 ngày
- **Dễ:** level = min(level + 1, 5), next_review = TODAY + (level × 2) ngày

## 🔗 API Endpoints

### POST `/api/add-word`
Thêm từ mới vào database

**Request:**
```json
{
  "word": "aberration",
  "userId": "user_123456"
}
```

**Response:**
```json
{
  "success": true,
  "vocabulary": {...},
  "progress": {...}
}
```

### GET `/api/review-words?userId=user_123456`
Lấy danh sách từ cần ôn tập hôm nay

**Response:**
```json
{
  "success": true,
  "words_for_today": [...],
  "all_progress": [...]
}
```

### POST `/api/update-progress`
Cập nhật tiến độ sau khi ôn tập

**Request:**
```json
{
  "user_progress_id": "uuid",
  "vocab_id": "uuid",
  "difficulty": "forgot|hard|easy",
  "current_level": 2
}
```

**Response:**
```json
{
  "success": true,
  "progress": {...}
}
```

## 🌐 Deploy

### Deploy Web App trên Vercel

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Lưu ý:** Cập nhật `API_BASE_URL` trong `background.js` của extension:
```javascript
const API_BASE_URL = 'https://your-app.vercel.app';
```

## 🔐 Bảo mật

- ✅ Sử dụng `NEXT_PUBLIC_SUPABASE_ANON_KEY` cho client-side
- ✅ Sử dụng `SUPABASE_SERVICE_ROLE_KEY` cho server-side (API routes)
- ✅ RLS Policies được bật (tuỳ chọn - bật trong `database.sql`)
- ⚠️ **Không** commit `.env.local` (đã có trong `.gitignore`)

## 📋 Danh sách các tính năng

### Hiện tại
- ✅ Thêm từ qua Chrome Extension
- ✅ Ôn tập Flashcard
- ✅ Spaced Repetition (5 mức độ)
- ✅ Thống kê tiến độ
- ✅ Tự động sinh dữ liệu từ Gemini

### Sắp tới (v2.0)
- 🔄 Authentication (Supabase Auth)
- 📱 Mobile App (React Native)
- 🎯 Quiz mode
- 🗣️ Phát âm (Text-to-Speech)
- 📈 Chi tiết thống kê
- 🌙 Dark mode
- 🔔 Thông báo định kỳ

## 🐛 Troubleshooting

### 1. Extension không hoạt động
- Kiểm tra `API_BASE_URL` trong `background.js`
- Kiểm tra console (F12) có lỗi gì không
- Reload extension: `chrome://extensions/` → Reload

### 2. Lỗi kết nối Supabase
- Kiểm tra `.env.local` có đầy đủ keys không
- Kiểm tra URL Supabase
- Kiểm tra RLS Policies

### 3. Gemini API lỗi
- Kiểm tra API Key có hợp lệ không
- Kiểm tra quota/limit của API

## 📚 Tài liệu tham khảo

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 📝 License

MIT License

## 👨‍💻 Author

Xây dựng bởi **Nguyễn Trần Trung Kiên**

---

**Chúc bạn học tập hiệu quả! 📚✨**
