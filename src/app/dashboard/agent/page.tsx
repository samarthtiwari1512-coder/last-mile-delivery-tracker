"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

type Order = {
  id: string;
  status: string;
  pickupAddress: string;
  dropAddress: string;
  customer: { name: string; phone: string | null };
};

const NEXT_STEP: Record<string, string> = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const STEP_LABEL: Record<string, string> = {
  PICKED_UP: "Mark Picked Up",
  IN_TRANSIT: "Mark In Transit",
  OUT_FOR_DELIVERY: "Mark Out for Delivery",
  DELIVERED: "Mark Delivered",
};

export default function AgentDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function advance(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) refresh();
    else {
      const data = await res.json();
      alert(data.error || "Update failed");
    }
  }

  async function markFailed(orderId: string) {
    const reason = prompt("Reason for failed delivery:") || "Customer unavailable";
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "FAILED", note: reason }),
    });
    if (res.ok) refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Deliveries</h1>
        <button onClick={refresh} className="btn-secondary text-xs px-3 py-1.5">
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-dashed p-12 text-center">
          <div className="text-4xl mb-3">🛵</div>
          <p className="font-medium text-slate-600">No deliveries assigned right now</p>
          <p className="text-sm text-slate-400 mt-1">
            The system will auto-assign orders to you based on your zone and availability.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card-hover p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {o.customer.name}
                  {o.customer.phone ? (
                    <span className="text-slate-400 font-normal"> · {o.customer.phone}</span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {o.pickupAddress} → {o.dropAddress}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
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
                  <button onClick={() => markFailed(o.id)} className="btn-secondary text-xs py-1.5 px-3">
                    Mark Failed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
