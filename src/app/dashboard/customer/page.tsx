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

  async function reschedule(orderId: string) {
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
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-500 text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{o.pickupZone.name} → {o.dropZone.name}</p>
                <p className="text-xs text-slate-500">{o.pickupAddress} → {o.dropAddress}</p>
                <p className="text-xs text-slate-400 mt-1">₹{o.totalCharge.toFixed(2)} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                {o.status === "FAILED" && (
                  <button onClick={() => reschedule(o.id)} className="btn-secondary text-xs">Reschedule</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
