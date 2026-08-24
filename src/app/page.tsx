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
    <div className="flex flex-col min-h-screen">
      {/* ── SECTION 1: Dark Hero ───────────────────────────────────────── */}
      <section className="relative bg-midnight pt-24 pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        
        {/* Background Details */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
             <defs>
               <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
               </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid-pattern)" />
           </svg>
        </div>

        {/* Glow behind hero */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Side: Copy & CTA */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <h1 className="text-5xl sm:text-7xl font-bold text-white leading-[1.05] tracking-tight">
              Last-mile delivery,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
                intelligently managed
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Transparent pricing before you commit. Auto-assigned agents. Admin-controlled rate cards — no code changes needed.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-4">
              <a href="/register" className="group relative inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-8 py-4 text-base font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all duration-300 hover:-translate-y-1">
                Place an order
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <a href="/login" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
                Sign in
              </a>
            </div>
          </div>

          {/* Right Side: Visual Tracker */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-float hidden lg:block">
            {/* The Control Panel UI */}
            <div className="bg-midnight-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
               {/* Inner glow */}
               <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
               
               <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-success-500 animate-pulse-live" />
                   <span className="text-sm font-bold text-white tracking-widest uppercase">Live Delivery</span>
                 </div>
                 <span className="text-xs font-mono text-slate-400">ID: TRK-8924</span>
               </div>

               {/* Route Visualization */}
               <div className="relative pl-4 space-y-8">
                 {/* The vertical line */}
                 <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-800">
                   {/* Animated progress line */}
                   <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-brand-400 to-brand-600 rounded-full" />
                 </div>

                 {/* Step 1: Origin */}
                 <div className="relative z-10 flex items-start gap-4">
                   <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center ring-4 ring-midnight-surface shrink-0 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-white" />
                   </div>
                   <div>
                     <p className="text-white font-semibold">Faridabad Hub</p>
                     <p className="text-sm text-slate-400">Picked up • 09:42 AM</p>
                   </div>
                 </div>

                 {/* Step 2: Truck (In Transit) */}
                 <div className="relative z-10 flex items-start gap-4">
                   <div className="w-5 h-5 rounded-full bg-warning-500 flex items-center justify-center ring-4 ring-midnight-surface shrink-0 mt-0.5 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                     <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                   </div>
                   <div>
                     <p className="text-warning-500 font-bold tracking-wide">IN TRANSIT</p>
                     <p className="text-sm text-slate-400">Arriving in approx. 24 min</p>
                   </div>
                 </div>

                 {/* Step 3: Destination */}
                 <div className="relative z-10 flex items-start gap-4 opacity-50">
                   <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center ring-4 ring-midnight-surface shrink-0 mt-0.5">
                     <div className="w-2 h-2 rounded-full bg-slate-900" />
                   </div>
                   <div>
                     <p className="text-white font-semibold">Anjir Destination</p>
                     <p className="text-sm text-slate-400">Pending arrival</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Warm Light Bento Features ───────────────────────── */}
      <section className="bg-surface py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-ink tracking-tight">Powerful capabilities,<br/>simplified operations.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 (Large / Span 2) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-8 md:p-12 border border-surface-border shadow-sm flex flex-col justify-between group overflow-hidden relative">
              <div className="relative z-10 max-w-md">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-6 border border-brand-100">
                  <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-ink mb-3">For Customers</h3>
                <p className="text-ink-secondary text-lg leading-relaxed">
                  Know the price before you ship. Enter pickup/drop pincodes and package dimensions — we calculate the charge instantly using zone-based rates before you commit.
                </p>
              </div>
              
              {/* Decorative Visual */}
              <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
                 <svg className="w-96 h-96 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
            </div>

            {/* Feature 2 (Small) */}
            <div className="bg-white rounded-3xl p-8 border border-surface-border shadow-sm flex flex-col group overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center mb-6 border border-success-100">
                  <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">For Delivery Agents</h3>
                <p className="text-ink-secondary leading-relaxed">
                  Auto-assigned, never confused. The system picks the nearest available agent using GPS distance, or falls back to the least-loaded agent.
                </p>
              </div>
            </div>

            {/* Feature 3 (Small) */}
            <div className="bg-white rounded-3xl p-8 border border-surface-border shadow-sm flex flex-col group overflow-hidden relative">
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-warning-50 flex items-center justify-center mb-6 border border-warning-100">
                  <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">For Admins</h3>
                <p className="text-ink-secondary leading-relaxed">
                  Control rates without touching code. Configure zones, map pincodes, set inter-zone rate cards, and update COD surcharges.
                </p>
              </div>
            </div>

             {/* Feature 4 (Large / Span 2) */}
             <div className="md:col-span-2 bg-midnight text-white rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10 max-w-md">
                <h3 className="text-2xl font-bold mb-3">Real-time Network</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Track every package across the entire delivery network simultaneously. Immutable tracking history stored securely.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none hidden sm:block">
                 <svg width="400" height="200" viewBox="0 0 400 200" className="animate-pulse-slow">
                   <circle cx="100" cy="100" r="4" fill="#7C3AED" />
                   <circle cx="200" cy="50" r="4" fill="#22C55E" />
                   <circle cx="300" cy="150" r="4" fill="#F59E0B" />
                   <path d="M100 100 Q 150 75 200 50 T 300 150" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                 </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: Dark Tracking/Control Center ───────────────────────── */}
      <section className="bg-[#050812] py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CjxwYXRoIGQ9Ik04MCAwTDAgODAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">Every shipment. <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-success-400 to-success-600">One live view.</span></h2>
          <p className="text-lg sm:text-xl text-slate-400 mb-16 max-w-2xl mx-auto">See exactly where your packages are, at any moment. Immutable event logs backed by a secure PostgreSQL database.</p>
          
          {/* Dashboard Mockup */}
          <div className="bg-midnight-surface border border-white/10 rounded-2xl p-2 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-auto max-w-4xl transform sm:perspective-1000 sm:rotate-x-2">
            <div className="bg-[#0B1020] rounded-xl border border-white/5 overflow-hidden">
               <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-danger-500" />
                 <div className="w-3 h-3 rounded-full bg-warning-500" />
                 <div className="w-3 h-3 rounded-full bg-success-500" />
               </div>
               <div className="p-4 sm:p-8">
                 {/* Mock UI Row */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-4">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-brand-900/50 flex items-center justify-center text-brand-400 font-bold shrink-0">📦</div>
                     <div className="text-left">
                       <p className="text-white font-bold">LM-849201</p>
                       <p className="text-sm text-slate-500">B2B Inter-zone</p>
                     </div>
                   </div>
                   <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-white text-sm">North Zone → East Zone</p>
                        <p className="text-xs text-slate-500">4.2 kg</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-success-900/50 text-success-400 text-xs font-bold uppercase border border-success-700/50">Delivered</span>
                   </div>
                 </div>
                 
                 {/* Mock UI Row 2 */}
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-4 gap-4">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-lg bg-brand-900/50 flex items-center justify-center text-brand-400 font-bold shrink-0">📦</div>
                     <div className="text-left">
                       <p className="text-white font-bold">LM-992314</p>
                       <p className="text-sm text-slate-500">B2C Intra-zone</p>
                     </div>
                   </div>
                   <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                      <div className="text-left sm:text-right">
                        <p className="text-white text-sm">South Zone → South Zone</p>
                        <p className="text-xs text-slate-500">1.5 kg</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-warning-900/50 text-warning-400 text-xs font-bold uppercase border border-warning-700/50 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-400 animate-pulse-live"/>
                        In Transit
                      </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Warm Light Footer ───────────────────────── */}
      <footer className="bg-surface border-t border-surface-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
           <div className="flex items-center justify-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-brand-600">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <span className="font-bold text-ink text-xl tracking-tight">Last<span className="text-brand-600">Mile</span></span>
           </div>
           <p className="text-ink-secondary text-sm">Next.js 14 · PostgreSQL · Prisma · Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
