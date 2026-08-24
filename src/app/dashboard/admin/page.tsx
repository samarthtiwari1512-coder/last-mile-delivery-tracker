"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

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

export default function AdminDashboard() {
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

  async function autoAssign(orderId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/orders/${orderId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "AUTO" }),
    });
    if (res.ok) refresh();
    else {
      const data = await res.json();
      alert(data.error || "Assignment failed");
    }
  }

  async function overrideStatus(orderId: string, status: string, e: React.ChangeEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: "Admin override" }),
    });
    if (res.ok) refresh();
    else {
      const data = await res.json();
      alert(data.error || "Override failed");
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin nav shortcuts */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/dashboard/admin/zones"
          className="btn-secondary text-sm flex items-center gap-2"
        >
          🗺️ Manage Zones &amp; Areas
        </a>
        <a
          href="/dashboard/admin/rates"
          className="btn-secondary text-sm flex items-center gap-2"
        >
          💳 Rate Cards &amp; COD
        </a>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">All Orders</h1>
        <select className="input w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="font-medium text-slate-600">No orders match this filter</p>
          <p className="text-sm text-slate-400 mt-1">Try a different status filter or wait for new orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <a
              key={o.id}
              href={`/orders/${o.id}`}
              className="card-hover p-4 flex items-center justify-between flex-wrap gap-3 block"
            >
              <div>
                <p className="font-medium text-sm">{o.customer.name} · {o.pickupZone.name} → {o.dropZone.name}</p>
                <p className="text-xs text-slate-500">
                  ₹{o.totalCharge.toFixed(2)} · Agent: {o.agent?.user.name ?? "Unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                {!o.agent && (
                  <button
                    onClick={(e) => autoAssign(o.id, e)}
                    className="btn-secondary text-xs"
                  >
                    Auto-assign
                  </button>
                )}
                <select
                  className="input text-xs w-40"
                  defaultValue=""
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.target.value && overrideStatus(o.id, e.target.value, e as any)}
                >
                  <option value="">Override status...</option>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
