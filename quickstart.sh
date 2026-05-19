#!/bin/bash
# 🚀 Vocab Master - Quick Start Script (Linux/Mac)
# Windows: Chạy các command thủ công từ QUICKSTART_WINDOWS.md

echo "🎉 Vocab Master Quick Start"
echo "=============================="
echo ""

# 1. Kiểm tra Node.js
echo "1️⃣ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node --version) found"
echo ""

# 2. Kiểm tra và tạo .env.local
echo "2️⃣ Setting up environment..."
cd web-app
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your API keys:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - GEMINI_API_KEY"
    echo ""
    read -p "Press Enter when you've filled in .env.local..."
fi
echo "✅ Environment configured"
echo ""

# 3. Install dependencies
echo "3️⃣ Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ npm install failed"
    exit 1
fi
echo ""

# 4. Start dev server
echo "4️⃣ Starting dev server..."
echo "📝 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Load extension from chrome://extensions/"
echo "   3. Test: Right-click on any word → Save"
echo ""
echo "🚀 Dev server starting..."
npm run dev
