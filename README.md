# IRCTC Apple-inspired web app

Initial Vite + React + TypeScript setup for a dark, Apple-inspired IRCTC booking experience.

## Run locally

```bash
npm install
npm run dev
```

## Supabase setup

1. Create a Supabase project at <https://supabase.com/dashboard>.
2. Copy your project URL from **Project Settings → API**.
3. Create a local `.env` file from `.env.example`.
4. Set `VITE_SUPABASE_URL` to your project URL.
5. Keep `VITE_SUPABASE_PUBLISHABLE_KEY` set to your publishable key.
6. In Supabase, enable the login providers you want under **Authentication → Sign In / Providers**.
7. Add your local dev URL, usually `http://localhost:5173`, under **Authentication → URL Configuration → Redirect URLs**.

Do not commit `.env`; only `.env.example` belongs in git.
