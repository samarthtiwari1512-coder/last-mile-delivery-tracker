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
      <h1 className="text-2xl font-bold">My Deliveries</h1>
      {loading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-500 text-sm">No deliveries assigned right now.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{o.customer.name}{o.customer.phone ? ` · ${o.customer.phone}` : ""}</p>
                <p className="text-xs text-slate-500">{o.pickupAddress} → {o.dropAddress}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.status} />
                {NEXT_STEP[o.status] && (
                  <button onClick={() => advance(o.id, NEXT_STEP[o.status])} className="btn-primary text-xs">
                    Mark {NEXT_STEP[o.status].replaceAll("_", " ")}
                  </button>
                )}
                {o.status === "OUT_FOR_DELIVERY" && (
                  <button onClick={() => markFailed(o.id)} className="btn-secondary text-xs">Mark Failed</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
