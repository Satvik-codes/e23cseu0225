# Campus Notification Platform (`e23cseu0225`)

Full-stack project using React (Vite) + Express + Socket.IO with shared local logging middleware.

## Prerequisites

- Node.js 18+ and npm
- Internet access to reach evaluation service endpoints

## Install Dependencies

From repository root:

```bash
cd logging_middleware && npm install
cd ../notification_app_be && npm install
cd ../notification_app_fe && npm install
```

## Environment Setup

Create `notification_app_be/.env` with:

```env
PORT=5000
CLIENT_ID=...
CLIENT_SECRET=...
AUTH_URL=http://4.224.186.213/evaluation-service/auth
NOTIFICATIONS_URL=http://4.224.186.213/evaluation-service/notifications
LOGS_URL=http://4.224.186.213/evaluation-service/logs
CLIENT_EMAIL=...
CLIENT_NAME=...
CLIENT_ROLL_NO=...
CLIENT_ACCESS_CODE=...
```

Create `notification_app_fe/.env` with:

```env
VITE_CLIENT_ID=...
VITE_CLIENT_SECRET=...
VITE_AUTH_URL=http://4.224.186.213/evaluation-service/auth
VITE_BACKEND_URL=http://localhost:5000
VITE_CLIENT_EMAIL=...
VITE_CLIENT_NAME=...
VITE_CLIENT_ROLL_NO=...
VITE_CLIENT_ACCESS_CODE=...
```

## Run Project

Backend (must run on `5000`):

```bash
cd notification_app_be
npm run dev
```

Frontend (must run on `3000`):

```bash
cd notification_app_fe
npm run dev -- --port 3000
```

Open:

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:5000/api/health`

## Build Check

Frontend production build:

```bash
cd notification_app_fe
npm run build
```

## Manual Verification Checklist

1. Backend:
   - `GET /api/health`
   - `GET /api/notifications`
   - `GET /api/notifications?notification_type=Placement&limit=5&page=1`
   - `GET /api/notifications?notification_type=Result&limit=10`
   - `GET /api/notifications/priority`
   - `GET /api/notifications/priority?n=5`
2. Frontend:
   - All Notifications page loads at `/`
   - Filters, pagination, and limit changes work
   - Priority Inbox page loads at `/priority`
   - Top-N selector works (`5,10,15,20`)
   - Seen/unseen state persists across refresh
   - Real-time banner appears on socket event

## Screenshot Paths

- Backend screenshots: `notification_app_be/screenshots/`
- Frontend screenshots: `notification_app_fe/screenshots/`

