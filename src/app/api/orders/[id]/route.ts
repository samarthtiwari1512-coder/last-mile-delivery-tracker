import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      pickupZone: true,
      dropZone: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
      agent: { include: { user: { select: { name: true } } } },
      history: {
        orderBy: { timestamp: "asc" },
        include: { actor: { select: { name: true } } },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Role-based access: customers can only view their own orders
  if (session.user.role === "CUSTOMER" && order.customerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Agents can only view orders assigned to them
  if (session.user.role === "AGENT") {
    const agent = await prisma.agent.findUnique({ where: { userId: session.user.id } });
    if (!agent || order.agentId !== agent.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.json(order);
}
