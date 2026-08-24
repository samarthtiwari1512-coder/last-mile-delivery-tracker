import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const role = (session.user as any).role?.toLowerCase();
    if (role) redirect(`/dashboard/${role}`);
  }

  return (
    <div className="space-y-24">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-8 text-center space-y-8 overflow-hidden">
        {/* Dot-grid background (pure CSS, no image asset) */}
        <div
          className="absolute inset-0 -z-10"
          aria-hidden="true"
          style={{
            backgroundImage: "radial-gradient(circle, #c7d2fe 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 50%, transparent 100%)",
            opacity: 0.5,
          }}
        />

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-4 py-1.5 rounded-full border border-brand-100 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
          Zone-based dynamic pricing · Real-time tracking
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-6xl font-bold text-ink leading-[1.1] max-w-2xl mx-auto"
          style={{ letterSpacing: "-0.03em" }}
        >
          Last-mile delivery,{" "}
          <span className="text-brand relative">
            intelligently managed
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-ink-secondary max-w-xl mx-auto leading-relaxed">
          Transparent pricing before you commit. Auto-assigned agents.{" "}
          Admin-controlled rate cards — no code changes needed.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <a href="/register" className="btn-primary px-7 py-3 text-base shadow-brand">
            Place an order →
          </a>
          <a href="/login" className="btn-secondary px-7 py-3 text-base">
            Sign in
          </a>
        </div>

        {/* Subtle trust-bar */}
        <p className="text-xs text-ink-muted pt-2">
          Next.js 14 · PostgreSQL · Prisma · NextAuth
        </p>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            ),
            label: "For Customers",
            heading: "Know the price before you ship",
            desc: "Enter pickup/drop pincodes and package dimensions — we calculate the charge instantly using zone-based rates and volumetric weight, before you confirm.",
            iconBg: "bg-brand-50",
            iconColor: "text-brand-600",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            ),
            label: "For Delivery Agents",
            heading: "Auto-assigned, never confused",
            desc: "The system picks the nearest available agent using GPS distance, or falls back to the least-loaded agent in the same zone. You always know what's yours.",
            iconBg: "bg-success-50",
            iconColor: "text-success-700",
          },
          {
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" />
              </svg>
            ),
            label: "For Admins",
            heading: "Control rates without touching code",
            desc: "Configure zones, map pincodes, set B2B/B2C intra/inter-zone rate cards, and update COD surcharges — all from the dashboard, reflected instantly.",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-700",
          },
        ].map((card) => (
          <div key={card.label} className="card p-7 space-y-5 group hover:shadow-card-hover transition-shadow duration-200">
            {/* Icon chip */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
              {card.icon}
            </div>
            <div className="space-y-2">
              <p className="section-label">{card.label}</p>
              <h2 className="text-base font-semibold text-ink leading-snug" style={{ letterSpacing: "-0.01em" }}>
                {card.heading}
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed">{card.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="space-y-8">
        <div className="text-center space-y-1">
          <p className="section-label">How it works</p>
          <h2 className="text-2xl font-bold text-ink" style={{ letterSpacing: "-0.025em" }}>
            From order to doorstep
          </h2>
        </div>

        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { step: "01", title: "Enter details", desc: "Pickup/drop pincodes, package dimensions, order type" },
            { step: "02", title: "Get price",     desc: "Rate engine calculates charge from zone + weight + COD config" },
            { step: "03", title: "Agent assigned", desc: "Nearest available agent in the pickup zone gets the job" },
            { step: "04", title: "Track live",    desc: "Full status timeline with timestamps, email + SMS at every step" },
          ].map((item, i) => (
            <li key={item.step} className="card p-5 space-y-3">
              {/* Step number — large, very light */}
              <span className="block text-3xl font-black text-brand-100 leading-none tabular-nums" style={{ letterSpacing: "-0.05em" }}>
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold text-ink text-sm">{item.title}</h3>
                <p className="text-xs text-ink-secondary leading-relaxed mt-1">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
