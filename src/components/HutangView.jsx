import { fmt } from "../utils";
import { Card, Label, EmptyState } from "./UI";

export default function HutangView({ c, tx }) {
  const getPersonTx = (name) => {
    const hutang = c.hutangMasuk.filter(t => t.item?.toLowerCase().includes(name.toLowerCase()) || t.catatan?.toLowerCase().includes(name.toLowerCase()));
    const bayar = c.bayarHutang.filter(t => t.item?.toLowerCase().includes(name.toLowerCase()) || t.catatan?.toLowerCase().includes(name.toLowerCase()));
    const totalH = hutang.reduce((s, t) => s + Math.max(Number(t.penghasilan) || 0, Number(t.pengeluaran) || 0), 0);
    const totalB = bayar.reduce((s, t) => s + Math.max(Number(t.pengeluaran) || 0, Number(t.penghasilan) || 0), 0);
    return { hutang, bayar, totalH, totalB, sisa: totalH - totalB };
  };

  const allDebtItems = [...c.hutangMasuk, ...c.bayarHutang];
  const people = [...new Set(allDebtItems.map(t => t.item?.split(" ").pop() || t.catatan?.split(" ").pop()).filter(Boolean))];

  const piutangItems = [...c.piutangKeluar, ...c.piutangMasuk];
  const piutangPeople = [...new Set(piutangItems.map(t => t.item?.split(" ").pop() || t.catatan?.split(" ").pop()).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-xl font-bold">🤝 Hutang / Piutang</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Hutang", val: fmt(c.totalHutang), color: "text-pink-600", icon: "📊" },
          { label: "Sudah Dibayar", val: fmt(c.totalBayar), color: "text-emerald-600", icon: "✅" },
          { label: "Sisa Hutang", val: fmt(c.sisaHutang), color: c.sisaHutang > 0 ? "text-pink-600" : "text-emerald-600", icon: "💳" },
        ].map((item, i) => (
          <div key={i} className="bg-white shadow-sm border border-pink-100 rounded-2xl p-4">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">{item.icon} {item.label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${item.color}`}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Piutang Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Piutang", val: fmt(c.totalPiutangOut), color: "text-purple-600", icon: "📤" },
          { label: "Sudah Kembali", val: fmt(c.totalPiutangIn), color: "text-emerald-600", icon: "📥" },
          { label: "Sisa Piutang", val: fmt(c.sisaPiutang), color: c.sisaPiutang > 0 ? "text-purple-600" : "text-emerald-600", icon: "💰" },
        ].map((item, i) => (
          <div key={i} className="bg-white shadow-sm border border-pink-100 rounded-2xl p-4">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">{item.icon} {item.label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${item.color}`}>{item.val}</div>
          </div>
        ))}
      </div>

      {/* Per Person Hutang */}
      <Card>
        <Label className="mb-3">📋 Detail Per Orang (Hutang)</Label>
        {people.length === 0 ? (
          <EmptyState icon="🤝" title="Belum ada hutang" sub="Semua hutang akan muncul di sini" />
        ) : (
          <div className="space-y-3">
            {people.map(name => {
              const p = getPersonTx(name);
              return (
                <div key={name} className="bg-white shadow-sm rounded-xl p-3 border border-pink-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800">{name}</span>
                    <span className={`font-mono text-sm font-bold ${p.sisa > 0 ? 'text-pink-600' : 'text-emerald-600'}`}>{p.sisa > 0 ? `Sisa: ${fmt(p.sisa)}` : "✅ Lunas"}</span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-slate-500">
                    <span>Hutang: <span className="text-pink-600 font-mono">{fmt(p.totalH)}</span></span>
                    <span>Bayar: <span className="text-emerald-600 font-mono">{fmt(p.totalB)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
