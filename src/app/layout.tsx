import "./globals.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "LastMile — Delivery Tracker",
  description:
    "Smart last-mile delivery management: zone-based dynamic pricing, intelligent agent assignment, and real-time shipment tracking.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role?.toLowerCase();

  return (
    <html lang="en">
      <body className="min-h-screen bg-surface">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm group-hover:shadow-brand/40 transition-shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                  <rect x="9" y="11" width="14" height="10" rx="2" />
                  <circle cx="12" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                </svg>
              </div>
              <span className="font-bold text-slate-900 tracking-tight">
                Last<span className="text-brand">Mile</span>
              </span>
            </a>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              {session ? (
                <>
                  <LogoutButton />
                  <a href={`/dashboard/${role}`} className="btn-primary text-sm py-1.5 px-4">
                    Dashboard
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="text-sm text-slate-600 hover:text-brand px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    Login
                  </a>
                  <a href="/register" className="btn-primary text-sm py-1.5 px-4">
                    Get started
                  </a>
                </>
              )}
            </nav>
          </div>
        </header>

        {/* ── Main ───────────────────────────────────────────────── */}
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 mt-20">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400">
            <span>© 2024 LastMile Delivery Tracker</span>
            <span>Built for assignment · Next.js 14 + Prisma + PostgreSQL</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
