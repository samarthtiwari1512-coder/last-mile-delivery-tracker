import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { ToastProvider } from "@/components/Toast";

// next/font: loads Inter from Google Fonts at build time (zero FOUC, no external request at runtime)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LastMile — Delivery Tracker",
  description:
    "Smart last-mile delivery management: zone-based dynamic pricing, intelligent agent assignment, and real-time shipment tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface antialiased">
        <Providers>
          <ToastProvider>
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
              {children}
            </main>
            <footer className="border-t border-surface-border-muted mt-24">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between text-xs text-ink-muted">
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
