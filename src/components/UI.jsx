export function Bar({ value, max, color = "#ec4899" }) {
  const p = max > 0 ? Math.min(value / max, 1.5) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(p, 1) * 100}%`, background: p > 1 ? "#ef4444" : color }}
      />
    </div>
  );
}

export function StatusBadge({ status }) {
  const isGreen = status?.includes("Aman") || status?.includes("Aktif") || status?.includes("Surplus") || status?.includes("✅");
  const isRed = status?.includes("Over") || status?.includes("Minus") || status?.includes("Defisit") || status?.includes("❌");
  const isYellow = status?.includes("Hampir") || status?.includes("⚠");
  const c = isGreen ? "text-emerald-400" : isRed ? "text-rose-400" : isYellow ? "text-amber-400" : "text-slate-600";
  return <span className={`text-[11px] font-semibold ${c}`}>{status}</span>;
}

export function Card({ children, className = "", glow = false }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.1] ${glow ? 'animate-pulse-glow' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children, className = "" }) {
  return <div className={`text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 ${className}`}>{children}</div>;
}

export function BigNum({ children, color = "text-white", className = "" }) {
  return <div className={`text-2xl font-bold font-mono ${color} ${className}`}>{children}</div>;
}

export function EmptyState({ icon = "📭", title = "Belum ada data", sub = "" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3 animate-float">{icon}</div>
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}
