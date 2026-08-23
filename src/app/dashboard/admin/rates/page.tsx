"use client";

import { useEffect, useState } from "react";

type RateCard = {
  id: string;
  orderType: "B2B" | "B2C";
  rateType: "INTRA_ZONE" | "INTER_ZONE";
  baseCharge: number;
  perKgRate: number;
  minCharge: number;
};

type CodConfig = {
  id: string;
  orderType: "B2B" | "B2C";
  isPercent: boolean;
  value: number;
};

const ORDER_TYPES = ["B2C", "B2B"] as const;
const RATE_TYPES = ["INTRA_ZONE", "INTER_ZONE"] as const;

function RateCardForm({
  existing,
  orderType,
  rateType,
  onSaved,
}: {
  existing: RateCard | undefined;
  orderType: "B2B" | "B2C";
  rateType: "INTRA_ZONE" | "INTER_ZONE";
  onSaved: () => void;
}) {
  const [base, setBase] = useState(String(existing?.baseCharge ?? ""));
  const [perKg, setPerKg] = useState(String(existing?.perKgRate ?? ""));
  const [min, setMin] = useState(String(existing?.minCharge ?? ""));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/rate-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderType,
        rateType,
        baseCharge: Number(base),
        perKgRate: Number(perKg),
        minCharge: Number(min),
      }),
    });
    if (res.ok) {
      setMsg("Saved ✓");
      onSaved();
    } else {
      const d = await res.json();
      setMsg(d.error?.formErrors?.join(", ") || "Failed to save");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Base charge (₹)</label>
          <input
            className="input text-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 50"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Per-kg rate (₹)</label>
          <input
            className="input text-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 12"
            value={perKg}
            onChange={(e) => setPerKg(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Min charge (₹)</label>
          <input
            className="input text-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 40"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary text-xs py-1.5 px-4" disabled={saving}>
          {saving ? "Saving…" : existing ? "Update" : "Save"}
        </button>
        {msg && (
          <span
            className={`text-xs ${
              msg.startsWith("Saved") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}

function CodConfigForm({
  existing,
  orderType,
  onSaved,
}: {
  existing: CodConfig | undefined;
  orderType: "B2B" | "B2C";
  onSaved: () => void;
}) {
  const [isPercent, setIsPercent] = useState(existing?.isPercent ?? false);
  const [value, setValue] = useState(String(existing?.value ?? ""));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/admin/cod-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderType, isPercent, value: Number(value) }),
    });
    if (res.ok) {
      setMsg("Saved ✓");
      onSaved();
    } else {
      const d = await res.json();
      setMsg(d.error?.formErrors?.join(", ") || "Failed to save");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs text-slate-500 mb-1">
            Surcharge amount
          </label>
          <input
            className="input text-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder={isPercent ? "e.g. 2.5" : "e.g. 30"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
        </div>
        <div className="pb-0.5">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPercent}
              onChange={(e) => setIsPercent(e.target.checked)}
              className="rounded"
            />
            Percentage?
          </label>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPercent
              ? "Value is treated as % of weight charge"
              : "Value is a flat ₹ amount per COD order"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary text-xs py-1.5 px-4" disabled={saving}>
          {saving ? "Saving…" : existing ? "Update" : "Save"}
        </button>
        {msg && (
          <span
            className={`text-xs ${
              msg.startsWith("Saved") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}

export default function AdminRatesPage() {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [codConfigs, setCodConfigs] = useState<CodConfig[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    Promise.all([
      fetch("/api/admin/rate-cards").then((r) => r.json()),
      fetch("/api/admin/cod-config").then((r) => r.json()),
    ]).then(([cards, configs]) => {
      setRateCards(Array.isArray(cards) ? cards : []);
      setCodConfigs(Array.isArray(configs) ? configs : []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  function findCard(ot: "B2B" | "B2C", rt: "INTRA_ZONE" | "INTER_ZONE") {
    return rateCards.find((c) => c.orderType === ot && c.rateType === rt);
  }

  function findCod(ot: "B2B" | "B2C") {
    return codConfigs.find((c) => c.orderType === ot);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Rate Card Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">
          These values drive the rate engine. Charge = max(baseCharge + perKgRate ×
          chargeableWeight, minCharge). Chargeable weight = max(actual, L×B×H÷5000).
        </p>
      </div>

      {/* Rate Card Grid — 2×2 */}
      <section className="space-y-4">
        <h2 className="font-semibold text-slate-800">Weight-Based Rates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ORDER_TYPES.map((ot) =>
            RATE_TYPES.map((rt) => {
              const existing = findCard(ot, rt);
              return (
                <div
                  key={`${ot}-${rt}`}
                  className="bg-white border rounded-xl p-5 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{ot}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-500">
                      {rt === "INTRA_ZONE" ? "Intra-zone" : "Inter-zone"}
                    </span>
                    {existing && (
                      <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Configured
                      </span>
                    )}
                    {!existing && (
                      <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Not set
                      </span>
                    )}
                  </div>
                  <RateCardForm
                    existing={existing}
                    orderType={ot}
                    rateType={rt}
                    onSaved={load}
                  />
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* COD Surcharge */}
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-slate-800">COD Surcharge</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Added on top of the weight charge only when payment type is Cash on Delivery.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ORDER_TYPES.map((ot) => {
            const existing = findCod(ot);
            return (
              <div key={ot} className="bg-white border rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{ot} — COD</span>
                  {existing ? (
                    <span className="ml-auto text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {existing.isPercent
                        ? `${existing.value}%`
                        : `₹${existing.value}`}{" "}
                      surcharge
                    </span>
                  ) : (
                    <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Not set
                    </span>
                  )}
                </div>
                <CodConfigForm existing={existing} orderType={ot} onSaved={load} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
