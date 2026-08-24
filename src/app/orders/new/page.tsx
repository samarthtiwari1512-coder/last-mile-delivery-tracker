"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { PackageOpen, MapPin, Calculator, CheckCircle2, ChevronRight, Package, Receipt, Banknote, HelpCircle, AlertTriangle } from "lucide-react";

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
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role ?? "CUSTOMER").toLowerCase();
  const dashHref = `/dashboard/${role}`;
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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="card p-10 text-center flex flex-col items-center gap-4 bg-success-50 border-success-200">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mb-2 ring-8 ring-success-50">
            <CheckCircle2 className="w-10 h-10 text-success-600" />
          </div>
          <h1 className="text-3xl font-bold text-success-900 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-success-800 text-lg max-w-sm">
            Your shipment has been queued for assignment. You'll receive email updates automatically.
          </p>
          <a href={dashHref} className="btn-primary mt-6 px-8 py-3 rounded-full shadow-brand-sm">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Dashboard", href: dashHref }, { label: "New Shipment" }]} />
      
      <div>
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Create Shipment</h1>
        <p className="text-slate-500">Enter pickup, drop, and package details to get an instant quote.</p>
      </div>

      <div className="card border-surface-border shadow-sm overflow-hidden bg-white rounded-3xl">
        {/* Step 1: Addresses */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand flex items-center justify-center font-bold text-sm ring-4 ring-brand-50/50">1</div>
            <h2 className="text-lg font-bold text-ink">Routing Details</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-ink">Origin</span>
              </div>
              <input className="input" placeholder="Pickup Address (e.g., 123 Main St)" value={form.pickupAddress}
                onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} disabled={!!quote} />
              <input className="input font-mono" placeholder="Pincode (e.g., 110001)" value={form.pickupPincode}
                onChange={(e) => setForm({ ...form, pickupPincode: e.target.value })} disabled={!!quote} />
            </div>
            
            <div className="hidden sm:block absolute left-1/2 top-[4.5rem] bottom-4 w-px bg-surface-border -translate-x-1/2 border-dashed" />

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-ink">Destination</span>
              </div>
              <input className="input" placeholder="Drop Address (e.g., 456 Park Ave)" value={form.dropAddress}
                onChange={(e) => setForm({ ...form, dropAddress: e.target.value })} disabled={!!quote} />
              <input className="input font-mono" placeholder="Pincode (e.g., 110002)" value={form.dropPincode}
                onChange={(e) => setForm({ ...form, dropPincode: e.target.value })} disabled={!!quote} />
            </div>
          </div>
        </div>

        <div className="divider border-surface-border m-0" />

        {/* Step 2: Package & Config */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand flex items-center justify-center font-bold text-sm ring-4 ring-brand-50/50">2</div>
            <h2 className="text-lg font-bold text-ink">Package Details</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink mb-2 block flex items-center gap-1.5">
                <PackageOpen className="w-4 h-4 text-brand" /> Dimensions & Weight
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <input type="number" className="input pr-8" placeholder="L" value={form.lengthCm} onChange={(e) => setForm({ ...form, lengthCm: e.target.value })} disabled={!!quote} />
                  <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-medium">cm</span>
                </div>
                <div className="relative">
                  <input type="number" className="input pr-8" placeholder="W" value={form.breadthCm} onChange={(e) => setForm({ ...form, breadthCm: e.target.value })} disabled={!!quote} />
                  <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-medium">cm</span>
                </div>
                <div className="relative">
                  <input type="number" className="input pr-8" placeholder="H" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} disabled={!!quote} />
                  <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-medium">cm</span>
                </div>
                <div className="relative">
                  <input type="number" className="input pr-8 font-semibold" placeholder="Wt" value={form.actualWeightKg} onChange={(e) => setForm({ ...form, actualWeightKg: e.target.value })} disabled={!!quote} />
                  <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-medium">kg</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink mb-2 block flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-brand" /> Service Type
                </label>
                <select className="input bg-white" value={form.orderType} onChange={(e) => setForm({ ...form, orderType: e.target.value })} disabled={!!quote}>
                  <option value="B2C">B2C (Standard Delivery)</option>
                  <option value="B2B">B2B (Bulk Freight)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink mb-2 block flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-brand" /> Payment Mode
                </label>
                <select className="input bg-white" value={form.paymentType} onChange={(e) => setForm({ ...form, paymentType: e.target.value })} disabled={!!quote}>
                  <option value="PREPAID">Prepaid</option>
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Actions & Quote */}
        <div className="p-6 sm:p-8 bg-midnight text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-midnight to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[80px] pointer-events-none z-0" />
          
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r text-red-200 text-sm mb-6 flex items-start gap-3 backdrop-blur-sm relative z-10">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-bold text-white mb-0.5">Validation Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!quote ? (
            <div className="relative z-10 flex flex-col items-center text-center py-4">
              <Calculator className="w-12 h-12 text-brand-400 mb-4 opacity-50" strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-2">Ready for pricing?</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm">We calculate real-time rates based on volumetric weight and zone distance.</p>
              <button onClick={getQuote} disabled={loading} className="btn-primary bg-brand hover:bg-brand-600 border border-brand-400/50 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] px-8 py-3 rounded-xl w-full sm:w-auto font-bold text-lg disabled:opacity-70 disabled:cursor-wait transition-all duration-300">
                {loading ? "Calculating Engine Rates..." : "Calculate Shipping Quote"}
              </button>
            </div>
          ) : (
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-success-500/20 text-success-300 flex items-center justify-center font-bold text-sm ring-4 ring-success-500/10">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Quote Approved</h2>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-3 font-medium">
                <div className="flex justify-between text-slate-300">
                  <span>Routing Zone</span>
                  <span className="font-mono text-xs uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded border border-white/5">{quote.rateType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Chargeable Weight</span>
                  <span className="font-mono">{quote.chargeableWeightKg.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Freight Charge</span>
                  <span className="font-mono">₹{quote.weightCharge.toFixed(2)}</span>
                </div>
                {quote.codSurcharge > 0 && (
                  <div className="flex justify-between text-warning-400">
                    <span>COD Handling Fee</span>
                    <span className="font-mono">+₹{quote.codSurcharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="divider border-white/10 my-4" />
                <div className="flex justify-between font-black text-2xl text-white">
                  <span>Total Due</span>
                  <span className="text-brand-300">₹{quote.totalCharge.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={confirmOrder} disabled={loading} className="btn-primary flex-1 bg-success-600 hover:bg-success-500 text-white border-0 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] py-3 rounded-xl font-bold text-lg disabled:opacity-70 disabled:cursor-wait transition-all duration-300">
                  {loading ? "Processing..." : "Confirm & Book Shipment"}
                </button>
                <button onClick={() => setQuote(null)} className="btn-secondary flex-1 sm:flex-none bg-white/5 text-white hover:bg-white/10 border-white/10 py-3 rounded-xl font-semibold transition-all duration-300">
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
