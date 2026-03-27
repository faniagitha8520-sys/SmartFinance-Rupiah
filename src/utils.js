import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ====== MONTHS ======
export const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

// ====== DEFAULTS ======
export const DEFAULT_AKUN_LIST = ["Cash","BCA","BRI","Mandiri","GoPay","OVO","Dana","ShopeePay","Dana Darurat"];
export const DEFAULT_AKUN_VIRTUAL = ["Dana Darurat"];
export const TIPE_LIST = ["Pemasukan","Pengeluaran","Investasi","Tabungan","Zakat/Donasi","Pajak","Transfer Masuk","Transfer Keluar","Hutang Masuk","Bayar Hutang","Piutang Keluar","Piutang Masuk","Alokasi Virtual"];
export const normalizeDebtType = (tipe) => tipe === "Hutang Catat" ? "Bayar Hutang" : tipe;
export const DEFAULT_KATEGORI_SPENDING = ["Tabungan","Rokok","Jajan","Logistik","Transport","Hobi","Komunikasi","Subscription","Admin/Tax","Gadget","Perabot","Pakaian","Kesehatan/Obat","Perawatan Diri","Olahraga/Gym","Makan di Luar","Kendaraan","Pendidikan/Kursus","Hadiah/Oleh-oleh","Ongkos Kirim","Biaya Visa/Dokumen","Wisata/Jalan-jalan","Donasi/Sedekah","Lain-lain"];
export const KATEGORI_SYSTEM = ["Gaji","Saldo Awal","Potongan","Transfer","Hutang","Piutang"];

export const DEFAULT_BUDGETS = {Rokok:500000,Jajan:500000,Logistik:300000,Transport:200000,Hobi:300000,Komunikasi:100000,Subscription:200000,"Admin/Tax":0,Gadget:500000,Perabot:0,Pakaian:300000,"Kesehatan/Obat":0,"Perawatan Diri":200000,"Olahraga/Gym":0,"Makan di Luar":500000,Kendaraan:0,"Pendidikan/Kursus":0,"Hadiah/Oleh-oleh":0,"Ongkos Kirim":100000,"Biaya Visa/Dokumen":0,"Wisata/Jalan-jalan":0,"Donasi/Sedekah":0,"Lain-lain":0};

export const DEFAULT_SETTINGS = {
  budgets: DEFAULT_BUDGETS,
  danaDarurat: { pengeluaranBulanan: 5000000, targetBulan: 6, saldoAwal: 0 },
  potonganRutin: 0,
  anthropicKey: "",
  akunList: DEFAULT_AKUN_LIST,
  akunVirtual: DEFAULT_AKUN_VIRTUAL,
  kategoriSpending: DEFAULT_KATEGORI_SPENDING,
  goldPrice: 1300000,
};

export const INITIAL_TX = [{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal Cash","penghasilan":2000000,"pengeluaran":0,"akun":"Cash","catatan":"Opening balance","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Gaji","item":"Gaji Maret","penghasilan":8500000,"pengeluaran":0,"akun":"BCA","catatan":"Gaji Maret","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Potongan","item":"Kost/Kontrakan","penghasilan":0,"pengeluaran":1500000,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Jajan","item":"Kopi + Snack","penghasilan":0,"pengeluaran":35000,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"}];

// ====== FORMATTERS ======
export const fmt = (n) => n != null ? "Rp " + Math.round(n).toLocaleString("id-ID") : "Rp 0";
export const fmtG = (n) => n != null ? n.toLocaleString("id-ID", { minimumFractionDigits: 4 }) + " g" : "0.0000 g";
export const pct = (n) => n != null ? (n * 100).toFixed(1) + "%" : "0%";
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ====== SUPABASE STORAGE ======
export async function loadData(key, fallback) {
  if (!supabase) {
    try { const v = localStorage.getItem("lz_" + key); return v ? JSON.parse(v) : fallback; } catch(e) { return fallback; }
  }
  try {
    const { data, error } = await supabase.from("laporan").select("value").eq("key", key).single();
    if (error || !data) return fallback;
    return data.value;
  } catch (e) { console.error("Supabase load error:", e); return fallback; }
}
export async function saveData(key, val) {
  if (!supabase) {
    try { localStorage.setItem("lz_" + key, JSON.stringify(val)); } catch(e) {}
    return;
  }
  try { await supabase.from("laporan").upsert({ key, value: val, updated_at: new Date().toISOString() }); }
  catch (e) { console.error("Supabase save error:", e); }
}

// ====== HOOKS ======
export function useDebounce(value, delay = 1000) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

// ====== MIGRATE SETTINGS ======
export function migrateSettings(s) {
  const m = { ...s };
  if (!m.akunList) m.akunList = [...DEFAULT_AKUN_LIST];
  if (!m.akunVirtual) m.akunVirtual = [...DEFAULT_AKUN_VIRTUAL];
  // Remove old virtual accounts
  if (m.akunVirtual && m.akunVirtual.includes("Self Reward")) {
    m.akunVirtual = m.akunVirtual.filter(a => a !== "Self Reward");
  }
  if (m.akunVirtual && m.akunVirtual.includes("Kirim Indonesia")) {
    m.akunVirtual = m.akunVirtual.filter(a => a !== "Kirim Indonesia");
  }
  // Migrate old Yen accounts to Rupiah accounts
  const OLD_TO_NEW = { "Yucho Bank": "BCA", "ICOCA": "BRI", "Everica": "Mandiri", "Wise": "GoPay", "PayPay": "OVO", "Self Reward": "Dana", "Kirim Indonesia": null };
  Object.entries(OLD_TO_NEW).forEach(([oldName, newName]) => {
    const idx = m.akunList.indexOf(oldName);
    if (idx !== -1) {
      if (newName && !m.akunList.includes(newName)) { m.akunList[idx] = newName; }
      else { m.akunList = m.akunList.filter(a => a !== oldName); }
    }
  });
  // Ensure new accounts exist
  DEFAULT_AKUN_LIST.forEach(a => { if (!m.akunList.includes(a)) m.akunList.push(a); });
  // Remove kirimIndo settings
  if (m.kirimIndo) delete m.kirimIndo;
  if (!m.kategoriSpending) m.kategoriSpending = [...DEFAULT_KATEGORI_SPENDING];
  if (m.customCategories && m.customCategories.length > 0) {
    m.customCategories.forEach(c => { if (!m.kategoriSpending.includes(c)) m.kategoriSpending.push(c); });
    delete m.customCategories;
  }
  if (!m.pin) m.pin = "";
  if (m.goldPrice === undefined) m.goldPrice = 1300000;
  return m;
}

// ====== PIN HASH ======
export function hashPin(pin) {
  let h = 0;
  for (let i = 0; i < pin.length; i++) { h = ((h << 5) - h + pin.charCodeAt(i)) | 0; }
  return "pin_" + Math.abs(h).toString(36);
}

// ====== CSV EXPORT ======
export function generateCSV(tx) {
  const headers = ["Tanggal","Kategori","Item","Penghasilan","Pengeluaran","Akun","Catatan","Bulan","Tipe"];
  const rows = tx.map(t => [t.date, t.kategori, `"${t.item}"`, t.penghasilan, t.pengeluaran, t.akun, `"${t.catatan||""}"`, t.bulan, t.tipe].join(","));
  return [headers.join(","), ...rows].join("\n");
}

// ====== TABS CONFIG ======
export const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "analisis", label: "Analisis" },
  { id: "input", label: "Input" },
  { id: "saldo", label: "Saldo" },
  { id: "darurat", label: "Dana Darurat" },
  { id: "hutang", label: "Hutang/Piutang" },
  { id: "rekap", label: "Rekap" },
  { id: "bulanan", label: "Bulanan" },
  { id: "settings", label: "Settings" },
];
