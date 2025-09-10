# MetalSense Frontend

A modern, responsive React + TypeScript app for real-time heavy metal pollution mapping and safety advisories.

## Tech stack
- Vite, React 18, TypeScript
- Leaflet + leaflet.heat for interactive GIS heatmaps
- Zustand for app state
- Recharts for charts
- PapaParse for CSV upload

## Getting started

1. Install Node.js 18+ (recommended via nvm) and npm.
2. Install dependencies:
   npm install
3. Start the dev server:
   npm run dev

Then open the local URL printed in the terminal.

## Features (demo)
- Dashboard with risk summary and indices charts
- GIS Hotspot Map with heatmap, filters, markers, and a demo route planner that avoids high-risk zones
- Data Upload (CSV): parse and preview points
- Reports & Alerts
- Profile & Settings with dark mode and high-contrast
- Education & Leaderboard
- Floating FAQ chatbot widget

## Notes
- Map tiles use OpenStreetMap (no API key required)
- Real-time updates are simulated; connect to your backend via WebSocket/REST when available
- CSV expected headers: lat, lng, metal, value

