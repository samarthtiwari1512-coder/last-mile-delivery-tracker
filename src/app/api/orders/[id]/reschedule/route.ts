import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { transitionOrderStatus } from "@/lib/orderStatus";
import { findBestAgentForOrder } from "@/lib/autoAssign";

const bodySchema = z.object({
  newDate: z.string().datetime(), // ISO date customer picked
});

/**
 * Failed-delivery flow:
 *   FAILED -> (customer submits new date) -> RESCHEDULED -> auto-assign -> ASSIGNED
 * A fresh agent is picked; the original agent is NOT force-reused, since
 * they may have gone offline or moved zones since the failed attempt.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUniqueOrThrow({ where: { id: params.id } });
  if (order.status !== "FAILED") {
    return NextResponse.json({ error: "Only a FAILED order can be rescheduled" }, { status: 409 });
  }
  if (session.user.role === "CUSTOMER" && order.customerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { rescheduledFor: new Date(parsed.data.newDate) },
  });

  await transitionOrderStatus({
    orderId: order.id,
    toStatus: "RESCHEDULED",
    actorId: session.user.id,
    actorRole: session.user.role,
    note: `Customer rescheduled for ${parsed.data.newDate}`,
  });

  const match = await findBestAgentForOrder(order.pickupZoneId);
  if (match) {
    await prisma.order.update({ where: { id: order.id }, data: { agentId: match.agentId } });
    await transitionOrderStatus({
      orderId: order.id,
      toStatus: "ASSIGNED",
      actorId: session.user.id,
      actorRole: session.user.role,
      note: `Reassigned to agent ${match.agentId} (${match.reason})`,
    });
  }

  const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { history: true } });
  return NextResponse.json(updated);
}
