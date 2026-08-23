import { prisma } from "./prisma";
import { OrderStatus } from "@prisma/client";

/**
 * SMS Notification Service
 * ------------------------------------------------------------------
 * Parallel to notifications.ts (email). Uses Twilio's free-trial tier
 * to send a text to the customer's phone number on every status change.
 *
 * Configuration (add to .env):
 *   TWILIO_ACCOUNT_SID   — found in the Twilio Console dashboard
 *   TWILIO_AUTH_TOKEN    — found in the Twilio Console dashboard
 *   TWILIO_FROM_NUMBER   — the Twilio trial phone number (e.g. +15005550006)
 *
 * If any of these are absent the function logs a [sms:mock] line and still
 * writes a Notification row to the database — same "log instead of throw"
 * pattern used in notifications.ts for SMTP.
 *
 * Twilio free-trial limitation: can only send to verified numbers. For the
 * assignment demo, verify your own number in the Twilio Console. The DB row
 * proves the intent even if the SMS itself is restricted.
 */

const STATUS_SMS: Record<OrderStatus, string> = {
  PLACED: "Your order has been placed. We'll notify you when an agent is assigned.",
  ASSIGNED: "A delivery agent has been assigned to your order. Pickup coming soon!",
  PICKED_UP: "Your package has been picked up and is on its way.",
  IN_TRANSIT: "Your package is in transit to the destination hub.",
  OUT_FOR_DELIVERY: "Your package is out for delivery today. Stay nearby!",
  DELIVERED: "Your package has been delivered. Thank you for using our service!",
  FAILED:
    "Delivery attempt failed. Please log in to reschedule from your dashboard.",
  RESCHEDULED:
    "Your delivery has been rescheduled. A new agent will be assigned shortly.",
  CANCELLED: "Your order has been cancelled.",
};

export async function sendOrderStatusSms(
  toPhone: string | null | undefined,
  orderId: string,
  status: OrderStatus,
  extraNote?: string
) {
  // If the customer has no phone number registered, skip silently.
  if (!toPhone) return;

  const shortId = orderId.slice(-8).toUpperCase();
  let body = `[Delivery Tracker] Order ${shortId}: ${STATUS_SMS[status]}`;
  if (extraNote) body += ` Note: ${extraNote}`;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  let sendStatus = "SENT";

  try {
    if (sid && token && from) {
      // Lazily import twilio so the module doesn't crash when env vars are absent
      const twilio = (await import("twilio")).default;
      const client = twilio(sid, token);
      await client.messages.create({ body, from, to: toPhone });
    } else {
      // No Twilio configured — log instead of throwing, same as SMTP behaviour
      console.log(`[sms:mock] to=${toPhone} body="${body}"`);
    }
  } catch (err) {
    sendStatus = "FAILED";
    console.error("SMS send failed:", err);
  }

  await prisma.notification.create({
    data: {
      orderId,
      channel: "SMS",
      recipient: toPhone,
      subject: `Order ${shortId} — ${status}`,
      body,
      status: sendStatus,
    },
  });
}
