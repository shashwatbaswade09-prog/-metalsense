# MetalSense - Environmental Risk Assessment Platform

## 🌊 Live Demo
Visit the deployed application: **[MetalSense on GitHub Pages](https://shashwatbaswade09-prog.github.io/-metalsense/)**

## 🎯 Major Features
- **Location-First Workflow**: Set coordinates once, add multiple metal measurements
- **Environmental Risk Assessment**: Comprehensive HPI calculations with WHO standards  
- **Real-time Results**: Color-coded risk visualization and professional reporting
- **Python Backend**: Scientific calculation engine for environmental indices
- **Interactive GIS Mapping**: Leaflet-based pollution visualization
- **Test Scenarios**: Complete test data from clean to critical contamination

A comprehensive web application for monitoring and tracking environmental pollution data with interactive mapping, real-time alerts, and data visualization.

## 🏗️ Architecture

This is a monorepo containing:

- **`frontend/`** - React + TypeScript web application with interactive GIS mapping
- **`backend/`** - Node.js + Express API server with real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git

### Installation & Development

```bash
# Clone the repository
git clone git@github.com:shashwatbaswade09-prog/metalsense.git
cd metalsense

# Install dependencies for all workspaces
npm run install:all

# Start both frontend and backend in development mode
npm run dev
```

This will start:
- Backend API server on http://localhost:3001
- Frontend development server on http://localhost:5173

### Individual Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only 
npm run dev:backend

# Build all
npm run build

# Run tests
npm run test
```

## 📁 Project Structure

```
metalsense/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   └── package.json
├── backend/           # Express TypeScript backend
│   ├── src/
│   │   ├── routes/
│   │   ├── data/
│   │   └── types/
│   └── package.json
└── package.json       # Root workspace configuration
```

## 🎯 Features

- **Interactive GIS Mapping** with pollution hotspots and heatmaps (Leaflet)
- **Multi-role User System** (Citizen, Researcher, Government Official)
- **Real-time Data Updates** via Server-Sent Events (SSE)
- **Data Upload & Validation** with CSV parsing
- **Dashboard & Analytics** with charts and visualizations
- **Incident Reporting** with geolocation
- **Alert System** with customizable notifications
- **Educational Content** with gamification elements
- **Floating FAQ Chatbot** for user assistance

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Leaflet (mapping)
- Recharts (data visualization)
- Zustand (state management)
- Tailwind CSS (styling)

**Backend:**
- Node.js + Express + TypeScript
- OpenAPI 3.1 specification
- Server-Sent Events for real-time updates
- In-memory data store (demo)

## 🔧 Development

### API Documentation
The backend includes comprehensive OpenAPI 3.1 documentation. Start the backend and visit:
- Swagger UI: http://localhost:3001/api-docs
- OpenAPI spec: http://localhost:3001/api/openapi.json

### Environment Setup
Both frontend and backend can be configured via environment variables. See respective `.env.example` files in each workspace.

## 📄 License

MIT License - see LICENSE file for details.
