import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  pincode: z.string().min(3),
  label: z.string().optional(),
  zoneId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const area = await prisma.area.upsert({
    where: { pincode: parsed.data.pincode },
    update: { zoneId: parsed.data.zoneId, label: parsed.data.label },
    create: parsed.data,
  });

  return NextResponse.json(area, { status: 201 });
}

export async function GET() {
  const areas = await prisma.area.findMany({ include: { zone: true }, orderBy: { pincode: "asc" } });
  return NextResponse.json(areas);
}
