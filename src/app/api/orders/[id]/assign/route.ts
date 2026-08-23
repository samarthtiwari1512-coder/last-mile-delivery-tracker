import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { transitionOrderStatus } from "@/lib/orderStatus";
import { findBestAgentForOrder } from "@/lib/autoAssign";

const bodySchema = z.object({
  mode: z.enum(["MANUAL", "AUTO"]),
  agentId: z.string().optional(), // required if mode === MANUAL
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUniqueOrThrow({ where: { id: params.id } });

  let agentId: string | undefined;
  if (parsed.data.mode === "MANUAL") {
    if (!parsed.data.agentId) return NextResponse.json({ error: "agentId required for manual assignment" }, { status: 400 });
    agentId = parsed.data.agentId;
  } else {
    const match = await findBestAgentForOrder(order.pickupZoneId);
    if (!match) return NextResponse.json({ error: "No available agent found in pickup zone" }, { status: 409 });
    agentId = match.agentId;
  }

  await prisma.order.update({ where: { id: order.id }, data: { agentId } });
  const history = await transitionOrderStatus({
    orderId: order.id,
    toStatus: "ASSIGNED",
    actorId: session.user.id,
    actorRole: "ADMIN",
    note: `Assigned via ${parsed.data.mode}`,
    allowAdminOverride: true,
  });

  return NextResponse.json({ agentId, history });
}
