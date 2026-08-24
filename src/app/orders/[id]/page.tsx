"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/StatusBadge";
import { Breadcrumb } from "@/components/Breadcrumb";
import { useParams } from "next/navigation";
import { Package, Clock, Truck, CheckCircle2, AlertTriangle, CalendarDays, XOctagon, Receipt, FileText, User, MapPin } from "lucide-react";

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

const STATUS_ICONS: Record<string, any> = {
  PLACED: Package,
  ASSIGNED: Clock,
  PICKED_UP: Package,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: CheckCircle2,
  FAILED: AlertTriangle,
  RESCHEDULED: CalendarDays,
  CANCELLED: XOctagon,
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
  const Icon = STATUS_ICONS[entry.status] || Package;
  return (
    <div className="flex gap-4">
      {/* Connector column */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
            ${isCurrent ? "bg-brand text-white shadow-brand-sm ring-4 ring-brand/10 scale-110" : "bg-surface-muted text-ink-muted border border-surface-border-muted"}
          `}
        >
          <Icon className="w-5 h-5" strokeWidth={isCurrent ? 2.5 : 2} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-surface-border-muted mt-2 min-h-[2.5rem]" />}
      </div>

      {/* Content */}
      <div className={`pb-8 flex-1 ${isLast ? "" : ""}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap bg-surface-card p-4 rounded-xl border border-surface-border-muted shadow-sm">
          <div>
            <StatusBadge status={entry.status} />
            <p className="text-xs text-ink-muted mt-2 font-medium">
              {formatDateTime(entry.timestamp)} <span className="mx-1">•</span> {entry.actor.name}{" "}
              <span className="bg-surface-muted text-ink-secondary px-2 py-0.5 rounded ml-1 text-[10px] uppercase tracking-wider font-bold">
                {entry.actorRole}
              </span>
            </p>
            {entry.note && (
              <p className="mt-3 text-sm text-ink-secondary leading-relaxed pl-3 border-l-2 border-surface-border">
                {entry.note}
              </p>
            )}
          </div>
        </div>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tight" style={{ letterSpacing: "-0.02em" }}>Control View</h1>
          <p className="text-sm text-ink-muted mt-1 font-mono">#{order.id.toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Summary card */}
      <div className="card p-6 space-y-6 bg-surface-card border-surface-border-muted shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Package className="w-32 h-32" />
        </div>
        
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <FileText className="w-5 h-5 text-ink-muted" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Shipment Details</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 text-sm relative z-10 bg-surface-muted/30 p-5 rounded-2xl border border-surface-border-muted/50">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-surface-border">
              <MapPin className="w-4 h-4 text-ink-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Pickup</p>
              <p className="font-bold text-ink mb-0.5">{order.pickupZone.name}</p>
              <p className="font-medium text-ink-secondary text-xs leading-snug">{order.pickupAddress}</p>
              <p className="text-xs text-ink-muted mt-1 font-mono">{order.pickupPincode}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-surface-border">
              <MapPin className="w-4 h-4 text-ink-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Dropoff</p>
              <p className="font-bold text-ink mb-0.5">{order.dropZone.name}</p>
              <p className="font-medium text-ink-secondary text-xs leading-snug">{order.dropAddress}</p>
              <p className="text-xs text-ink-muted mt-1 font-mono">{order.dropPincode}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-surface-border">
              <User className="w-4 h-4 text-ink-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Customer</p>
              <p className="font-bold text-ink mb-0.5">{order.customer.name}</p>
              <p className="text-xs text-ink-muted font-medium">{order.customer.phone ?? order.customer.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-surface-border">
              <Truck className="w-4 h-4 text-ink-secondary" />
            </div>
            <div>
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Agent & Config</p>
              <p className="font-bold text-ink mb-0.5">
                {order.agent?.user.name ?? <span className="text-warning-600 bg-warning-50 px-1.5 py-0.5 rounded border border-warning-100">Unassigned</span>}
              </p>
              <p className="text-xs text-ink-muted mt-1">{order.orderType} · {order.rateType.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* Charge breakdown */}
        <div className="pt-2 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="w-5 h-5 text-ink-muted" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Invoice</h2>
          </div>
          <div className="bg-surface-muted rounded-2xl p-5 border border-surface-border-muted/50 space-y-2.5 text-sm font-medium">
            <div className="flex justify-between text-ink-secondary">
              <span>Actual weight</span>
              <span className="font-mono text-xs">{order.actualWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-ink-secondary">
              <span>Volumetric weight</span>
              <span className="font-mono text-xs">{order.volumetricWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="flex justify-between text-ink">
              <span>Chargeable weight</span>
              <span className="font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-surface-border">{order.chargeableWeightKg.toFixed(2)} kg</span>
            </div>
            <div className="divider my-3 opacity-50" />
            <div className="flex justify-between text-ink-secondary">
              <span>Base + weight charge</span>
              <span className="font-mono">₹{order.weightCharge.toFixed(2)}</span>
            </div>
            {order.codSurcharge > 0 && (
              <div className="flex justify-between text-warning-700 bg-warning-50 px-2 py-1 -mx-2 rounded-lg">
                <span>COD Surcharge</span>
                <span className="font-mono">+₹{order.codSurcharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-ink text-lg border-t border-surface-border-muted pt-4 mt-2">
              <span>Total Charge</span>
              <span className="text-brand">₹{order.totalCharge.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Reschedule info */}
        {order.rescheduledFor && (
          <div className="bg-warning-50 border-l-4 border-warning text-warning-700 p-4 rounded-r-xl text-sm font-medium relative z-10 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4" />
              <span>Rescheduled</span>
            </div>
            <p className="text-xs opacity-90 ml-6">
              For: <strong>{new Date(order.rescheduledFor).toLocaleDateString("en-IN", { dateStyle: "long" })}</strong>
              {order.failureReason && <><br/>Reason: {order.failureReason}</>}
            </p>
          </div>
        )}
      </div>

      {/* Tracking Timeline */}
      <div className="card p-6 bg-surface-card border-surface-border-muted shadow-card">
        <div className="flex items-center gap-2 mb-8">
          <Clock className="w-5 h-5 text-ink-muted" />
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Activity History</h2>
        </div>
        {order.history.length === 0 ? (
          <div className="text-center py-8 bg-surface-muted rounded-xl border border-surface-border-muted">
            <p className="text-sm text-ink-secondary font-medium">No history recorded yet.</p>
          </div>
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
