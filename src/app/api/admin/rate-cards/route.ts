import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderType: z.enum(["B2B", "B2C"]),
  rateType: z.enum(["INTRA_ZONE", "INTER_ZONE"]),
  baseCharge: z.number().nonnegative(),
  perKgRate: z.number().nonnegative(),
  minCharge: z.number().nonnegative(),
});

export async function GET() {
  const cards = await prisma.rateCard.findMany({ orderBy: [{ orderType: "asc" }, { rateType: "asc" }] });
  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { orderType, rateType, ...rest } = parsed.data;
  const card = await prisma.rateCard.upsert({
    where: { orderType_rateType: { orderType, rateType } },
    update: rest,
    create: { orderType, rateType, ...rest },
  });

  return NextResponse.json(card, { status: 201 });
}
