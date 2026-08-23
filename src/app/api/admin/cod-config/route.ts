import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  orderType: z.enum(["B2B", "B2C"]),
  isPercent: z.boolean(),
  value: z.number().nonnegative(),
});

export async function GET() {
  const configs = await prisma.codSurchargeConfig.findMany();
  return NextResponse.json(configs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { orderType, ...rest } = parsed.data;
  const config = await prisma.codSurchargeConfig.upsert({
    where: { orderType },
    update: rest,
    create: { orderType, ...rest },
  });

  return NextResponse.json(config, { status: 201 });
}
