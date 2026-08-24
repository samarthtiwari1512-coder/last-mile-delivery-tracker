import { CheckCircle2, Clock, Truck, Package, XCircle, AlertTriangle, CalendarDays, XOctagon } from "lucide-react";

// Status → semantic color mapping using the design system tokens.
// Every page that shows order state (dashboards, detail, timeline) uses this component,
// so changing colors here propagates everywhere automatically.

const STATUS_STYLES: Record<string, { bg: string; dot: string; text: string; Icon: any; isPulsing?: boolean }> = {
  PLACED:           { bg: "bg-slate-100",    dot: "bg-slate-400",     text: "text-slate-700",     Icon: Package },
  ASSIGNED:         { bg: "bg-brand-50",     dot: "bg-brand-500",     text: "text-brand-700",     Icon: Clock, isPulsing: true },
  PICKED_UP:        { bg: "bg-info-50",      dot: "bg-info-500",      text: "text-info-700",      Icon: Package, isPulsing: true },
  IN_TRANSIT:       { bg: "bg-info-50",      dot: "bg-info-600",      text: "text-info-700",      Icon: Truck, isPulsing: true },
  OUT_FOR_DELIVERY: { bg: "bg-warning-50",   dot: "bg-warning-500",   text: "text-warning-700",   Icon: Truck, isPulsing: true },
  DELIVERED:        { bg: "bg-success-50",   dot: "bg-success-600",   text: "text-success-700",   Icon: CheckCircle2 },
  FAILED:           { bg: "bg-danger-50",    dot: "bg-danger-500",    text: "text-danger-700",    Icon: AlertTriangle },
  RESCHEDULED:      { bg: "bg-warning-50",   dot: "bg-warning-600",   text: "text-warning-700",   Icon: CalendarDays },
  CANCELLED:        { bg: "bg-slate-100",    dot: "bg-slate-400",     text: "text-slate-500",     Icon: XOctagon },
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
  const Icon = style.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap border shadow-xs
        ${style.bg} ${style.text} border-current/10`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
      {style.isPulsing && (
        <span className="relative flex h-2 w-2 ml-1">
          <span className={`animate-pulse-live absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`}></span>
        </span>
      )}
    </span>
  );
}
