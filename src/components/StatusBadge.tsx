const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string }> = {
  PLACED:           { bg: "bg-slate-100",   dot: "bg-slate-400",   text: "text-slate-600"  },
  ASSIGNED:         { bg: "bg-brand-50",    dot: "bg-brand-500",   text: "text-brand-700"  },
  PICKED_UP:        { bg: "bg-indigo-50",   dot: "bg-indigo-500",  text: "text-indigo-700" },
  IN_TRANSIT:       { bg: "bg-violet-50",   dot: "bg-violet-500",  text: "text-violet-700" },
  OUT_FOR_DELIVERY: { bg: "bg-amber-50",    dot: "bg-amber-500",   text: "text-amber-700"  },
  DELIVERED:        { bg: "bg-emerald-50",  dot: "bg-emerald-500", text: "text-emerald-700"},
  FAILED:           { bg: "bg-red-50",      dot: "bg-red-500",     text: "text-red-700"    },
  RESCHEDULED:      { bg: "bg-orange-50",   dot: "bg-orange-500",  text: "text-orange-700" },
  CANCELLED:        { bg: "bg-slate-100",   dot: "bg-slate-300",   text: "text-slate-400"  },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PLACED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
        ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {status.replaceAll("_", " ")}
    </span>
  );
}
