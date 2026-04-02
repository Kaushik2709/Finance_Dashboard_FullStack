# Finance Frontend (Vite + React)

## Prereqs

- Node.js 18+ (Node 20+ recommended)
- The backend running from `Finance_api` (Express)

## Configure API

This app calls the backend via `/api/*` by default and uses a Vite dev proxy.

1) Copy env file:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

2) If your backend runs on a non-default port, edit `.env`:

- `VITE_API_PROXY_TARGET=http://localhost:3000` (set this to your backend origin)

> If you deploy the frontend separately, you can set `VITE_API_URL` to a full URL like `https://your-backend.com/api`.

## Run

```bash
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`).
