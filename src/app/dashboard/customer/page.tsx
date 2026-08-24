"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";

type Order = {
  id: string;
  status: string;
  totalCharge: number;
  pickupAddress: string;
  dropAddress: string;
  pickupZone: { name: string };
  dropZone: { name: string };
  createdAt: string;
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
        <div className="h-3.5 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/4" />
      </div>
      <div className="h-6 w-20 bg-slate-100 rounded-full flex-shrink-0" />
    </div>
  );
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule modal state
  const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const userName = (session?.user as any)?.name ?? "there";

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  // ── Stats (client-side, no new API) ─────────────────────────────────────────
  const total     = orders.length;
  const inTransit = orders.filter((o) => ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  // ── Reschedule ───────────────────────────────────────────────────────────────
  async function confirmReschedule() {
    if (!rescheduleOrderId || !rescheduleDate) return;
    setRescheduleLoading(true);
    const iso = new Date(rescheduleDate).toISOString();
    const res = await fetch(`/api/orders/${rescheduleOrderId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDate: iso }),
    });
    setRescheduleLoading(false);

    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === rescheduleOrderId ? { ...o, status: updated.status } : o))
      );
      toast("Delivery rescheduled successfully", "success");
      setRescheduleOrderId(null);
      setRescheduleDate("");
    } else {
      const data = await res.json();
      toast(data.error || "Failed to reschedule", "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-400 mt-0.5">Welcome back, {userName}</p>
        </div>
        <a href="/orders/new" className="btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Order
        </a>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex gap-3 flex-wrap">
          <StatTile label="Total orders"  value={total}     color="text-slate-800" />
          <StatTile label="In progress"   value={inTransit} color="text-brand"     />
          <StatTile label="Delivered"     value={delivered} color="text-emerald-600" />
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        /* Empty state */
        <div className="card border-dashed p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" />
              <path d="M16 8h4l3 5v3h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-700">No orders yet</p>
            <p className="text-sm text-slate-400 mt-1">Place your first order to see it tracked here in real time.</p>
          </div>
          <a href="/orders/new" className="btn-primary mt-2">Place an Order</a>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <a
              key={o.id}
              href={`/orders/${o.id}`}
              className="card-hover p-4 flex items-center justify-between gap-4 block group"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800 group-hover:text-brand transition-colors">
                  {o.pickupZone.name}
                  <span className="text-slate-300 mx-1.5">→</span>
                  {o.dropZone.name}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {o.pickupAddress} → {o.dropAddress}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  ₹{o.totalCharge.toFixed(2)}
                  <span className="mx-1.5 text-slate-200">·</span>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={o.status} />
                {o.status === "FAILED" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setRescheduleOrderId(o.id);
                      setRescheduleDate("");
                    }}
                    className="btn-secondary text-xs py-1.5 px-2.5"
                  >
                    Reschedule
                  </button>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* ── Reschedule Modal ──────────────────────────────────────────────── */}
      <Modal
        open={!!rescheduleOrderId}
        onClose={() => setRescheduleOrderId(null)}
        title="Reschedule delivery"
        onConfirm={confirmReschedule}
        confirmLabel="Reschedule"
        loading={rescheduleLoading}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Choose a new delivery date for this order.</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New delivery date</label>
            <input
              className="input"
              type="date"
              value={rescheduleDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
