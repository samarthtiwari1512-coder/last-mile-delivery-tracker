import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const zones = await prisma.zone.findMany({ include: { areas: true }, orderBy: { name: "asc" } });
  return NextResponse.json(zones);
}

const createSchema = z.object({ name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const zone = await prisma.zone.create({ data: { name: parsed.data.name } });
  return NextResponse.json(zone, { status: 201 });
}
