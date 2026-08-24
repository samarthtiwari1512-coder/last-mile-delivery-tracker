"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";

type Order = {
  id: string;
  status: string;
  totalCharge: number;
  pickupZone: { id: string; name: string };
  dropZone: { id: string; name: string };
  agent: { id: string; user: { name: string } } | null;
  customer: { name: string };
};

const ALL_STATUSES = [
  "PLACED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY",
  "DELIVERED", "FAILED", "RESCHEDULED", "CANCELLED",
];

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card px-4 py-3 flex-1 min-w-[90px]">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
        <div className="h-6 w-24 bg-slate-100 rounded-lg" />
        <div className="h-6 w-32 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/orders${qs}`)
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [statusFilter]);

  // ── Stats (always from unfiltered orders — refetch once at mount) ───────────
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setAllOrders(Array.isArray(data) ? data : []));
  }, []);

  const totalAll     = allOrders.length;
  const unassigned   = allOrders.filter((o) => !o.agent).length;
  const deliveredAll = allOrders.filter((o) => o.status === "DELIVERED").length;
  const failedAll    = allOrders.filter((o) => o.status === "FAILED").length;

  async function autoAssign(orderId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/orders/${orderId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "AUTO" }),
    });
    if (res.ok) {
      refresh();
      toast("Agent assigned successfully", "success");
    } else {
      const data = await res.json();
      toast(data.error || "Assignment failed", "error");
    }
  }

  async function overrideStatus(orderId: string, status: string, e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: "Admin override" }),
    });
    if (res.ok) {
      refresh();
      toast(`Status overridden to ${status.replaceAll("_", " ")}`, "success");
    } else {
      const data = await res.json();
      toast(data.error || "Override failed", "error");
    }
    // Reset select visually
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {/* ── Admin quick links ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <a href="/dashboard/admin/zones" className="card-hover px-4 py-3 flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Zones &amp; Areas</p>
            <p className="text-xs text-slate-400">Manage pincodes</p>
          </div>
        </a>
        <a href="/dashboard/admin/rates" className="card-hover px-4 py-3 flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round">
              <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">Rate Cards &amp; COD</p>
            <p className="text-xs text-slate-400">Configure pricing</p>
          </div>
        </a>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <StatTile label="Total orders" value={totalAll}     color="text-slate-800" />
        <StatTile label="Unassigned"   value={unassigned}   color="text-amber-600" />
        <StatTile label="Delivered"    value={deliveredAll} color="text-emerald-600" />
        <StatTile label="Failed"       value={failedAll}    color="text-red-500" />
      </div>

      {/* ── Filter bar + title ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-900">All Orders</h1>
        <select
          className="input w-full sm:w-48 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
          ))}
        </select>
      </div>

      {/* ── List ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-dashed p-12 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-700">No orders match this filter</p>
            <p className="text-sm text-slate-400 mt-1">Try a different status or clear the filter.</p>
          </div>
          {statusFilter && (
            <button onClick={() => setStatusFilter("")} className="btn-secondary mt-1">Clear filter</button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <a
              key={o.id}
              href={`/orders/${o.id}`}
              className="card-hover p-4 flex items-start sm:items-center justify-between gap-3 flex-wrap block group"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-slate-800 group-hover:text-brand transition-colors">
                  {o.customer.name}
                  <span className="text-slate-300 mx-1.5">·</span>
                  {o.pickupZone.name}
                  <span className="text-slate-300 mx-1.5">→</span>
                  {o.dropZone.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  ₹{o.totalCharge.toFixed(2)}
                  <span className="text-slate-200 mx-1.5">·</span>
                  Agent: {o.agent?.user.name ?? <span className="text-amber-600">Unassigned</span>}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap flex-shrink-0" onClick={(e) => e.preventDefault()}>
                <StatusBadge status={o.status} />
                {!o.agent && (
                  <button
                    onClick={(e) => autoAssign(o.id, e)}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Auto-assign
                  </button>
                )}
                <select
                  className="input text-xs w-36 sm:w-40 py-1.5"
                  defaultValue=""
                  onChange={(e) => e.target.value && overrideStatus(o.id, e.target.value, e)}
                >
                  <option value="">Override…</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
