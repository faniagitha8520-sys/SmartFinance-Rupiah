import { fmt, fmtG, pct } from "../utils";
import { Card, Label, StatusBadge } from "./UI";

export default function SaldoView({ c, lists, settings }) {
  const goldAkun = lists.akunList.filter(a => a.includes("(Emas)"));
  const nonGoldReal = lists.akunReal.filter(a => !a.includes("(Emas)"));

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
              {nonGoldReal.map(a => { const s = c.saldo[a]; if (!s) return null;
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

      {/* ASET EMAS Section */}
      {goldAkun.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🏆</span>
            <h3 className="text-base font-bold text-amber-800">ASET EMAS — Terpisah dari Total Aset Rupiah</h3>
          </div>
          <div className="flex items-center gap-2 mb-4 text-sm text-amber-700">
            <span>💡 Harga Emas /gram:</span>
            <span className="font-bold font-mono">{fmt(settings.goldPrice || 0)}</span>
            <span className="text-[10px] text-amber-500 italic">— Edit di Settings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-200/50">
                  {["Akun","Saldo Awal (g)","Masuk (g)","Keluar (g)","Total (g)","Est. Nilai (Rp)","Status"].map((h,i) =>
                    <th key={i} className="text-left text-[11px] text-amber-800 pb-2 pt-2 px-3 font-bold whitespace-nowrap">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {goldAkun.map(a => {
                  const s = c.saldo[a]; if (!s) return null;
                  const estNilai = s.gramTotal * (settings.goldPrice || 0);
                  const status = s.gramTotal > 0 ? "🟢 Ada" : "— Kosong";
                  return (
                    <tr key={a} className="border-t border-amber-200/60 hover:bg-amber-100/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-amber-800">🏆 {a}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{fmtG(s.gramSaldoAwal)}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-600">{fmtG(s.gramMasuk)}</td>
                      <td className="py-2.5 px-3 font-mono text-pink-600">{fmtG(s.gramKeluar)}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-800 font-bold">{fmtG(s.gramTotal)}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">{fmt(estNilai)}</td>
                      <td className="py-2.5 px-3 text-sm">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-amber-200/60 font-bold">
                  <td className="py-2.5 px-3 text-amber-900">TOTAL EMAS</td>
                  <td className="py-2.5 px-3"></td>
                  <td className="py-2.5 px-3"></td>
                  <td className="py-2.5 px-3"></td>
                  <td className="py-2.5 px-3 font-mono text-amber-900">{fmtG(c.totalGram)}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-900">{fmt(c.totalGoldValue)}</td>
                  <td className="py-2.5 px-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
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
