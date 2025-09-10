# MetalSense Backend (demo)

A minimal Express + TypeScript API matching the frontend and OpenAPI spec (mocked data, SSE realtime).

## Prereqs
- Node.js 18+

## Install and run (dev)
- npm install
- npm run dev

The API will listen at http://localhost:4000/api/v1

## Endpoints (high level)
- Auth: POST /auth/login, /auth/refresh (stubs), GET /me
- Hotspots: GET /hotspots, GET /hotspots/:id
- Incidents: POST /incidents, GET /incidents
- Indices: GET /indices/timeseries
- Datasets: POST /datasets (multipart), GET /datasets, GET /datasets/:id, GET /datasets/:id/validation
- Compliance: GET /compliance/industries
- Alerts: GET /alerts?since=ISO
- Routing: POST /routes/plan
- Realtime (SSE): GET /events/sse

CORS is enabled for any origin in dev. Update as needed for production.

