import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const zoneId = searchParams.get("zoneId") || undefined;
  const agentId = searchParams.get("agentId") || undefined;

  let where: any = {};

  if (session.user.role === "CUSTOMER") {
    where.customerId = session.user.id;
  } else if (session.user.role === "AGENT") {
    const agent = await prisma.agent.findUnique({ where: { userId: session.user.id } });
    where.agentId = agent?.id ?? "__none__";
  }
  // ADMIN sees everything, with optional filters
  if (status) where.status = status;
  if (zoneId) where.OR = [{ pickupZoneId: zoneId }, { dropZoneId: zoneId }];
  if (agentId && session.user.role === "ADMIN") where.agentId = agentId;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      pickupZone: true,
      dropZone: true,
      agent: { include: { user: true } },
      customer: true,
    },
  });

  return NextResponse.json(orders);
}
