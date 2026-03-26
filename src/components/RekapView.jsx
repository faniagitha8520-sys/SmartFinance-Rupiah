import { fmt, pct, MONTHS } from "../utils";
import { Card, Label, EmptyState } from "./UI";

export default function RekapView({ c }) {
  const activeMonths = Object.entries(c.monthStats).filter(([,v]) => v.txCount > 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-xl font-bold">📋 Rekap Keuangan</h2>

      {activeMonths.length === 0 ? (
        <EmptyState icon="📋" title="Belum ada data rekap" sub="Data akan muncul setelah kamu menambahkan transaksi" />
      ) : (
        <Card>
          <Label className="mb-3">📅 Rekap Per Bulan</Label>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr>{["Bulan","Pemasukan","Pengeluaran","Net","Saving Rate","Tx"].map((h,i) =>
                <th key={i} className="text-left text-[11px] text-slate-500 pb-2 font-semibold pr-4 whitespace-nowrap">{h}</th>
              )}</tr></thead>
              <tbody>
                {activeMonths.map(([m,v]) => (
                  <tr key={m} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-4 font-semibold text-white">{m}</td>
                    <td className="py-2.5 pr-4 font-mono text-emerald-400">{fmt(v.pemasukan)}</td>
                    <td className="py-2.5 pr-4 font-mono text-pink-400">{fmt(v.pengeluaran)}</td>
                    <td className={`py-2.5 pr-4 font-mono font-bold ${v.net >= 0 ? 'text-emerald-400' : 'text-pink-400'}`}>{fmt(v.net)}</td>
                    <td className={`py-2.5 pr-4 ${v.savingRate >= 0.3 ? 'text-emerald-400' : 'text-amber-400'}`}>{pct(v.savingRate)}</td>
                    <td className="py-2.5 text-slate-500">{v.txCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
