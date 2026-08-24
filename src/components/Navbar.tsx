"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Package2, LogOut, LayoutDashboard } from "lucide-react";

// Role → display label + pill color (Dark theme adjusted)
const ROLE_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  ADMIN:    { label: "Admin",    bg: "bg-brand-900/50", text: "text-brand-300", border: "border-brand-700/50" },
  AGENT:    { label: "Agent",    bg: "bg-warning-900/50",  text: "text-warning-300", border: "border-warning-700/50"  },
  CUSTOMER: { label: "Customer", bg: "bg-success-900/50", text: "text-success-300", border: "border-success-700/50"},
};

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;
  const role = user?.role ?? "";
  const roleMeta = ROLE_META[role] ?? { label: role, bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" };
  const dashHref = role ? `/dashboard/${role.toLowerCase()}` : "/";
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-midnight/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ── Logo ─────────────────────────────────── */}
        <a href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all duration-300">
            {/* Custom SVG combining Package, Route, Arrow */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
              {/* Arrow/Route indicator */}
              <path d="M12 12 l4 -2" className="animate-pulse-live" stroke="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight hidden sm:inline text-lg" style={{ letterSpacing: "-0.03em" }}>
            Last<span className="text-brand-400">Mile</span>
          </span>
        </a>

        {/* ── Nav ──────────────────────────────────── */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {isLoading ? (
            /* Skeleton while session loads */
            <div className="h-8 w-32 bg-slate-800 animate-pulse rounded-lg" />
          ) : session ? (
            /* ── Authenticated ── */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User identity chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-midnight-surface border border-white/5">
                {/* Initials avatar */}
                <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold leading-none">
                    {getInitials(user?.name)}
                  </span>
                </div>
                {/* Name */}
                <span className="text-sm font-medium text-slate-200 max-w-[120px] truncate">
                  {user?.name ?? user?.email}
                </span>
                {/* Role pill */}
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${roleMeta.bg} ${roleMeta.text} ${roleMeta.border}`}>
                  {roleMeta.label}
                </span>
              </div>

              {/* Mobile: just avatar + role */}
              <div className="flex sm:hidden items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{getInitials(user?.name)}</span>
                </div>
              </div>

              <a
                href={dashHref}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </a>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-danger-500 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-danger-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          ) : (
            /* ── Unauthenticated ── */
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Login
              </a>
              <a href="/register" className="btn-primary py-2 px-5 bg-brand-600 hover:bg-brand-500 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] border border-brand-500/50 text-white rounded-xl text-sm font-semibold transition-all">
                Get started
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
