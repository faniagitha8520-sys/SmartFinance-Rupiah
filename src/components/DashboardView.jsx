import { fmt, pct } from "../utils";
import { Card, Label, BigNum, Bar } from "./UI";

export default function DashboardView({ c, lists, settings }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-bold text-slate-800">📊 Financial Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Semua angka auto-update dari data transaksi</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Pemasukan", val: fmt(c.totalPemasukan), color: "text-emerald-600", accent: "from-emerald-400 to-emerald-600", icon: "💰" },
          { label: "Potongan Rutin", val: fmt(c.totalPotongan), color: "text-amber-600", accent: "from-amber-400 to-amber-600", icon: "🔒" },
          { label: "Pengeluaran Real", val: fmt(c.totalPengeluaranReal), color: "text-pink-600", accent: "from-pink-500 to-pink-600", icon: "💸" },
          { label: "Investasi", val: fmt(c.totalInvestasi), color: "text-blue-600", accent: "from-blue-400 to-blue-600", icon: "📈" },
          { label: "Tabungan", val: fmt(c.totalTabungan), color: "text-purple-600", accent: "from-purple-400 to-purple-600", icon: "🏦" },
          { label: "Net Saving", val: fmt(c.netSaving), color: c.netSaving >= 0 ? "text-emerald-600" : "text-pink-600", accent: "from-emerald-400 to-emerald-600", icon: "💎" },
        ].map((item, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-pink-100 p-5 backdrop-blur-sm hover:border-pink-100 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-900/5">
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${item.accent} opacity-80`} />
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>{item.icon}</span> {item.label}
            </p>
            <p className={`text-xl lg:text-2xl font-bold font-mono mt-2 ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>
      
      {/* Aset Emas — selalu tampil jika ada akun emas */}
      {lists.akunList.some(a => a.includes("(Emas)")) && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-6 shadow-xl shadow-amber-900/20 animate-fade-in">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150">
            <span className="text-9xl">🏆</span>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold text-amber-900/60 uppercase tracking-[0.2em] mb-1">Aset Emas — Terpisah dari Rupiah</p>
              {c.totalGram > 0 ? (
                <h3 className="text-3xl lg:text-4xl font-black text-amber-900 font-mono tracking-tight flex items-baseline gap-2">
                  {c.totalGram.toLocaleString("id-ID", { minimumFractionDigits: 4 })} <span className="text-xl font-bold opacity-70">gram</span>
                </h3>
              ) : (
                <p className="text-lg font-semibold text-amber-900/70 mt-1">Belum ada transaksi emas. Input di tab Input → pilih akun Treasury (Emas).</p>
              )}
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-right">
              <p className="text-[10px] font-bold text-amber-900/60 uppercase mb-1">Estimasi Nilai Saat Ini</p>
              <p className="text-2xl font-black text-amber-900 font-mono">{fmt(c.totalGoldValue)}</p>
              <p className="text-[9px] font-bold text-amber-900/40 mt-1 uppercase">Harga: {fmt(settings.goldPrice || 0)}/g — Edit di Settings</p>
            </div>
          </div>
        </div>
      )}

      {/* Saldo Per Akun */}
      <Card>
        <Label className="mb-3">🏦 Saldo Per Akun</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {lists.akunReal.filter(a => !a.includes("(Emas)")).map(a => {
            const s = c.saldo[a]; if (!s) return null;
            const pctTotal = c.totalAset > 0 ? s.saldoAkhir / c.totalAset : 0;
            return (
              <div key={a} className="bg-white shadow-sm rounded-xl p-3 border border-pink-100 hover:border-pink-500/20 transition-all duration-200">
                <div className="text-xs font-semibold text-pink-600 mb-1">🏦 {a}</div>
                <div className="text-lg font-bold font-mono text-slate-800">{fmt(s.saldoAkhir)}</div>
                <div className="text-[10px] text-slate-600 mt-1">{pct(pctTotal)} dari total</div>
                <div className="mt-1.5"><Bar value={pctTotal} max={1} /></div>
                <div className="flex justify-between mt-2 text-[10px]">
                  <span className="text-emerald-600">▲ {fmt(s.masuk)}</span>
                  <span className="text-pink-600">▼ {fmt(s.keluar)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Alokasi Virtual */}
      {lists.akunVirtual.length > 0 && (
        <Card>
          <Label className="mb-1">✨ Alokasi Virtual — Dana Earmark</Label>
          <p className="text-[11px] text-slate-600 mb-3">Dana dicatat terpisah dari saldo utama. Sisa free: {fmt(c.mainBankFree)}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lists.akunVirtual.map(a => {
              const s = c.saldo[a]; if (!s) return null;
              return (
                <div key={a} className="bg-white shadow-sm rounded-xl p-3 border-l-[3px] border-l-purple-500 border border-pink-100">
                  <div className="text-xs font-semibold text-purple-600 mb-1">📌 {a}</div>
                  <div className="text-lg font-bold font-mono text-slate-800">{fmt(s.saldoAkhir)}</div>
                  <div className="flex justify-between mt-2 text-[10px]">
                    <span className="text-emerald-600">▲ {fmt(s.masuk || s.saldoAkhir + (s.keluar || 0))}</span>
                    <span className="text-pink-600">▼ {fmt(s.keluar)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Insights */}
      <Card>
        <Label className="mb-3">📈 Quick Insights</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "🏥 Health Score", val: c.healthScore, sub: c.healthLabel, color: c.healthScore >= 80 ? "text-emerald-600" : c.healthScore >= 60 ? "text-amber-600" : "text-pink-600" },
            { label: "📈 Saving Rate", val: pct(c.savingRate), sub: c.savingRate >= 0.3 ? "✅ Target 30% tercapai" : "⚠️ Below target", color: c.savingRate >= 0.3 ? "text-emerald-600" : "text-amber-600" },
            { label: "🔥 Burn Rate", val: Math.round(c.burnRate), sub: "bulan tersisa", color: "text-slate-800" },
            { label: "💳 Top Spending", val: c.topSpending[0]?.[0] || "—", sub: c.topSpending[0] ? fmt(c.topSpending[0][1]) : "Belum ada data", color: "text-pink-600", small: true },
          ].map((item, i) => (
            <div key={i} className="bg-white shadow-sm rounded-xl p-3 border border-pink-100">
              <div className="text-[11px] text-slate-500">{item.label}</div>
              <div className={`${item.small ? 'text-base' : 'text-2xl'} font-bold ${item.color} mt-0.5`}>{item.val}</div>
              <div className="text-[11px] text-slate-600">{item.sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
