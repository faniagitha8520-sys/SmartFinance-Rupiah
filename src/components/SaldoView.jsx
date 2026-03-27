import { fmt, pct } from "../utils";
import { Card, Label, StatusBadge } from "./UI";

export default function SaldoView({ c, lists }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-xl font-bold">💰 Saldo Per Akun</h2>
      <Card>
        <div className="bg-white shadow-sm rounded-xl p-4 border border-pink-500/10 mb-4">
          <Label>Total Aset (Real)</Label>
          <div className="text-2xl font-bold font-mono text-pink-600 mt-1">{fmt(c.totalAsetReal)}</div>
        </div>
        <Label className="mb-3">🏦 Akun Bank</Label>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr>{["Akun","Pemasukan","Pengeluaran","Saldo Akhir","% Total","Status"].map((h,i) =>
              <th key={i} className="text-left text-[11px] text-slate-500 pb-2 font-semibold pr-3 whitespace-nowrap">{h}</th>
            )}</tr></thead>
            <tbody>
              {lists.akunReal.map(a => { const s = c.saldo[a]; if (!s) return null;
                const pctVal = c.totalAset > 0 ? s.saldoAkhir / c.totalAset : 0;
                let status = "— Kosong"; if (s.saldoAkhir < 0) status = "❌ Minus"; else if (s.saldoAkhir > 0) status = "✅ Aktif";
                return (
                  <tr key={a} className="border-t border-pink-100 hover:bg-white shadow-sm transition-colors">
                    <td className="py-2 pr-3 font-semibold text-slate-800"><span className="text-pink-600">🏦</span> {a}</td>
                    <td className="py-2 pr-3 font-mono text-emerald-600">{fmt(s.masuk)}</td>
                    <td className="py-2 pr-3 font-mono text-pink-600">{fmt(s.keluar)}</td>
                    <td className="py-2 pr-3 font-mono text-slate-800 font-bold">{fmt(s.saldoAkhir)}</td>
                    <td className="py-2 pr-3 text-slate-500">{pct(pctVal)}</td>
                    <td className="py-2"><StatusBadge status={status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <Label className="mb-1">✨ Alokasi Virtual (Dana Earmark)</Label>
        <p className="text-[11px] text-slate-600 mb-3">Dana dicatat terpisah dari saldo utama. Free balance: {fmt(c.mainBankFree)}</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr>{["Akun","Alokasi","Terpakai","Saldo","Status"].map((h,i) =>
              <th key={i} className="text-left text-[11px] text-slate-500 pb-2 font-semibold pr-3">{h}</th>
            )}</tr></thead>
            <tbody>
              {lists.akunVirtual.map(a => { const s = c.saldo[a]; if (!s) return null;
                const alokasi = (s.masuk || 0) + Math.max(s.saldoAkhir + (s.keluar || 0), 0);
                const status = s.saldoAkhir <= 0 ? "❌ Defisit" : "✅ Surplus";
                return (
                  <tr key={a} className="border-t border-pink-100 hover:bg-white shadow-sm transition-colors">
                    <td className="py-2 pr-3 font-semibold text-purple-600">📌 {a}</td>
                    <td className="py-2 pr-3 font-mono text-slate-800">{fmt(alokasi)}</td>
                    <td className="py-2 pr-3 font-mono text-pink-600">{fmt(s.keluar)}</td>
                    <td className="py-2 pr-3 font-mono text-slate-800 font-bold">{fmt(s.saldoAkhir)}</td>
                    <td className="py-2"><StatusBadge status={status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
