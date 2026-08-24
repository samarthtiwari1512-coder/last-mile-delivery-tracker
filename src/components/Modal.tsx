"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Trap body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const btnClass =
    confirmVariant === "danger"
      ? "btn-danger"
      : "btn-primary";

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Close on backdrop click (not card click)
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-5
                   animate-in fade-in slide-in-from-bottom-3 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-base font-semibold text-slate-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>

        {/* Footer */}
        {onConfirm && (
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button onClick={onConfirm} className={btnClass} disabled={loading}>
              {loading ? "Saving…" : confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
