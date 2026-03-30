import { useState, useMemo } from "react";
import { fmt, MONTHS, TIPE_LIST, normalizeDebtType, uid } from "../utils";
import { Card, Label } from "./UI";
import { Trash2, Plus, Pencil, Check, X, AlertTriangle } from "lucide-react";

const cellBase = "px-2 py-1.5 text-xs border border-pink-100/60";
const inp = "w-full bg-white border border-pink-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all";
const inpErr = "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20";

// Validation per-field
function validateRow(row) {
  const errors = {};
  if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) errors.date = "Format: YYYY-MM-DD";
  if (!row.kategori?.trim()) errors.kategori = "Wajib diisi";
  if (!row.item?.trim()) errors.item = "Wajib diisi";
  const peng = Number(row.penghasilan);
  const pengl = Number(row.pengeluaran);
  if (isNaN(peng) || peng < 0) errors.penghasilan = "Angka tidak valid";
  if (isNaN(pengl) || pengl < 0) errors.pengeluaran = "Angka tidak valid";
  if (peng === 0 && pengl === 0) errors.pengeluaran = "Minimal salah satu harus > 0";
  if (!row.bulan || !MONTHS.includes(row.bulan)) errors.bulan = "Bulan tidak valid";
  return errors;
}

function InlineSelect({ value, onChange, options, error }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={`${inp} ${error ? inpErr : ""}`}>
      <option value="">— Pilih —</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function EditableRow({ row, onUpdate, onDelete, onCommitEdit, onCancelEdit, isEditing, onStartEdit, lists, rowErrors }) {
  if (!isEditing) {
    const hasErr = Object.keys(rowErrors).length > 0;
    return (
      <tr className={`group transition-colors ${hasErr ? "bg-red-50/60" : "hover:bg-pink-50/40"}`}>
        <td className={`${cellBase} font-mono text-slate-600 w-[90px]`}>{row.date?.slice(5) || "—"}</td>
        <td className={`${cellBase} text-pink-600 font-semibold w-[80px]`}>{row.kategori || "—"}</td>
        <td className={`${cellBase} max-w-[160px] truncate`}>{row.item || "—"}</td>
        <td className={`${cellBase} font-mono text-right w-[90px] ${row.penghasilan > 0 ? "text-emerald-600" : "text-slate-400"}`}>
          {row.penghasilan > 0 ? `+${fmt(row.penghasilan)}` : "—"}
        </td>
        <td className={`${cellBase} font-mono text-right w-[90px] ${row.pengeluaran > 0 ? "text-pink-600" : "text-slate-400"}`}>
          {row.pengeluaran > 0 ? `-${fmt(row.pengeluaran)}` : "—"}
        </td>
        <td className={`${cellBase} text-slate-600 w-[60px] hidden sm:table-cell`}>{row.akun}</td>
        <td className={`${cellBase} text-slate-600 w-[70px] hidden sm:table-cell`}>{normalizeDebtType(row.tipe)}</td>
        <td className={`${cellBase} w-[70px]`}>
          <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onStartEdit(row._tempId)} className="p-1 rounded hover:bg-pink-100 text-slate-500 hover:text-pink-600 transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(row._tempId)} className="p-1 rounded hover:bg-red-100 text-slate-500 hover:text-red-500 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          {hasErr && (
            <div className="sm:hidden">
              <AlertTriangle className="w-3 h-3 text-red-500 mx-auto" />
            </div>
          )}
        </td>
      </tr>
    );
  }

  // Edit mode
  return (
    <tr className="bg-pink-50/60">
      <td className={cellBase}>
        <input type="date" value={row.date} onChange={e => onUpdate(row._tempId, "date", e.target.value)}
          className={`${inp} ${rowErrors.date ? inpErr : ""}`} />
      </td>
      <td className={cellBase}>
        <InlineSelect value={row.kategori} onChange={v => onUpdate(row._tempId, "kategori", v)}
          options={lists.kategoriAll} error={rowErrors.kategori} />
      </td>
      <td className={cellBase}>
        <input value={row.item} onChange={e => onUpdate(row._tempId, "item", e.target.value)}
          className={`${inp} ${rowErrors.item ? inpErr : ""}`} placeholder="Nama item..." />
      </td>
      <td className={cellBase}>
        <input type="number" value={row.penghasilan} onChange={e => onUpdate(row._tempId, "penghasilan", e.target.value)}
          className={`${inp} text-right font-mono ${rowErrors.penghasilan ? inpErr : ""}`} placeholder="0" />
      </td>
      <td className={cellBase}>
        <input type="number" value={row.pengeluaran} onChange={e => onUpdate(row._tempId, "pengeluaran", e.target.value)}
          className={`${inp} text-right font-mono ${rowErrors.pengeluaran ? inpErr : ""}`} placeholder="0" />
      </td>
      <td className={`${cellBase} hidden sm:table-cell`}>
        <InlineSelect value={row.akun} onChange={v => onUpdate(row._tempId, "akun", v)}
          options={lists.akunList} error={null} />
      </td>
      <td className={`${cellBase} hidden sm:table-cell`}>
        <InlineSelect value={row.tipe} onChange={v => onUpdate(row._tempId, "tipe", v)}
          options={TIPE_LIST} error={null} />
      </td>
      <td className={cellBase}>
        <div className="flex gap-1 justify-center">
          <button onClick={() => onCommitEdit()} className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onCancelEdit()} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TransactionReviewTable({ pending, setPending, onConfirm, onCancel, lists }) {
  const [editingId, setEditingId] = useState(null);
  const [editSnapshot, setEditSnapshot] = useState(null);

  // Validate all rows
  const allErrors = useMemo(() => {
    const map = {};
    pending.forEach(row => { map[row._tempId] = validateRow(row); });
    return map;
  }, [pending]);

  const totalErrors = useMemo(() => {
    return Object.values(allErrors).reduce((sum, errs) => sum + Object.keys(errs).length, 0);
  }, [allErrors]);

  const isValid = totalErrors === 0 && pending.length > 0;

  const totalPemasukan = useMemo(() => pending.reduce((s, r) => s + (Number(r.penghasilan) || 0), 0), [pending]);
  const totalPengeluaran = useMemo(() => pending.reduce((s, r) => s + (Number(r.pengeluaran) || 0), 0), [pending]);

  // Immutable updates
  const updateField = (tempId, field, value) => {
    setPending(prev => prev.map(r => r._tempId === tempId ? { ...r, [field]: value } : r));
  };

  const deleteRow = (tempId) => {
    setPending(prev => prev.filter(r => r._tempId !== tempId));
    if (editingId === tempId) { setEditingId(null); setEditSnapshot(null); }
  };

  const startEdit = (tempId) => {
    setEditSnapshot(pending.find(r => r._tempId === tempId));
    setEditingId(tempId);
  };

  const commitEdit = () => {
    setEditingId(null);
    setEditSnapshot(null);
  };

  const cancelEdit = () => {
    if (editSnapshot) {
      setPending(prev => prev.map(r => r._tempId === editSnapshot._tempId ? editSnapshot : r));
    }
    setEditingId(null);
    setEditSnapshot(null);
  };

  const addEmptyRow = () => {
    const newRow = {
      _tempId: uid(),
      date: new Date().toISOString().slice(0, 10),
      kategori: "",
      item: "",
      penghasilan: 0,
      pengeluaran: 0,
      akun: "Cash",
      catatan: "",
      bulan: MONTHS[new Date().getMonth()],
      tipe: "Pengeluaran",
    };
    setPending(prev => [...prev, newRow]);
    setEditSnapshot(null);
    setEditingId(newRow._tempId);
  };

  const handleConfirm = () => {
    if (!isValid) return;
    // Strip _tempId before sending
    const cleaned = pending.map(({ _tempId, ...rest }) => ({
      ...rest,
      penghasilan: Number(rest.penghasilan) || 0,
      pengeluaran: Number(rest.pengeluaran) || 0,
      gram: Number(rest.gram) || 0,
      tipe: normalizeDebtType(rest.tipe),
    }));
    onConfirm(cleaned);
  };

  return (
    <Card className="border-purple-500/20 overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div>
          <Label>Review & Edit Transaksi</Label>
          <p className="text-sm font-bold text-pink-600">{pending.length} transaksi siap disimpan</p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          {totalErrors > 0 && (
            <span className="flex items-center gap-1 text-red-500 font-semibold bg-red-50 px-2.5 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {totalErrors} error
            </span>
          )}
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-slate-50 rounded-xl border border-pink-100/50">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Total Pemasukan</span>
          <p className="text-sm font-bold font-mono text-emerald-600">+{fmt(totalPemasukan)}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Total Pengeluaran</span>
          <p className="text-sm font-bold font-mono text-pink-600">-{fmt(totalPengeluaran)}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Nett</span>
          <p className={`text-sm font-bold font-mono ${totalPemasukan - totalPengeluaran >= 0 ? "text-emerald-600" : "text-pink-600"}`}>
            {fmt(totalPemasukan - totalPengeluaran)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-pink-200/60">
              {["Tanggal", "Kategori", "Item", "Pemasukan", "Pengeluaran", "Akun", "Tipe", "Aksi"].map((h, i) => (
                <th key={h} className={`px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ${i >= 5 && i < 7 ? "hidden sm:table-cell" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-100/40">
            {pending.map(row => (
              <EditableRow
                key={row._tempId}
                row={row}
                onUpdate={updateField}
                onDelete={deleteRow}
                onCommitEdit={commitEdit}
                onCancelEdit={cancelEdit}
                isEditing={editingId === row._tempId}
                onStartEdit={startEdit}
                lists={lists}
                rowErrors={allErrors[row._tempId] || {}}
              />
            ))}
          </tbody>
        </table>
      </div>

      {pending.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          Tidak ada transaksi. Tambah baris baru atau kembali ke upload.
        </div>
      )}

      {/* Error detail for rows with issues */}
      {totalErrors > 0 && (
        <div className="mt-3 p-3 bg-red-50/60 border border-red-200/50 rounded-xl">
          <p className="text-[11px] font-bold text-red-600 mb-1">Perbaiki error berikut sebelum menyimpan:</p>
          <ul className="text-[10px] text-red-500 space-y-0.5">
            {pending.map((row, i) => {
              const errs = allErrors[row._tempId];
              if (!errs || Object.keys(errs).length === 0) return null;
              return (
                <li key={row._tempId}>
                  <span className="font-semibold">Baris {i + 1}</span> ({row.item || "kosong"}): {Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join(", ")}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-pink-100/50">
        <button onClick={addEmptyRow}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-pink-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-pink-50 hover:border-pink-300 transition-all active:scale-95">
          <Plus className="w-3.5 h-3.5" /> Tambah Baris
        </button>
        <div className="flex-1" />
        <button onClick={onCancel}
          className="px-4 py-2 bg-pink-500/10 border border-pink-500/20 text-pink-600 rounded-xl text-xs font-semibold hover:bg-pink-500/20 transition-all active:scale-95">
          Batal
        </button>
        <button onClick={handleConfirm} disabled={!isValid}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
            isValid
              ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-900/25 hover:from-pink-500 hover:to-pink-400"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}>
          Simpan {pending.length} Transaksi
        </button>
      </div>
    </Card>
  );
}
