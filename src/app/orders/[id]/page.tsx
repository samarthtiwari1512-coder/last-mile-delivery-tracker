"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/StatusBadge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useParams } from "next/navigation";

type HistoryEntry = {
  id: string;
  status: string;
  timestamp: string;
  note: string | null;
  actorRole: string;
  actor: { name: string };
};

type Order = {
  id: string;
  status: string;
  pickupAddress: string;
  pickupPincode: string;
  dropAddress: string;
  dropPincode: string;
  pickupZone: { name: string };
  dropZone: { name: string };
  orderType: string;
  paymentType: string;
  rateType: string;
  actualWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
  customer: { name: string; email: string; phone: string | null };
  agent: { user: { name: string } } | null;
  rescheduledFor: string | null;
  failureReason: string | null;
  createdAt: string;
  history: HistoryEntry[];
};

// Status sequence used to compute timeline progress
const STATUS_SEQUENCE = [
  "PLACED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED",
];

const STATUS_ICONS: Record<string, string> = {
  PLACED: "📋",
  ASSIGNED: "👤",
  PICKED_UP: "📦",
  IN_TRANSIT: "🚛",
  OUT_FOR_DELIVERY: "🛵",
  DELIVERED: "✅",
  FAILED: "❌",
  RESCHEDULED: "🔄",
  CANCELLED: "🚫",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function TimelineEntry({
  entry,
  isLast,
  isCurrent,
}: {
  entry: HistoryEntry;
  isLast: boolean;
  isCurrent: boolean;
}) {
  return (
    <div className="flex gap-4">
      {/* Connector column */}
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0
            ${isCurrent ? "bg-brand shadow-md shadow-brand/30 ring-4 ring-brand/10" : "bg-slate-100"}
          `}
        >
          {STATUS_ICONS[entry.status] ?? "•"}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 mt-1 min-h-[2rem]" />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <StatusBadge status={entry.status} />
            <p className="text-xs text-slate-400 mt-1">
              {formatDateTime(entry.timestamp)} · by {entry.actor.name}{" "}
              <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs">
                {entry.actorRole}
              </span>
            </p>
          </div>
        </div>
        {entry.note && (
          <p className="mt-2 text-sm text-slate-600 bg-slate-50 border rounded-lg px-3 py-2">
            {entry.note}
          </p>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role ?? "CUSTOMER").toLowerCase();
  const dashHref = `/dashboard/${role}`;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Could not load this order.");
        return r.json();
      })
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="h-8 bg-slate-100 animate-pulse rounded w-1/3" />
        <div className="h-40 bg-slate-100 animate-pulse rounded-xl" />
        <div className="h-60 bg-slate-100 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="font-medium text-red-700">{error ?? "Order not found"}</p>
        <a href="/dashboard/customer" className="btn-primary inline-block mt-4">
          ← Back to dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: dashHref },
          { label: `Order #${order.id.slice(-8).toUpperCase()}` },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Summary card */}
      <div className="card p-5 space-y-4">
        <h2 className="section-label mb-3">Shipment Info</h2>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <p className="text-xs text-slate-400">Pickup</p>
            <p className="font-medium text-slate-800">{order.pickupAddress}</p>
            <p className="text-xs text-slate-500">{order.pickupPincode} · {order.pickupZone.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Drop</p>
            <p className="font-medium text-slate-800">{order.dropAddress}</p>
            <p className="text-xs text-slate-500">{order.dropPincode} · {order.dropZone.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Customer</p>
            <p className="font-medium text-slate-800">{order.customer.name}</p>
            <p className="text-xs text-slate-500">{order.customer.phone ?? order.customer.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Delivery Agent</p>
            <p className="font-medium text-slate-800">
              {order.agent?.user.name ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Order type</p>
            <p className="font-medium text-slate-800">
              {order.orderType} · {order.paymentType}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Zone type</p>
            <p className="font-medium text-slate-800">{order.rateType.replace("_", " ")}</p>
          </div>
        </div>

        {/* Charge breakdown */}
        <div className="divider pt-5 space-y-1">
          <h2 className="section-label mb-3">Charge Breakdown</h2>
          <div className="bg-surface-muted rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-secondary">
              <span>Actual weight</span>
              <span>{order.actualWeightKg} kg</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Volumetric weight</span>
              <span>{order.volumetricWeightKg.toFixed(3)} kg</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Chargeable weight (higher of above)</span>
              <span className="font-semibold text-ink">{order.chargeableWeightKg.toFixed(3)} kg</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Base + weight charge</span>
              <span>₹{order.weightCharge.toFixed(2)}</span>
            </div>
            {order.codSurcharge > 0 && (
              <div className="flex justify-between text-ink-secondary">
                <span>COD surcharge</span>
                <span>₹{order.codSurcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink text-base border-t border-surface-border pt-3 mt-1">
              <span>Total</span>
              <span>₹{order.totalCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Reschedule info */}
        {order.rescheduledFor && (
          <div className="banner-warning text-sm">
            Rescheduled for:{" "}
            <strong>{new Date(order.rescheduledFor).toLocaleDateString("en-IN")}</strong>
            {order.failureReason && <> · Reason: {order.failureReason}</>}
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="card p-5">
        <h2 className="section-label mb-5">Tracking Timeline</h2>
        {order.history.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No history recorded yet.</p>
        ) : (
          <div>
            {order.history.map((entry, i) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isLast={i === order.history.length - 1}
                isCurrent={i === order.history.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
