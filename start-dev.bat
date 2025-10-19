@echo off
echo 🚀 Starting Full Development Environment...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    call npm install
) else (
    echo ✅ Node.js dependencies already installed
)

REM Check if Python dependencies are installed
cd backend
python -c "import fastapi, uvicorn, pypdf" 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
) else (
    echo ✅ Python dependencies already installed
)
cd ..

echo.
echo 🐍 Starting Python PDF Service and React App...
echo 📝 This will open both services in one terminal
echo 🛑 Press Ctrl+C to stop both services
echo.

call npm run dev