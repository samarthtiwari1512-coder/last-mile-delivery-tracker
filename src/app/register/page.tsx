"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white border rounded-lg p-6 space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <input className="input" placeholder="Full name" value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className="input" type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className="input" placeholder="Phone (optional)" value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <input className="input" type="password" placeholder="Password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="CUSTOMER">Customer</option>
        <option value="AGENT">Delivery Agent</option>
      </select>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Creating..." : "Register"}
      </button>
      <p className="text-xs text-slate-500">Admin accounts are created via the seed script, not self-registration.</p>
    </form>
  );
}
