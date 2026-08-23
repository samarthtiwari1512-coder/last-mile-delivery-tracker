export default function Home() {
  return (
    <div className="space-y-20">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="pt-8 pb-4 text-center space-y-6">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-brand-100">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Zone-based dynamic pricing · Real-time tracking
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight max-w-2xl mx-auto">
          Last-mile delivery,{" "}
          <span className="text-brand">intelligently managed</span>
        </h1>

        <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
          Customers get transparent pricing before they commit. Agents get
          auto-assigned based on proximity. Admins control every rate card from
          the dashboard — no code changes needed.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a href="/register" className="btn-primary px-6 py-2.5 text-base shadow-brand">
            Place an order →
          </a>
          <a href="/login" className="btn-secondary px-6 py-2.5 text-base">
            Sign in
          </a>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            ),
            label: "For Customers",
            heading: "Know the price before you ship",
            desc: "Enter pickup/drop pincodes and package dimensions — we calculate the charge instantly using zone-based rates and volumetric weight, before you confirm.",
            color: "text-brand bg-brand-50",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            ),
            label: "For Delivery Agents",
            heading: "Auto-assigned, never confused",
            desc: "The system picks the nearest available agent using GPS distance, or falls back to the least-loaded agent in the same zone. You always know what's yours.",
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" />
              </svg>
            ),
            label: "For Admins",
            heading: "Control rates without touching code",
            desc: "Configure zones, map pincodes, set B2B/B2C intra/inter-zone rate cards, and update COD surcharges — all from the dashboard, reflected instantly.",
            color: "text-violet-700 bg-violet-50",
          },
        ].map((card) => (
          <div key={card.label} className="card p-6 space-y-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <p className="section-label mb-1">{card.label}</p>
              <h2 className="text-base font-semibold text-slate-900 leading-snug">{card.heading}</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center">
          <p className="section-label mb-2">How it works</p>
          <h2 className="text-2xl font-bold text-slate-900">From order to doorstep</h2>
        </div>
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Enter details", desc: "Pickup/drop pincodes, package dimensions, order type" },
            { step: "02", title: "Get price", desc: "Rate engine calculates charge from zone + weight + COD config" },
            { step: "03", title: "Agent assigned", desc: "Nearest available agent in the pickup zone gets the job" },
            { step: "04", title: "Track in real time", desc: "Full status timeline with timestamps, email + SMS at every step" },
          ].map((item) => (
            <div key={item.step} className="card p-5 space-y-2">
              <span className="text-2xl font-black text-brand-100 leading-none">{item.step}</span>
              <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </ol>
      </section>
    </div>
  );
}
