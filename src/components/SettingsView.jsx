import { DEFAULT_AKUN_LIST, DEFAULT_AKUN_VIRTUAL, DEFAULT_KATEGORI_SPENDING } from "../utils";
import { Card, Label } from "./UI";

const inp = "bg-white shadow-sm border border-pink-100 rounded-lg px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-pink-500/40 transition-all font-mono";

export default function SettingsView({ settings, setSettings, tx, renameKategori, renameAkun, resetData, lists }) {

  const handleRenameKat = (oldName) => {
    const n = prompt(`Rename "${oldName}" ke:`, oldName);
    if (n && n !== oldName && !lists.kategoriSpending.includes(n)) renameKategori(oldName, n);
  };
  const handleDeleteKat = (k) => {
    if (tx.some(t => t.kategori === k)) { alert(`❌ Tidak bisa hapus "${k}" — masih ada ${tx.filter(t => t.kategori === k).length} transaksi linked.`); return; }
    setSettings({ ...settings, kategoriSpending: lists.kategoriSpending.filter(x => x !== k) });
  };
  const handleAddKat = () => {
    const n = prompt("Nama kategori baru:"); if (!n || lists.kategoriSpending.includes(n)) return;
    setSettings({ ...settings, kategoriSpending: [...lists.kategoriSpending, n], budgets: { ...settings.budgets, [n]: 0 } });
  };
  const handleRenameAkun = (oldName) => {
    const n = prompt(`Rename "${oldName}" ke:`, oldName);
    if (n && n !== oldName && !lists.akunList.includes(n)) renameAkun(oldName, n);
  };
  const handleDeleteAkun = (a) => {
    if (tx.some(t => t.akun === a)) { alert(`❌ Tidak bisa hapus "${a}" — masih ada ${tx.filter(t => t.akun === a).length} transaksi linked.`); return; }
    setSettings({ ...settings, akunList: lists.akunList.filter(x => x !== a), akunVirtual: lists.akunVirtual.filter(x => x !== a) });
  };
  const handleAddAkun = () => {
    const n = prompt("Nama akun baru:"); if (!n || lists.akunList.includes(n)) return;
    const isVirtual = confirm(`Jadikan "${n}" sebagai akun Virtual (earmark)?`);
    setSettings({ ...settings, akunList: [...lists.akunList, n], akunVirtual: isVirtual ? [...lists.akunVirtual, n] : lists.akunVirtual });
  };
  const handleSetPin = () => {
    const p = prompt("Set PIN baru (4-6 digit, kosongkan untuk hapus):"); if (p === null) return;
    if (p === "") { setSettings({ ...settings, pin: "" }); alert("PIN dihapus."); return; }
    if (p.length < 4 || p.length > 6) { alert("PIN harus 4-6 digit!"); return; }
    const { hashPin } = require("../utils");
    setSettings({ ...settings, pin: hashPin(p) }); alert("PIN berhasil di-set!");
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <h2 className="text-xl font-bold">⚙️ Settings</h2>

      {/* Budget per Kategori */}
      <Card>
        <Label className="mb-3">Budget Per Kategori (Rp/bulan)</Label>
        <p className="text-[11px] text-slate-600 mb-3">Klik nama untuk rename · ✕ hapus (hanya jika 0 transaksi linked)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {lists.kategoriSpending.map(k => {
            const linked = tx.filter(t => t.kategori === k).length;
            return (
              <div key={k} className="flex items-center gap-2 bg-white shadow-sm rounded-lg px-2 py-1.5 border border-pink-100">
                <button onClick={() => handleRenameKat(k)} className="flex-1 text-left text-sm text-slate-800 hover:text-pink-600 truncate transition-colors">{k}</button>
                <span className="text-[10px] text-slate-600 shrink-0">{linked}tx</span>
                <input type="number" value={settings.budgets[k] || 0} onChange={e => setSettings({...settings, budgets: {...settings.budgets, [k]: Number(e.target.value)||0}})} className={`${inp} !w-20 text-right text-[11px]`} />
                <button onClick={() => handleDeleteKat(k)} className="text-pink-500/40 hover:text-pink-600 text-[11px] transition-colors">✕</button>
              </div>
            );
          })}
        </div>
        <button onClick={handleAddKat} className="mt-3 px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-500/20 transition-all">+ Tambah Kategori</button>
      </Card>

      {/* Potongan Rutin */}
      <Card>
        <Label className="mb-3">🔒 Potongan Rutin</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm">Total Potongan Rutin (Rp/bulan)</span>
          <input type="number" value={settings.potonganRutin} onChange={e=>setSettings({...settings,potonganRutin:Number(e.target.value)||0})} className={`${inp} !w-28`} />
        </div>
      </Card>

      {/* Akun Management */}
      <Card>
        <Label className="mb-3">🏦 Manajemen Akun</Label>
        <div className="space-y-1">
          {lists.akunList.map(a => {
            const isVirtual = lists.akunVirtual.includes(a);
            const linked = tx.filter(t => t.akun === a).length;
            return (
              <div key={a} className="flex items-center gap-2 bg-white shadow-sm rounded-lg px-3 py-2 border border-pink-100">
                <span className={`text-sm font-semibold ${isVirtual ? 'text-purple-600' : 'text-pink-600'}`}>{isVirtual ? '📌' : '🏦'}</span>
                <button onClick={() => handleRenameAkun(a)} className="flex-1 text-left text-sm text-slate-800 hover:text-pink-600 transition-colors">{a}</button>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isVirtual ? 'bg-purple-500/10 text-purple-600' : 'bg-pink-500/10 text-pink-600'} font-semibold`}>{isVirtual ? 'Virtual' : 'Real'}</span>
                <span className="text-[10px] text-slate-600">{linked}tx</span>
                <button onClick={() => handleDeleteAkun(a)} className="text-pink-500/40 hover:text-pink-600 text-[11px] transition-colors">✕</button>
              </div>
            );
          })}
        </div>
        <button onClick={handleAddAkun} className="mt-3 px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-500/20 transition-all">+ Tambah Akun</button>
      </Card>

      {/* PIN & OCR */}
      <Card>
        <Label className="mb-3">🔐 Keamanan & API</Label>
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm">PIN Lock:</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${settings.pin ? 'bg-pink-100merald-500/10 text-emerald-600' : 'bg-white shadow-sm shadow-pink-100/50 text-slate-500'}`}>{settings.pin ? '🔒 Aktif' : '🔓 Nonaktif'}</span>
            <button onClick={handleSetPin} className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-lg text-xs font-semibold hover:bg-pink-500/20 transition-all">{settings.pin ? 'Ubah PIN' : 'Set PIN'}</button>
          </div>
          <div>
            <span className="text-sm block mb-1">Anthropic API Key (untuk OCR)</span>
            <input type="password" value={settings.anthropicKey || ""} onChange={e => setSettings({...settings, anthropicKey: e.target.value})} placeholder="sk-ant-..." className={`${inp} !w-full !font-sans`} />
          </div>
        </div>
      </Card>

      {/* Reset Data */}
      <Card>
        <Label className="mb-3">⚠️ Danger Zone</Label>
        <button onClick={() => { if (confirm("RESET SEMUA DATA? Tindakan ini tidak bisa di-undo!")) resetData(); }}
          className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all">🗑️ Reset Semua Data</button>
      </Card>
    </div>
  );
}
