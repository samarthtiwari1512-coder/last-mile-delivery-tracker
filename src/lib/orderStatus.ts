import { prisma } from "./prisma";
import { OrderStatus, Role } from "@prisma/client";
import { sendOrderStatusEmail } from "./notifications";

/**
 * Status Lifecycle
 * ------------------------------------------------------------------
 * PLACED -> ASSIGNED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
 *                                                                   -> FAILED -> RESCHEDULED -> ASSIGNED (loop)
 *
 * Rules enforced here (not left to the caller):
 *  - Every transition appends a new OrderStatusHistory row. Rows are
 *    never edited or deleted, so the timeline is a true audit log.
 *  - The Order.status column is a denormalized "current status" for
 *    fast reads; history is the source of truth.
 *  - A status change always fires a customer notification.
 */

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["RESCHEDULED"],
  RESCHEDULED: ["ASSIGNED"],
  CANCELLED: [],
};

export class InvalidTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot move order from ${from} to ${to}.`);
    this.name = "InvalidTransitionError";
  }
}

export async function transitionOrderStatus(params: {
  orderId: string;
  toStatus: OrderStatus;
  actorId: string;
  actorRole: Role;
  note?: string;
  allowAdminOverride?: boolean;
}) {
  const { orderId, toStatus, actorId, actorRole, note, allowAdminOverride } = params;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true },
  });

  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(toStatus) && !(allowAdminOverride && actorRole === "ADMIN")) {
    throw new InvalidTransitionError(order.status, toStatus);
  }

  const [, historyRow] = await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: toStatus } }),
    prisma.orderStatusHistory.create({
      data: { orderId, status: toStatus, actorId, actorRole, note },
    }),
  ]);

  await sendOrderStatusEmail(order.customer.email, order.id, toStatus, note);

  return historyRow;
}
