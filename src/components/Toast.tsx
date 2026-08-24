"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { createPortal } from "react-dom";

// ── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void;
};

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ── Provider + Renderer ──────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + counter++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    // Auto-dismiss after 4 s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string; bg: string; text: string }> = {
    success: { bar: "bg-emerald-500", icon: "✓", bg: "bg-white", text: "text-slate-800" },
    error:   { bar: "bg-red-500",     icon: "✕", bg: "bg-white", text: "text-slate-800" },
    info:    { bar: "bg-brand",       icon: "i", bg: "bg-white", text: "text-slate-800" },
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
            aria-live="polite"
          >
            {toasts.map((t) => {
              const s = VARIANT_STYLES[t.variant];
              return (
                <div
                  key={t.id}
                  className={`pointer-events-auto flex items-start gap-3 ${s.bg} rounded-xl shadow-lg border border-slate-100
                              min-w-[260px] max-w-xs overflow-hidden`}
                >
                  {/* Colored left bar */}
                  <div className={`w-1 self-stretch flex-shrink-0 ${s.bar} rounded-l-xl`} />
                  <div className="flex-1 py-3 pr-3 pl-1">
                    <p className={`text-sm font-medium ${s.text}`}>{t.message}</p>
                  </div>
                  <button
                    onClick={() => dismiss(t.id)}
                    className="self-start mt-2 mr-2 text-slate-300 hover:text-slate-500 transition-colors"
                    aria-label="Dismiss"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}
