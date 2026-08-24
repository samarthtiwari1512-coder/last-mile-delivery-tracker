"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";

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

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function reschedule(orderId: string, e: React.MouseEvent) {
    e.preventDefault(); // don't follow the link
    const newDate = prompt("Enter new delivery date (YYYY-MM-DD):");
    if (!newDate) return;
    const iso = new Date(newDate).toISOString();
    const res = await fetch(`/api/orders/${orderId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDate: iso }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
    } else {
      const data = await res.json();
      alert(data.error || "Failed to reschedule");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <a href="/orders/new" className="btn-primary">+ New Order</a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl p-10 text-center">
          <div className="text-4xl mb-3">🚚</div>
          <p className="font-medium text-slate-600">No orders yet</p>
          <p className="text-sm text-slate-400 mt-1">Place your first order to see it tracked here in real time.</p>
          <a href="/orders/new" className="btn-primary inline-block mt-4">Place an Order</a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <a
              key={o.id}
              href={`/orders/${o.id}`}
              className="card-hover p-4 flex items-center justify-between block"
            >
              <div>
                <p className="font-medium text-sm">{o.pickupZone.name} → {o.dropZone.name}</p>
                <p className="text-xs text-slate-500">{o.pickupAddress} → {o.dropAddress}</p>
                <p className="text-xs text-slate-400 mt-1">
                  ₹{o.totalCharge.toFixed(2)} · {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                {o.status === "FAILED" && (
                  <button
                    onClick={(e) => reschedule(o.id, e)}
                    className="btn-secondary text-xs"
                  >
                    Reschedule
                  </button>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
