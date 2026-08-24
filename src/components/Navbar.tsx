"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

// Role → display label + pill color
const ROLE_META: Record<string, { label: string; bg: string; text: string }> = {
  ADMIN:    { label: "Admin",    bg: "bg-violet-100", text: "text-violet-700" },
  AGENT:    { label: "Agent",    bg: "bg-amber-100",  text: "text-amber-700"  },
  CUSTOMER: { label: "Customer", bg: "bg-emerald-100", text: "text-emerald-700"},
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
  const roleMeta = ROLE_META[role] ?? { label: role, bg: "bg-slate-100", text: "text-slate-600" };
  const dashHref = role ? `/dashboard/${role.toLowerCase()}` : "/";
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* ── Logo ─────────────────────────────────── */}
        <a href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" />
              <circle cx="12" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
            </svg>
          </div>
          <span className="font-bold text-slate-900 tracking-tight hidden sm:inline">
            Last<span className="text-brand">Mile</span>
          </span>
        </a>

        {/* ── Nav ──────────────────────────────────── */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {isLoading ? (
            /* Skeleton while session loads */
            <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-lg" />
          ) : session ? (
            /* ── Authenticated ── */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User identity chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                {/* Initials avatar */}
                <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold leading-none">
                    {getInitials(user?.name)}
                  </span>
                </div>
                {/* Name */}
                <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                  {user?.name ?? user?.email}
                </span>
                {/* Role pill */}
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${roleMeta.bg} ${roleMeta.text}`}>
                  {roleMeta.label}
                </span>
              </div>

              {/* Mobile: just avatar + role */}
              <div className="flex sm:hidden items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">{getInitials(user?.name)}</span>
                </div>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${roleMeta.bg} ${roleMeta.text}`}>
                  {roleMeta.label}
                </span>
              </div>

              <a
                href={dashHref}
                className="text-sm text-slate-600 hover:text-brand px-2 sm:px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors font-medium"
              >
                Dashboard
              </a>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-secondary text-sm py-1.5 px-2 sm:px-3"
              >
                Log out
              </button>
            </div>
          ) : (
            /* ── Unauthenticated ── */
            <div className="flex items-center gap-1">
              <a
                href="/login"
                className="text-sm text-slate-600 hover:text-brand px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
              >
                Login
              </a>
              <a href="/register" className="btn-primary text-sm py-1.5 px-3 sm:px-4">
                Get started
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
