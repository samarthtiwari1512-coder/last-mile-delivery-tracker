import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateOrderCharge } from "@/lib/rateEngine";

const quoteSchema = z.object({
  pickupPincode: z.string().min(3),
  dropPincode: z.string().min(3),
  lengthCm: z.number().positive(),
  breadthCm: z.number().positive(),
  heightCm: z.number().positive(),
  actualWeightKg: z.number().positive(),
  orderType: z.enum(["B2B", "B2C"]),
  paymentType: z.enum(["PREPAID", "COD"]),
});

// Shown to the customer BEFORE they confirm the order — same function
// used again on confirm, so quote and final charge can never diverge.
export async function POST(req: NextRequest) {
  const parsed = quoteSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const quote = await calculateOrderCharge(parsed.data);
    return NextResponse.json(quote);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
}
