import nodemailer from "nodemailer";
import { prisma } from "./prisma";
import { OrderStatus } from "@prisma/client";

/**
 * Notification Service
 * ------------------------------------------------------------------
 * Uses any SMTP provider via env vars (Gmail app password, Mailtrap,
 * Brevo, etc. all work on their free tiers). Every send is logged to
 * the Notification table so there's an auditable record even if the
 * email itself is only visible in the recipient's inbox.
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const STATUS_COPY: Record<OrderStatus, { subject: string; body: string }> = {
  PLACED: { subject: "Order placed", body: "We've received your order and are getting it ready for pickup." },
  ASSIGNED: { subject: "Agent assigned", body: "A delivery agent has been assigned to your order." },
  PICKED_UP: { subject: "Package picked up", body: "Your package has been picked up and is on its way." },
  IN_TRANSIT: { subject: "In transit", body: "Your package is in transit to your city/hub." },
  OUT_FOR_DELIVERY: { subject: "Out for delivery", body: "Your package is out for delivery today." },
  DELIVERED: { subject: "Delivered", body: "Your package has been delivered. Thank you!" },
  FAILED: { subject: "Delivery attempt failed", body: "We couldn't deliver your package. You can reschedule from your dashboard." },
  RESCHEDULED: { subject: "Delivery rescheduled", body: "Your delivery has been rescheduled and a new agent will be assigned." },
  CANCELLED: { subject: "Order cancelled", body: "Your order has been cancelled." },
};

export async function sendOrderStatusEmail(
  toEmail: string,
  orderId: string,
  status: OrderStatus,
  extraNote?: string
) {
  const copy = STATUS_COPY[status];
  const subject = `Order ${orderId.slice(-8).toUpperCase()} — ${copy.subject}`;
  const body = extraNote ? `${copy.body}\n\nNote: ${extraNote}` : copy.body;

  let sendStatus = "SENT";
  try {
    if (process.env.SMTP_HOST) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? "no-reply@delivery-tracker.local",
        to: toEmail,
        subject,
        text: body,
      });
    } else {
      // No SMTP configured (e.g. local dev) — log instead of throwing.
      console.log(`[email:mock] to=${toEmail} subject="${subject}" body="${body}"`);
    }
  } catch (err) {
    sendStatus = "FAILED";
    console.error("Email send failed:", err);
  }

  await prisma.notification.create({
    data: {
      orderId,
      channel: "EMAIL",
      recipient: toEmail,
      subject,
      body,
      status: sendStatus,
    },
  });
}
