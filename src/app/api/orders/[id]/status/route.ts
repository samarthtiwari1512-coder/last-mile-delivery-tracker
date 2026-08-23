import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { transitionOrderStatus } from "@/lib/orderStatus";

const bodySchema = z.object({
  status: z.enum([
    "ASSIGNED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED",
    "CANCELLED",
  ]),
  note: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only the assigned agent or an admin may move an order forward.
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const history = await transitionOrderStatus({
      orderId: params.id,
      toStatus: parsed.data.status,
      actorId: session.user.id,
      actorRole: session.user.role,
      note: parsed.data.note,
      allowAdminOverride: session.user.role === "ADMIN",
    });
    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
