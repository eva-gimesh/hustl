<<<<<<< HEAD
# HUSTL

Student-focused talent platform (Freelance · Recruit · TeamUp), India-first (INR, en-IN formatting).

## Run locally
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env` and fill it in (a Supabase URL + publishable key; `GEMINI_API_KEY` optional).
4. `npm run dev` → http://localhost:3000

Production build: `npm run build` then `NODE_ENV=production npm start`.

## Supabase (run in the SQL Editor, in order)
1. `supabase/migrations/20250101000000_hustl_core_schema.sql`
2. `supabase/migrations/20260103000000_hustl_security_hardening.sql`

Never put a service-role key or DB password in `.env`.

## AI
Runs through `server.ts` (key stays server-side). Without `GEMINI_API_KEY` the AI panels show "not configured".

## Known limitations
- Freelance / Recruit / TeamUp load seed data from localStorage and sync to Supabase in the background.
- Messaging and notifications are localStorage-only (not wired to Supabase yet). Secure RPCs exist in the hardening migration.
- Demo login (local mode): hamlin.jaiju@gmail.com / password123
=======
# hustl
>>>>>>> 96b0c11eecf0fbf447a2356af2e2d0be91f0fc62
