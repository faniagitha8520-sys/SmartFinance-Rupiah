import { fmt } from "../utils";
import { Card, Label, BigNum } from "./UI";

const inp = "bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono outline-none focus:border-emerald-500/50 w-36 text-right transition-all";

export default function KirimView({ c, settings, setSettings }) {
  const ki = settings.kirimIndo;
  const hold = Math.max(c.saldo["Kirim Indonesia"]?.saldoAkhir||0,0);
  const holdIDR = hold * ki.kursJPYIDR;
  const kursOK = ki.kursJPYIDR >= ki.kursTarget;
  const upd = (k,v) => setSettings({...settings, kirimIndo:{...ki,[k]:Number(v)||0}});

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-xl font-bold">💸 Kirim Indonesia</h2>
      <Card>
        <Label className="mb-3">⚙️ Kurs & Target</Label>
        {[{l:"💱 Kurs JPY→IDR",k:"kursJPYIDR",v:ki.kursJPYIDR},{l:"🎯 Kurs Target",k:"kursTarget",v:ki.kursTarget},{l:"💰 Target/bln (IDR)",k:"targetKirimIDR",v:ki.targetKirimIDR}].map(i=>(
          <div key={i.k} className="flex justify-between items-center py-2">
            <span className="text-sm">{i.l}</span>
            <input type="number" value={i.v} onChange={e=>upd(i.k,e.target.value)} className={inp}/>
          </div>
        ))}
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card><Label>Hold (JPY)</Label><BigNum color="text-purple-600">{fmt(hold)}</BigNum><p className="text-[11px] text-slate-500 mt-1">≈ Rp{Math.round(holdIDR).toLocaleString("id-ID")}</p></Card>
        <Card><Label>Status Kurs</Label><div className={`text-lg font-bold mt-1 ${kursOK?'text-emerald-600':'text-amber-600'}`}>{kursOK?"✅ KIRIM!":"⏳ Tunggu"}</div></Card>
      </div>
    </div>
  );
}
