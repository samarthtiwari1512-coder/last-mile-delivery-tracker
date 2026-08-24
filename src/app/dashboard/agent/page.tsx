"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";

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
function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card px-4 py-3 flex-1 min-w-[90px]">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
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
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Deliveries</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your assigned orders</p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex gap-3 flex-wrap">
          <StatTile label="Assigned"  value={total}     color="text-slate-800" />
          <StatTile label="Pending"   value={pending}   color="text-brand"     />
          <StatTile label="Delivered" value={delivered} color="text-emerald-600" />
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-dashed p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-700">No deliveries assigned right now</p>
            <p className="text-sm text-slate-400 mt-1">The system auto-assigns orders based on your zone and availability.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="card-hover p-4 flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800">
                  {o.customer.name}
                  {o.customer.phone && (
                    <span className="text-slate-400 font-normal text-xs ml-1.5">· {o.customer.phone}</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {o.pickupAddress}
                  <span className="text-slate-300 mx-1">→</span>
                  {o.dropAddress}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <StatusBadge status={o.status} />
                {NEXT_STEP[o.status] && (
                  <button
                    onClick={() => advance(o.id, NEXT_STEP[o.status])}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    {STEP_LABEL[NEXT_STEP[o.status]] ?? NEXT_STEP[o.status].replaceAll("_", " ")}
                  </button>
                )}
                {o.status === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => { setFailedOrderId(o.id); setFailReason("Customer unavailable"); }}
                    className="btn-danger text-xs py-1.5 px-3"
                  >
                    Mark Failed
                  </button>
                )}
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
