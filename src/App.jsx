import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./supabase";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const AKUN_LIST = ["Cash","Yucho Bank","ICOCA","Everica","Wise","PayPay","Self Reward","Dana Darurat","Kirim Indonesia"];
const AKUN_VIRTUAL = ["Self Reward","Dana Darurat","Kirim Indonesia"];
const TIPE_LIST = ["Pemasukan","Pengeluaran","Transfer Masuk","Transfer Keluar","Hutang Masuk","Hutang Catat","Bayar Hutang","Piutang Keluar","Piutang Masuk","Alokasi Virtual"];
const KATEGORI_SPENDING = ["Rokok","Jajan","Logistik","Transport","Hobi","Komunikasi","Subscription","Admin/Tax","Gadget","Perabot","Pakaian","Kesehatan/Obat","Perawatan Diri","Olahraga/Gym","Makan di Luar","Kendaraan","Pendidikan/Kursus","Hadiah/Oleh-oleh","Ongkos Kirim","Biaya Visa/Dokumen","Wisata/Jalan-jalan","Donasi/Sedekah","Lain-lain"];
const KATEGORI_ALL = ["Gaji","Saldo Awal","Potongan","Transfer","Hutang","Piutang",...KATEGORI_SPENDING];

const DEFAULT_BUDGETS = {Rokok:3000,Jajan:3000,Logistik:3000,Transport:1000,Hobi:1000,Komunikasi:0,Subscription:1000,"Admin/Tax":0,Gadget:3000,Perabot:0,Pakaian:0,"Kesehatan/Obat":0,"Perawatan Diri":3000,"Olahraga/Gym":0,"Makan di Luar":1500,Kendaraan:0,"Pendidikan/Kursus":0,"Hadiah/Oleh-oleh":0,"Ongkos Kirim":0,"Biaya Visa/Dokumen":0,"Wisata/Jalan-jalan":0,"Donasi/Sedekah":0,"Lain-lain":0};

const DEFAULT_SETTINGS = {
  budgets: DEFAULT_BUDGETS,
  danaDarurat: { pengeluaranBulanan: 71179, targetBulan: 3, saldoAwal: 0 },
  kirimIndo: { kursJPYIDR: 106, kursTarget: 110, targetKirimIDR: 4000000 },
  potonganRutin: 51500,
  anthropicKey: "",
};

const INITIAL_TX = [{"date":"2025-12-01","kategori":"Hutang","item":"Hutang Apartemen 清家会","penghasilan":155669,"pengeluaran":0,"akun":"Cash","catatan":"清家会","bulan":"Maret","tipe":"Hutang Masuk"},{"date":"2026-02-05","kategori":"Hutang","item":"Bayar Cicilan 清家会","penghasilan":0,"pengeluaran":10000,"akun":"Cash","catatan":"清家会","bulan":"Februari","tipe":"Hutang Catat"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal Everica","penghasilan":380,"pengeluaran":0,"akun":"Everica","catatan":"Opening balance awal periode","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal PayPay","penghasilan":220,"pengeluaran":0,"akun":"PayPay","catatan":"Opening balance awal periode","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal Yucho Bank","penghasilan":27366,"pengeluaran":0,"akun":"Yucho Bank","catatan":"Opening balance awal periode","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Gaji","item":"給与　福）清恵会","penghasilan":187313,"pengeluaran":0,"akun":"Yucho Bank","catatan":"Gaji Maret","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal Wise","penghasilan":1111,"pengeluaran":0,"akun":"Wise","catatan":"Opening balance awal periode","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal ICOCA","penghasilan":800,"pengeluaran":0,"akun":"ICOCA","catatan":"Opening balance awal periode","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal Cash","penghasilan":7505,"pengeluaran":0,"akun":"Cash","catatan":"Opening balance awal periode","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Potongan","item":"Uang Listrik","penghasilan":0,"pengeluaran":10000,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Potongan","item":"Uang Share Makan","penghasilan":0,"pengeluaran":10000,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Potongan","item":"Uang Apartemen","penghasilan":0,"pengeluaran":31500,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Jajan","item":"軽ファミリア @バニラチョ","penghasilan":0,"pengeluaran":658,"akun":"Cash","catatan":"Snack Familia","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Jajan","item":"軽★5つに切ったロールケーキ","penghasilan":0,"pengeluaran":99,"akun":"Cash","catatan":"Roll Cake","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Logistik","item":"軽フルグラ","penghasilan":0,"pengeluaran":658,"akun":"Cash","catatan":"Granola","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Logistik","item":"低脂肪乳","penghasilan":0,"pengeluaran":199,"akun":"Cash","catatan":"Susu Rendah Lemak","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Jajan","item":"SPアップル","penghasilan":0,"pengeluaran":219,"akun":"Cash","catatan":"Apel","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Saldo Awal","item":"Saldo Awal Self Reward","penghasilan":3415,"pengeluaran":0,"akun":"Self Reward","catatan":"","bulan":"Maret","tipe":"Pemasukan"},{"date":"2026-03-05","kategori":"Transfer","item":"Transfer Dana Self Reward","penghasilan":0,"pengeluaran":10000,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Transfer Keluar"},{"date":"2026-03-05","kategori":"Transfer","item":"Transfer Dana Self Reward","penghasilan":10000,"pengeluaran":0,"akun":"Self Reward","catatan":"","bulan":"Maret","tipe":"Transfer Masuk"},{"date":"2026-03-05","kategori":"Hutang","item":"Bayar Cicilan 清家会","penghasilan":0,"pengeluaran":10000,"akun":"Cash","catatan":"清家会","bulan":"Maret","tipe":"Bayar Hutang"},{"date":"2026-03-06","kategori":"Transport","item":"Bus Hiroshima","penghasilan":0,"pengeluaran":440,"akun":"ICOCA","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-06","kategori":"Pakaian","item":"EXW ヒートテックコットンタイツ","penghasilan":0,"pengeluaran":790,"akun":"Self Reward","catatan":"Celana Thermal (Sale)","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-06","kategori":"Pakaian","item":"エアリズムコットンクルーネックT","penghasilan":0,"pengeluaran":990,"akun":"Self Reward","catatan":"Kaos Airism (Sale)","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-08","kategori":"Transfer","item":"Tarik Tunai","penghasilan":0,"pengeluaran":82000,"akun":"Yucho Bank","catatan":"","bulan":"Maret","tipe":"Transfer Keluar"},{"date":"2026-03-08","kategori":"Transfer","item":"Tarik Tunai","penghasilan":82000,"pengeluaran":0,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Transfer Masuk"},{"date":"2026-03-08","kategori":"Pakaian","item":"Portable Coin","penghasilan":0,"pengeluaran":303,"akun":"Wise","catatan":"Shein 3 biji","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Transfer","item":"Transfer ke Sri Wahyuni","penghasilan":0,"pengeluaran":10000,"akun":"Yucho Bank","catatan":"Di mintain tolong noni","bulan":"Maret","tipe":"Transfer Keluar"},{"date":"2026-03-09","kategori":"Transfer","item":"Cash dari Sri Wahyuni","penghasilan":10000,"pengeluaran":0,"akun":"Cash","catatan":"Sri Wahyuni","bulan":"Maret","tipe":"Transfer Masuk"},{"date":"2026-03-09","kategori":"Hobi","item":"ジテンシャパ フホーン","penghasilan":0,"pengeluaran":110,"akun":"Self Reward","catatan":"Aksesori Sepeda","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Perawatan Diri","item":"スキンアクアSPME","penghasilan":0,"pengeluaran":692,"akun":"Self Reward","catatan":"Sunscreen","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Perawatan Diri","item":"ハニーヘアオイル","penghasilan":0,"pengeluaran":1540,"akun":"Self Reward","catatan":"Hair Oil","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Makan di Luar","item":"きつねうどん(並)","penghasilan":0,"pengeluaran":640,"akun":"Self Reward","catatan":"Udon Kitsune","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Makan di Luar","item":"ちくわ天","penghasilan":0,"pengeluaran":170,"akun":"Self Reward","catatan":"Tempura Chikuwa","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Makan di Luar","item":"かしわ天","penghasilan":0,"pengeluaran":220,"akun":"Self Reward","catatan":"Tempura Ayam","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Makan di Luar","item":"えび天","penghasilan":0,"pengeluaran":200,"akun":"Self Reward","catatan":"Tempura Udang","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Gadget","item":"SALONIA Straight Hair Iron","penghasilan":0,"pengeluaran":2958,"akun":"Self Reward","catatan":"Amazon - Catok Rambut","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-09","kategori":"Transfer","item":"Deposit ke Yucho","penghasilan":10000,"pengeluaran":0,"akun":"Yucho Bank","catatan":"Deposit balik dari Sri","bulan":"Maret","tipe":"Transfer Masuk"},{"date":"2026-03-09","kategori":"Transfer","item":"Deposit ke Yucho","penghasilan":0,"pengeluaran":10000,"akun":"Cash","catatan":"Deposit balik dari Sri","bulan":"Maret","tipe":"Transfer Keluar"},{"date":"2026-03-10","kategori":"Subscription","item":"YouTube Premium","penghasilan":0,"pengeluaran":290,"akun":"Wise","catatan":"YouTube Premium","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-12","kategori":"Logistik","item":"軽フルグラ (Granola)","penghasilan":0,"pengeluaran":658,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-12","kategori":"Jajan","item":"軽フルーツフェスタアップル (Apel Festa)","penghasilan":0,"pengeluaran":198,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-12","kategori":"Jajan","item":"軽草原のまごころ","penghasilan":0,"pengeluaran":188,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-12","kategori":"Jajan","item":"軽十勝バターチョコスティック (Choco Stick)","penghasilan":0,"pengeluaran":218,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-12","kategori":"Jajan","item":"軽★5つに切ったロールケーキ バニラ (Roll Cake Vanilla)","penghasilan":0,"pengeluaran":395,"akun":"Cash","catatan":"5コ diskon 20%","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-12","kategori":"Piutang","item":"Titipan Teman","penghasilan":0,"pengeluaran":629,"akun":"Cash","catatan":"Yoga","bulan":"Maret","tipe":"Piutang Keluar"},{"date":"2026-03-13","kategori":"Piutang","item":"Hutang Tambahan Yoga","penghasilan":0,"pengeluaran":450,"akun":"Cash","catatan":"Yoga","bulan":"Maret","tipe":"Piutang Keluar"},{"date":"2026-03-13","kategori":"Piutang","item":"Pelunasan Hutang Yoga","penghasilan":1000,"pengeluaran":0,"akun":"Cash","catatan":"Yoga","bulan":"Maret","tipe":"Piutang Masuk"},{"date":"2026-03-13","kategori":"Piutang","item":"Ikhlas Yoga","penghasilan":79,"pengeluaran":0,"akun":"Cash","catatan":"Yoga","bulan":"Maret","tipe":"Piutang Masuk"},{"date":"2026-03-13","kategori":"Rokok","item":"Camel","penghasilan":0,"pengeluaran":450,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-14","kategori":"Piutang","item":"Hutang noni","penghasilan":0,"pengeluaran":1000,"akun":"Cash","catatan":"Noni","bulan":"Maret","tipe":"Piutang Keluar"},{"date":"2026-03-14","kategori":"Jajan","item":"SPアップル","penghasilan":0,"pengeluaran":0,"akun":"Cash","catatan":"Diskon 20% dari ¥219","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-16","kategori":"Piutang","item":"Pelunasan Hutang Noni","penghasilan":1000,"pengeluaran":0,"akun":"Cash","catatan":"Noni","bulan":"Maret","tipe":"Piutang Masuk"},{"date":"2026-03-16","kategori":"Piutang","item":"Hutang Noni","penghasilan":0,"pengeluaran":50,"akun":"Cash","catatan":"Noni","bulan":"Maret","tipe":"Piutang Keluar"},{"date":"2026-03-19","kategori":"Logistik","item":"SPグレープ","penghasilan":0,"pengeluaran":189,"akun":"Cash","catatan":"Anggur SP (diskon 20%)","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Jajan","item":"軽フルーツフェスタアップル","penghasilan":0,"pengeluaran":168,"akun":"Cash","catatan":"Apel Festa","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Jajan","item":"軽草原のまごころ","penghasilan":0,"pengeluaran":188,"akun":"Cash","catatan":"Susu","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Jajan","item":"軽★5つに切ったロールケーキ(バニラ)","penghasilan":0,"pengeluaran":198,"akun":"Cash","catatan":"Roll Cake Vanilla","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Piutang","item":"Ikhlas Yoga","penghasilan":0,"pengeluaran":20,"akun":"Cash","catatan":"Yoga","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Rokok","item":"JTキャメル・クラフトM・ペアー5","penghasilan":0,"pengeluaran":450,"akun":"Cash","catatan":"Lawson 広島本通","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Transfer","item":"Top Up ICOCA","penghasilan":0,"pengeluaran":1000,"akun":"Cash","catatan":"","bulan":"Maret","tipe":"Transfer Keluar"},{"date":"2026-03-20","kategori":"Transfer","item":"Top Up ICOCA","penghasilan":1000,"pengeluaran":0,"akun":"ICOCA","catatan":"","bulan":"Maret","tipe":"Transfer Masuk"},{"date":"2026-03-20","kategori":"Transport","item":"Bus Hiroshima","penghasilan":0,"pengeluaran":200,"akun":"ICOCA","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Transport","item":"Bus Hiroshima","penghasilan":0,"pengeluaran":220,"akun":"ICOCA","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-20","kategori":"Transport","item":"Bus Hiroshima","penghasilan":0,"pengeluaran":220,"akun":"ICOCA","catatan":"","bulan":"Maret","tipe":"Pengeluaran"},{"date":"2026-03-05","kategori":"Transfer","item":"Alokasi Dana Darurat","penghasilan":30000,"pengeluaran":0,"akun":"Dana Darurat","catatan":"Earmark dari Yucho","bulan":"Maret","tipe":"Alokasi Virtual"},{"date":"2026-03-05","kategori":"Transfer","item":"Alokasi Kirim Indonesia","penghasilan":100000,"pengeluaran":0,"akun":"Kirim Indonesia","catatan":"Earmark dari Yucho","bulan":"Maret","tipe":"Alokasi Virtual"}];

const fmt = (n) => n != null ? "¥" + Math.round(n).toLocaleString("ja-JP") : "¥0";
const pct = (n) => n != null ? (n * 100).toFixed(1) + "%" : "0%";
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ====== SUPABASE STORAGE ======
async function loadData(key, fallback) {
  try {
    const { data, error } = await supabase
      .from("laporan")
      .select("value")
      .eq("key", key)
      .single();
    if (error || !data) return fallback;
    return data.value;
  } catch (e) {
    console.error("Supabase load error:", e);
    return fallback;
  }
}

async function saveData(key, val) {
  try {
    await supabase
      .from("laporan")
      .upsert({ key, value: val, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error("Supabase save error:", e);
  }
}

// Debounce helper — prevent spamming Firestore on every keystroke
function useDebounce(value, delay = 1000) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Bar({ value, max, color = "#22d3ee" }) {
  const p = max > 0 ? Math.min(value / max, 1.5) : 0;
  const over = p > 1;
  return (
    <div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(p, 1) * 100}%`, height: "100%", borderRadius: 4, background: over ? "#ef4444" : color, transition: "width 0.5s ease" }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { "✅": "#22c55e", "⚠️": "#eab308", "🔴": "#ef4444", "🟡": "#eab308", "🟢": "#22c55e", "—": "#64748b" };
  const c = Object.entries(colors).find(([k]) => status?.includes(k))?.[1] || "#64748b";
  return <span style={{ color: c, fontSize: 12, fontWeight: 600 }}>{status}</span>;
}

const TABS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "analisis", icon: "📈", label: "Analisis" },
  { id: "input", icon: "📥", label: "Input" },
  { id: "saldo", icon: "💰", label: "Saldo" },
  { id: "darurat", icon: "🛡️", label: "Dana Darurat" },
  { id: "kirim", icon: "💸", label: "Kirim Indo" },
  { id: "hutang", icon: "💳", label: "Hutang/Piutang" },
  { id: "rekap", icon: "📋", label: "Rekap" },
  { id: "bulanan", icon: "📅", label: "Bulanan" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function App() {
  const [tx, setTx] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selMonth, setSelMonth] = useState("Maret");

  // Load from Firestore on mount
  useEffect(() => {
    (async () => {
      const [storedTx, storedSettings] = await Promise.all([
        loadData("transactions", null),
        loadData("settings", null),
      ]);
      setTx(storedTx || INITIAL_TX.map(t => ({ ...t, id: uid() })));
      setSettings(storedSettings || DEFAULT_SETTINGS);
      setLoading(false);
    })();
  }, []);

  // Debounced save to Firestore
  const debouncedTx = useDebounce(tx);
  const debouncedSettings = useDebounce(settings);

  useEffect(() => {
    if (!loading && debouncedTx.length > 0) {
      setSaving(true);
      saveData("transactions", debouncedTx).then(() => setSaving(false));
    }
  }, [debouncedTx, loading]);

  useEffect(() => {
    if (!loading) {
      saveData("settings", debouncedSettings);
    }
  }, [debouncedSettings, loading]);

  // ====== COMPUTED DATA ======
  const computed = useMemo(() => {
    const byMonth = {};
    MONTHS.forEach(m => { byMonth[m] = tx.filter(t => t.bulan === m); });

    // === SALDO PER AKUN ===
    // Key rules from Excel:
    // - Hutang Masuk does NOT inflate saldo (it's debt, not real income)
    // - Hutang Catat does NOT reduce saldo (it's record-keeping only)
    // - Alokasi Virtual adds to virtual account but does NOT leave Yucho
    // - Saldo Akhir = all real flows (transfers included)
    // - Display masuk/keluar = only real income/expenses (no transfers, no saldo awal, no hutang, no piutang)
    const saldo = {};
    const EXCLUDED_FROM_SALDO = ["Hutang Masuk", "Hutang Catat"];
    AKUN_LIST.forEach(a => {
      const akunTx = tx.filter(t => t.akun === a);
      // Saldo akhir: all flows EXCEPT hutang masuk/catat
      const allMasuk = akunTx.filter(t => !EXCLUDED_FROM_SALDO.includes(t.tipe)).reduce((s, t) => s + (t.penghasilan || 0), 0);
      const allKeluar = akunTx.filter(t => !EXCLUDED_FROM_SALDO.includes(t.tipe)).reduce((s, t) => s + (t.pengeluaran || 0), 0);
      // Display: only Gaji for masuk, only real spending for keluar
      const masukDisplay = akunTx.filter(t => t.tipe === "Pemasukan" && t.kategori === "Gaji").reduce((s, t) => s + (t.penghasilan || 0), 0);
      const keluarDisplay = akunTx.filter(t => (t.tipe === "Pengeluaran" || t.tipe === "Bayar Hutang")).reduce((s, t) => s + (t.pengeluaran || 0), 0);
      const saldoAwal = akunTx.filter(t => t.kategori === "Saldo Awal").reduce((s, t) => s + (t.penghasilan || 0), 0);
      saldo[a] = { masuk: masukDisplay, keluar: keluarDisplay, saldoAwal, saldoAkhir: allMasuk - allKeluar };
    });
    // Total aset = only real bank accounts (not virtual — virtual is earmark inside Yucho)
    const AKUN_REAL = ["Cash","Yucho Bank","ICOCA","Everica","Wise","PayPay"];
    const totalAsetReal = AKUN_REAL.reduce((s, a) => s + Math.max(saldo[a].saldoAkhir, 0), 0);
    const totalAsetVirtual = AKUN_VIRTUAL.reduce((s, a) => s + Math.max(saldo[a].saldoAkhir, 0), 0);
    const totalAset = totalAsetReal;

    // === DASHBOARD TOP CARDS ===
    const totalPemasukan = tx.filter(t => t.tipe === "Pemasukan" && t.kategori === "Gaji").reduce((s, t) => s + t.penghasilan, 0);
    // Potongan Rutin = Potongan + Bayar Hutang (per user request)
    const totalPotongan = tx.filter(t => t.kategori === "Potongan" || t.tipe === "Bayar Hutang").reduce((s, t) => s + t.pengeluaran, 0);
    // Pengeluaran Real = spending yang bukan potongan, bukan transfer, bukan hutang/piutang
    const totalPengeluaranReal = tx.filter(t => t.tipe === "Pengeluaran" && t.kategori !== "Potongan" && !["Saldo Awal","Transfer","Hutang","Piutang"].includes(t.kategori)).reduce((s, t) => s + t.pengeluaran, 0);
    // Net Saving = Pemasukan - Pengeluaran Real (match Excel: ¥172,177)
    const netSaving = totalPemasukan - totalPengeluaranReal;

    // === PER-MONTH STATS ===
    const monthStats = {};
    MONTHS.forEach(m => {
      const mTx = byMonth[m];
      const pemasukan = mTx.filter(t => t.tipe === "Pemasukan" && t.kategori === "Gaji").reduce((s, t) => s + t.penghasilan, 0);
      // Pengeluaran per bulan = Potongan + Bayar Hutang + daily spending
      const pengeluaran = mTx.filter(t => t.tipe === "Pengeluaran" || t.tipe === "Bayar Hutang").reduce((s, t) => s + t.pengeluaran, 0);
      const net = pemasukan - pengeluaran;
      const savingRate = pemasukan > 0 ? net / pemasukan : 0;
      monthStats[m] = { pemasukan, pengeluaran, net, savingRate, txCount: mTx.length };
    });

    // === BUDGET PER KATEGORI PER BULAN ===
    const budgetData = {};
    MONTHS.forEach(m => {
      budgetData[m] = {};
      KATEGORI_SPENDING.forEach(k => {
        const spent = byMonth[m].filter(t => t.kategori === k && t.tipe === "Pengeluaran").reduce((s, t) => s + t.pengeluaran, 0);
        const budget = settings.budgets[k] || 0;
        const pctUsed = budget > 0 ? spent / budget : (spent > 0 ? 999 : 0);
        let status = "—";
        if (budget === 0 && spent === 0) status = "—";
        else if (pctUsed <= 0.7) status = "✅ Aman";
        else if (pctUsed <= 1) status = "⚠️ Hampir";
        else status = "🔴 Over";
        budgetData[m][k] = { spent, budget, pctUsed, status };
      });
    });

    // === HUTANG ===
    const hutangMasuk = tx.filter(t => t.tipe === "Hutang Masuk");
    const bayarHutang = tx.filter(t => t.tipe === "Bayar Hutang" || t.tipe === "Hutang Catat");
    const totalHutang = hutangMasuk.reduce((s, t) => s + t.penghasilan, 0);
    const totalBayar = bayarHutang.reduce((s, t) => s + t.pengeluaran, 0);
    const sisaHutang = totalHutang - totalBayar;

    // === PIUTANG ===
    const piutangKeluar = tx.filter(t => t.tipe === "Piutang Keluar");
    const piutangMasuk = tx.filter(t => t.tipe === "Piutang Masuk");
    const totalPiutangOut = piutangKeluar.reduce((s, t) => s + t.pengeluaran, 0);
    const totalPiutangIn = piutangMasuk.reduce((s, t) => s + t.penghasilan, 0);
    const sisaPiutang = totalPiutangOut - totalPiutangIn;

    // === HEALTH SCORE ===
    const savingRate = totalPemasukan > 0 ? (totalPemasukan - totalPotongan - totalPengeluaranReal) / totalPemasukan : 0;
    const savingScore = savingRate >= 0.3 ? 30 : Math.round(savingRate / 0.3 * 30);
    const totalBudgetCats = KATEGORI_SPENDING.filter(k => settings.budgets[k] > 0).length;
    const overBudgetCats = MONTHS.reduce((s, m) => s + KATEGORI_SPENDING.filter(k => budgetData[m][k].pctUsed > 1).length, 0);
    const budgetScore = totalBudgetCats > 0 ? Math.round((1 - overBudgetCats / (totalBudgetCats * 12)) * 25) : 15;
    const ddTarget = settings.danaDarurat.pengeluaranBulanan * settings.danaDarurat.targetBulan;
    const ddCurrent = Math.max(saldo["Dana Darurat"]?.saldoAkhir || 0, 0);
    const ddProgress = ddTarget > 0 ? ddCurrent / ddTarget : 0;
    const ddScore = Math.min(Math.round(ddProgress * 20), 20);
    const hutangRatio = totalPemasukan > 0 ? sisaHutang / totalPemasukan : 0;
    const hutangScore = sisaHutang <= 0 ? 15 : Math.max(Math.round((1 - hutangRatio) * 15), 2);
    const activeAkun = AKUN_LIST.filter(a => saldo[a].saldoAkhir > 0).length;
    const diversScore = Math.min(Math.round(activeAkun / 7 * 10), 10);
    const healthScore = savingScore + budgetScore + ddScore + hutangScore + diversScore;
    const healthLabel = healthScore >= 80 ? "🟢 SEHAT" : healthScore >= 60 ? "🟡 CUKUP" : "🔴 PERLU PERBAIKAN";

    // === SPENDING ANALYSIS ===
    const spendingByKat = {};
    KATEGORI_SPENDING.forEach(k => {
      spendingByKat[k] = tx.filter(t => t.kategori === k && t.tipe === "Pengeluaran").reduce((s, t) => s + t.pengeluaran, 0);
    });
    const topSpending = Object.entries(spendingByKat).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0).slice(0, 5);
    const avgMonthlySpend = totalPotongan + totalPengeluaranReal;
    const burnRate = avgMonthlySpend > 0 ? totalAset / avgMonthlySpend : 99;

    // === VIRTUAL ALLOCATION (for Yucho sub-display) ===
    const yuchoFree = Math.max((saldo["Yucho Bank"]?.saldoAkhir || 0) - totalAsetVirtual, 0);

    return {
      saldo, totalAset, totalAsetReal, totalAsetVirtual, yuchoFree,
      totalPemasukan, totalPotongan, totalPengeluaranReal, netSaving,
      monthStats, budgetData, byMonth,
      totalHutang, totalBayar, sisaHutang, hutangMasuk, bayarHutang,
      totalPiutangOut, totalPiutangIn, sisaPiutang, piutangKeluar, piutangMasuk,
      healthScore, healthLabel, savingRate, savingScore, budgetScore, ddScore, hutangScore, diversScore,
      ddTarget, ddCurrent, ddProgress,
      topSpending, burnRate, spendingByKat, activeAkun,
    };
  }, [tx, settings]);

  const addTx = useCallback((newTx) => { setTx(prev => [...prev, { ...newTx, id: uid() }]); }, []);
  const updateTx = useCallback((id, updated) => { setTx(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t)); }, []);
  const deleteTx = useCallback((id) => { setTx(prev => prev.filter(t => t.id !== id)); }, []);
  const resetData = useCallback(() => {
    setTx(INITIAL_TX.map(t => ({ ...t, id: uid() })));
    setSettings(DEFAULT_SETTINGS);
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 16, animation: "pulse 1.5s infinite" }}>💴</div>
        <div style={{ fontSize: 14, opacity: 0.6 }}>Connecting to Supabase...</div>
      </div>
    </div>
  );

  const S = {
    bg: "#0a0a0f", card: "#12121a", cardAlt: "#181824", border: "#1e1e2e",
    text: "#e2e8f0", textDim: "#94a3b8", textMuted: "#475569",
    accent: "#22d3ee", accentGreen: "#22c55e", accentRed: "#ef4444", accentYellow: "#eab308", accentPurple: "#a78bfa",
    font: "'DM Sans', system-ui, sans-serif",
  };

  const cardStyle = { background: S.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${S.border}` };
  const labelStyle = { fontSize: 11, color: S.textDim, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4 };
  const bigNum = { fontSize: 24, fontWeight: 700, color: S.text, fontFamily: "'DM Mono', monospace" };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <DashboardView S={S} c={computed} settings={settings} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "analisis": return <AnalisisView S={S} c={computed} settings={settings} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "input": return <InputView S={S} tx={tx} addTx={addTx} updateTx={updateTx} deleteTx={deleteTx} settings={settings} cardStyle={cardStyle} labelStyle={labelStyle} />;
      case "saldo": return <SaldoView S={S} c={computed} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "darurat": return <DanaView S={S} c={computed} settings={settings} setSettings={setSettings} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "kirim": return <KirimView S={S} c={computed} settings={settings} setSettings={setSettings} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "hutang": return <HutangView S={S} c={computed} tx={tx} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "rekap": return <RekapView S={S} c={computed} cardStyle={cardStyle} labelStyle={labelStyle} />;
      case "bulanan": return <BulananView S={S} c={computed} tx={tx} settings={settings} selMonth={selMonth} setSelMonth={setSelMonth} cardStyle={cardStyle} labelStyle={labelStyle} bigNum={bigNum} />;
      case "settings": return <SettingsView S={S} settings={settings} setSettings={setSettings} resetData={resetData} cardStyle={cardStyle} labelStyle={labelStyle} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, color: S.text, fontFamily: S.font }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>💴</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: S.accent }}>Laporan Zharizal</span>
            <span style={{ fontSize: 11, color: S.textMuted, marginLeft: 4 }}>v.WEB</span>
          </div>
          {saving && <span style={{ fontSize: 11, color: S.accentYellow, animation: "pulse 1s infinite" }}>💾 Saving...</span>}
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", overflowX: "auto", display: "flex", gap: 2, padding: "0 12px 8px", scrollbarWidth: "none" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? "rgba(34,211,238,0.12)" : "transparent",
                border: tab === t.id ? "1px solid rgba(34,211,238,0.3)" : "1px solid transparent",
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: tab === t.id ? S.accent : S.textDim,
                fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: S.font,
                transition: "all 0.2s",
              }}>
              <span style={{ marginRight: 4 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px 80px" }}>
        {renderContent()}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}

// ==================== DASHBOARD ====================
function DashboardView({ S, c, cardStyle, labelStyle, bigNum }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>📊 Financial Dashboard</div>
      <div style={{ fontSize: 12, color: S.textDim }}>Semua angka auto-update dari data transaksi</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { label: "📈 Total Pemasukan", val: fmt(c.totalPemasukan), color: S.accentGreen },
          { label: "🔒 Potongan Rutin", val: fmt(c.totalPotongan), color: S.accentYellow },
          { label: "💸 Pengeluaran Real", val: fmt(c.totalPengeluaranReal), color: S.accentRed },
          { label: "💵 Net Saving", val: fmt(c.netSaving), color: c.netSaving >= 0 ? S.accentGreen : S.accentRed },
        ].map((item, i) => (
          <div key={i} style={cardStyle}>
            <div style={labelStyle}>{item.label}</div>
            <div style={{ ...bigNum, color: item.color, fontSize: 20 }}>{item.val}</div>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>💰 SALDO PER AKUN</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {["Cash","Yucho Bank","ICOCA","Everica","Wise","PayPay"].map(a => {
            const s = c.saldo[a]; const pctTotal = c.totalAset > 0 ? s.saldoAkhir / c.totalAset : 0;
            return (
              <div key={a} style={{ background: S.cardAlt, borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: S.accent, marginBottom: 4 }}>🏦 {a}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(s.saldoAkhir)}</div>
                <div style={{ fontSize: 10, color: S.textMuted, marginTop: 4 }}>{pct(pctTotal)} of total</div>
                <Bar value={pctTotal} max={1} color={S.accent} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10 }}>
                  <span style={{ color: "#22c55e" }}>▲ {fmt(s.masuk)}</span><span style={{ color: "#ef4444" }}>▼ {fmt(s.keluar)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Virtual Allocations from Yucho */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>📌 ALOKASI VIRTUAL — Earmark dari Yucho Bank</div>
        <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 12 }}>Dana fisik di Yucho, tapi dicatat terpisah. Sisa free: {fmt(c.yuchoFree)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {AKUN_VIRTUAL.map(a => {
            const s = c.saldo[a];
            const labels = { "Self Reward": "🎁", "Dana Darurat": "🛡️", "Kirim Indonesia": "💸" };
            return (
              <div key={a} style={{ background: S.cardAlt, borderRadius: 8, padding: 12, borderLeft: `3px solid #a78bfa` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>{labels[a] || "🏷️"} {a}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(s.saldoAkhir)}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10 }}>
                  <span style={{ color: "#22c55e" }}>▲ {fmt(s.masuk || s.saldoAkhir + (s.keluar || 0))}</span><span style={{ color: "#ef4444" }}>▼ {fmt(s.keluar)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>📈 QUICK INSIGHTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            { label: "🏥 Health Score", val: c.healthScore, sub: c.healthLabel, color: c.healthScore >= 80 ? S.accentGreen : c.healthScore >= 60 ? S.accentYellow : S.accentRed },
            { label: "📈 Saving Rate", val: pct(c.savingRate), sub: c.savingRate >= 0.3 ? "✅ Target 30% tercapai" : "⚠️ Below target", color: c.savingRate >= 0.3 ? S.accentGreen : S.accentYellow },
            { label: "🔥 Burn Rate", val: Math.round(c.burnRate), sub: "bulan tersisa", color: S.text },
            { label: "🏆 Top Spending", val: c.topSpending[0]?.[0] || "—", sub: c.topSpending[0] ? fmt(c.topSpending[0][1]) : "—", color: S.accentRed, smallVal: true },
          ].map((item, i) => (
            <div key={i} style={{ background: S.cardAlt, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: S.textDim }}>{item.label}</div>
              <div style={{ fontSize: item.smallVal ? 16 : 28, fontWeight: 700, color: item.color }}>{item.val}</div>
              <div style={{ fontSize: 11, color: S.textDim }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ANALISIS ====================
function AnalisisView({ S, c, cardStyle, labelStyle }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>📈 Analisis Keuangan</div>
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>🏥 FINANCIAL HEALTH SCORE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `conic-gradient(${c.healthScore >= 80 ? "#22c55e" : c.healthScore >= 60 ? "#eab308" : "#ef4444"} ${c.healthScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#12121a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>{c.healthScore}</div>
          </div>
          <div><div style={{ fontSize: 16, fontWeight: 700 }}>{c.healthLabel}</div><div style={{ fontSize: 12, color: S.textDim }}>dari 100 poin</div></div>
        </div>
        {[
          { label: "Saving Rate", score: c.savingScore, max: 30, detail: pct(c.savingRate), note: c.savingScore >= 30 ? "✅ MAX" : "" },
          { label: "Disiplin Budget", score: c.budgetScore, max: 25, note: c.budgetScore >= 25 ? "✅ MAX" : "" },
          { label: "Dana Darurat", score: c.ddScore, max: 20, detail: pct(c.ddProgress), note: c.ddScore >= 20 ? "✅ Penuh" : "🔴 Belum" },
          { label: "Manajemen Hutang", score: c.hutangScore, max: 15, note: c.hutangScore >= 15 ? "✅ Lunas" : "🔴 Ada hutang" },
          { label: "Diversifikasi Akun", score: c.diversScore, max: 10, detail: `${c.activeAkun}/7 akun` },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: S.cardAlt, borderRadius: 8, marginBottom: 4 }}>
            <div style={{ flex: "0 0 140px", fontSize: 12, fontWeight: 600 }}>{item.label}</div>
            <div style={{ flex: 1 }}><Bar value={item.score} max={item.max} color={item.score / item.max >= 0.7 ? "#22c55e" : item.score / item.max >= 0.4 ? "#eab308" : "#ef4444"} /></div>
            <div style={{ flex: "0 0 50px", textAlign: "right", fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{item.score}/{item.max}</div>
            <div style={{ flex: "0 0 90px", textAlign: "right", fontSize: 11, color: S.textDim }}>{item.note || item.detail || ""}</div>
          </div>
        ))}
      </div>
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>📊 MONTH-OVER-MONTH</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead><tr>{["", ...MONTHS.map(m => m.slice(0,3))].map((h, i) => <th key={i} style={{ padding: "6px 8px", textAlign: i === 0 ? "left" : "right", color: S.textDim, fontWeight: 600, borderBottom: `1px solid ${S.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                { label: "💰 Pemasukan", key: "pemasukan", color: S.accentGreen },
                { label: "💸 Pengeluaran", key: "pengeluaran", color: S.accentRed },
                { label: "📊 Net", key: "net" },
                { label: "📈 Saving Rate", key: "savingRate", isPct: true },
              ].map((row, ri) => (
                <tr key={ri}>
                  <td style={{ padding: "6px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{row.label}</td>
                  {MONTHS.map((m, mi) => {
                    const v = c.monthStats[m][row.key];
                    return <td key={mi} style={{ padding: "6px 8px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: v === 0 ? S.textMuted : row.color || (row.key === "net" ? (v >= 0 ? S.accentGreen : S.accentRed) : S.text) }}>{row.isPct ? (v === 0 ? "—" : pct(v)) : (v === 0 ? "—" : fmt(v))}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>🔥 SPENDING HEATMAP</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr><th style={{ padding: "4px 8px", textAlign: "left", color: S.textDim }}>Kategori</th>{MONTHS.map(m => <th key={m} style={{ padding: "4px 6px", textAlign: "right", color: S.textDim }}>{m.slice(0,3)}</th>)}<th style={{ padding: "4px 8px", textAlign: "right", color: S.textDim }}>Total</th></tr></thead>
            <tbody>
              {KATEGORI_SPENDING.filter(k => c.spendingByKat[k] > 0).map(k => (
                <tr key={k}>
                  <td style={{ padding: "4px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>{k}</td>
                  {MONTHS.map(m => {
                    const v = c.budgetData[m][k].spent; const p = c.budgetData[m][k].pctUsed;
                    return <td key={m} style={{ padding: "4px 6px", textAlign: "right", fontFamily: "'DM Mono', monospace", background: v === 0 ? "transparent" : p > 1 ? "rgba(239,68,68,0.2)" : p > 0.8 ? "rgba(234,179,8,0.15)" : "rgba(34,211,238,0.1)", color: v === 0 ? S.textMuted : S.text }}>{v === 0 ? "—" : fmt(v)}</td>;
                  })}
                  <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{fmt(c.spendingByKat[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== INPUT DATA ====================
function InputView({ S, tx, addTx, updateTx, deleteTx, settings, cardStyle, labelStyle }) {
  const empty = { date: new Date().toISOString().slice(0, 10), kategori: "", item: "", penghasilan: 0, pengeluaran: 0, akun: "Cash", catatan: "", bulan: MONTHS[new Date().getMonth()], tipe: "Pengeluaran" };
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showOCR, setShowOCR] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrPreview, setOcrPreview] = useState([]);
  const [csvText, setCsvText] = useState("");
  const [ocrMode, setOcrMode] = useState("photo"); // "photo" | "csv"
  const fileRef = useRef(null);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase();
    return [...(f ? tx.filter(t => t.item.toLowerCase().includes(f) || t.kategori.toLowerCase().includes(f) || t.catatan.toLowerCase().includes(f)) : tx)].reverse();
  }, [tx, filter]);

  const handleSubmit = () => {
    if (!form.item || !form.kategori) return;
    if (editId) {
      updateTx(editId, form);
      setEditId(null);
    } else {
      addTx(form);
    }
    setForm(empty);
    setShowForm(false);
  };
  const startEdit = (t) => {
    setForm({ date: t.date, kategori: t.kategori, item: t.item, penghasilan: t.penghasilan, pengeluaran: t.pengeluaran, akun: t.akun, catatan: t.catatan, bulan: t.bulan, tipe: t.tipe });
    setEditId(t.id);
    setShowForm(true);
    setShowOCR(false);
  };
  const cancelEdit = () => { setEditId(null); setForm(empty); setShowForm(false); };

  // CSV paste parser
  const parseCSV = (text) => {
    const lines = text.trim().split("\n").filter(l => l.trim());
    const parsed = [];
    for (const line of lines) {
      const cols = line.split(",").map(c => c.trim());
      if (cols.length < 5 || cols[0].toLowerCase() === "tanggal") continue;
      parsed.push({
        date: cols[0] || new Date().toISOString().slice(0, 10),
        kategori: cols[1] || "",
        item: cols[2] || "",
        penghasilan: Number(cols[3]) || 0,
        pengeluaran: Number(cols[4]) || 0,
        akun: cols[5] || "Cash",
        catatan: cols[6] || "",
        bulan: cols[7] || MONTHS[new Date().getMonth()],
        tipe: cols[8] || "Pengeluaran",
      });
    }
    return parsed;
  };

  const handleCSVImport = () => {
    const parsed = parseCSV(csvText);
    if (parsed.length === 0) return;
    setOcrPreview(parsed);
  };

  // OCR photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const apiKey = settings.anthropicKey;
    if (!apiKey) { alert("⚠️ API Key Anthropic belum diisi! Buka Settings → masukkan API key."); return; }

    setOcrLoading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("Read failed"));
        r.readAsDataURL(file);
      });
      const mediaType = file.type || "image/jpeg";

      const resp = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType, apiKey }),
      });
      const data = await resp.json();

      if (data.transactions) {
        setOcrPreview(data.transactions);
      } else if (data.error) {
        alert("OCR Error: " + data.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setOcrLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const confirmPreview = () => {
    ocrPreview.forEach(t => addTx(t));
    setOcrPreview([]);
    setCsvText("");
    setShowOCR(false);
  };

  const inp = { background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", width: "100%" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div><div style={{ fontSize: 20, fontWeight: 700 }}>📥 Input Data</div><div style={{ fontSize: 12, color: S.textDim }}>{tx.length} transaksi</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowOCR(!showOCR); setShowForm(false); }} style={{ background: showOCR ? "#ef4444" : "#a78bfa", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{showOCR ? "✕ Tutup" : "📷 Scan Struk"}</button>
          <button onClick={() => { setShowForm(!showForm); setShowOCR(false); if (editId) cancelEdit(); }} style={{ background: S.accent, color: "#000", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{showForm && !editId ? "✕ Tutup" : "+ Manual"}</button>
        </div>
      </div>

      {/* OCR / CSV IMPORT */}
      {showOCR && (
        <div style={{ ...cardStyle, border: "1px solid rgba(167,139,250,0.3)" }}>
          <div style={{ ...labelStyle, marginBottom: 12 }}>📷 SCAN STRUK / IMPORT CSV</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setOcrMode("photo")} style={{ background: ocrMode === "photo" ? "rgba(167,139,250,0.2)" : "transparent", border: ocrMode === "photo" ? "1px solid rgba(167,139,250,0.4)" : `1px solid ${S.border}`, borderRadius: 8, padding: "6px 14px", color: ocrMode === "photo" ? "#a78bfa" : S.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📷 Upload Foto</button>
            <button onClick={() => setOcrMode("csv")} style={{ background: ocrMode === "csv" ? "rgba(34,211,238,0.2)" : "transparent", border: ocrMode === "csv" ? "1px solid rgba(34,211,238,0.4)" : `1px solid ${S.border}`, borderRadius: 8, padding: "6px 14px", color: ocrMode === "csv" ? S.accent : S.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📋 Paste CSV</button>
          </div>

          {ocrMode === "photo" && (
            <div>
              <div style={{ fontSize: 12, color: S.textDim, marginBottom: 8 }}>Upload foto struk → Claude OCR → auto-parse ke transaksi</div>
              <div style={{ fontSize: 11, color: S.textMuted, marginBottom: 12 }}>⚠️ Butuh API key Anthropic di Settings. Biaya ~¥1-2 per struk.</div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: "none" }} />
              <button onClick={() => fileRef.current?.click()} disabled={ocrLoading} style={{ background: ocrLoading ? S.border : "#a78bfa", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: ocrLoading ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                {ocrLoading ? "⏳ Processing..." : "📷 Ambil Foto / Upload"}
              </button>
            </div>
          )}

          {ocrMode === "csv" && (
            <div>
              <div style={{ fontSize: 12, color: S.textDim, marginBottom: 8 }}>Paste CSV dari Claude chat. Format: Tanggal,Kategori,Item,Penghasilan,Pengeluaran,Akun,Catatan,Bulan,Tipe</div>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder={"2026-03-20,Jajan,Roll Cake,0,198,Cash,Snack,Maret,Pengeluaran\n2026-03-20,Transport,Bus,0,220,ICOCA,,Maret,Pengeluaran"} style={{ ...inp, height: 120, resize: "vertical", fontFamily: "'DM Mono', monospace", fontSize: 11 }} />
              <button onClick={handleCSVImport} style={{ marginTop: 8, background: S.accent, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📋 Parse CSV</button>
            </div>
          )}

          {/* Preview parsed transactions */}
          {ocrPreview.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>✅ {ocrPreview.length} transaksi ditemukan — review sebelum simpan:</div>
              <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                {ocrPreview.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: S.cardAlt, borderRadius: 6, fontSize: 11 }}>
                    <span style={{ flex: "0 0 70px", color: S.textDim, fontFamily: "'DM Mono', monospace" }}>{t.date?.slice(5)}</span>
                    <span style={{ flex: "0 0 70px", color: S.accent, fontWeight: 600 }}>{t.kategori}</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.item}</span>
                    <span style={{ flex: "0 0 65px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: t.pengeluaran > 0 ? S.accentRed : S.accentGreen }}>{t.pengeluaran > 0 ? `-${fmt(t.pengeluaran)}` : `+${fmt(t.penghasilan)}`}</span>
                    <span style={{ flex: "0 0 50px", textAlign: "right", color: S.textMuted, fontSize: 10 }}>{t.akun}</span>
                    <button onClick={() => setOcrPreview(prev => prev.filter((_, j) => j !== i))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 4, color: "#ef4444", cursor: "pointer", padding: "2px 5px", fontSize: 10 }}>✕</button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={confirmPreview} style={{ background: "#22c55e", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✅ Simpan Semua ({ocrPreview.length})</button>
                <button onClick={() => setOcrPreview([])} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 16px", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Batal</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL INPUT */}
      {showForm && (
        <div style={{ ...cardStyle, border: editId ? "1px solid rgba(234,179,8,0.4)" : "1px solid rgba(34,211,238,0.3)" }}>
          <div style={{ ...labelStyle, marginBottom: 12, color: editId ? "#eab308" : S.textDim }}>{editId ? "✏️ EDIT TRANSAKSI" : "TRANSAKSI BARU"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Tanggal</div><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inp} /></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Tipe</div><select value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })} style={{ ...inp, cursor: "pointer" }}>{TIPE_LIST.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Kategori</div><select value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} style={{ ...inp, cursor: "pointer" }}><option value="">— Pilih —</option>{KATEGORI_ALL.map(k => <option key={k} value={k}>{k}</option>)}</select></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Akun</div><select value={form.akun} onChange={e => setForm({ ...form, akun: e.target.value })} style={{ ...inp, cursor: "pointer" }}>{AKUN_LIST.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Item</div><input value={form.item} onChange={e => setForm({ ...form, item: e.target.value })} placeholder="Nama item..." style={inp} /></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Bulan</div><select value={form.bulan} onChange={e => setForm({ ...form, bulan: e.target.value })} style={{ ...inp, cursor: "pointer" }}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Penghasilan (¥)</div><input type="number" value={form.penghasilan || ""} onChange={e => setForm({ ...form, penghasilan: Number(e.target.value) || 0 })} style={inp} placeholder="0" /></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Pengeluaran (¥)</div><input type="number" value={form.pengeluaran || ""} onChange={e => setForm({ ...form, pengeluaran: Number(e.target.value) || 0 })} style={inp} placeholder="0" /></div>
            <div><div style={{ fontSize: 11, color: S.textDim, marginBottom: 4 }}>Catatan</div><input value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} placeholder="Optional..." style={inp} /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleSubmit} style={{ background: editId ? "#eab308" : S.accent, color: "#000", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{editId ? "✏️ Update" : "💾 Simpan"}</button>
            {editId && <button onClick={cancelEdit} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 16px", color: "#ef4444", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Batal</button>}
          </div>
        </div>
      )}

      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="🔍 Cari transaksi..." style={{ ...cardStyle, fontSize: 13, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.slice(0, 100).map((t, i) => (
          <div key={t.id || i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: editId === t.id ? "rgba(234,179,8,0.08)" : i % 2 === 0 ? S.card : S.cardAlt, borderRadius: 8, fontSize: 12, border: editId === t.id ? "1px solid rgba(234,179,8,0.3)" : "1px solid transparent", cursor: "pointer", transition: "all 0.15s" }} onClick={() => startEdit(t)}>
            <div style={{ flex: "0 0 78px", color: S.textDim, fontFamily: "'DM Mono', monospace" }}>{t.date?.slice(5)}</div>
            <div style={{ flex: "0 0 80px", fontWeight: 600, color: S.accent, fontSize: 11 }}>{t.kategori}</div>
            <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.item}</div>
            <div style={{ flex: "0 0 70px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: t.penghasilan > 0 ? S.accentGreen : S.accentRed, fontWeight: 600 }}>{t.penghasilan > 0 ? `+${fmt(t.penghasilan)}` : t.pengeluaran > 0 ? `-${fmt(t.pengeluaran)}` : "—"}</div>
            <div style={{ flex: "0 0 60px", fontSize: 10, color: S.textMuted, textAlign: "right" }}>{t.akun}</div>
            <button onClick={(e) => { e.stopPropagation(); deleteTx(t.id); }} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 4, color: "#ef4444", cursor: "pointer", padding: "2px 6px", fontSize: 11 }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}


// ==================== SALDO ====================
function SaldoView({ S, c, cardStyle, labelStyle, bigNum }) {
  const REAL = ["Cash","Yucho Bank","ICOCA","Everica","Wise","PayPay"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>💰 Saldo Per Akun</div>
      <div style={cardStyle}><div style={labelStyle}>TOTAL ASET (Real)</div><div style={{ ...bigNum, fontSize: 28, color: S.accent }}>{fmt(c.totalAset)}</div></div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:8}}>🏦 AKUN BANK</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Akun","Pemasukan","Pengeluaran","Saldo Akhir","% Total","Status"].map((h, i) => <th key={i} style={{ padding: "8px 10px", textAlign: i === 0 ? "left" : "right", color: S.textDim, fontWeight: 600, borderBottom: `1px solid ${S.border}`, fontSize: 11 }}>{h}</th>)}</tr></thead>
          <tbody>{REAL.map(a => { const s = c.saldo[a]; const pctVal = c.totalAset > 0 ? Math.max(s.saldoAkhir,0) / c.totalAset : 0; return (
            <tr key={a} style={{ borderBottom: `1px solid ${S.border}` }}>
              <td style={{ padding: "8px 10px", fontWeight: 600 }}>🏦 {a}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: S.accentGreen }}>{fmt(s.masuk)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: S.accentRed }}>{fmt(s.keluar)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmt(s.saldoAkhir)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 11 }}>{pct(pctVal)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}><StatusBadge status={s.saldoAkhir > 0 ? "🟢 Aktif" : s.saldoAkhir === 0 ? "— Kosong" : "🔴 Minus"} /></td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:4}}>📌 ALOKASI VIRTUAL (Earmark dari Yucho)</div>
        <div style={{fontSize:11,color:S.textMuted,marginBottom:8}}>Dana fisik tetap di Yucho — dicatat terpisah untuk tracking. Free balance: {fmt(c.yuchoFree)}</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr>{["Akun","Alokasi","Terpakai","Saldo","Status"].map((h, i) => <th key={i} style={{ padding: "8px 10px", textAlign: i === 0 ? "left" : "right", color: S.textDim, fontWeight: 600, borderBottom: `1px solid ${S.border}`, fontSize: 11 }}>{h}</th>)}</tr></thead>
          <tbody>{AKUN_VIRTUAL.map(a => { const s = c.saldo[a]; const alloc = s.saldoAkhir + (s.keluar||0); return (
            <tr key={a} style={{ borderBottom: `1px solid ${S.border}` }}>
              <td style={{ padding: "8px 10px", fontWeight: 600, color: "#a78bfa" }}>🏷️ {a}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: S.accentGreen }}>{fmt(alloc)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: S.accentRed }}>{fmt(s.keluar)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmt(s.saldoAkhir)}</td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}><StatusBadge status={s.saldoAkhir > 0 ? "🟢 Aktif" : "— Kosong"} /></td>
            </tr>
          ); })}</tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== DANA DARURAT ====================
function DanaView({ S, c, settings, setSettings, cardStyle, labelStyle, bigNum }) {
  const dd = settings.danaDarurat; const target = dd.pengeluaranBulanan * dd.targetBulan; const current = Math.max(c.saldo["Dana Darurat"]?.saldoAkhir || 0, 0);
  const progress = target > 0 ? current / target : 0; const remaining = target - current;
  const upd = (k, v) => setSettings({ ...settings, danaDarurat: { ...dd, [k]: Number(v) || 0 } });
  const inp = { background: "#1a1a2e", border: "1px solid #2a2a3e", borderRadius: 8, padding: "8px 12px", color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", width: 120, textAlign: "right" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>🛡️ Dana Darurat Tracker</div>
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: 12 }}>⚙️ ASUMSI</div>
        {[{l:"Pengeluaran Bulanan (¥)",k:"pengeluaranBulanan",v:dd.pengeluaranBulanan},{l:"Target Bulan",k:"targetBulan",v:dd.targetBulan}].map(i=>(
          <div key={i.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"}}><span style={{fontSize:13}}>{i.l}</span><input type="number" value={i.v} onChange={e=>upd(i.k,e.target.value)} style={inp}/></div>
        ))}
      </div>
      <div style={cardStyle}>
        <div style={labelStyle}>PROGRESS</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{...bigNum,color:S.accent}}>{fmt(current)}</span><span style={{fontSize:14,color:S.textMuted}}>/ {fmt(target)}</span></div>
        <div style={{margin:"12px 0"}}><Bar value={progress} max={1} color={progress>=1?S.accentGreen:S.accent}/></div>
        <div style={{fontSize:13,color:S.textDim}}>{pct(progress)} — {remaining>0?`sisa ${fmt(remaining)}`:"✅ TARGET TERCAPAI!"}</div>
      </div>
    </div>
  );
}

// ==================== KIRIM INDO ====================
function KirimView({ S, c, settings, setSettings, cardStyle, labelStyle, bigNum }) {
  const ki = settings.kirimIndo; const hold = Math.max(c.saldo["Kirim Indonesia"]?.saldoAkhir||0,0); const holdIDR = hold*ki.kursJPYIDR; const kursOK = ki.kursJPYIDR>=ki.kursTarget;
  const upd = (k,v) => setSettings({...settings,kirimIndo:{...ki,[k]:Number(v)||0}});
  const inp = {background:"#1a1a2e",border:"1px solid #2a2a3e",borderRadius:8,padding:"8px 12px",color:"#e2e8f0",fontSize:13,fontFamily:"'DM Mono', monospace",outline:"none",width:140,textAlign:"right"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:20,fontWeight:700}}>💸 Kirim Indonesia</div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>⚙️ KURS & TARGET</div>
        {[{l:"💴 Kurs JPY→IDR",k:"kursJPYIDR",v:ki.kursJPYIDR},{l:"🎯 Kurs Target",k:"kursTarget",v:ki.kursTarget},{l:"💰 Target/bln (IDR)",k:"targetKirimIDR",v:ki.targetKirimIDR}].map(i=>(
          <div key={i.k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"}}><span style={{fontSize:13}}>{i.l}</span><input type="number" value={i.v} onChange={e=>upd(i.k,e.target.value)} style={inp}/></div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={cardStyle}><div style={labelStyle}>Hold (JPY)</div><div style={{...bigNum,color:S.accentPurple}}>{fmt(hold)}</div><div style={{fontSize:11,color:S.textDim}}>≈ Rp{Math.round(holdIDR).toLocaleString("id-ID")}</div></div>
        <div style={cardStyle}><div style={labelStyle}>Status Kurs</div><div style={{fontSize:18,fontWeight:700,color:kursOK?S.accentGreen:S.accentYellow}}>{kursOK?"✅ KIRIM!":"⏳ Tunggu"}</div></div>
      </div>
    </div>
  );
}

// ==================== HUTANG/PIUTANG ====================
function HutangView({ S, c, tx, cardStyle, labelStyle }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:20,fontWeight:700}}>💳 Hutang & Piutang</div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>💳 HUTANG</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          <div><div style={{fontSize:11,color:S.textDim}}>Total</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{fmt(c.totalHutang)}</div></div>
          <div><div style={{fontSize:11,color:S.textDim}}>Dibayar</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'DM Mono', monospace",color:S.accentGreen}}>{fmt(c.totalBayar)}</div></div>
          <div><div style={{fontSize:11,color:S.textDim}}>Sisa</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'DM Mono', monospace",color:S.accentRed}}>{fmt(c.sisaHutang)}</div></div>
        </div>
        <Bar value={c.totalBayar} max={c.totalHutang} color={S.accentGreen}/>
      </div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>💳 PIUTANG</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          <div><div style={{fontSize:11,color:S.textDim}}>Keluar</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'DM Mono', monospace"}}>{fmt(c.totalPiutangOut)}</div></div>
          <div><div style={{fontSize:11,color:S.textDim}}>Balik</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'DM Mono', monospace",color:S.accentGreen}}>{fmt(c.totalPiutangIn)}</div></div>
          <div><div style={{fontSize:11,color:S.textDim}}>Outstanding</div><div style={{fontSize:18,fontWeight:700,fontFamily:"'DM Mono', monospace",color:S.accentYellow}}>{fmt(c.sisaPiutang)}</div></div>
        </div>
        {tx.filter(t=>t.tipe==="Piutang Keluar"||t.tipe==="Piutang Masuk").reverse().map((t,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${S.border}`,fontSize:12}}>
            <span style={{color:t.tipe==="Piutang Masuk"?S.accentGreen:S.text}}>{t.date} — {t.item} ({t.catatan})</span>
            <span style={{fontFamily:"'DM Mono', monospace",fontWeight:600,color:t.tipe==="Piutang Masuk"?S.accentGreen:S.accentRed}}>{t.tipe==="Piutang Masuk"?`+${fmt(t.penghasilan)}`:`-${fmt(t.pengeluaran)}`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== REKAP ====================
function RekapView({ S, c, cardStyle, labelStyle }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:20,fontWeight:700}}>📋 Rekap Periode</div>
      <div style={cardStyle}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>{["Periode","Pemasukan","Pengeluaran","Net","Saving Rate","Tx","Status"].map((h,i)=><th key={i} style={{padding:"8px 10px",textAlign:i===0?"left":"right",color:S.textDim,fontWeight:600,borderBottom:`1px solid ${S.border}`,fontSize:11}}>{h}</th>)}</tr></thead>
          <tbody>{MONTHS.map(m=>{const s=c.monthStats[m];const has=s.txCount>0;const hasReal=s.pemasukan>0||s.pengeluaran>0;return(
            <tr key={m} style={{borderBottom:`1px solid ${S.border}`,opacity:hasReal?1:has?0.5:0.4}}>
              <td style={{padding:"8px 10px",fontWeight:600}}>{m}</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono', monospace",color:S.accentGreen}}>{hasReal?fmt(s.pemasukan):"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono', monospace",color:S.accentRed}}>{hasReal?fmt(s.pengeluaran):"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontFamily:"'DM Mono', monospace",fontWeight:700,color:s.net>=0?S.accentGreen:S.accentRed}}>{hasReal?fmt(s.net):"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right"}}>{has&&s.pemasukan>0?pct(s.savingRate):"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right"}}>{s.txCount||"—"}</td>
              <td style={{padding:"8px 10px",textAlign:"right"}}><StatusBadge status={!has||s.pemasukan===0?"—":s.net>=0?"✅ Surplus":"🔴 Defisit"}/></td>
            </tr>
          );})}</tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== BULANAN ====================
function BulananView({ S, c, tx, settings, selMonth, setSelMonth, cardStyle, labelStyle, bigNum }) {
  const ms = c.monthStats[selMonth]; const mTx = c.byMonth[selMonth]||[];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:20,fontWeight:700}}>📅 {selMonth}</div>
        <select value={selMonth} onChange={e=>setSelMonth(e.target.value)} style={{background:S.card,border:`1px solid ${S.border}`,borderRadius:8,padding:"6px 12px",color:S.text,fontSize:13,cursor:"pointer"}}>{MONTHS.map(m=><option key={m} value={m}>{m}</option>)}</select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12}}>
        {[{l:"Pemasukan",v:fmt(ms.pemasukan),c:S.accentGreen},{l:"Pengeluaran",v:fmt(ms.pengeluaran),c:S.accentRed},{l:"Net",v:fmt(ms.net),c:ms.net>=0?S.accentGreen:S.accentRed},{l:"Transaksi",v:ms.txCount,c:S.accent}].map((x,i)=>(
          <div key={i} style={cardStyle}><div style={labelStyle}>{x.l}</div><div style={{fontSize:18,fontWeight:700,color:x.c,fontFamily:"'DM Mono', monospace"}}>{x.v}</div></div>
        ))}
      </div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>💰 BUDGET — {selMonth.toUpperCase()}</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr>{["Kategori","Budget","Realisasi","Selisih","% Pakai","Status"].map((h,i)=><th key={i} style={{padding:"6px 8px",textAlign:i===0?"left":"right",color:S.textDim,fontWeight:600,borderBottom:`1px solid ${S.border}`,fontSize:11}}>{h}</th>)}</tr></thead>
          <tbody>{KATEGORI_SPENDING.map(k=>{const bd=c.budgetData[selMonth][k];if(bd.budget===0&&bd.spent===0)return null;const sel=bd.budget-bd.spent;return(
            <tr key={k} style={{borderBottom:`1px solid ${S.border}`}}>
              <td style={{padding:"6px 8px",fontWeight:600}}>{k}</td>
              <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"'DM Mono', monospace"}}>{fmt(bd.budget)}</td>
              <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"'DM Mono', monospace"}}>{fmt(bd.spent)}</td>
              <td style={{padding:"6px 8px",textAlign:"right",fontFamily:"'DM Mono', monospace",color:sel>=0?S.accentGreen:S.accentRed}}>{fmt(sel)}</td>
              <td style={{padding:"6px 8px",textAlign:"right"}}><div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}><div style={{width:50}}><Bar value={bd.pctUsed} max={1} color={bd.pctUsed>1?"#ef4444":bd.pctUsed>0.8?"#eab308":"#22c55e"}/></div><span style={{fontFamily:"'DM Mono', monospace",width:40}}>{pct(bd.pctUsed)}</span></div></td>
              <td style={{padding:"6px 8px",textAlign:"right"}}><StatusBadge status={bd.status}/></td>
            </tr>
          );})}</tbody>
        </table>
      </div>
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>📋 TRANSAKSI — {selMonth.toUpperCase()}</div>
        {mTx.length===0?<div style={{color:S.textMuted,fontSize:12}}>Belum ada transaksi</div>:
          [...mTx].sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",background:i%2===0?"transparent":S.cardAlt,borderRadius:4,fontSize:11}}>
              <span style={{flex:"0 0 68px",color:S.textDim,fontFamily:"'DM Mono', monospace"}}>{t.date?.slice(5)}</span>
              <span style={{flex:"0 0 70px",color:S.accent,fontWeight:600,fontSize:10}}>{t.kategori}</span>
              <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.item}</span>
              <span style={{flex:"0 0 70px",textAlign:"right",fontFamily:"'DM Mono', monospace",fontWeight:600,color:t.penghasilan>0?S.accentGreen:t.pengeluaran>0?S.accentRed:S.textMuted}}>{t.penghasilan>0?`+${fmt(t.penghasilan)}`:t.pengeluaran>0?`-${fmt(t.pengeluaran)}`:"—"}</span>
              <span style={{flex:"0 0 55px",textAlign:"right",color:S.textMuted,fontSize:10}}>{t.akun}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsView({ S, settings, setSettings, resetData, cardStyle, labelStyle }) {
  const [newCat, setNewCat] = useState("");
  const [newAkunName, setNewAkunName] = useState("");
  const [editAkun, setEditAkun] = useState(null);
  const [editAkunVal, setEditAkunVal] = useState("");
  const upd = (k,v) => setSettings({...settings,budgets:{...settings.budgets,[k]:Number(v)||0}});
  const inp = {background:"#1a1a2e",border:"1px solid #2a2a3e",borderRadius:6,padding:"6px 10px",color:"#e2e8f0",fontSize:12,fontFamily:"'DM Mono', monospace",outline:"none",width:80,textAlign:"right"};
  const inpWide = {...inp,width:"100%",textAlign:"left",fontFamily:"'DM Sans', sans-serif"};

  const addCategory = () => {
    const cat = newCat.trim();
    if (!cat || settings.budgets[cat] !== undefined) return;
    setSettings({...settings, budgets:{...settings.budgets, [cat]: 0}, customCategories: [...(settings.customCategories||[]), cat]});
    setNewCat("");
  };
  const removeCategory = (cat) => {
    if (!confirm(`Hapus kategori "${cat}"?`)) return;
    const b = {...settings.budgets}; delete b[cat];
    setSettings({...settings, budgets: b, customCategories: (settings.customCategories||[]).filter(c=>c!==cat)});
  };

  const allCategories = [...KATEGORI_SPENDING, ...(settings.customCategories||[]).filter(c=>!KATEGORI_SPENDING.includes(c))];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:20,fontWeight:700}}>⚙️ Settings</div>

      {/* Budget per kategori */}
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>BUDGET PER KATEGORI (¥/bulan)</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:6}}>
          {allCategories.map(k=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:S.cardAlt,borderRadius:6,gap:6}}>
              <span style={{fontSize:12,flex:1}}>{k}</span>
              <input type="number" value={settings.budgets[k]||0} onChange={e=>upd(k,e.target.value)} style={inp}/>
              {(settings.customCategories||[]).includes(k) && <button onClick={()=>removeCategory(k)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:11,padding:"2px 4px"}}>✕</button>}
            </div>
          ))}
        </div>
        {/* Add new category */}
        <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center"}}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Kategori baru..." style={{...inpWide,width:200}} onKeyDown={e=>e.key==="Enter"&&addCategory()} />
          <button onClick={addCategory} style={{background:"rgba(34,211,238,0.15)",border:"1px solid rgba(34,211,238,0.3)",borderRadius:6,padding:"6px 14px",color:S.accent,fontWeight:600,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>+ Tambah Kategori</button>
        </div>
      </div>

      {/* Potongan Rutin */}
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>🔒 POTONGAN RUTIN</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13}}>Total Potongan Rutin (¥/bulan)</span>
          <input type="number" value={settings.potonganRutin} onChange={e=>setSettings({...settings,potonganRutin:Number(e.target.value)||0})} style={{...inp,width:120}} />
        </div>
      </div>

      {/* Rename akun */}
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>🏦 NAMA AKUN</div>
        <div style={{fontSize:11,color:S.textMuted,marginBottom:8}}>Klik nama akun untuk rename. Perubahan berlaku di semua transaksi.</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:6}}>
          {AKUN_LIST.map(a=>(
            <div key={a} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:S.cardAlt,borderRadius:6}}>
              <span style={{fontSize:10,color:AKUN_VIRTUAL.includes(a)?"#a78bfa":S.accent}}>{AKUN_VIRTUAL.includes(a)?"🏷️":"🏦"}</span>
              <span style={{fontSize:12,fontWeight:600}}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OCR Key */}
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12}}>🔑 OCR — ANTHROPIC API KEY</div>
        <div style={{fontSize:12,color:S.textDim,marginBottom:8}}>Untuk fitur Scan Struk (opsional)</div>
        <input type="password" value={settings.anthropicKey||""} onChange={e=>setSettings({...settings,anthropicKey:e.target.value})} placeholder="sk-ant-..." style={{...inp,width:"100%"}} />
      </div>

      {/* Danger Zone */}
      <div style={cardStyle}>
        <div style={{...labelStyle,marginBottom:12,color:"#ef4444"}}>⚠️ DANGER ZONE</div>
        <button onClick={()=>{if(confirm("Reset semua data ke original? Semua transaksi & settings akan kembali ke default."))resetData();}} style={{background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"10px 20px",color:"#ef4444",fontWeight:700,fontSize:13,cursor:"pointer"}}>🔄 Reset Data</button>
      </div>
    </div>
  );
}
