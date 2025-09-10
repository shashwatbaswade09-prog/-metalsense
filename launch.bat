@echo off
REM MetalSense Launch Script for Windows
REM This script will install dependencies and start the development servers

REM Set the Node.js path
set NODE_PATH=C:\Program Files\nodejs
set PATH=%PATH%;%NODE_PATH%

echo Node.js found at: %NODE_PATH%
echo.

echo Starting MetalSense development servers...
echo Frontend will be available at: http://localhost:5173
echo Backend API will be available at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the servers
echo.

"%NODE_PATH%\npm.cmd" run dev
