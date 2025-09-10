@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "E:\-metalsense"
echo Starting MetalSense Backend Server...
cd backend
npm run dev
