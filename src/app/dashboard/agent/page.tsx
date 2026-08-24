"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Package2, Truck, CheckCircle2, Navigation, AlertCircle } from "lucide-react";

type Order = {
  id: string;
  status: string;
  pickupAddress: string;
  dropAddress: string;
  customer: { name: string; phone: string | null };
  createdAt: string;
};

const NEXT_STEP: Record<string, string> = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const STEP_LABEL: Record<string, string> = {
  PICKED_UP:        "Mark Picked Up",
  IN_TRANSIT:       "Mark In Transit",
  OUT_FOR_DELIVERY: "Mark Out for Delivery",
  DELIVERED:        "Mark Delivered",
};

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: any }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-ink tracking-tight" style={{ letterSpacing: "-0.04em" }}>{value}</p>
        </div>
        <div className={`p-2 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-50')} bg-opacity-50`}>
          <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-slate-100 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-6 w-24 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function AgentDashboard() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Mark-failed modal
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [failReason, setFailReason] = useState("Customer unavailable");
  const [modalLoading, setModalLoading] = useState(false);

  function refresh() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const total     = orders.length;
  const pending   = orders.filter((o) => o.status !== "DELIVERED" && o.status !== "FAILED" && o.status !== "CANCELLED").length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  // ── Advance status ───────────────────────────────────────────────────────────
  async function advance(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      refresh();
      toast(`Marked as ${status.replaceAll("_", " ").toLowerCase()}`, "success");
    } else {
      const data = await res.json();
      toast(data.error || "Update failed", "error");
    }
  }

  // ── Mark failed ──────────────────────────────────────────────────────────────
  async function confirmMarkFailed() {
    if (!failedOrderId) return;
    setModalLoading(true);
    const res = await fetch(`/api/orders/${failedOrderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FAILED", note: failReason }),
    });
    setModalLoading(false);
    if (res.ok) {
      refresh();
      toast("Order marked as failed", "info");
      setFailedOrderId(null);
    } else {
      const data = await res.json();
      toast(data.error || "Failed to update", "error");
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Page hero ──────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-brand-900 text-white overflow-hidden p-8 sm:p-12 shadow-brand">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-brand-500/30 to-transparent" />
          <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 text-brand-400" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M 20 100 Q 100 0, 180 100" />
            <path d="M 20 100 Q 100 200, 180 100" />
            <circle cx="20" cy="100" r="4" fill="currentColor" />
            <circle cx="180" cy="100" r="4" fill="currentColor" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-lg space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              Agent Dashboard
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">My Deliveries</h1>
              <p className="text-brand-100/80 text-sm sm:text-base leading-relaxed">
                Manage your assigned orders, navigate routes, and update statuses.
              </p>
            </div>
          </div>
          <button onClick={refresh} className="flex items-center gap-2 bg-white text-brand-900 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-brand-50 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh List
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex gap-4 flex-wrap">
          <StatTile label="Assigned"  value={total}     color="text-brand-600"   Icon={Package2} />
          <StatTile label="Pending"   value={pending}   color="text-warning-600" Icon={Truck} />
          <StatTile label="Delivered" value={delivered} color="text-success-600" Icon={CheckCircle2} />
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-dashed border-2 border-surface-border-muted p-16 text-center flex flex-col items-center gap-4 bg-surface-muted/50">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Navigation className="w-8 h-8 text-ink-muted" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-ink text-lg">No deliveries assigned right now</p>
            <p className="text-sm text-ink-secondary mt-1">The system auto-assigns orders based on your zone and availability.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold text-sm text-ink">
                    {o.customer.name}
                  </p>
                  {o.customer.phone && (
                    <span className="text-brand-600 bg-brand-50 px-2 py-0.5 rounded font-medium text-xs border border-brand-100">{o.customer.phone}</span>
                  )}
                  <span className="text-ink-muted font-mono text-[10px]">#{o.id.slice(-8).toUpperCase()}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 p-3 bg-surface-muted rounded-xl border border-surface-border-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-0.5">Pickup</p>
                    <p className="text-xs text-ink-secondary truncate" title={o.pickupAddress}>{o.pickupAddress}</p>
                  </div>
                  <div className="hidden sm:flex text-ink-muted">→</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider mb-0.5">Dropoff</p>
                    <p className="text-xs text-ink-secondary truncate" title={o.dropAddress}>{o.dropAddress}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-3 flex-shrink-0 sm:w-48">
                <StatusBadge status={o.status} />
                <div className="flex items-center gap-2 w-full sm:justify-end">
                  {NEXT_STEP[o.status] && (
                    <button
                      onClick={() => advance(o.id, NEXT_STEP[o.status])}
                      className="btn-primary text-[11px] py-1.5 px-3 flex-shrink-0"
                    >
                      {STEP_LABEL[NEXT_STEP[o.status]] ?? NEXT_STEP[o.status].replaceAll("_", " ")}
                    </button>
                  )}
                  {o.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => { setFailedOrderId(o.id); setFailReason("Customer unavailable"); }}
                      className="btn-danger text-[11px] py-1.5 px-3 flex-shrink-0"
                      title="Mark Failed"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Mark Failed Modal ─────────────────────────────────────────────── */}
      <Modal
        open={!!failedOrderId}
        onClose={() => setFailedOrderId(null)}
        title="Mark delivery as failed"
        onConfirm={confirmMarkFailed}
        confirmLabel="Mark Failed"
        confirmVariant="danger"
        loading={modalLoading}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Please provide a reason. The customer will be notified and can reschedule.</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reason</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. Customer unavailable"
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
