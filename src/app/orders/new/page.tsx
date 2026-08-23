"use client";

import { useState } from "react";

type Quote = {
  chargeableWeightKg: number;
  volumetricWeightKg: number;
  rateType: string;
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
};

const initialForm = {
  pickupAddress: "",
  pickupPincode: "",
  dropAddress: "",
  dropPincode: "",
  lengthCm: "",
  breadthCm: "",
  heightCm: "",
  actualWeightKg: "",
  orderType: "B2C",
  paymentType: "PREPAID",
};

export default function NewOrderPage() {
  const [form, setForm] = useState(initialForm);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const numeric = {
    lengthCm: Number(form.lengthCm),
    breadthCm: Number(form.breadthCm),
    heightCm: Number(form.heightCm),
    actualWeightKg: Number(form.actualWeightKg),
  };

  async function getQuote() {
    setError(null);
    setLoading(true);
    setQuote(null);
    try {
      const res = await fetch("/api/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...numeric }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.join(", ") || data.error || "Could not fetch quote");
      setQuote(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmOrder() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...numeric }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.join(", ") || data.error || "Could not create order");
      setConfirmed(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="bg-white border rounded-lg p-6 max-w-md">
        <h1 className="text-xl font-semibold mb-2">Order placed 🎉</h1>
        <p className="text-slate-600">You'll get an email as the status updates. Track it from your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">New Order</h1>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Pickup address" value={form.pickupAddress}
            onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} />
          <input className="input" placeholder="Pickup pincode" value={form.pickupPincode}
            onChange={(e) => setForm({ ...form, pickupPincode: e.target.value })} />
          <input className="input" placeholder="Drop address" value={form.dropAddress}
            onChange={(e) => setForm({ ...form, dropAddress: e.target.value })} />
          <input className="input" placeholder="Drop pincode" value={form.dropPincode}
            onChange={(e) => setForm({ ...form, dropPincode: e.target.value })} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <input className="input" placeholder="L (cm)" value={form.lengthCm}
            onChange={(e) => setForm({ ...form, lengthCm: e.target.value })} />
          <input className="input" placeholder="B (cm)" value={form.breadthCm}
            onChange={(e) => setForm({ ...form, breadthCm: e.target.value })} />
          <input className="input" placeholder="H (cm)" value={form.heightCm}
            onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
          <input className="input" placeholder="Weight (kg)" value={form.actualWeightKg}
            onChange={(e) => setForm({ ...form, actualWeightKg: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.orderType}
            onChange={(e) => setForm({ ...form, orderType: e.target.value })}>
            <option value="B2C">B2C</option>
            <option value="B2B">B2B</option>
          </select>
          <select className="input" value={form.paymentType}
            onChange={(e) => setForm({ ...form, paymentType: e.target.value })}>
            <option value="PREPAID">Prepaid</option>
            <option value="COD">COD</option>
          </select>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!quote ? (
          <button onClick={getQuote} disabled={loading} className="btn-primary">
            {loading ? "Calculating..." : "Get Price"}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-slate-50 border rounded-lg p-4 text-sm space-y-1">
              <div className="flex justify-between"><span>Rate type</span><span>{quote.rateType}</span></div>
              <div className="flex justify-between"><span>Chargeable weight</span><span>{quote.chargeableWeightKg.toFixed(2)} kg</span></div>
              <div className="flex justify-between"><span>Base + weight charge</span><span>₹{quote.weightCharge.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>COD surcharge</span><span>₹{quote.codSurcharge.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t"><span>Total</span><span>₹{quote.totalCharge.toFixed(2)}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmOrder} disabled={loading} className="btn-primary">
                {loading ? "Placing..." : "Confirm Order"}
              </button>
              <button onClick={() => setQuote(null)} className="btn-secondary">Edit details</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
