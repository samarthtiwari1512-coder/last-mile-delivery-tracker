import "./globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "LastMile — Delivery Tracker",
  description:
    "Smart last-mile delivery management: zone-based dynamic pricing, intelligent agent assignment, and real-time shipment tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface">
        <Providers>
          <ToastProvider>
          {/* ── Header (Navbar is a Client Component, reads useSession) ── */}
          <Navbar />

          {/* ── Main ─────────────────────────────────────────────────── */}
          <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
            {children}
          </main>

          {/* ── Footer ───────────────────────────────────────────────── */}
          <footer className="border-t border-slate-100 mt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-slate-400">
              <span>© 2024 LastMile Delivery Tracker</span>
              <span className="hidden sm:inline">Built for assignment · Next.js 14 + Prisma + PostgreSQL</span>
            </div>
          </footer>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
