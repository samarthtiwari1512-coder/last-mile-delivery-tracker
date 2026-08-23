# System Design Write-up — Last-Mile Delivery Tracker

## 1. Rate Calculation Engine

The rate engine's core design goal is that **no price-affecting number lives in code**. Every
figure — base charge, per-kg rate, minimum charge, COD surcharge — sits in two database tables,
`RateCard` and `CodSurchargeConfig`, edited only by an admin. The engine itself is a pure,
stateless pipeline (`calculateOrderCharge`) that takes raw order inputs and returns a priced
breakdown; it has no side effects, which makes it trivially testable and reusable.

The pipeline runs in a fixed order: resolve pickup/drop zones → classify the rate type
(intra vs inter, purely from whether the two zone IDs match) → compute volumetric weight
(`L×B×H / 5000`) → take the chargeable weight as `max(actual, volumetric)` → look up the single
`RateCard` row matching `(orderType, rateType)` → apply `baseCharge + perKgRate × weight`,
floored at `minCharge` → add COD surcharge if applicable. Because there are only two order
types and two rate types, the rate table is a fixed 4-row lookup rather than a rules engine —
simple enough to reason about, but general enough that an admin can retune pricing without a
deploy.

The most important design decision here is that **the same function powers the pre-confirmation
quote and the actual order creation**. A naive implementation might duplicate the pricing logic
between a "preview" endpoint and a "create" endpoint, which risks the quoted price silently
drifting from the charged price — a serious trust problem in a billing system. By routing both
through one function, that class of bug is structurally impossible.

## 2. Zone Detection Approach

Zone detection is intentionally the dumbest possible design: a pincode-to-zone lookup table
(`Area`), not geocoding, radius math, or polygon containment. For a last-mile logistics MVP,
pincodes already partition the country into small, well-understood units, and every shipment
already carries one. Using geocoded coordinates and a "distance to zone centroid" heuristic
would add complexity and ambiguity (what happens near a zone boundary?) without materially
improving correctness, since real courier networks also draw zone boundaries along pincode
lines for exactly this reason.

This also keeps zone management fully admin-driven: reassigning a pincode to a different zone,
or standing up a new zone, is a data change (`POST /api/admin/areas`), not a code change. The
trade-off is that an unmapped pincode fails closed — the order is rejected with a clear
`ZoneNotFoundError` rather than silently defaulting to some zone, which is the safer failure
mode for a billing-adjacent system.

## 3. Auto-Assignment Logic

Agent assignment is modeled as a two-tier strategy rather than a single algorithm, because the
"best" signal for nearest-agent depends on what data actually exists at runtime:

- **Tier 1 (geographic):** if agents are reporting live `latitude/longitude`, the system ranks
  `AVAILABLE` agents in the order's pickup zone by haversine distance to the pickup point and
  picks the closest. This is the "real" version of the feature.
- **Tier 2 (zone fallback):** if no agent has location data yet — e.g. before a mobile app with
  GPS reporting exists — the system instead picks the `AVAILABLE` agent in that zone with the
  fewest currently active orders, which approximates load-balancing without needing coordinates.

Splitting these into explicit tiers (rather than one blended scoring function) keeps each tier
simple, testable in isolation, and lets the system upgrade automatically the moment agents start
sending real coordinates, with zero schema or API changes. Availability itself is modeled as an
enum (`AVAILABLE / BUSY / OFFLINE`) on the `Agent` row rather than inferred from order state,
so an agent can be taken out of rotation (breaks, shift end) independent of what orders they're
currently carrying.

## 4. Failed Delivery Handling

A failed delivery is treated as a first-class state transition, not an error path bolted onto
the status field. `OUT_FOR_DELIVERY → FAILED` is a valid transition in the same state machine
that governs every other status change, which means it automatically gets an immutable history
row, a customer notification, and the transaction guarantee that `Order.status` and the audit
log never disagree.

Reschedule is deliberately a separate, explicit action rather than an automatic retry: the
customer picks a new date via `POST /api/orders/:id/reschedule`, which (1) records the date,
(2) transitions the order to `RESCHEDULED`, and (3) re-runs auto-assignment from scratch. The
original agent is **not** force-reassigned — they may have gone offline, left the zone, or
simply be busy — so re-running the same assignment logic used for fresh orders is both simpler
to maintain (one code path, not two) and more likely to find someone actually available for
the new date.

The state machine enforces that `RESCHEDULED` can only be reached from `FAILED`, and can only
move forward to `ASSIGNED`, preventing an order from being "rescheduled" out of an arbitrary
state by a client bug or malicious request — the only bypass is an explicit admin override,
which is itself logged with the actor's identity.

*(Word count: ~790)*
