"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { StatusBadge } from "@/components/StatusBadge";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { Package2, TrendingUp, CheckCircle2, ChevronRight, Plus, MapPin } from "lucide-react";

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

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, color, Icon, trend }: { label: string; value: number; color: string; Icon: any; trend?: string }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">{label}</p>
          <p className="text-3xl font-bold text-ink tracking-tight" style={{ letterSpacing: "-0.04em" }}>{value}</p>
        </div>
        <div className={`p-2 rounded-xl ${color.replace('text-', 'bg-').replace('-600', '-50')} bg-opacity-50`}>
          <Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-success">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card p-4 flex items-center justify-between gap-4 animate-pulse">
      <div className="space-y-2 flex-1">
        <div className="h-3.5 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/4" />
      </div>
      <div className="h-6 w-20 bg-slate-100 rounded-full flex-shrink-0" />
    </div>
  );
}

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule modal state
  const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const userName = (session?.user as any)?.name ?? "there";

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  // ── Stats (client-side, no new API) ─────────────────────────────────────────
  const total     = orders.length;
  const inTransit = orders.filter((o) => ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === "DELIVERED").length;

  // ── Reschedule ───────────────────────────────────────────────────────────────
  async function confirmReschedule() {
    if (!rescheduleOrderId || !rescheduleDate) return;
    setRescheduleLoading(true);
    const iso = new Date(rescheduleDate).toISOString();
    const res = await fetch(`/api/orders/${rescheduleOrderId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newDate: iso }),
    });
    setRescheduleLoading(false);

    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === rescheduleOrderId ? { ...o, status: updated.status } : o))
      );
      toast("Delivery rescheduled successfully", "success");
      setRescheduleOrderId(null);
      setRescheduleDate("");
    } else {
      const data = await res.json();
      toast(data.error || "Failed to reschedule", "error");
    }
  }

  return (
    <div className="space-y-10">
      {/* ── Page hero ──────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl bg-midnight text-white overflow-hidden p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/5">
        {/* Abstract graphics */}
        <div className="absolute right-0 top-0 w-full md:w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-midnight to-transparent" />
          <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 text-brand-400 animate-pulse-slow" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M 0 100 Q 50 20, 100 100 T 200 100" />
            <path d="M 0 150 Q 70 80, 130 150 T 200 150" />
            <path d="M 0 50 Q 40 10, 80 50 T 200 50" />
            <circle cx="100" cy="100" r="4" fill="currentColor" />
            <circle cx="130" cy="150" r="3" fill="currentColor" />
          </svg>
        </div>
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/20 rounded-full blur-[80px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10 text-brand-300">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-live" />
            Customer Dashboard
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3">Good evening, {userName.split(' ')[0]}</h1>
            <p className="text-slate-400 text-sm sm:text-lg leading-relaxed">
              Track your shipments, monitor delivery progress, and place new orders from your control center.
            </p>
          </div>
          <div className="pt-4">
            <a href="/orders/new" className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-600 text-white border border-brand-400/50 rounded-xl px-6 py-3 text-sm font-semibold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 transition-all duration-300">
              <Plus className="w-5 h-5" />
              Place New Order
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      {!loading && (
        <div className="flex gap-4 flex-wrap">
          <StatTile label="Total orders"  value={total}     color="text-brand-600"   Icon={Package2}     trend={total > 0 ? "Up to date" : undefined} />
          <StatTile label="In progress"   value={inTransit} color="text-info-600"    Icon={TrendingUp}   trend={inTransit > 0 ? "Moving fast" : undefined} />
          <StatTile label="Delivered"     value={delivered} color="text-success-600" Icon={CheckCircle2} />
        </div>
      )}

      {/* ── List ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink" style={{ letterSpacing: "-0.02em" }}>Recent Shipments</h2>
        </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : orders.length === 0 ? (
        /* Empty state */
        <div className="card border-dashed border-2 border-surface-border-muted p-16 text-center flex flex-col items-center gap-4 bg-surface-muted/50">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Package2 className="w-8 h-8 text-ink-muted" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-ink text-lg">No orders yet</p>
            <p className="text-sm text-ink-secondary mt-1 max-w-sm mx-auto leading-relaxed">
              Your shipments will appear here. Place your first order to track it in real time across zones.
            </p>
          </div>
          <a href="/orders/new" className="btn-primary mt-2">Place an Order</a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <a
              key={o.id}
              href={`/orders/${o.id}`}
              className="card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 block group"
            >
              {/* Route Visualizer */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Source</p>
                    <p className="font-bold text-ink text-sm group-hover:text-brand transition-colors">{o.pickupZone.name}</p>
                    <p className="text-xs text-ink-secondary truncate max-w-[200px]" title={o.pickupAddress}>{o.pickupAddress}</p>
                  </div>
                  
                  {/* Visual Route Line */}
                  <div className="hidden sm:flex flex-col items-center px-4 pt-4 flex-1">
                    <div className="w-full flex items-center">
                      <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
                      <div className="flex-1 h-px bg-surface-border relative overflow-hidden">
                        {["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status) && (
                          <div className="absolute inset-0 bg-brand/30">
                            <div className="h-full bg-brand animate-slide-right w-1/3" />
                          </div>
                        )}
                      </div>
                      <div className="w-2 h-2 rounded-full border-2 border-brand bg-white flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex-1 sm:text-right">
                    <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">Destination</p>
                    <p className="font-bold text-ink text-sm group-hover:text-brand transition-colors">{o.dropZone.name}</p>
                    <p className="text-xs text-ink-secondary truncate max-w-[200px] sm:ml-auto" title={o.dropAddress}>{o.dropAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-ink-muted pt-2 border-t border-surface-border-muted/50">
                  <span className="font-medium text-ink bg-surface-muted px-2 py-0.5 rounded">₹{o.totalCharge.toFixed(2)}</span>
                  <span>·</span>
                  <span>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span>·</span>
                  <span className="font-mono text-[10px] tracking-wider">#{o.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 flex-shrink-0 sm:w-48 pl-4 sm:border-l border-surface-border-muted/50">
                <StatusBadge status={o.status} />
                
                <div className="flex items-center gap-2">
                  {o.status === "FAILED" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setRescheduleOrderId(o.id);
                        setRescheduleDate("");
                      }}
                      className="btn-secondary text-[11px] py-1.5 px-3 rounded-lg"
                    >
                      Reschedule
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-ink-muted group-hover:bg-brand-50 group-hover:text-brand transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
      </div>

      {/* ── Reschedule Modal ──────────────────────────────────────────────── */}
      <Modal
        open={!!rescheduleOrderId}
        onClose={() => setRescheduleOrderId(null)}
        title="Reschedule delivery"
        onConfirm={confirmReschedule}
        confirmLabel="Reschedule"
        loading={rescheduleLoading}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Choose a new delivery date for this order.</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">New delivery date</label>
            <input
              className="input"
              type="date"
              value={rescheduleDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
