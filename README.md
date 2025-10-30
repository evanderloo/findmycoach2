# FindMyCoach — MVP README (Start Here)

> The fastest way for **players** to find high-quality **coaches** and for **coaches** to see and capture **local demand**. Start with **Beach Volleyball**, expand sport-by-sport.

---

## TL;DR (What to do first)
1. **Install & run locally** → see [Quickstart](#quickstart).
2. **Create your .env** → copy `.env.example` and fill secrets.
3. **Run the smoke test** → create a player + coach, search, request, pre-auth (test) payment.
4. **Ship MVP** → track KPIs below; iterate weekly on the biggest drop-off.

**90‑day KPIs:** weekly coach signups, search→contact rate, bookings created, session completion %.  
**12‑month North Star:** GMV & repeat booking rate.

---

## Why this exists
- Players struggle to find great local coaches and form groups.  
- Coaches can’t see **where demand is** or keep calendars full.  
**FindMyCoach** solves both sides with: map-based search, simple booking, Stripe payments, reviews, and a **demand heatmap** that shows where players are searching and requesting sessions.

This is a **revenue engine**—instrument everything from day one.

---

## MVP Scope
**Player**
- Sign up & profile (level, location, languages).
- Search coaches near me (map + list), filters (price, level, language, availability).
- Message/request session (1:1 or **group** request).
- Checkout with **pre‑auth** (test mode).

**Coach**
- Sign up & profile (bio, pricing, radius, certifications, languages, media).
- Manage availability.
- **Demand Map**: heatmap of player demand (searches + unfilled requests).

**Common**
- Reviews after completed sessions.
- Basic policies (cancel/reschedule windows).
- **Feedback**: NPS after first session + micro-survey on failed search.
- Analytics: PostHog events for all core actions.

**Out‑of‑scope (v1)**: calendar sync, disputes, multi-currency, coupons, advanced messaging threads.

---

## Architecture & Stack
- **App:** Next.js 15 (App Router) + TypeScript
- **UI:** Tailwind + shadcn/ui + lucide-react
- **Auth:** NextAuth (credentials; providers later)
- **DB:** PostgreSQL (Supabase recommended) + Prisma
- **Geo:** lat/lng by default; optional **PostGIS** for server-tiling
- **Payments:** Stripe + Stripe Connect (Express payouts)
- **Maps:** Mapbox GL JS
- **Uploads:** UploadThing
- **Analytics:** PostHog
- **Deploy:** Vercel (web) + Supabase (DB)

---

## Directory Structure
```
.
├─ app/
│  ├─ (marketing)/page.tsx                # Landing page
│  ├─ (auth)/sign-in/page.tsx
│  ├─ (auth)/sign-up/player/page.tsx
│  ├─ (auth)/sign-up/coach/page.tsx
│  ├─ (player)/search/page.tsx            # Map + list search
│  ├─ (player)/groups/page.tsx
│  ├─ (coach)/demand-map/page.tsx
│  ├─ api/
│  │  ├─ webhooks/stripe/route.ts         # Stripe webhook
│  │  └─ waitlist/route.ts                # Landing email capture
│  └─ layout.tsx
├─ components/
│  ├─ ui/*                                # shadcn primitives
│  ├─ map/MapboxHeatmap.tsx               # Demand heatmap
│  └─ feedback/NPSModal.tsx               # NPS + micro-surveys
├─ lib/ (db.ts, auth.ts, stripe.ts, posthog.ts, zod.ts)
├─ prisma/ (schema.prisma, seed.ts)
├─ public/images/*
├─ .env.example
├─ package.json
└─ README.md
```

---

## Quickstart
### Prereqs
- **Node 20+**, **pnpm**
- **PostgreSQL 14+** (or Supabase)
- **Stripe** (test)
- **Mapbox** token
- (Optional) **PostHog** key

### Setup
```bash
git clone <your-repo-url> findmycoach
cd findmycoach
pnpm install
cp .env.example .env.local   # Fill values below
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed                 # Optional if seed.ts present
pnpm dev
# open http://localhost:3000
```

### Environment Variables
| Key | Req | Example | Notes |
|-----|-----|---------|-------|
| NEXTAUTH_URL | yes | http://localhost:3000 | Must match running URL |
| NEXTAUTH_SECRET | yes | long-random-string | `openssl rand -base64 32` |
| DATABASE_URL | yes | postgres://user:pass@localhost:5432/findmycoach | Supabase or local |
| DIRECT_URL | no | postgres://... | Non-pooled URL for migrations (Supabase) |
| STRIPE_PUBLISHABLE_KEY | yes | pk_test_… | Test mode |
| STRIPE_SECRET_KEY | yes | sk_test_… | Test mode |
| STRIPE_WEBHOOK_SECRET | yes | whsec_… | From `stripe listen` |
| PLATFORM_FEE_BPS | yes | 1500 | 15% platform fee |
| CURRENCY | yes | CHF | Default currency |
| NEXT_PUBLIC_MAPBOX_TOKEN | yes | pk.ey… | Public token |
| UPLOADTHING_SECRET | no | … | Uploads |
| UPLOADTHING_APP_ID | no | … |  |
| NEXT_PUBLIC_POSTHOG_KEY | no | phc_… | Analytics |
| NEXT_PUBLIC_POSTHOG_HOST | no | https://us.i.posthog.com | Region |
| GEO_DRIVER | no | latlng \| postgis | Use `postgis` if enabled |

> **Stripe webhook (local):**
> ```bash
> stripe listen --forward-to localhost:3000/api/webhooks/stripe
> # copy signing secret → STRIPE_WEBHOOK_SECRET
> ```

---

## First-Run Smoke Test (5–10 min)
1. **Create a Coach** account → add price, radius, languages, availability.
2. **Create a Player** account → go to **Search**, set your location.
3. **Search & Filter** → open a coach profile → **Request Session**.
4. Coach **accepts** → Stripe **pre‑auth** runs (test card `4242 4242 4242 4242`).
5. Mark session **completed** → **capture** runs → leave a **review**.
6. Verify **PostHog** events appear (`search_performed`, `session_requested`, `payment_pre_auth_succeeded`).

If any step fails, see [Troubleshooting](#troubleshooting).

---

## Analytics Events (minimum viable)
- `user_signed_up` (role)
- `search_performed` (filters, lat/lng, results_count)
- `coach_profile_viewed` (coach_id)
- `session_requested` (coach_id, group?, price)
- `payment_pre_auth_succeeded` / `payment_pre_auth_failed`
- `session_completed`
- `review_submitted` (rating)
- `demand_ping` (lat/lng, sport, level)

> Ship with **PostHog** key in dev. Data → decisions → conversion → revenue.

---

## Roadmap (MVP → v1.3)
- **v1.0 (MVP):** search, request, booking pre‑auth, reviews, basic NPS, client heatmap
- **v1.1:** server‑side heatmap tiles (PostGIS), improved availability UX
- **v1.2:** coach Pro (boost + insights), referral loop, refunds/cancellations
- **v1.3:** add sport #2 (Tennis/Padel), multi‑currency, calendar sync

---

## Contributing (Internal)
- **Branching:** `feat/*`, `fix/*`, `chore/*`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`…)
- **PR checks:** type‑safe (TS), lint clean, run smoke test steps
- **Security:** never commit secrets; use `.env.local` & Vercel env

**Security contact:** security@findmycoach.local (replace in prod)

---

## Troubleshooting
**Prisma P1001** – DB unreachable → check `DATABASE_URL`, DB running, network rules.  
**Supabase migrations** – set `DIRECT_URL` and run `pnpm prisma:migrate:deploy`.  
**NextAuth callback/CSRF** – `NEXTAUTH_URL` must match actual URL; set `NEXTAUTH_SECRET`.  
**Stripe webhook** – restart `stripe listen`; update `STRIPE_WEBHOOK_SECRET`.  
**Mapbox** – ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set.  
**PostHog** – verify key/host; disable ad‑blockers locally.

---

## License
MIT © FindMyCoach

---

## KPI Reminder (build wealth, not features)
Review weekly: **coach signups → search→contact → bookings → completion → reviews**. Ship 1 change that lifts the biggest drop‑off. Repeat.
