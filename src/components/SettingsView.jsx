import { useState } from "react";
import { DEFAULT_AKUN_LIST, DEFAULT_AKUN_VIRTUAL, DEFAULT_KATEGORI_SPENDING, hashPin } from "../utils";
import { Card, Label } from "./UI";

const inp = "bg-white shadow-sm border border-pink-100 rounded-lg px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-pink-500/40 transition-all font-mono";

export default function SettingsView({ settings, setSettings, tx, renameKategori, renameAkun, resetData, lists }) {
  const [modal, setModal] = useState(null); 

  const closeModal = () => setModal(null);

  const handleRenameKat = (oldName) => {
    setModal({
      title: `Rename Kategori "${oldName}"`,
      placeholder: "Nama Kategori Baru...",
      initialValue: oldName,
      onConfirm: (n) => {
        if (n && n !== oldName && !lists.kategoriSpending.includes(n)) renameKategori(oldName, n);
        closeModal();
      }
    });
  };

  const handleDeleteKat = (k) => {
    if (tx.some(t => t.kategori === k)) {
      setModal({ isConfirmOnly: true, title: "❌ Gagal Hapus", placeholder: `Masih ada ${tx.filter(t => t.kategori === k).length} transaksi. Silakan hapus transaksinya dulu.`});
      return;
    }
    setSettings({ ...settings, kategoriSpending: lists.kategoriSpending.filter(x => x !== k) });
  };

  const handleAddKat = () => {
    setModal({
      title: "Tambah Kategori Baru",
      placeholder: "Nama Kategori...",
      initialValue: "",
      onConfirm: (n) => {
        const t = n.trim();
        if (!t || lists.kategoriSpending.includes(t)) return closeModal();
        setSettings({ ...settings, kategoriSpending: [...lists.kategoriSpending, t], budgets: { ...settings.budgets, [t]: 0 } });
        closeModal();
      }
    });
  };

  const handleRenameAkun = (oldName) => {
    setModal({
      title: `Rename Akun "${oldName}"`,
      placeholder: "Nama Akun Baru...",
      initialValue: oldName,
      onConfirm: (n) => {
        if (n && n !== oldName && !lists.akunList.includes(n)) renameAkun(oldName, n);
        closeModal();
      }
    });
  };

  const handleDeleteAkun = (a) => {
    if (tx.some(t => t.akun === a)) {
      setModal({ isConfirmOnly: true, title: "❌ Gagal Hapus", placeholder: `Masih ada ${tx.filter(t => t.akun === a).length} transaksi tercatat pada akun ini.`});
      return;
    }
    setSettings({ ...settings, akunList: lists.akunList.filter(x => x !== a), akunVirtual: lists.akunVirtual.filter(x => x !== a) });
  };

  const handleAddAkun = () => {
    setModal({
      title: "Tambah Akun Baru",
      placeholder: "Nama Akun...",
      initialValue: "",
      onConfirm: (n) => {
        const t = n.trim();
        if (!t || lists.akunList.includes(t)) return closeModal();
        
        setModal({
          title: `Setup Tipe Akun "${t}"`,
          placeholder: "Pilih Tipe Akun:",
          isConfirmOnly: true,
          confirmText: "Virtual Earmark 📌",
          cancelText: "Akun Standard 🏦",
          onConfirm: () => {
            setSettings({ ...settings, akunList: [...lists.akunList, t], akunVirtual: [...lists.akunVirtual, t] });
            closeModal();
          },
          onCancel: () => {
            setSettings({ ...settings, akunList: [...lists.akunList, t], akunVirtual: lists.akunVirtual });
            closeModal();
          }
        });
      }
    });
  };

  const handleSetPin = () => {
    setModal({
      title: "Konfigurasi PIN",
      placeholder: "PIN 4-6 digit (kosong utk lepas)",
      initialValue: "",
      isPassword: true,
      onConfirm: (p) => {
        if (!p || p === "") {
          setSettings({ ...settings, pin: "" });
          setModal({ isConfirmOnly: true, title: "Sukses", placeholder: "PIN keamanan berhasil dilepas 🔓" });
          return;
        }
        if (p.length < 4 || p.length > 6) {
          setModal({ isConfirmOnly: true, title: "Error", placeholder: "PIN wajib terdiri dari 4 sampai 6 digit!" });
          return;
        }
        setSettings({ ...settings, pin: hashPin(p) });
        setModal({ isConfirmOnly: true, title: "Berhasil", placeholder: "PIN keamanan baru berhasil dipasang 🔒" });
      }
    });
  };

  const handleReset = () => {
    setModal({
      title: "⚠️ RESET SEMUA DATA",
      placeholder: "Tindakan ini menghapus SEMUA TRANSAKSI permanen secara instan tidak bisa di-undo!",
      isConfirmOnly: true,
      confirmText: "Ya, Hapus Semua!",
      danger: true,
      onConfirm: () => {
        resetData();
        closeModal();
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10">
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
                <button onClick={() => handleRenameKat(k)} className="flex-1 text-left text-sm text-slate-800 hover:text-pink-600 truncate transition-colors font-medium">{k}</button>
                <span className="text-[10px] text-slate-600 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded-full">{linked}tx</span>
                <input type="number" value={settings.budgets[k] || 0} onChange={e => setSettings({...settings, budgets: {...settings.budgets, [k]: Number(e.target.value)||0}})} className={`${inp} !w-24 text-right text-[11px]`} />
                <button onClick={() => handleDeleteKat(k)} className="text-pink-300 hover:text-pink-600 text-[11px] transition-colors ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-pink-50">✕</button>
              </div>
            );
          })}
        </div>
        <button onClick={handleAddKat} className="mt-4 px-4 py-2.5 bg-pink-50 border border-pink-100 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-100 transition-all shadow-sm">+ Tambah Kategori</button>
      </Card>

      {/* Potongan Rutin */}
      <Card>
        <Label className="mb-3">🔒 Potongan Rutin</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm">Total Potongan Rutin (Rp/bulan)</span>
          <input type="number" value={settings.potonganRutin} onChange={e=>setSettings({...settings,potonganRutin:Number(e.target.value)||0})} className={`${inp} !w-32`} />
        </div>
      </Card>

      {/* Akun Management */}
      <Card>
        <Label className="mb-3">🏦 Manajemen Akun</Label>
        <div className="space-y-1.5">
          {lists.akunList.map(a => {
            const isVirtual = lists.akunVirtual.includes(a);
            const linked = tx.filter(t => t.akun === a).length;
            return (
              <div key={a} className="flex items-center gap-2 bg-white shadow-sm rounded-lg px-3 py-2 border border-pink-100">
                <span className={`text-sm font-semibold ${isVirtual ? 'text-purple-600' : 'text-pink-600'}`}>{isVirtual ? '📌' : '🏦'}</span>
                <button onClick={() => handleRenameAkun(a)} className="flex-1 text-left text-sm text-slate-800 hover:text-pink-600 transition-colors font-medium">{a}</button>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isVirtual ? 'bg-purple-50 text-purple-600' : 'bg-pink-50 text-pink-600'} font-semibold border ${isVirtual ? 'border-purple-100' : 'border-pink-100'}`}>{isVirtual ? 'Virtual' : 'Real'}</span>
                <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">{linked}tx</span>
                <button onClick={() => handleDeleteAkun(a)} className="text-pink-300 hover:text-pink-600 text-[11px] transition-colors ml-1 w-6 h-6 flex items-center justify-center rounded-full hover:bg-pink-50">✕</button>
              </div>
            );
          })}
        </div>
        <button onClick={handleAddAkun} className="mt-4 px-4 py-2.5 bg-pink-50 border border-pink-100 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-100 transition-all shadow-sm">+ Tambah Akun</button>
      </Card>

      {/* PIN & OCR */}
      <Card>
        <Label className="mb-3">🔐 Keamanan & Akses</Label>
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">Status PIN Lock:</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${settings.pin ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{settings.pin ? '🔒 Aktif' : '🔓 Nonaktif'}</span>
            </div>
            <button onClick={handleSetPin} className="px-4 py-2 bg-pink-50 border border-pink-100 text-pink-600 rounded-lg text-xs font-bold hover:bg-pink-100 transition-all shadow-sm">{settings.pin ? 'Ubah Limit / Lepas PIN' : '🛡️ Pasang PIN'}</button>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <span className="text-sm block mb-1.5 font-medium text-slate-700">Anthropic API Key (Opsional untk Auto-Scan Struk)</span>
            <input type="password" value={settings.anthropicKey || ""} onChange={e => setSettings({...settings, anthropicKey: e.target.value})} placeholder="sk-ant-..." className={`${inp} !w-full !font-sans bg-slate-50`} />
          </div>
        </div>
      </Card>

      {/* Reset Data */}
      <Card>
        <Label className="mb-3 text-red-500">⚠️ Danger Zone</Label>
        <button onClick={handleReset}
          className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-500 rounded-xl text-sm font-bold hover:bg-red-100 hover:text-red-600 transition-all shadow-sm flex items-center gap-2">🗑️ Reset Seluruh Database Transaksi</button>
      </Card>

      {/* Modal UI Injection */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pink-900/10 backdrop-blur-[4px] animate-fade-in-up">
          <div className="bg-white rounded-3xl w-full max-w-xs shadow-2xl border border-pink-100 p-6 overflow-hidden">
            <h3 className={`text-lg font-bold mb-1.5 ${modal.danger ? 'text-red-500' : 'text-slate-800'}`}>{modal.title}</h3>
            
            {!modal.isConfirmOnly && (
              <input
                autoFocus
                type={modal.isPassword ? "password" : "text"}
                placeholder={modal.placeholder}
                defaultValue={modal.initialValue}
                autoComplete="off"
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-pink-500 transition-all font-mono mt-3 mb-5 ${modal.isPassword && 'tracking-[8px] text-center'}`}
                onKeyDown={(e) => { 
                    if (e.key === 'Enter') modal.onConfirm(e.target.value); 
                    else if (e.key === 'Escape') closeModal();
                }}
                id="modalInputEl"
              />
            )}
            
            {modal.isConfirmOnly && (
              <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">{modal.placeholder}</p>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={modal.onCancel || closeModal} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all">
                {modal.cancelText || (modal.isConfirmOnly && !modal.onConfirm ? "Tutup" : "Batal")}
              </button>
              
              {modal.onConfirm && (
                <button 
                  onClick={() => {
                    if (modal.isConfirmOnly) modal.onConfirm();
                    else modal.onConfirm(document.getElementById('modalInputEl').value);
                  }} 
                  className={`flex-1 px-4 py-3 ${modal.danger ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-pink-500 to-pink-600'} hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-lg transition-all`}>
                  {modal.confirmText || "Selesai"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
