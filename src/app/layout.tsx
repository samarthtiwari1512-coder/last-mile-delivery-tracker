import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Last-Mile Delivery Tracker",
  description: "Order, track, and manage last-mile deliveries with zone-based dynamic pricing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-semibold text-brand text-lg">
            Last-Mile Delivery Tracker
          </a>
          <nav className="text-sm space-x-4">
            <a href="/login" className="hover:text-brand">Login</a>
            <a href="/register" className="hover:text-brand">Register</a>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
