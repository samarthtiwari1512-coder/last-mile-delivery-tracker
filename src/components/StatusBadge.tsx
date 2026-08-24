// Status → semantic color mapping using the design system tokens.
// Every page that shows order state (dashboards, detail, timeline) uses this component,
// so changing colors here propagates everywhere automatically.

const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string; ring: string }> = {
  PLACED:           { bg: "bg-slate-100",    dot: "bg-slate-400",     text: "text-slate-600",     ring: "" },
  ASSIGNED:         { bg: "bg-brand-100",    dot: "bg-brand-500",     text: "text-brand-700",     ring: "" },
  PICKED_UP:        { bg: "bg-info-100",     dot: "bg-info-500",      text: "text-info-700",      ring: "" },
  IN_TRANSIT:       { bg: "bg-info-100",     dot: "bg-info-600",      text: "text-info-700",      ring: "" },
  OUT_FOR_DELIVERY: { bg: "bg-warning-100",  dot: "bg-warning-500",   text: "text-warning-700",   ring: "" },
  DELIVERED:        { bg: "bg-success-100",  dot: "bg-success-500",   text: "text-success-700",   ring: "" },
  FAILED:           { bg: "bg-danger-100",   dot: "bg-danger-500",    text: "text-danger-700",    ring: "" },
  RESCHEDULED:      { bg: "bg-warning-50",   dot: "bg-warning-600",   text: "text-warning-700",   ring: "" },
  CANCELLED:        { bg: "bg-slate-100",    dot: "bg-slate-300",     text: "text-slate-400",     ring: "" },
};

// Human-readable labels for display
const STATUS_LABEL: Record<string, string> = {
  PLACED:           "Placed",
  ASSIGNED:         "Assigned",
  PICKED_UP:        "Picked Up",
  IN_TRANSIT:       "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED:        "Delivered",
  FAILED:           "Failed",
  RESCHEDULED:      "Rescheduled",
  CANCELLED:        "Cancelled",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PLACED;
  const label = STATUS_LABEL[status] ?? status.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
        ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
      {label}
    </span>
  );
}
