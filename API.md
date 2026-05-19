# 🔌 API Documentation - Vocab Master

Base URL: `http://localhost:3000` (Development) hoặc `https://your-app.vercel.app` (Production)

---

## 📝 Endpoints

### 1️⃣ POST `/api/add-word`

**Thêm từ vựng mới vào database**

Endpoint này được gọi khi người dùng bôi đen một từ và click "Lưu" từ Chrome Extension.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "word": "aberration",
  "userId": "user_123456"
}
```

**Parameters:**
- `word` (string, required): Cụm từ cần lưu
- `userId` (string, required): ID của người dùng

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Word added successfully",
  "vocabulary": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "word": "aberration",
    "phonetic": "/ˌæbəˈreɪʃn/",
    "meaning": "Sự lệch lạc, bất thường",
    "example_sentence": "This behavior is an aberration from his usual conduct.",
    "cloze_sentence": "This behavior is an ___ from his usual conduct.",
    "created_at": "2024-01-20T10:30:00Z"
  },
  "progress": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "user_123456",
    "vocab_id": "550e8400-e29b-41d4-a716-446655440000",
    "learning_level": 1,
    "next_review_date": "2024-01-20T10:30:00Z",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Word and userId are required"
}
```

**Error (400 - Word exists):**
```json
{
  "error": "Word already exists in database"
}
```

**Error (500 Internal Server Error):**
```json
{
  "error": "Internal server error"
}
```

#### cURL Example:
```bash
curl -X POST http://localhost:3000/api/add-word \
  -H "Content-Type: application/json" \
  -d '{
    "word": "aberration",
    "userId": "user_123456"
  }'
```

#### JavaScript Example:
```javascript
const response = await fetch('/api/add-word', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    word: 'aberration',
    userId: 'user_123456'
  })
});

const data = await response.json();
console.log(data);
```

---

### 2️⃣ GET `/api/review-words`

**Lấy danh sách từ cần ôn tập hôm nay**

Endpoint này lấy tất cả các từ có `next_review_date <= NOW()` để ôn tập.

#### Request

**Query Parameters:**
- `userId` (string, required): ID của người dùng

**URL:**
```
GET /api/review-words?userId=user_123456
```

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "words_for_today": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "learning_level": 1,
      "next_review_date": "2024-01-20T10:30:00Z",
      "vocabulary": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "word": "aberration",
        "phonetic": "/ˌæbəˈreɪʃn/",
        "meaning": "Sự lệch lạc",
        "example_sentence": "This behavior is an aberration...",
        "cloze_sentence": "This behavior is an ___..."
      }
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "learning_level": 2,
      "next_review_date": "2024-01-21T15:00:00Z",
      "vocabulary": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "word": "abscond",
        "phonetic": "/əbˈskɒnd/",
        "meaning": "Bỏ trốn",
        "example_sentence": "The embezzler absconded...",
        "cloze_sentence": "The embezzler ___..."
      }
    }
  ],
  "all_progress": [
    { "learning_level": 1 },
    { "learning_level": 2 },
    { "learning_level": 3 },
    { "learning_level": 1 },
    { "learning_level": 5 }
  ]
}
```

**Error (400):**
```json
{
  "error": "userId is required"
}
```

#### cURL Example:
```bash
curl "http://localhost:3000/api/review-words?userId=user_123456"
```

#### JavaScript Example:
```javascript
const response = await fetch(`/api/review-words?userId=user_123456`);
const data = await response.json();
console.log(data.words_for_today);
```

---

### 3️⃣ POST `/api/update-progress`

**Cập nhật tiến độ sau khi ôn tập**

Endpoint này cập nhật learning level và next_review_date dựa trên đánh giá của người dùng.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "user_progress_id": "660e8400-e29b-41d4-a716-446655440001",
  "vocab_id": "550e8400-e29b-41d4-a716-446655440000",
  "difficulty": "easy",
  "current_level": 1
}
```

**Parameters:**
- `user_progress_id` (string, UUID, required): ID của user_progress record
- `vocab_id` (string, UUID, required): ID của vocabulary
- `difficulty` (string, enum, required): 
  - `"forgot"` - Quên lại (level → 1, review today)
  - `"hard"` - Khó nhớ (level giữ nguyên, review +1 day)
  - `"easy"` - Dễ (level + 1, review + level×2 days)
- `current_level` (integer, required): Mức độ hiện tại (1-5)

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "progress": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "user_123456",
    "vocab_id": "550e8400-e29b-41d4-a716-446655440000",
    "learning_level": 2,
    "next_review_date": "2024-01-27T10:30:00Z",
    "updated_at": "2024-01-20T15:45:00Z"
  }
}
```

**Error (400):**
```json
{
  "error": "Missing required parameters"
}
```

#### cURL Example:
```bash
curl -X POST http://localhost:3000/api/update-progress \
  -H "Content-Type: application/json" \
  -d '{
    "user_progress_id": "660e8400-e29b-41d4-a716-446655440001",
    "vocab_id": "550e8400-e29b-41d4-a716-446655440000",
    "difficulty": "easy",
    "current_level": 1
  }'
```

#### JavaScript Example:
```javascript
const response = await fetch('/api/update-progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_progress_id: '660e8400...',
    vocab_id: '550e8400...',
    difficulty: 'easy',
    current_level: 1
  })
});

const data = await response.json();
if (data.success) {
  console.log('Progress updated:', data.progress);
}
```

---

## 📊 Data Models

### Vocabulary Object
```typescript
{
  id: UUID,                      // Unique identifier
  word: string,                  // Từ vựng (lowercase)
  phonetic: string,              // Phiên âm IPA
  meaning: string,               // Nghĩa tiếng Việt
  example_sentence: string,      // Câu ví dụ tiếng Anh
  cloze_sentence: string,        // Câu đục lỗ (thay từ bằng ___)
  created_at: ISO8601,           // Thời gian tạo
  updated_at: ISO8601            // Lần cập nhật cuối
}
```

### UserProgress Object
```typescript
{
  id: UUID,                      // Unique identifier
  user_id: string,               // User identifier (UUID or string)
  vocab_id: UUID,                // Reference to vocabulary
  learning_level: int (1-5),     // Mức độ học (1-5)
  next_review_date: ISO8601,     // Ngày ôn tập tiếp theo
  created_at: ISO8601,           // Thời gian tạo
  updated_at: ISO8601            // Lần cập nhật cuối
}
```

---

## 🔄 Luồng dữ liệu

### Scenario: Lưu từ mới

```
1. Chrome Extension
   ↓ (Right-click → Save word)
   
2. background.js
   ↓ POST /api/add-word
   {word: "aberration", userId: "user_123"}
   
3. Next.js API Route (/api/add-word)
   ↓
   a. Check if word exists
   b. Call Gemini API → get phonetic, meaning, examples
   c. INSERT into vocabulary table
   d. INSERT into user_progress table (level=1, next_review=NOW)
   
4. Response
   ↓ Success with vocabulary & progress objects
   
5. Chrome Extension
   ↓ Show notification ✅ Saved!
```

### Scenario: Ôn tập từ

```
1. User opens http://localhost:3000

2. app/page.js
   ↓ GET /api/review-words?userId=user_123
   
3. Next.js API Route
   ↓
   a. Query user_progress where next_review_date <= NOW
   b. Join with vocabulary table
   c. Return words_for_today & all_progress
   
4. Frontend
   ↓
   a. Display ReviewCard with cloze sentence
   b. User chooses difficulty: "forgot" | "hard" | "easy"
   
5. ReviewCard component
   ↓ POST /api/update-progress
   {
     user_progress_id: "...",
     difficulty: "easy",
     current_level: 1
   }
   
6. Next.js API Route
   ↓
   a. Calculate nextLevel & nextReviewDate
   b. UPDATE user_progress
   c. Return updated progress
   
7. Frontend
   ↓ Load next word
```

---

## ⚠️ Error Handling

| Status | Meaning | Typical Cause |
|--------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Missing/invalid parameters |
| 401 | Unauthorized | Auth required |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## 🔐 Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIzaSy...
```

---

## 📱 Rate Limiting

Hiện tại không có rate limiting. Trong production, nên thêm:
- Rate limiting per user
- Request throttling
- API key validation

---

## 🧪 Testing

### Test add-word endpoint:
```bash
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/add-word \
  -H "Content-Type: application/json" \
  -d '{"word":"test","userId":"testuser"}'
```

### Test review-words endpoint:
```bash
curl "http://localhost:3000/api/review-words?userId=testuser"
```

### Test update-progress endpoint:
```bash
curl -X POST http://localhost:3000/api/update-progress \
  -H "Content-Type: application/json" \
  -d '{
    "user_progress_id":"...",
    "vocab_id":"...",
    "difficulty":"easy",
    "current_level":1
  }'
```

---

## 📚 Postman Collection

[Tạo Postman collection để test các endpoints]

---

## 🚀 Deployment Checklist

- [ ] Test tất cả endpoints
- [ ] Verify environment variables
- [ ] Check Supabase permissions
- [ ] Test Gemini API quota
- [ ] Enable CORS nếu cần
- [ ] Update API_BASE_URL in extension
- [ ] Deploy to Vercel
- [ ] Test production endpoints
