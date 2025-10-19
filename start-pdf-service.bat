@echo off
echo Starting PDF Extraction Service...
echo.

cd backend

echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting PDF service on http://localhost:8001...
echo Press Ctrl+C to stop the service
echo.

python -m uvicorn pdf_service:app --host 0.0.0.0 --port 8001 --reload