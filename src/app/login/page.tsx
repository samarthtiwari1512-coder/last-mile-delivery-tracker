"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password. Check the seeded test accounts in the README.");
    else router.push("/");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="w-full max-w-sm px-4">
        {/* Card */}
        <div className="card p-8 sm:p-10 space-y-8 bg-surface-card border-surface-border-muted shadow-card relative z-10">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand flex items-center justify-center mx-auto mb-6 shadow-sm border border-brand-100">
              <ShieldCheck className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Welcome back</h1>
            <p className="text-sm text-ink-secondary">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-secondary mb-1">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="banner-danger text-xs">
                {error}
              </div>
            )}

            <button className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2" type="submit" disabled={loading}>
              {loading ? "Signing in…" : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-brand hover:text-brand-700 font-bold underline decoration-brand/30 underline-offset-4">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
