"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/Toast";
import { Package2, Users, CheckCircle2, AlertTriangle, Map, CreditCard, ChevronRight } from "lucide-react";

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
function StatTile({ label, value, color, Icon }: { label: string; value: number; color: string; Icon: any }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-ink tracking-tight" style={{ letterSpacing: "-0.04em" }}>{value}</p>
        </div>
        <div className={`p-2 rounded-xl ${color.replace('text-', 'bg-').replace('-500', '-50').replace('-600', '-50')} bg-opacity-50`}>
          <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} />
        </div>
      </div>
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
    <div className="space-y-10">
      {/* ── Page hero ──────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-ink text-white overflow-hidden p-8 sm:p-12 shadow-card">
        {/* Abstract graphics */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-ink to-transparent" />
          <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 text-white" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="20" y="20" width="160" height="160" rx="8" />
            <path d="M 60 20 L 60 180 M 140 20 L 140 180" />
            <path d="M 20 60 L 180 60 M 20 140 L 180 140" />
            <circle cx="100" cy="100" r="16" fill="currentColor" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Admin Control Center
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Fleet Overview</h1>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Monitor network health, unassigned orders, and system configurations.
            </p>
          </div>
        </div>
      </div>

      {/* ── Admin quick links ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/dashboard/admin/zones" className="card-hover p-4 flex items-center gap-4 group rounded-2xl bg-surface-card border border-surface-border-muted shadow-sm hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
            <Map className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Zones &amp; Areas</p>
            <p className="text-xs text-ink-secondary mt-0.5">Manage operating regions and pincodes</p>
          </div>
        </a>
        <a href="/dashboard/admin/rates" className="card-hover p-4 flex items-center gap-4 group rounded-2xl bg-surface-card border border-surface-border-muted shadow-sm hover:shadow-card-hover transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
            <CreditCard className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Rate Cards &amp; Pricing</p>
            <p className="text-xs text-ink-secondary mt-0.5">Configure distance/weight formulas and COD logic</p>
          </div>
        </a>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div className="flex gap-4 flex-wrap">
        <StatTile label="Total orders" value={totalAll}     color="text-brand-600"   Icon={Package2} />
        <StatTile label="Unassigned"   value={unassigned}   color="text-warning-600" Icon={Users} />
        <StatTile label="Delivered"    value={deliveredAll} color="text-success-600" Icon={CheckCircle2} />
        <StatTile label="Failed"       value={failedAll}    color="text-danger-500"  Icon={AlertTriangle} />
      </div>

      {/* ── Filter bar + title ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-ink" style={{ letterSpacing: "-0.02em" }}>Order Management</h2>
        <select
          className="input w-full sm:w-64 text-sm bg-white"
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
        <div className="card border-dashed border-2 border-surface-border-muted p-16 text-center flex flex-col items-center gap-4 bg-surface-muted/50">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Package2 className="w-8 h-8 text-ink-muted" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-ink text-lg">No orders match this filter</p>
            <p className="text-sm text-ink-secondary mt-1">Try a different status or clear the filter.</p>
          </div>
          {statusFilter && (
            <button onClick={() => setStatusFilter("")} className="btn-secondary mt-2">Clear filter</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <a
              key={o.id}
              href={`/orders/${o.id}`}
              className="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 block group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm text-ink group-hover:text-brand transition-colors">
                    {o.customer.name}
                  </p>
                  <span className="text-ink-muted font-mono text-[10px]">#{o.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-secondary mt-1 mb-2">
                  <span className="font-medium text-ink bg-surface-muted px-2 py-0.5 rounded">{o.pickupZone.name}</span>
                  <span className="text-ink-muted">→</span>
                  <span className="font-medium text-ink bg-surface-muted px-2 py-0.5 rounded">{o.dropZone.name}</span>
                </div>
                <p className="text-xs text-ink-muted">
                  ₹{o.totalCharge.toFixed(2)}
                  <span className="text-surface-border-muted mx-2">|</span>
                  Agent: {o.agent?.user.name ? <span className="font-medium text-ink">{o.agent.user.name}</span> : <span className="text-warning-600 font-medium bg-warning-50 px-1.5 py-0.5 rounded">Unassigned</span>}
                </p>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 flex-shrink-0 sm:w-48 pl-4 sm:border-l border-surface-border-muted/50" onClick={(e) => e.preventDefault()}>
                <StatusBadge status={o.status} />
                <div className="flex items-center gap-2 w-full sm:justify-end">
                  {!o.agent && (
                    <button
                      onClick={(e) => autoAssign(o.id, e)}
                      className="btn-primary text-[11px] py-1.5 px-3 flex-shrink-0"
                    >
                      Auto-assign
                    </button>
                  )}
                  <select
                    className="input text-[11px] py-1.5 px-2 bg-white"
                    defaultValue=""
                    onChange={(e) => e.target.value && overrideStatus(o.id, e.target.value, e)}
                  >
                    <option value="">Override…</option>
                    {ALL_STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
