"use client";

import { useEffect, useState } from "react";

type Area = { id: string; pincode: string; label: string | null };
type Zone = { id: string; name: string; areas: Area[] };

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add-zone form state
  const [zoneName, setZoneName] = useState("");
  const [zoneSubmitting, setZoneSubmitting] = useState(false);

  // Add-area form state
  const [areaPincode, setAreaPincode] = useState("");
  const [areaLabel, setAreaLabel] = useState("");
  const [areaZoneId, setAreaZoneId] = useState("");
  const [areaSubmitting, setAreaSubmitting] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/admin/zones")
      .then((r) => r.json())
      .then((data) => {
        setZones(Array.isArray(data) ? data : []);
        // Pre-select first zone in the area form if none selected
        setAreaZoneId((prev) => prev || (data[0]?.id ?? ""));
      })
      .catch(() => setError("Failed to load zones."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addZone(e: React.FormEvent) {
    e.preventDefault();
    if (!zoneName.trim()) return;
    setZoneSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: zoneName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.formErrors?.join(", ") || data.error || "Failed to create zone.");
    } else {
      setZoneName("");
      load();
    }
    setZoneSubmitting(false);
  }

  async function addArea(e: React.FormEvent) {
    e.preventDefault();
    if (!areaPincode.trim() || !areaZoneId) return;
    setAreaSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pincode: areaPincode.trim(),
        label: areaLabel.trim() || undefined,
        zoneId: areaZoneId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.formErrors?.join(", ") || data.error || "Failed to add area.");
    } else {
      setAreaPincode("");
      setAreaLabel("");
      load();
    }
    setAreaSubmitting(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Zone &amp; Area Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Zones group areas (pincodes) for rate calculation. Every pincode must belong to a zone
          so the rate engine can detect pickup and drop zones.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Add Zone */}
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Add New Zone</h2>
        <form onSubmit={addZone} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">Zone name</label>
            <input
              className="input"
              placeholder="e.g. North Delhi"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={zoneSubmitting}>
            {zoneSubmitting ? "Adding..." : "Add Zone"}
          </button>
        </form>
      </section>

      {/* Add Area / Pincode */}
      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-800">Map Pincode to Zone</h2>
        <p className="text-xs text-slate-500">
          The rate engine uses pincode → zone lookup. Adding a pincode here lets customers
          use it in orders.
        </p>
        <form onSubmit={addArea} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Pincode</label>
            <input
              className="input"
              placeholder="e.g. 110001"
              value={areaPincode}
              onChange={(e) => setAreaPincode(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Label (optional)</label>
            <input
              className="input"
              placeholder="e.g. Connaught Place"
              value={areaLabel}
              onChange={(e) => setAreaLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Zone</label>
            <select
              className="input"
              value={areaZoneId}
              onChange={(e) => setAreaZoneId(e.target.value)}
              required
            >
              <option value="">Select zone…</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-start-3 flex justify-end">
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={areaSubmitting}>
              {areaSubmitting ? "Saving..." : "Map Pincode"}
            </button>
          </div>
        </form>
      </section>

      {/* Zone list */}
      <section className="space-y-4">
        <h2 className="font-semibold text-slate-800">
          All Zones{" "}
          <span className="text-slate-400 font-normal text-sm">({zones.length})</span>
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="bg-white border border-dashed rounded-xl p-10 text-center">
            <div className="text-4xl mb-3">🗺️</div>
            <p className="font-medium text-slate-600">No zones yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Add your first zone above — every pincode your customers use must belong to one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-white border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{zone.name}</h3>
                  <span className="text-xs text-slate-400">
                    {zone.areas.length} pincode{zone.areas.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {zone.areas.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {zone.areas.map((area) => (
                      <span
                        key={area.id}
                        className="inline-flex items-center gap-1 bg-slate-50 border rounded-full px-3 py-1 text-xs text-slate-700"
                      >
                        <span className="font-mono font-medium">{area.pincode}</span>
                        {area.label && (
                          <span className="text-slate-400">· {area.label}</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2 italic">
                    No pincodes mapped yet — add one above.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
