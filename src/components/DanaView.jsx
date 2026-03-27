import { fmt, pct } from "../utils";
import { Card, Bar, Label } from "./UI";

export default function DanaView({ c, settings, setSettings }) {
  const dd = settings.danaDarurat || { pengeluaranBulanan: 5000000, targetBulan: 6, saldoAwal: 0 };
  const upd = (k, v) => setSettings({ ...settings, danaDarurat: { ...dd, [k]: Number(v) || 0 } });

  const inp = "w-24 bg-white shadow-sm border border-pink-100 rounded-lg px-2 py-1 text-sm text-slate-800 font-mono outline-none focus:border-pink-500/40 transition-all text-right";

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-xl font-bold">🛡️ Dana Darurat Tracker</h2>
      <Card>
        <Label className="mb-3">⚙️ Asumsi</Label>
        {[{l:"Pengeluaran Bulanan (Rp)",k:"pengeluaranBulanan",v:dd.pengeluaranBulanan},{l:"Target Bulan",k:"targetBulan",v:dd.targetBulan}].map(i=>(
          <div key={i.k} className="flex justify-between items-center py-2">
            <span className="text-sm">{i.l}</span>
            <input type="number" value={i.v} onChange={e=>upd(i.k,e.target.value)} className={inp}/>
          </div>
        ))}
      </Card>
      <Card glow>
        <Label className="mb-3">📊 Progress Dana Darurat</Label>
        <div className="flex items-end gap-6">
          <div>
            <div className="text-sm text-slate-500">Target</div>
            <div className="text-xl font-bold font-mono text-slate-800">{fmt(c.ddTarget)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Terkumpul</div>
            <div className="text-xl font-bold font-mono text-pink-600">{fmt(c.ddCurrent)}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Progress</div>
            <div className={`text-xl font-bold ${c.ddProgress >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>{pct(c.ddProgress)}</div>
          </div>
        </div>
        <div className="mt-4"><Bar value={c.ddProgress} max={1} color="#ec4899" /></div>
        <div className="text-xs text-slate-600 mt-2">
          {c.ddProgress >= 1 ? "✅ Target dana darurat tercapai!" : `⚠️ Masih kurang ${fmt(c.ddTarget - c.ddCurrent)}`}
        </div>
      </Card>
    </div>
  );
}
