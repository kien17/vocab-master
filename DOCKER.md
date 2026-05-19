# 🐳 Docker Setup - Vocab Master

## Cách sử dụng Docker để Test

### 1️⃣ Yêu cầu
- Docker & Docker Compose đã cài đặt
- Port 3000, 5432, 8000 trống
- Gemini API Key (hoặc skip vì test data)

### 2️⃣ Cài đặt nhanh

**Windows (PowerShell):**
```powershell
# B1: Copy .env.example
Copy-Item web-app\.env.example web-app\.env.local

# B2: Edit .env.local - chỉ cần fill GEMINI_API_KEY (optional)
# Hoặc skip vì sẽ dùng test data

# B3: Build & run
docker-compose up -d

# B4: Xem logs
docker-compose logs -f web
```

**Linux/Mac:**
```bash
cp web-app/.env.example web-app/.env.local

# Optional: Edit .env.local
# GEMINI_API_KEY=your_key

docker-compose up -d

docker-compose logs -f web
```

### 3️⃣ Kiểm tra

✅ Database chạy:
```bash
docker exec vocab-master-db psql -U postgres -d vocab_master -c "\dt"
```

✅ Web app chạy:
```
Open: http://localhost:3000
```

✅ API test:
```bash
curl http://localhost:3000/api/review-words?userId=user_test
```

### 4️⃣ Dừng containers

```bash
docker-compose down

# Xóa volumes (xóa database)
docker-compose down -v
```

---

## 📋 Services

| Service | Port | Container Name |
|---------|------|-----------------|
| **PostgreSQL** | 5432 | vocab-master-db |
| **Next.js** | 3000 | vocab-master-web |

---

## 📁 Cấu trúc Docker

```
docker-compose.yml          - Orchestration file
web-app/
├── Dockerfile            - Web app image
├── .dockerignore         - Exclude files
└── .env.local            - Environment (create from .env.example)
database.sql             - Auto-init database
```

---

## 🔧 Troubleshooting

### Port đã bị chiếm

```bash
# Kiểm tra
docker ps

# Xóa container cũ
docker-compose down
docker container prune
```

### Database error

```bash
# Check database logs
docker-compose logs postgres

# Reconnect
docker-compose down -v
docker-compose up -d
```

### App logs

```bash
# Real-time logs
docker-compose logs -f web

# Specific service
docker-compose logs postgres
```

### Build lỗi

```bash
# Rebuild image
docker-compose build --no-cache

# Start again
docker-compose up -d
```

---

## 📝 Thêm dữ liệu test

```bash
# SSH vào PostgreSQL
docker exec -it vocab-master-db psql -U postgres -d vocab_master

# Hoặc chạy SQL
docker exec vocab-master-db psql -U postgres -d vocab_master -f init.sql
```

---

## 🚀 Production Build

Nếu muốn build production:

```bash
# Build image
docker build -t vocab-master:latest web-app/

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e GEMINI_API_KEY=... \
  vocab-master:latest
```

---

## ✅ Environment Variables

Cần thiết:
- `GEMINI_API_KEY` - Optional (test có seed data)
- Supabase keys - Đã có default test keys

Edit file: `web-app/.env.local`

---

**Happy testing with Docker! 🐳🚀**
