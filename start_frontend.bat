@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "E:\-metalsense"
echo Starting MetalSense Frontend Server...
cd frontend
npm run dev
