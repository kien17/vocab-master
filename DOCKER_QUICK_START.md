# 🐳 Docker Compose Guide

## Quick Start (Windows - PowerShell)

```powershell
# 1. Vào thư mục vocab-master
cd d:\HocTap\Du_an_ca_nhan\web\vocab-master

# 2. Copy environment file
Copy-Item web-app\.env.docker web-app\.env.local

# 3. Build & Run
docker-compose -f docker-compose.dev.yml up -d

# 4. Check logs
docker-compose -f docker-compose.dev.yml logs -f web

# 5. Open browser
# http://localhost:3000
```

## Quick Start (Linux/Mac)

```bash
cd ~/path/to/vocab-master

cp web-app/.env.docker web-app/.env.local

docker-compose -f docker-compose.dev.yml up -d

docker-compose -f docker-compose.dev.yml logs -f web

# http://localhost:3000
```

---

## 📋 Services chạy

| Service | URL | Container |
|---------|-----|-----------|
| **Web App** | http://localhost:3000 | vocab-master-web |
| **Database** | localhost:5432 | vocab-master-db |

---

## 🧪 Test

### 1. Check database tồn tại
```bash
docker exec vocab-master-db psql -U postgres -d vocab_master -c "\dt"

# Output nên thấy: vocabulary, user_progress
```

### 2. Check web app chạy
```bash
# Browser
http://localhost:3000

# Hoặc curl
curl http://localhost:3000
```

### 3. Test API
```bash
# Add word
curl -X POST http://localhost:3000/api/add-word \
  -H "Content-Type: application/json" \
  -d '{"word":"test","userId":"user_docker"}'

# Get review words
curl "http://localhost:3000/api/review-words?userId=user_docker"
```

---

## 🛑 Stop & Cleanup

### Stop containers (dữ liệu vẫn lưu)
```bash
docker-compose -f docker-compose.dev.yml down
```

### Stop + xóa database
```bash
docker-compose -f docker-compose.dev.yml down -v
```

### Xóa tất cả
```bash
docker-compose -f docker-compose.dev.yml down -v
docker image rm vocab-master-web
```

---

## 📊 Logs & Debugging

### View logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs

# Specific service
docker-compose -f docker-compose.dev.yml logs web
docker-compose -f docker-compose.dev.yml logs postgres

# Real-time
docker-compose -f docker-compose.dev.yml logs -f web
```

### SSH into containers
```bash
# Web app
docker exec -it vocab-master-web sh

# Database
docker exec -it vocab-master-db psql -U postgres -d vocab_master
```

### Check container status
```bash
docker-compose -f docker-compose.dev.yml ps

# Output:
# NAME                IMAGE               STATUS
# vocab-master-web    vocab-master:dev    Up ...
# vocab-master-db     postgres:15         Up ...
```

---

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows

lsof -i :3000  # Linux/Mac

# Kill process & retry
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

### Database connection error
```bash
# Kiểm tra database logs
docker-compose -f docker-compose.dev.yml logs postgres

# Restart database
docker-compose -f docker-compose.dev.yml restart postgres

# Nếu vẫn lỗi, reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Web app không start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs web

# Rebuild image
docker-compose -f docker-compose.dev.yml build --no-cache

# Restart
docker-compose -f docker-compose.dev.yml up -d
```

### Hot reload không hoạt động
```bash
# Ensure volumes mounted correctly
docker-compose -f docker-compose.dev.yml logs web | grep "volumes"

# Rebuild containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📦 Files

| File | Mục đích |
|------|---------|
| `docker-compose.dev.yml` | Development setup với hot reload |
| `web-app/Dockerfile.dev` | Dev image (mã hot reload) |
| `web-app/Dockerfile` | Production image |
| `web-app/.dockerignore` | Exclude files từ image |
| `web-app/.env.docker` | Environment template |
| `database.sql` | Database initialization |

---

## 💡 Tips

### Auto-start on reboot
```bash
docker-compose -f docker-compose.dev.yml up -d --restart unless-stopped
```

### View resource usage
```bash
docker stats vocab-master-web
docker stats vocab-master-db
```

### Backup database
```bash
docker exec vocab-master-db pg_dump -U postgres vocab_master > backup.sql
```

### Restore database
```bash
docker exec -i vocab-master-db psql -U postgres vocab_master < backup.sql
```

---

## ✅ Production Build

```bash
# Build production image
docker-compose -f docker-compose.yml build

# Run production
docker-compose -f docker-compose.yml up -d
```

---

**Happy Docker testing! 🐳🚀**
