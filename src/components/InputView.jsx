import { useState, useMemo, useRef } from "react";
import { fmt, MONTHS, TIPE_LIST, normalizeDebtType } from "../utils";
import { Card, Label, EmptyState } from "./UI";

const inp = "w-full bg-white shadow-sm border border-pink-100 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-600 outline-none focus:border-pink-500/40 focus:ring-1 focus:ring-pink-500/20 transition-all font-sans";
const inpMono = inp + " font-mono";

export default function InputView({ tx, addTx, updateTx, deleteTx, settings, lists }) {
  const empty = { date: new Date().toISOString().slice(0, 10), kategori: "", item: "", penghasilan: "", pengeluaran: "", gram: "", akun: "Cash", catatan: "", bulan: MONTHS[new Date().getMonth()], tipe: "Pengeluaran" };
  // Number input handler: keeps raw string so user can type freely, no "01" or "0500" issue
  const numChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showAddKat, setShowAddKat] = useState(false);
  const [newKatName, setNewKatName] = useState("");
  const [showOCR, setShowOCR] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPreview, setOcrPreview] = useState([]);
  const [csvText, setCsvText] = useState("");
  const [ocrMode, setOcrMode] = useState("photo");
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    const isHutangTx = (t) => t.tipe === "Hutang Masuk" || t.tipe === "Bayar Hutang" || t.tipe === "Hutang Catat" || t.kategori === "Hutang";
    const isPiutangTx = (t) => t.tipe === "Piutang Keluar" || t.tipe === "Piutang Masuk" || t.kategori === "Piutang";
    const modeFiltered = tx.filter((t) => {
      if (filterMode === "hutang") return isHutangTx(t);
      if (filterMode === "piutang") return isPiutangTx(t);
      return true;
    });
    return [...(f ? modeFiltered.filter(t => t.item?.toLowerCase().includes(f) || t.kategori?.toLowerCase().includes(f) || t.catatan?.toLowerCase().includes(f)) : modeFiltered)].reverse();
  }, [tx, filter, filterMode]);

  const handleSubmit = () => {
    if (!form.item || !form.kategori) return;
    // Convert string values to numbers on submit
    const normalizedForm = { ...form, tipe: normalizeDebtType(form.tipe), penghasilan: Number(form.penghasilan) || 0, pengeluaran: Number(form.pengeluaran) || 0, gram: Number(form.gram) || 0 };
    // Emas: hanya catat gram, Rp = 0
    if (normalizedForm.akun.includes("(Emas)")) {
      normalizedForm.penghasilan = 0;
      normalizedForm.pengeluaran = 0;
    }
    if (editId) { updateTx(editId, normalizedForm); setEditId(null); } else { addTx(normalizedForm); }
    setForm(empty); setShowForm(false);
  };
  const startEdit = (t) => { setForm({ date: t.date, kategori: t.kategori, item: t.item, penghasilan: t.penghasilan || "", pengeluaran: t.pengeluaran || "", gram: t.gram || "", akun: t.akun, catatan: t.catatan, bulan: t.bulan, tipe: normalizeDebtType(t.tipe) }); setEditId(t.id); setShowForm(true); setShowOCR(false); };
  const cancelEdit = () => { setEditId(null); setForm(empty); setShowForm(false); };
  const parseCSV = (text) => { const lines = text.trim().split("\n").filter(l => l.trim()); const parsed = []; for (const line of lines) { const cols = line.split(",").map(c => c.trim()); if (cols.length < 5 || cols[0].toLowerCase() === "tanggal") continue; parsed.push({ date: cols[0] || new Date().toISOString().slice(0, 10), kategori: cols[1] || "", item: cols[2] || "", penghasilan: Number(cols[3]) || 0, pengeluaran: Number(cols[4]) || 0, akun: cols[5] || "Cash", catatan: cols[6] || "", bulan: cols[7] || MONTHS[new Date().getMonth()], tipe: normalizeDebtType(cols[8] || "Pengeluaran") }); } return parsed; };
  const handleCSVImport = () => { const parsed = parseCSV(csvText); if (parsed.length === 0) return; setOcrPreview(parsed); };
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const apiKey = settings.anthropicKey; if (!apiKey) { alert("⚠️ API Key Anthropic belum diisi! Buka Settings → masukkan API key."); return; }
    setOcrLoading(true);
    try {
      const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = () => rej(new Error("Read failed")); r.readAsDataURL(file); });
      const resp = await fetch("/api/ocr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image: base64, mediaType: file.type || "image/jpeg", apiKey }) });
      const data = await resp.json();
      if (data.transactions) setOcrPreview(data.transactions); else if (data.error) alert("OCR Error: " + data.error);
    } catch (err) { alert("Error: " + err.message); } finally { setOcrLoading(false); if (fileRef.current) fileRef.current.value = ""; }
  };
  const confirmPreview = () => { ocrPreview.forEach(t => addTx(t)); setOcrPreview([]); setCsvText(""); setShowOCR(false); };
  
  const handleQuickAddKat = () => {
    const t = newKatName.trim();
    if (!t || lists.kategoriAll.includes(t)) { setShowAddKat(false); setNewKatName(""); return; }
    setSettings({ ...settings, kategoriSpending: [...lists.kategoriSpending, t], budgets: { ...settings.budgets, [t]: 0 } });
    setForm({ ...form, kategori: t });
    setShowAddKat(false);
    setNewKatName("");
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold">📝 Input Data</h2>
          <p className="text-sm text-slate-500">{tx.length} transaksi</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowOCR(!showOCR); setShowForm(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showOCR ? 'bg-pink-500 text-white shadow-lg shadow-pink-900/30' : 'bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20'}`}>
            {showOCR ? "✕ Tutup" : "📷 Scan Struk"}
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowOCR(false); if (editId) cancelEdit(); }}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-pink-900/25 transition-all active:scale-95">
            {showForm && !editId ? "✕ Tutup" : "+ Manual"}
          </button>
        </div>
      </div>

      {/* OCR Section */}
      {showOCR && (
        <Card className="border-purple-500/20">
          <Label className="mb-3">📷 Scan Struk / Import CSV</Label>
          <div className="flex gap-2 mb-4">
            {[{k:"photo",l:"📷 Upload Foto"},{k:"csv",l:"📋 Paste CSV"}].map(b=>(
              <button key={b.k} onClick={()=>setOcrMode(b.k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${ocrMode===b.k ? 'bg-pink-500/12 border-pink-500/30 text-pink-600' : 'bg-transparent border-pink-100 text-slate-500 hover:text-white'}`}>{b.l}</button>
            ))}
          </div>
          {ocrMode === "photo" && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Upload foto struk → Claude OCR → auto-parse ke transaksi</p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} disabled={ocrLoading}
                className={`px-6 py-3 rounded-xl font-bold text-sm text-slate-800 transition-all ${ocrLoading ? 'bg-slate-700 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 shadow-lg shadow-purple-900/25'}`}>
                {ocrLoading ? "⏳ Processing..." : "📷 Ambil Foto / Upload"}
              </button>
            </div>
          )}
          {ocrMode === "csv" && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Format: Tanggal,Kategori,Item,Penghasilan,Pengeluaran,Akun,Catatan,Bulan,Tipe</p>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="2026-03-20,Jajan,Roll Cake,0,198,Cash,Snack,Maret,Pengeluaran" className={`${inpMono} h-28 resize-y text-[11px]`} />
              <button onClick={handleCSVImport} className="mt-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 text-slate-800 rounded-xl font-bold text-sm transition-all hover:from-pink-500 hover:to-pink-400">📋 Parse CSV</button>
            </div>
          )}
          {ocrPreview.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-bold text-pink-600 mb-2">✅ {ocrPreview.length} transaksi ditemukan:</p>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {ocrPreview.map((t,i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm rounded-lg text-[11px]">
                    <span className="w-16 text-slate-500 font-mono shrink-0">{t.date?.slice(5)}</span>
                    <span className="w-16 text-pink-600 font-semibold shrink-0">{t.kategori}</span>
                    <span className="flex-1 truncate">{t.item}</span>
                    <span className={`w-16 text-right font-mono font-semibold shrink-0 ${t.pengeluaran > 0 ? 'text-pink-600' : 'text-emerald-600'}`}>{t.pengeluaran > 0 ? `-${fmt(t.pengeluaran)}` : `+${fmt(t.penghasilan)}`}</span>
                    <button onClick={() => setOcrPreview(prev => prev.filter((_, j) => j !== i))} className="text-pink-600 hover:text-pink-300 text-[10px]">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={confirmPreview} className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 text-slate-800 rounded-xl font-bold text-sm hover:from-pink-500 hover:to-pink-400">✅ Simpan Semua ({ocrPreview.length})</button>
                <button onClick={() => setOcrPreview([])} className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-xl text-xs font-semibold">Batal</button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Manual Form */}
      {showForm && (
        <Card className={editId ? "border-amber-500/30" : "border-pink-500/20"}>
          <Label className={`mb-3 ${editId ? 'text-amber-600' : ''}`}>{editId ? "✏️ Edit Transaksi" : "Transaksi Baru"}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><div className="text-[11px] text-slate-500 mb-1">Tanggal</div><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inp} /></div>
            <div><div className="text-[11px] text-slate-500 mb-1">Tipe</div><select value={form.tipe} onChange={e => setForm({...form, tipe: e.target.value})} className={inp}>{TIPE_LIST.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="relative">
              <div className="text-[11px] text-slate-500 mb-1 flex justify-between items-center">
                <span>Kategori</span>
                <button onClick={() => setShowAddKat(true)} className="text-[10px] text-pink-600 font-bold hover:underline">+ Baru</button>
              </div>
              <select value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})} className={inp}>
                <option value="">— Pilih —</option>
                {lists.kategoriAll.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div><div className="text-[11px] text-slate-500 mb-1">Akun</div><select value={form.akun} onChange={e => setForm({...form, akun: e.target.value})} className={inp}>{lists.akunList.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
            <div><div className="text-[11px] text-slate-500 mb-1">Item</div><input value={form.item} onChange={e => setForm({...form, item: e.target.value})} placeholder="Nama item..." className={inp} /></div>
            <div><div className="text-[11px] text-slate-500 mb-1">Bulan</div><select value={form.bulan} onChange={e => setForm({...form, bulan: e.target.value})} className={inp}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            {form.akun.includes("(Emas)") ? (
              <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-[11px] text-amber-700 font-bold mb-2">🏆 Pencatatan Emas (gram)</div>
                <input type="number" step="0.0001" value={form.gram} onChange={numChange("gram")} className={inpMono + " border-amber-300 bg-white"} placeholder="Contoh: 0.2" />
                <p className="text-[10px] text-amber-600 mt-1">Tipe Pemasukan = beli emas, Pengeluaran = jual emas. Nilai Rp dihitung otomatis.</p>
              </div>
            ) : (<>
              <div><div className="text-[11px] text-slate-500 mb-1">Penghasilan (Rp)</div><input type="number" value={form.penghasilan} onChange={numChange("penghasilan")} className={inpMono} placeholder="0" /></div>
              <div><div className="text-[11px] text-slate-500 mb-1">Pengeluaran (Rp)</div><input type="number" value={form.pengeluaran} onChange={numChange("pengeluaran")} className={inpMono} placeholder="0" /></div>
            </>)}
          </div>
          <div className="mt-3"><div className="text-[11px] text-slate-500 mb-1">Catatan</div><input value={form.catatan} onChange={e => setForm({...form, catatan: e.target.value})} placeholder="Optional..." className={inp} /></div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className={`px-6 py-2.5 rounded-xl font-bold text-sm text-slate-800 transition-all active:scale-95 ${editId ? 'bg-pink-100mber-500 hover:bg-pink-100mber-400' : 'bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 shadow-lg shadow-pink-900/25'}`}>{editId ? "✏️ Update" : "💾 Simpan"}</button>
            {editId && <button onClick={cancelEdit} className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-xl text-xs font-semibold">Batal</button>}
          </div>
        </Card>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: `Semua (${tx.length})` },
          { key: "hutang", label: `Hutang (${tx.filter(t => t.tipe === "Hutang Masuk" || t.tipe === "Bayar Hutang" || t.tipe === "Hutang Catat" || t.kategori === "Hutang").length})` },
          { key: "piutang", label: `Piutang (${tx.filter(t => t.tipe === "Piutang Keluar" || t.tipe === "Piutang Masuk" || t.kategori === "Piutang").length})` },
        ].map(btn => (
          <button key={btn.key} onClick={() => setFilterMode(btn.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${filterMode === btn.key ? 'bg-pink-500/12 border-pink-500/30 text-pink-600' : 'border-pink-100 text-slate-500 hover:text-white'}`}>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="🔍 Cari transaksi..."
        className="w-full bg-white shadow-sm border border-pink-100 rounded-2xl px-5 py-3 text-sm text-slate-800 placeholder-slate-600 outline-none focus:border-pink-500/30 transition-all" />

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <EmptyState icon="📭" title="Belum ada transaksi" sub="Tap tombol + Manual untuk menambahkan" />
      ) : (
        <div className="space-y-0.5">
          {filtered.slice(0, 100).map((t, i) => (
            <div key={t.id || i} onClick={() => startEdit(t)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all group ${editId === t.id ? 'bg-pink-100mber-500/10 border border-amber-500/30' : 'bg-white shadow-sm hover:bg-white shadow-sm shadow-pink-100/50 border border-transparent'}`}>
              <span className="w-[70px] text-slate-500 font-mono shrink-0">{t.date?.slice(5)}</span>
              <span className="w-[70px] text-pink-600 font-semibold text-[11px] shrink-0">{t.kategori}</span>
              <span className="flex-1 truncate">{t.item}</span>
              <span className={`w-[70px] text-right font-mono font-semibold shrink-0 ${t.gram > 0 ? 'text-amber-600' : t.penghasilan > 0 ? 'text-emerald-600' : t.pengeluaran > 0 ? 'text-pink-600' : 'text-slate-600'}`}>
                {t.gram > 0 ? `${Number(t.gram).toFixed(4)}g` : t.penghasilan > 0 ? `+${fmt(t.penghasilan)}` : t.pengeluaran > 0 ? `-${fmt(t.pengeluaran)}` : "—"}
              </span>
              <span className="w-[80px] text-right text-slate-600 text-[10px] shrink-0 hidden sm:block">{normalizeDebtType(t.tipe)}</span>
              <span className="w-[55px] text-right text-slate-600 text-[10px] shrink-0 hidden sm:block">{t.akun}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteTx(t.id); }}
                className="opacity-0 group-hover:opacity-100 text-pink-600 hover:text-pink-300 transition-opacity text-[11px] shrink-0">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add Modal */}
      {showAddKat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-6 border border-pink-100 animate-float">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Tambah Kategori Baru</h3>
            <input autoFocus value={newKatName} onChange={e => setNewKatName(e.target.value)} placeholder="Misal: Tabungan Nikah" className={inp} onKeyDown={e => e.key === "Enter" && handleQuickAddKat()} />
            <div className="flex gap-2 mt-4">
              <button onClick={handleQuickAddKat} className="flex-1 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-900/20">Tambah</button>
              <button onClick={() => { setShowAddKat(false); setNewKatName(""); }} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
