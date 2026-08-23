import { prisma } from "./prisma";

/**
 * Auto-Assignment Engine
 * ------------------------------------------------------------------
 * Two-tier matching, in priority order:
 *
 *   1. GEOGRAPHIC (preferred): if the agent has a live lat/lng, rank
 *      AVAILABLE agents in the pickup zone by straight-line (haversine)
 *      distance to the pickup point and pick the closest.
 *
 *   2. ZONE FALLBACK: if no agent has location data (or none is close
 *      enough to matter for a demo), fall back to "first available
 *      agent whose currentZone matches the order's pickup zone",
 *      ordered by whoever has been idle longest (fewest active orders).
 *
 * Splitting it this way means the system still works before any GPS
 * integration exists, and upgrades automatically once agents start
 * sending live coordinates.
 */

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface AssignmentResult {
  agentId: string;
  reason: "GEOGRAPHIC" | "ZONE_FALLBACK";
  distanceKm?: number;
}

export async function findBestAgentForOrder(
  pickupZoneId: string,
  pickupLat?: number | null,
  pickupLng?: number | null
): Promise<AssignmentResult | null> {
  const candidates = await prisma.agent.findMany({
    where: { availability: "AVAILABLE", currentZoneId: pickupZoneId },
    include: { orders: { where: { status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } } } },
  });

  if (candidates.length === 0) return null;

  // Tier 1: geographic ranking, only among agents that have live coordinates.
  const withLocation = candidates.filter((a) => a.latitude != null && a.longitude != null);
  if (pickupLat != null && pickupLng != null && withLocation.length > 0) {
    let best = withLocation[0];
    let bestDist = haversineDistanceKm(pickupLat, pickupLng, best.latitude!, best.longitude!);
    for (const agent of withLocation.slice(1)) {
      const d = haversineDistanceKm(pickupLat, pickupLng, agent.latitude!, agent.longitude!);
      if (d < bestDist) {
        best = agent;
        bestDist = d;
      }
    }
    return { agentId: best.id, reason: "GEOGRAPHIC", distanceKm: bestDist };
  }

  // Tier 2: zone fallback, least-loaded agent wins.
  const sortedByLoad = [...candidates].sort((a, b) => a.orders.length - b.orders.length);
  return { agentId: sortedByLoad[0].id, reason: "ZONE_FALLBACK" };
}
