"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "CUSTOMER" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push("/login");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-sm px-4">
        {/* Card */}
        <div className="card p-8 sm:p-10 space-y-8 bg-surface-card border-surface-border-muted shadow-card relative z-10">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100">
              <UserPlus className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Create account</h1>
            <p className="text-sm text-ink-secondary">Sign up to start shipping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Full name</label>
                <input
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Phone (optional)</label>
                <input
                  className="input"
                  placeholder="+1 555-0123"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Account type</label>
                <select
                  className="input"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="AGENT">Delivery Agent</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="banner-danger text-xs">
                {error}
              </div>
            )}

            <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2" disabled={loading} type="submit">
              {loading ? "Creating..." : (
                <>Register <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-xs text-center text-ink-muted">
              Admin accounts are created via the seed script.
            </p>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Already have an account?{" "}
            <a href="/login" className="text-brand hover:text-brand-700 font-bold underline decoration-brand/30 underline-offset-4">
              Log in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
