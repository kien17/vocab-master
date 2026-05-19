# 📚 Spaced Repetition Algorithm - Giải thích chi tiết

## Lý thuyết

**Spaced Repetition** là kỹ thuật học tập dựa trên tâm lý học, cho phép bộ não ghi nhớ thông tin lâu dài bằng cách ôn tập theo khoảng thời gian tối ưu.

### Công thức gốc - SM-2 (Super Memo 2)
```
I(1) = 1 (day)
I(2) = 3 (days)
I(n) = I(n-1) * EF (Easiness Factor)

EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
```

## 5 Mức độ học tập (Vocab Master)

Ứng dụng này sử dụng **5 mức độ** giống như **MochiMochi**:

### Cấp độ 1️⃣: **Mới / Quên lại** (Red)
- **Khoảng ôn tập:** 1 ngày
- **Dấu hiệu:** Người dùng bấm "❌ Quên"
- **Ý nghĩa:** Chưa nhớ hoặc quên hoàn toàn
- **Hành động:** Reset về level 1, ôn lại hôm nay

```javascript
// Ví dụ
currentLevel = 1
difficulty = 'forgot'
nextLevel = 1  // Vẫn ở level 1
nextReviewDate = TODAY + 0 ngày (hôm nay)
```

---

### Cấp độ 2️⃣: **Khó nhớ** (Yellow)
- **Khoảng ôn tập:** 3 ngày
- **Dấu hiệu:** Người dùng bấm "😕 Khó nhớ"
- **Ý nghĩa:** Nhớ được nhưng chậm, cần luyện tập
- **Hành động:** Giữ nguyên level, ôn lại sau 1 ngày

```javascript
currentLevel = 1 → 2
difficulty = 'hard'
nextLevel = 1  // Giữ nguyên
nextReviewDate = TODAY + 1 ngày
```

---

### Cấp độ 3️⃣: **Bình thường** (Orange)
- **Khoảng ôn tập:** 7 ngày
- **Dấu hiệu:** Người dùng bấm "✅ Dễ" từ level 2
- **Ý nghĩa:** Nhớ khá tốt, độc lập cơ bản
- **Hành động:** Tăng level, ôn lại sau 7 ngày

```javascript
currentLevel = 2
difficulty = 'easy'
nextLevel = 3  // Tăng lên
nextReviewDate = TODAY + 7 ngày
```

---

### Cấp độ 4️⃣: **Dễ** (Light Green)
- **Khoảng ôn tập:** 14 ngày
- **Dấu hiệu:** Người dùng bấm "✅ Dễ" từ level 3
- **Ý nghĩa:** Nhớ rất tốt, sử dụng tự tin
- **Hành động:** Tăng level, ôn lại sau 14 ngày

```javascript
currentLevel = 3
difficulty = 'easy'
nextLevel = 4  // Tăng lên
nextReviewDate = TODAY + 14 ngày
```

---

### Cấp độ 5️⃣: **Rất dễ - Thành thạo** (Green) ✨
- **Khoảng ôn tập:** 30 ngày
- **Dấu hiệu:** Người dùng bấm "✅ Dễ" từ level 4
- **Ý nghĩa:** Đã thành thạo hoàn toàn
- **Hành động:** Ở level cao nhất, ôn lại sau 30 ngày

```javascript
currentLevel = 4
difficulty = 'easy'
nextLevel = 5  // Mức cao nhất
nextReviewDate = TODAY + 30 ngày
```

---

## Biểu đồ luồng

```
          ┌─────────────────────────────────────────┐
          │   Người dùng ôn tập một từ               │
          └─────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ❌ Quên      😕 Khó nhớ      ✅ Dễ
    (Forgot)      (Hard)         (Easy)
         │               │               │
         │               │               │
    Level = 1       Level không đổi   Level + 1
    Review = Hôm nay  Review = +1 ngày  Review = Level × 2 ngày
         │               │               │
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
          ┌─────────────────────────────────────────┐
          │   Cập nhật Database (user_progress)     │
          └─────────────────────────────────────────┘
```

## Code Implementation (JavaScript)

```javascript
// lib/spaced-repetition.js

const REVIEW_INTERVALS = {
  1: 1,    // Level 1: 1 ngày
  2: 3,    // Level 2: 3 ngày
  3: 7,    // Level 3: 7 ngày
  4: 14,   // Level 4: 14 ngày
  5: 30    // Level 5: 30 ngày
};

function calculateNextReview(currentLevel, difficulty) {
  let nextLevel = currentLevel;
  
  if (difficulty === 'forgot') {
    // Quên: về level 1, ôn hôm nay
    nextLevel = 1;
  } else if (difficulty === 'hard') {
    // Khó: giữ nguyên level, ôn ngày mai
    nextLevel = Math.max(1, currentLevel);
  } else if (difficulty === 'easy') {
    // Dễ: tăng lên, ôn sau (level × 2) ngày
    nextLevel = Math.min(5, currentLevel + 1);
  }

  const daysToAdd = REVIEW_INTERVALS[nextLevel];
  const nextReviewDate = addDays(new Date(), daysToAdd);

  return {
    nextLevel,
    nextReviewDate: nextReviewDate.toISOString()
  };
}
```

## Ví dụ thực tế

### Scenario: Học từ "aberration"

**Ngày 1 - Lần ôn tập đầu tiên**
```
Trạng thái: Level 1 (Mới)
Xem câu: "The ___ of natural disasters has increased."
Người dùng: Bấm "❌ Quên" (quên hoàn toàn)

Kết quả:
- Level: 1 (vẫn ở level 1)
- Next review: TODAY + 0 ngày = Hôm nay (sẽ thấy lại)
```

**Ngày 2 - Lần thứ 2**
```
Trạng thái: Level 1 (Mới)
Xem câu: "The ___ of natural disasters..."
Người dùng: Bấm "😕 Khó nhớ" (nhớ được nhưng mất thời gian)

Kết quả:
- Level: 1 (giữ nguyên)
- Next review: TODAY + 1 ngày = Ngày 3
```

**Ngày 3 - Lần thứ 3**
```
Trạng thái: Level 1 (Mới)
Xem câu: "The ___ of natural disasters..."
Người dùng: Bấm "✅ Dễ" (nhớ nhanh)

Kết quả:
- Level: 2 (tăng lên)
- Next review: TODAY + 3 ngày = Ngày 6
```

**Ngày 6 - Lần thứ 4**
```
Trạng thái: Level 2 (Khó nhớ)
Xem câu: "The ___ of natural disasters..."
Người dùng: Bấm "✅ Dễ" (nhớ tốt)

Kết quả:
- Level: 3 (tăng lên)
- Next review: TODAY + 7 ngày = Ngày 13
```

...và cứ tiếp tục cho đến khi từ đạt **Level 5** ✨

---

## Lợi ích của Spaced Repetition

### ✅ Nhớ lâu dài
- Ôn tập đúng lúc trước khi quên
- Tăng độ mạnh của trí nhớ

### ✅ Tiết kiệm thời gian
- Chỉ ôn những gì cần ôn
- Không lãng phí thời gian ôn những từ đã nhớ

### ✅ Tối ưu học tập
- Khoảng ôn tập được tính toán khoa học
- Dựa trên tâm lý học về quên lãng

### ✅ Động lực
- Thấy tiến bộ (từ level 1 → 5)
- Thống kê rõ ràng

---

## Công thức IELTS

Để đạt **IELTS 7.5+**, bạn cần:

| Kỹ năng | Mục tiêu |
|--------|---------|
| **Từ vựng** | 8.0+ |
| **Ngữ pháp** | 7.5+ |
| **Phát âm** | 8.0+ |
| **Độ trôi chảy** | 7.5+ |

**Vocab Master** tập trung vào **từ vựng** với các từ chuẩn IELTS 7.5-8.5.

---

## Tham khảo

- [Ebbinghaus Forgetting Curve](https://en.wikipedia.org/wiki/Forgetting_curve)
- [Spaced Repetition - Anki](https://docs.ankiweb.net/spaced-repetition.html)
- [SM-2 Algorithm](https://super-memory.com/english/ol/2017/12/09/the-sm-2-algorithm.html)
- [MochiMochi App](https://mochimochi.app/)
