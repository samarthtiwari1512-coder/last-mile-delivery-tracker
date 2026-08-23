const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  PICKED_UP: "bg-indigo-100 text-indigo-700",
  IN_TRANSIT: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  RESCHEDULED: "bg-orange-100 text-orange-700",
  CANCELLED: "bg-slate-200 text-slate-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[status] ?? "bg-slate-100"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
