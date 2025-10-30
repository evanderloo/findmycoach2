# FindMyCoach

FindMyCoach is a two-sided marketplace that connects Beach Volleyball players with qualified coaches. The MVP is built with Next.js 15, Prisma, PostgreSQL, Stripe, and Mapbox.

## Tech stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- NextAuth for authentication
- Prisma ORM with PostgreSQL (Supabase ready)
- Stripe Payments + Connect for coach payouts
- Mapbox GL for maps and heatmaps
- PostHog for product analytics

## Getting started locally

1. **Install dependencies**
   ```bash
   pnpm install
   # or npm install
   ```
2. **Copy env template**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `DATABASE_URL` (Supabase or local Postgres)
   - `NEXTAUTH_SECRET` (generate via `openssl rand -base64 32`)
   - `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)
3. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
4. **Run the dev server**
   ```bash
   pnpm dev
   ```
5. Navigate to `http://localhost:3000`.

### Stripe webhooks
Use the Stripe CLI to forward webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

### Mapbox styles
Mapbox GL styles are loaded from `mapbox://styles/mapbox/light-v11`. Adjust the token in `.env` if you maintain a custom style.

### Seed users
After seeding you can sign in with:
- Player: `player@example.com` / `Password123!`
- Coach: `coach@example.com` / `Password123!`

## Deployment
- **Web**: Vercel. Set the environment variables above in Vercel project settings.
- **Database**: Supabase (PostgreSQL). Run `prisma migrate deploy` during deploy.
- **Payments**: Stripe dashboard. Configure webhook endpoint to `https://your-domain/api/webhooks`.
- **Maps**: Mapbox token stored as `NEXT_PUBLIC_MAPBOX_TOKEN`.

### Production checklist
- Configure NextAuth email provider or OAuth providers as required.
- In Stripe, enable Connect with Express accounts and add restricted API keys to Vercel.
- Set PostHog host/key to production project.
- Update `NEXT_PUBLIC_APP_URL` to production domain for Stripe Connect redirects.
- Enable Supabase Row Level Security rules as needed.

## Troubleshooting
- **Prisma/PostGIS issues**: ensure the `postgis` extension is enabled in your database.
- **Stripe signature errors**: confirm the webhook secret matches the CLI/Stripe dashboard.
- **Mapbox blank map**: check that the access token has `styles:read` scope.
- **NextAuth session**: reset cookies or ensure `NEXTAUTH_SECRET` is consistent across redeploys.

## Scripts
- `pnpm dev` – run the Next.js dev server
- `pnpm build` – build for production
- `pnpm start` – start production server
- `pnpm lint` – run Next.js ESLint
- `pnpm prisma:migrate` – run Prisma migrations
- `pnpm prisma:generate` – generate Prisma client

## License
Internal use for FindMyCoach MVP.
