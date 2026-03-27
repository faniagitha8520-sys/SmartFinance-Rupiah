import { fmt, pct } from "../utils";
import { Card, Bar, Label, StatusBadge } from "./UI";

export default function AnalisisView({ c, lists }) {
  const { healthScore, healthLabel, savingRate, savingScore, budgetScore, ddScore, hutangScore, diversScore, topSpending, spendingByKat } = c;
  const scoreColor = healthScore >= 80 ? "#10b981" : healthScore >= 60 ? "#f59e0b" : "#ec4899";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold">📊 Analisis Keuangan</h2>
        <p className="text-sm text-slate-500 mt-0.5">Evaluasi kesehatan finansialmu</p>
      </div>

      {/* Health Score Ring */}
      <Card glow>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-36 h-36 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 264} 264`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-slate-800">{healthScore}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Score</span>
            </div>
          </div>
          <div className="flex-1 space-y-2 w-full">
            <div className="text-lg font-bold" style={{ color: scoreColor }}>{healthLabel}</div>
            {[
              { label: "Saving Rate", score: savingScore, max: 30, icon: "💰" },
              { label: "Disiplin Budget", score: budgetScore, max: 25, icon: "📋" },
              { label: "Dana Darurat", score: ddScore, max: 20, icon: "🛡️" },
              { label: "Manajemen Hutang", score: hutangScore, max: 15, icon: "🤝" },
              { label: "Diversifikasi", score: diversScore, max: 10, icon: "🏦" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <span className="w-5">{item.icon}</span>
                <span className="w-28 text-slate-500 shrink-0">{item.label}</span>
                <div className="flex-1"><Bar value={item.score} max={item.max} color="#ec4899" /></div>
                <span className="w-12 text-right text-slate-500 font-mono">{item.score}/{item.max}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Month-over-Month */}
      <Card>
        <Label className="mb-3">📅 Month-over-Month</Label>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr>{["Bulan","Pemasukan","Pengeluaran","Net","Saving Rate","Transaksi"].map((h,i) =>
              <th key={i} className="text-left text-[11px] text-slate-500 pb-2 font-semibold pr-3 whitespace-nowrap">{h}</th>
            )}</tr></thead>
            <tbody>
              {Object.entries(c.monthStats).filter(([,v]) => v.txCount > 0).map(([m,v]) => (
                <tr key={m} className="border-t border-pink-100 hover:bg-white shadow-sm transition-colors">
                  <td className="py-2 pr-3 font-semibold text-slate-800">{m}</td>
                  <td className="py-2 pr-3 font-mono text-emerald-600">{fmt(v.pemasukan)}</td>
                  <td className="py-2 pr-3 font-mono text-pink-600">{fmt(v.pengeluaran)}</td>
                  <td className={`py-2 pr-3 font-mono font-bold ${v.net >= 0 ? 'text-emerald-600' : 'text-pink-600'}`}>{fmt(v.net)}</td>
                  <td className="py-2 pr-3">{pct(v.savingRate)}</td>
                  <td className="py-2 text-slate-500">{v.txCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Top Spending */}
      <Card>
        <Label className="mb-3">🔥 Top 5 Spending Kategori</Label>
        {topSpending.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-600">Belum ada data pengeluaran</div>
        ) : (
          <div className="space-y-2">
            {topSpending.map(([k, v], i) => {
              const maxVal = topSpending[0][1];
              return (
                <div key={k} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-center text-slate-500 font-bold">{i + 1}</span>
                  <span className="w-32 text-slate-800 font-medium truncate">{k}</span>
                  <div className="flex-1"><Bar value={v} max={maxVal} color="#ec4899" /></div>
                  <span className="w-24 text-right font-mono text-pink-600 text-xs">{fmt(v)}</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
