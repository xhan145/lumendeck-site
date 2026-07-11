# LumenDeck — Marketing Site

A fast, single-page landing site advertising **[LumenDeck](https://github.com/xhan145/lumendeck)** — the open-source, local-first (cloud-optional) AI creation studio with the Constellation System (currently **v0.33.0**).

Static HTML/CSS/JS (no build step) + a Supabase-backed email waitlist, deployed on Vercel from GitHub.

## What the page covers

Hero with the GitHub repo as the primary CTA, plus a nine-card "What's inside" feature grid:
**Constellation System**, **Creative Intelligence** (Craft insights + Prompt Lab lineage), **Node
graph + Recipe view**, **Video Export Suite** (WebM/VP9), **Shareable Showcase** + hosted
share-links, **Studio Overview** dashboard, and the newest work — **3D Node Control** (position as a
control surface in the volumetric constellation), **Glass Cinema UI** (glassmorphism shell + splash),
and **optional Cloud providers** (OpenAI, Stability, Fal, Replicate, Runway; opt-in, keys stored by
the local bridge). Followed by the constellation deep-dive, a Creative Intelligence section,
local-first pillars, who-it's-for, and a final GitHub CTA.

Keep the version badge and the "new"-badged cards in sync with the app's `main` — only advertise
features merged to `main` (check `git show origin/main:package.json`), not feature branches.

### Graphics & animation

Animated constellation `<canvas>` starfield, drifting aurora glow, orbiting hero scene with pointer
parallax, animated SVG feature-card icons, and scroll-reveal on every section. Scroll-reveal is
**fail-safe**: the hidden state is gated behind a JS-added `.reveal-on` class, in-view elements
reveal immediately, and a catch-all timer guarantees content never stays hidden.

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
