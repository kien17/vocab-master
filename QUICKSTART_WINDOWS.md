# 🚀 Vocab Master - Quick Start (Windows)

## 1️⃣ Check Node.js
```bash
node --version  # Should be v18+
npm --version   # Should be v8+
```

If not installed: https://nodejs.org/

---

## 2️⃣ Setup Environment

### Copy template
```bash
cd web-app
copy .env.example .env.local
```

### Edit .env.local (use any text editor)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Get your API keys:
- **Supabase:** https://app.supabase.com → Settings → API
- **Gemini:** https://aistudio.google.com/app/apikey

### Setup Database:
- Supabase Dashboard → SQL Editor
- Paste entire content of `database.sql`
- Click "Run"

---

## 3️⃣ Install & Run

```bash
cd web-app

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Opens: http://localhost:3000

---

## 4️⃣ Setup Chrome Extension

1. Open `chrome://extensions/`
2. Turn ON "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Done! ✅

---

## 5️⃣ Test It!

1. Open any website
2. Select any word (e.g., "hello")
3. Right-click → "Lưu cụm từ vào Vocab Master"
4. See notification ✅ or ❌
5. Open http://localhost:3000
6. See flashcard and review!

---

## 🆘 Issues?

### "Cannot connect to server"
- Check: `npm run dev` is running
- Check: `.env.local` is filled correctly
- Check: Browser console (F12) for errors

### "Module not found"
```bash
npm install  # Run again
```

### "Port 3000 in use"
```bash
# Kill process or use different port
PORT=3001 npm run dev
```

### "API Key invalid"
- Double-check key in `.env.local`
- Re-copy from Supabase/Google
- Restart dev server

---

## 📚 Full Documentation

- **Setup:** See `SETUP.md`
- **API:** See `API.md`
- **Troubleshooting:** See `TROUBLESHOOTING.md`
- **Algorithm:** See `SPACED_REPETITION.md`

---

**All done! Happy learning! 🚀📚**
