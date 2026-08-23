import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { calculateOrderCharge } from "@/lib/rateEngine";
import { computeVolumetricWeightKg, computeChargeableWeightKg } from "@/lib/rateEngine";
import { sendOrderStatusEmail } from "@/lib/notifications";

const createSchema = z.object({
  customerId: z.string().optional(), // admin can set this; customers create for themselves
  pickupAddress: z.string().min(3),
  pickupPincode: z.string().min(3),
  dropAddress: z.string().min(3),
  dropPincode: z.string().min(3),
  lengthCm: z.number().positive(),
  breadthCm: z.number().positive(),
  heightCm: z.number().positive(),
  actualWeightKg: z.number().positive(),
  orderType: z.enum(["B2B", "B2C"]),
  paymentType: z.enum(["PREPAID", "COD"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  // Only admins can create an order "on behalf of" a different customer.
  const customerId =
    session.user.role === "ADMIN" && input.customerId ? input.customerId : session.user.id;

  try {
    const quote = await calculateOrderCharge(input);
    const volumetricWeightKg = computeVolumetricWeightKg(input.lengthCm, input.breadthCm, input.heightCm);
    const chargeableWeightKg = computeChargeableWeightKg(input.actualWeightKg, volumetricWeightKg);

    const order = await prisma.order.create({
      data: {
        customerId,
        createdById: session.user.id,
        pickupAddress: input.pickupAddress,
        pickupPincode: input.pickupPincode,
        pickupZoneId: quote.pickupZoneId,
        dropAddress: input.dropAddress,
        dropPincode: input.dropPincode,
        dropZoneId: quote.dropZoneId,
        lengthCm: input.lengthCm,
        breadthCm: input.breadthCm,
        heightCm: input.heightCm,
        actualWeightKg: input.actualWeightKg,
        volumetricWeightKg,
        chargeableWeightKg,
        orderType: input.orderType,
        paymentType: input.paymentType,
        rateType: quote.rateType,
        baseCharge: quote.baseCharge,
        weightCharge: quote.weightCharge,
        codSurcharge: quote.codSurcharge,
        totalCharge: quote.totalCharge,
        status: "PLACED",
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "PLACED",
        actorId: session.user.id,
        actorRole: session.user.role,
        note: "Order created",
      },
    });

    const customer = await prisma.user.findUniqueOrThrow({ where: { id: customerId } });
    await sendOrderStatusEmail(customer.email, order.id, "PLACED");

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
}
