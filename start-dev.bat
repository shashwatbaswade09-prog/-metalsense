@echo off
echo 🚀 Starting MetalSense Development Environment

REM Function to check if a port is in use
REM Windows version - using netstat
netstat -an | findstr "LISTENING" | findstr ":8001" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Python service already running on port 8001
    goto check_node
)

REM Start Python service
echo 🐍 Starting Python Environmental Calculations Service...
cd python-service

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Start the service in background
echo 🌟 Starting Python service on port 8001...
start /b python main.py
cd ..

:check_node
REM Check if Node.js services are already running
netstat -an | findstr "LISTENING" | findstr ":5173" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Node.js services already running
    goto finish
)

REM Start Node.js services
echo 🟢 Starting Node.js services...

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Start development servers
echo 🌟 Starting development servers...
start /b npm run dev

:finish
echo ✅ All services started!
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:4000
echo 🐍 Python API: http://localhost:8001
echo 📊 Python API Docs: http://localhost:8001/docs
echo.
echo Press any key to stop all services...
pause >nul

REM Stop services (Windows doesn't have easy process management, so we'll just inform the user)
echo 🛑 To stop services manually:
echo - Close this window or press Ctrl+C in the terminal windows
echo - Or use Task Manager to end Node.js and Python processes
