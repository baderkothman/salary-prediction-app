# SalaryLens Frontend

Next.js dashboard for reading salary prediction history from Supabase and running new prediction analyses through the FastAPI backend.

## Local Development

From this folder:

```powershell
npm install
npm run dev
```

The dashboard runs at:

```text
http://localhost:3000
```

## Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Checks

```powershell
npm run lint
npm run build
```
