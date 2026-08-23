# Last-Mile Delivery Tracker

A delivery management platform where customers/admins create orders with auto-calculated,
zone-based charges, agents get assigned intelligently (manually or automatically), and
customers are notified by **email and SMS** at every status change.

Built with **Next.js 14 (App Router) + TypeScript + Prisma + PostgreSQL + NextAuth + Tailwind CSS**.

---

## 1. Quick Start

```bash
git clone https://github.com/samarthtiwari1512-coder/last-mile-delivery-tracker.git
cd last-mile-delivery-tracker
npm install
cp .env.example .env      # fill in DATABASE_URL, NEXTAUTH_SECRET, SMTP_*, and optionally TWILIO_*
npx prisma migrate dev --name init
npm run seed               # creates admin/agent/customer test accounts + zones + rate cards
npm run dev
```

App runs at `http://localhost:3000`.

### Seeded test accounts

| Role     | Email                              | Password      |
|----------|-------------------------------------|----------------|
| Admin    | admin@delivery-tracker.local        | Admin@123      |
| Agent    | agent1@delivery-tracker.local       | Agent@123      |
| Customer | customer1@delivery-tracker.local    | Customer@123   |

Seeded pincodes span 4 zones (North/South/East/West) so intra-zone vs inter-zone
pricing can be demoed immediately — see `prisma/seed.ts` for the exact pincode → zone map.

---

## 2. Environment Variables (`.env.example`)

```
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_tracker"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Delivery Tracker <no-reply@delivery-tracker.local>"
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_FROM_NUMBER="+15005550006"
```

- **DATABASE_URL**: any Postgres works — [Neon](https://neon.tech) or [Supabase](https://supabase.com)
  free tier is the fastest way to get a hosted DB for the deployed URL requirement.
- **SMTP**: any free-tier SMTP provider works (Gmail with an App Password, Mailtrap, Brevo).
  If `SMTP_HOST` is left empty, the app logs emails to the console instead of failing —
  useful for local dev without setting up SMTP.
- **Twilio SMS**: sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio) (no credit card
  for the trial). The trial provides a real phone number and ~15 SMS credits. Leave the three
  `TWILIO_*` vars blank for local dev — the app logs `[sms:mock]` to the console instead and
  still writes a `Notification` row to the DB. Note: trial accounts can only send to
  **verified** phone numbers (verify yours in the Twilio Console).

---

## 3. Database Schema

Full schema lives in `prisma/schema.prisma`. Summary:

- **User** — one table for all roles (`CUSTOMER` / `AGENT` / `ADMIN`), auth via NextAuth credentials + bcrypt.
- **Agent** — 1:1 with a `User(role=AGENT)`; tracks `currentZoneId`, optional live `lat/lng`, and `availability`.
- **Zone** — admin-defined delivery zones (e.g. North/South/East/West, or city-based).
- **Area** — maps a pincode to a `Zone`. This is the entire "zone detection" mechanism — it's a
  database lookup, not a hardcoded rule, so admins can remap pincodes without a code change.
- **RateCard** — one row per `(orderType, rateType)` combination — i.e. 4 rows total
  (B2B-intra, B2B-inter, B2C-intra, B2C-inter). Holds `baseCharge`, `perKgRate`, `minCharge`.
  Admin-editable via `/api/admin/rate-cards`.
- **CodSurchargeConfig** — one row per `orderType`, either a flat amount or a percentage.
- **Order** — captures the full snapshot of an order: addresses, resolved zones, package
  dimensions, computed weights, the priced breakdown, current status, and assigned agent.
- **OrderStatusHistory** — **append-only** audit trail. Every status transition inserts a new
  row with `status`, `actorId`, `actorRole`, `timestamp`. Rows are never updated or deleted —
  this is what "immutable tracking history" means in the brief.
- **Notification** — a log of every email sent, so notification delivery is auditable too.

---

## 4. Rate Calculation Logic

Implemented in `src/lib/rateEngine.ts`. Pipeline for every order:

1. **Zone detection** — look up `pickupPincode` and `dropPincode` in the `Area` table to get
   their `Zone`. If a pincode isn't mapped, the order is rejected with a clear error rather
   than silently guessing.
2. **Rate type** — `pickupZoneId === dropZoneId` → `INTRA_ZONE`, otherwise `INTER_ZONE`.
3. **Volumetric weight** — `(L × B × H) / 5000` (standard courier industry divisor, cm → kg).
4. **Chargeable weight** — `max(actualWeightKg, volumetricWeightKg)`.
5. **Rate card lookup** — fetch the `RateCard` row for `(orderType, rateType)`.
6. **Weight charge** — `baseCharge + perKgRate × chargeableWeight`, floored at `minCharge`.
7. **COD surcharge** — if `paymentType === COD`, add the configured flat amount or percentage
   of the weight charge, looked up from `CodSurchargeConfig`.
8. **Total** = weight charge + COD surcharge.

The same function (`calculateOrderCharge`) powers both the **pre-confirmation quote**
(`POST /api/orders/quote`) and the **actual order creation** (`POST /api/orders/create`), so
the price shown to the customer can never drift from the price actually charged.

No number in this pipeline is hardcoded in application code — every configurable value lives
in `RateCard` or `CodSurchargeConfig` and is editable by an admin through the admin API/dashboard.

---

## 5. Auto-Assignment Logic

Implemented in `src/lib/autoAssign.ts`, used by both admin-triggered auto-assign and the
reschedule-after-failure flow.

- **Tier 1 — geographic**: among `AVAILABLE` agents in the order's pickup zone who have a live
  `lat/lng`, rank by haversine distance to the pickup point and pick the closest.
- **Tier 2 — zone fallback**: if no agent has live coordinates yet, fall back to the
  least-loaded available agent in that zone (fewest active orders). This keeps the system
  functional before any live GPS integration exists, and it upgrades automatically the moment
  agents start sending coordinates.

Admins can always override with a manual assignment via `POST /api/orders/:id/assign`
(`mode: "MANUAL"`).

---

## 6. Order Status Lifecycle

```
PLACED → ASSIGNED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                                               ↘ FAILED → RESCHEDULED → ASSIGNED (loop)
```

Enforced centrally in `src/lib/orderStatus.ts` via a transition table — invalid jumps (e.g.
`PLACED → DELIVERED`) are rejected unless the actor is an `ADMIN` explicitly overriding.
Every transition is wrapped in a DB transaction that (a) updates `Order.status` and
(b) appends an `OrderStatusHistory` row, so the two can never go out of sync. A notification
email fires on every transition.

### Failed delivery → reschedule flow

`POST /api/orders/:id/reschedule` — only callable when `status === FAILED`:
1. Records the customer's new preferred date on the order.
2. Transitions status to `RESCHEDULED` (logged in history).
3. Runs the same auto-assignment logic to find a fresh agent (does **not** force-reuse the
   original agent, since they may be offline/relocated).
4. Transitions to `ASSIGNED` once a new agent is found.

---

## 7. API Overview

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register as customer or agent |
| POST | `/api/auth/[...nextauth]` | Login/session (NextAuth credentials) |
| POST | `/api/orders/quote` | Get a price quote before confirming |
| POST | `/api/orders/create` | Create an order (customer, or admin on behalf of customer) |
| GET | `/api/orders` | List orders (role-scoped: own orders / assigned orders / all, with filters for admin) |
| GET | `/api/orders/:id` | Single order with full `OrderStatusHistory` timeline (same role-based access) |
| PATCH | `/api/orders/:id/status` | Agent updates status; admin can override any transition |
| POST | `/api/orders/:id/assign` | Admin manual or auto agent assignment |
| POST | `/api/orders/:id/reschedule` | Customer reschedules a failed delivery |
| GET/POST | `/api/admin/zones` | List/create zones |
| GET/POST | `/api/admin/areas` | List/map pincodes to zones |
| GET/POST | `/api/admin/rate-cards` | List/update rate cards |
| GET/POST | `/api/admin/cod-config` | List/update COD surcharge config |

---

## 8. Deployment

1. Provision a free Postgres instance (Neon/Supabase/Railway) and set `DATABASE_URL`.
2. Deploy to Vercel/Render/Railway, setting the same env vars as `.env.example`.
3. Run `npx prisma migrate deploy && npm run seed` against the production DB once (via the
   platform's shell/one-off job, or a local `.env.production` pointed at the hosted DB).
4. Set `NEXTAUTH_URL` to the deployed domain.

---

## 9. Dependencies — why each one is here

Per submission guidelines, dependencies are kept to only what's strictly required:

| Package | Why it's necessary |
|---|---|
| `next`, `react`, `react-dom` | The framework itself — App Router, API routes, SSR |
| `@prisma/client`, `prisma` | Type-safe DB access matching the required schema/ORM |
| `next-auth`, `bcryptjs` | Role-based auth (customer/agent/admin) with hashed passwords — required by spec |
| `nodemailer` | Email notifications on every status change — required by spec |
| `twilio` | SMS notifications on every status change — required by spec ("Email and SMS integration"); no native Node.js SMS API exists |
| `zod` | Runtime validation for every API input (rejects malformed requests before they hit the DB) |
| `tailwindcss`, `postcss`, `autoprefixer` | Styling toolchain, dev-only |
| `typescript`, `tsx`, `@types/*` | Type safety and running the seed script, dev-only |

No UI component libraries, icon packs, state-management libraries, or analytics — everything
in the dependency tree is either the core stack or directly required by a feature in the brief.

---

## 10. Submission Checklist

- [x] `node_modules/`, `.next/`, `out/`, `dist/`, `.env`, `.vscode/`, `.idea/` all git-ignored
- [x] No unused/extra packages — see §9 above
- [x] App runs via `npm install && npx prisma migrate dev && npm run seed && npm run dev`
- [x] Public GitHub repo on the `main` branch: https://github.com/samarthtiwari1512-coder/last-mile-delivery-tracker
- [x] Repo is downloadable/clonable from a fresh, logged-out browser session
- [ ] Hosted deployment URL added below before submitting

---

## 11. What I'd add with more time

- Live agent location updates (mobile geolocation ping) instead of static `lat/lng`.
- Rate-card versioning so historical orders keep the rate that was active when they were placed.
- WebSocket or SSE-based real-time status push (currently requires a manual page refresh).
- Push notifications (FCM) for mobile-first customers alongside the existing email + SMS.
