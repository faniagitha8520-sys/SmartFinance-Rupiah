import { fmt, MONTHS } from "../utils";
import { Card, Bar, Label, StatusBadge, EmptyState } from "./UI";

export default function BulananView({ c, tx, settings, lists, selMonth, setSelMonth }) {
  const monthData = c.budgetData[selMonth] || {};
  const monthTx = c.byMonth[selMonth] || [];
  const stats = c.monthStats[selMonth] || {};

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-xl font-bold">📅 Bulanan</h2>
        <select value={selMonth} onChange={e => setSelMonth(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-pink-500/40 transition-all">
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pemasukan", val: fmt(stats.pemasukan || 0), color: "text-emerald-400" },
          { label: "Pengeluaran", val: fmt(stats.pengeluaran || 0), color: "text-pink-400" },
          { label: "Net", val: fmt(stats.net || 0), color: (stats.net || 0) >= 0 ? "text-emerald-400" : "text-pink-400" },
          { label: "Transaksi", val: stats.txCount || 0, color: "text-white" },
        ].map((item, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">{item.label}</div>
            <div className={`text-lg font-bold font-mono mt-1 ${item.color}`}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Budget Tracking */}
      <Card>
        <Label className="mb-3">📊 Budget Tracking — {selMonth}</Label>
        {Object.entries(monthData).filter(([,v]) => v.budget > 0 || v.spent > 0).length === 0 ? (
          <EmptyState icon="📊" title="Belum ada budget aktif" sub="Set budget di Settings untuk mulai tracking" />
        ) : (
          <div className="space-y-2">
            {Object.entries(monthData).filter(([,v]) => v.budget > 0 || v.spent > 0).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3 text-sm py-1">
                <span className="w-28 text-white truncate shrink-0">{k}</span>
                <div className="flex-1"><Bar value={v.spent} max={v.budget} color="#ec4899" /></div>
                <span className="w-28 text-right text-[11px] text-slate-500 font-mono shrink-0">{fmt(v.spent)}/{fmt(v.budget)}</span>
                <span className="w-16 shrink-0"><StatusBadge status={v.status} /></span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Month Transactions */}
      <Card>
        <Label className="mb-3">📝 Transaksi {selMonth}</Label>
        {monthTx.length === 0 ? (
          <EmptyState icon="📝" title={`Belum ada transaksi di ${selMonth}`} sub="Mulai input transaksi di tab Input" />
        ) : (
          <div className="space-y-0.5 max-h-96 overflow-y-auto">
            {[...monthTx].reverse().map((t, i) => (
              <div key={t.id || i} className="flex items-center gap-2 px-2 py-2 bg-white/[0.015] rounded-lg text-xs hover:bg-white/[0.04] transition-colors">
                <span className="w-16 text-slate-500 font-mono shrink-0">{t.date?.slice(5)}</span>
                <span className="w-16 text-pink-400 font-semibold shrink-0 text-[11px]">{t.kategori}</span>
                <span className="flex-1 truncate">{t.item}</span>
                <span className={`font-mono font-semibold shrink-0 ${t.penghasilan > 0 ? 'text-emerald-400' : 'text-pink-400'}`}>
                  {t.penghasilan > 0 ? `+${fmt(t.penghasilan)}` : `-${fmt(t.pengeluaran)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
