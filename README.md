# LumenDeck — Marketing Site

A simple, fast, single-page landing site advertising **[LumenDeck](https://github.com/xhan145/lumendeck)** — the local-first AI creation studio with the Constellation System.

Static HTML/CSS/JS (no build step) + a Supabase-backed email waitlist, deployed on Vercel from GitHub.

## Stack

| Layer     | Choice                                                            |
|-----------|-------------------------------------------------------------------|
| Frontend  | Plain HTML + CSS + ES modules (animated constellation canvas)     |
| Backend   | Supabase — `lumendeck_waitlist` table + `lumendeck_waitlist_count()` RPC |
| Hosting   | Vercel (static), auto-deploys on every push to `main`             |
| Source    | GitHub                                                            |

## Local preview

No build step. Serve the folder with any static server:

```bash
npx serve .
# or
python -m http.server 5173
```

Then open the printed URL.

## Supabase backend

Lives in the shared **"The Collective"** project (isolated by table + RLS), not a separate project.

- **Table** `public.lumendeck_waitlist` — `id`, `email` (unique), `source`, `created_at`
- **RLS** — anonymous users may **INSERT only**. No read/update/delete of rows.
- **Counter** — `public.lumendeck_waitlist_count()` is a `security definer` function granted to `anon`, so the page can show a total without exposing any email.

Public config (safe to commit — publishable key + RLS) lives in [`config.js`](config.js).

### Export signups

```sql
select email, source, created_at
from public.lumendeck_waitlist
order by created_at desc;
```

## Deploy workflow (push → pull → commit → deploy)

1. Edit files locally.
2. `git add -A && git commit -m "..."`
3. `git push` → Vercel auto-builds and deploys `main` to production.

Vercel is linked to this GitHub repo; there are no build/env secrets required (the
publishable Supabase key is public by design).

## Files

- `index.html` — page markup and sections
- `styles.css` — dark "creative observatory" theme + responsive layout
- `app.js` — Supabase client, waitlist forms, live counter, constellation canvas
- `config.js` — public Supabase URL + publishable key
- `vercel.json` — clean URLs + basic security headers
