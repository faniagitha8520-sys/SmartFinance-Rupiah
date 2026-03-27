import { useState, useEffect, useMemo, useCallback } from "react";
import { MONTHS, DEFAULT_AKUN_LIST, DEFAULT_AKUN_VIRTUAL, DEFAULT_KATEGORI_SPENDING, KATEGORI_SYSTEM, DEFAULT_SETTINGS, INITIAL_TX, TABS, fmt, pct, uid, loadData, saveData, useDebounce, migrateSettings, normalizeDebtType, generateCSV } from "./utils";
import PinScreen from "./components/PinScreen";
import DashboardView from "./components/DashboardView";
import AnalisisView from "./components/AnalisisView";
import InputView from "./components/InputView";
import SaldoView from "./components/SaldoView";
import DanaView from "./components/DanaView";
import HutangView from "./components/HutangView";
import RekapView from "./components/RekapView";
import BulananView from "./components/BulananView";
import SettingsView from "./components/SettingsView";
import MonthlyChart from "./components/Charts";
import { LayoutDashboard, BarChart3, PenLine, Wallet, Shield, Handshake, ClipboardList, Calendar, Settings, Download, Plus } from "lucide-react";

const TAB_ICONS = { dashboard: LayoutDashboard, analisis: BarChart3, input: PenLine, saldo: Wallet, darurat: Shield, hutang: Handshake, rekap: ClipboardList, bulanan: Calendar, settings: Settings };

export default function App() {
  const [tx, setTx] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selMonth, setSelMonth] = useState("Maret");
  const [unlocked, setUnlocked] = useState(false);
  const [tabKey, setTabKey] = useState(0);

  const switchTab = (newTab) => { setTab(newTab); setTabKey(k => k + 1); };

  useEffect(() => {
    const AKUN_MIGRATE = { "Yucho Bank": "BCA", "ICOCA": "BRI", "Everica": "Mandiri", "Wise": "GoPay", "PayPay": "OVO", "Self Reward": "Dana" };
    const migrateTx = (txList) => txList.map(t => ({ ...t, akun: AKUN_MIGRATE[t.akun] || t.akun, id: t.id || uid() }));
    (async () => {
      const [storedTx, storedSettings] = await Promise.all([loadData("transactions", null), loadData("settings", null)]);
      setTx(migrateTx(storedTx?.length > 0 ? storedTx : INITIAL_TX.map(t => ({ ...t, id: uid() }))));
      const migrated = migrateSettings(storedSettings || DEFAULT_SETTINGS);
      setSettings(migrated);
      try { if (!migrated.pin || sessionStorage.getItem("lz_unlocked") === "1") setUnlocked(true); } catch(e) { if (!migrated.pin) setUnlocked(true); }
      setLoading(false);
    })();
  }, []);

  const debouncedTx = useDebounce(tx);
  const debouncedSettings = useDebounce(settings);
  useEffect(() => { if (!loading && debouncedTx) { setSaving(true); saveData("transactions", debouncedTx).then(() => setSaving(false)); } }, [debouncedTx, loading]);
  useEffect(() => { if (!loading) { setSaving(true); saveData("settings", debouncedSettings).then(() => setSaving(false)); } }, [debouncedSettings, loading]);

  const akunList = settings.akunList || DEFAULT_AKUN_LIST;
  const akunVirtual = settings.akunVirtual || DEFAULT_AKUN_VIRTUAL;
  const akunReal = akunList.filter(a => !akunVirtual.includes(a));
  const kategoriSpending = settings.kategoriSpending || DEFAULT_KATEGORI_SPENDING;
  const kategoriAll = [...KATEGORI_SYSTEM, ...kategoriSpending];

  const computed = useMemo(() => {
    const byMonth = {}; MONTHS.forEach(m => { byMonth[m] = tx.filter(t => t.bulan === m); });
    const saldo = {}; const EXCLUDED = ["Hutang Masuk", "Hutang Catat"];
    akunList.forEach(a => {
      const akunTx = tx.filter(t => t.akun === a);
      const allMasuk = akunTx.filter(t => !EXCLUDED.includes(t.tipe)).reduce((s, t) => s + (t.penghasilan || 0), 0);
      const allKeluar = akunTx.filter(t => !EXCLUDED.includes(t.tipe)).reduce((s, t) => s + (t.pengeluaran || 0), 0);
      const masukDisplay = akunTx.filter(t => t.tipe === "Pemasukan").reduce((s, t) => s + (t.penghasilan || 0), 0);
      const keluarDisplay = akunTx.filter(t => (t.tipe === "Pengeluaran" || t.tipe === "Bayar Hutang" || t.tipe === "Investasi" || t.tipe === "Tabungan" || t.tipe === "Zakat/Donasi" || t.tipe === "Pajak")).reduce((s, t) => s + (t.pengeluaran || 0), 0);
      const gramSaldoAwal = akunTx.filter(t => t.tipe === "Saldo Awal").reduce((s, t) => s + (Number(t.gram) || 0), 0);
      const gramMasuk = akunTx.filter(t => ["Pemasukan","Transfer Masuk","Hutang Masuk"].includes(t.tipe)).reduce((s, t) => s + (Number(t.gram) || 0), 0);
      const gramKeluar = akunTx.filter(t => ["Pengeluaran","Transfer Keluar","Bayar Hutang"].includes(t.tipe)).reduce((s, t) => s + (Number(t.gram) || 0), 0);
      saldo[a] = { masuk: masukDisplay, keluar: keluarDisplay, saldoAkhir: allMasuk - allKeluar, gramSaldoAwal, gramMasuk, gramKeluar, gramTotal: gramSaldoAwal + gramMasuk - gramKeluar };
    });
    const goldAkun = akunList.filter(a => a.includes("(Emas)"));
    const totalGram = goldAkun.reduce((s, a) => s + (saldo[a]?.gramTotal || 0), 0);
    const totalGoldValue = totalGram * (settings.goldPrice || 1300000);
    const totalAsetReal = akunReal.reduce((s, a) => s + Math.max(saldo[a]?.saldoAkhir || 0, 0), 0);
    const totalAsetVirtual = akunVirtual.reduce((s, a) => s + Math.max(saldo[a]?.saldoAkhir || 0, 0), 0);
    const totalAset = totalAsetReal;
    const totalPemasukan = tx.filter(t => t.tipe === "Pemasukan").reduce((s, t) => s + t.penghasilan, 0);
    const totalPotongan = tx.filter(t => t.kategori === "Potongan" || t.tipe === "Bayar Hutang" || t.tipe === "Pajak" || t.tipe === "Zakat/Donasi").reduce((s, t) => s + t.pengeluaran, 0);
    const totalPengeluaranReal = tx.filter(t => t.tipe === "Pengeluaran" && t.kategori !== "Potongan" && !["Saldo Awal","Transfer","Hutang","Piutang"].includes(t.kategori)).reduce((s, t) => s + t.pengeluaran, 0);
    const totalInvestasi = tx.filter(t => t.tipe === "Investasi").reduce((s, t) => s + t.pengeluaran, 0);
    const totalTabungan = tx.filter(t => t.tipe === "Tabungan").reduce((s, t) => s + t.pengeluaran, 0);
    const netSaving = totalPemasukan - totalPengeluaranReal - totalPotongan; // Investment/Savings are considered saved funds, excluded here so SR stays high
    const monthStats = {}; MONTHS.forEach(m => {
      const mTx = byMonth[m];
      const pemasukan = mTx.filter(t => t.tipe === "Pemasukan").reduce((s, t) => s + t.penghasilan, 0);
      const pengeluaran = mTx.filter(t => t.tipe === "Pengeluaran" || t.tipe === "Bayar Hutang" || t.tipe === "Pajak" || t.tipe === "Zakat/Donasi").reduce((s, t) => s + t.pengeluaran, 0);
      const investasi = mTx.filter(t => t.tipe === "Investasi").reduce((s, t) => s + t.pengeluaran, 0);
      const tabungan = mTx.filter(t => t.tipe === "Tabungan").reduce((s, t) => s + t.pengeluaran, 0);
      const net = pemasukan - pengeluaran - investasi - tabungan;
      monthStats[m] = { pemasukan, pengeluaran, investasi, tabungan, net, savingRate: pemasukan > 0 ? (pemasukan - pengeluaran) / pemasukan : 0, txCount: mTx.length };
    });
    const budgetData = {}; MONTHS.forEach(m => {
      budgetData[m] = {}; kategoriSpending.forEach(k => {
        const spent = byMonth[m].filter(t => t.kategori === k && t.tipe === "Pengeluaran").reduce((s, t) => s + t.pengeluaran, 0);
        const budget = settings.budgets[k] || 0; const pctUsed = budget > 0 ? spent / budget : (spent > 0 ? 999 : 0);
        let status = "—"; if (budget === 0 && spent === 0) status = "—"; else if (pctUsed <= 0.7) status = "✅ Aman"; else if (pctUsed <= 1) status = "⚠️ Hampir"; else status = "❌ Over";
        budgetData[m][k] = { spent, budget, pctUsed, status };
      });
    });
    const getHutangMasukAmount = (t) => Math.max(Number(t.penghasilan) || 0, Number(t.pengeluaran) || 0);
    const getBayarHutangAmount = (t) => Math.max(Number(t.pengeluaran) || 0, Number(t.penghasilan) || 0);
    const isHutangMasuk = (t) => t.tipe === "Hutang Masuk" || (t.kategori === "Hutang" && getHutangMasukAmount(t) > 0 && t.tipe !== "Bayar Hutang" && t.tipe !== "Hutang Catat");
    const isBayarHutang = (t) => t.tipe === "Bayar Hutang" || t.tipe === "Hutang Catat" || (t.kategori === "Hutang" && (Number(t.pengeluaran) || 0) > 0 && t.tipe !== "Hutang Masuk");
    const hutangMasuk = tx.filter(isHutangMasuk); const bayarHutang = tx.filter(isBayarHutang);
    const totalHutang = hutangMasuk.reduce((s, t) => s + getHutangMasukAmount(t), 0);
    const totalBayar = bayarHutang.reduce((s, t) => s + getBayarHutangAmount(t), 0);
    const sisaHutang = totalHutang - totalBayar;
    const piutangKeluar = tx.filter(t => t.tipe === "Piutang Keluar" || (t.kategori === "Piutang" && t.pengeluaran > 0 && t.tipe !== "Piutang Masuk"));
    const piutangMasuk = tx.filter(t => t.tipe === "Piutang Masuk" || (t.kategori === "Piutang" && t.penghasilan > 0 && t.tipe !== "Piutang Keluar"));
    const totalPiutangOut = piutangKeluar.reduce((s, t) => s + (t.pengeluaran || 0), 0);
    const totalPiutangIn = piutangMasuk.reduce((s, t) => s + (t.penghasilan || 0), 0);
    const sisaPiutang = totalPiutangOut - totalPiutangIn;
    const savingRate = totalPemasukan > 0 ? (totalPemasukan - totalPotongan - totalPengeluaranReal) / totalPemasukan : 0;
    const savingScore = savingRate >= 0.3 ? 30 : Math.round(savingRate / 0.3 * 30);
    const totalBudgetCats = kategoriSpending.filter(k => settings.budgets[k] > 0).length;
    const overBudgetCats = MONTHS.reduce((s, m) => s + kategoriSpending.filter(k => budgetData[m]?.[k]?.pctUsed > 1).length, 0);
    const budgetScore = totalBudgetCats > 0 ? Math.round((1 - overBudgetCats / (totalBudgetCats * 12)) * 25) : 15;
    const ddTarget = settings.danaDarurat.pengeluaranBulanan * settings.danaDarurat.targetBulan;
    const ddCurrent = Math.max(saldo["Dana Darurat"]?.saldoAkhir || 0, 0);
    const ddProgress = ddTarget > 0 ? ddCurrent / ddTarget : 0;
    const ddScore = Math.min(Math.round(ddProgress * 20), 20);
    const hutangRatio = totalPemasukan > 0 ? sisaHutang / totalPemasukan : 0;
    const hutangScore = sisaHutang <= 0 ? 15 : Math.max(Math.round((1 - hutangRatio) * 15), 2);
    const activeAkun = akunList.filter(a => saldo[a]?.saldoAkhir > 0).length;
    const diversScore = Math.min(Math.round(activeAkun / 7 * 10), 10);
    const healthScore = savingScore + budgetScore + ddScore + hutangScore + diversScore;
    const healthLabel = healthScore >= 80 ? "✅ SEHAT" : healthScore >= 60 ? "⚠️ CUKUP" : "❌ PERLU PERBAIKAN";
    const spendingByKat = {}; kategoriSpending.forEach(k => { spendingByKat[k] = tx.filter(t => t.kategori === k && t.tipe === "Pengeluaran").reduce((s, t) => s + t.pengeluaran, 0); });
    const topSpending = Object.entries(spendingByKat).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0).slice(0, 5);
    const avgMonthlySpend = totalPotongan + totalPengeluaranReal;
    const burnRate = avgMonthlySpend > 0 ? totalAset / avgMonthlySpend : 99;
    const mainBankFree = Math.max((saldo["BCA"]?.saldoAkhir || 0) - totalAsetVirtual, 0);
    return { saldo, totalAset, totalAsetReal, totalAsetVirtual, mainBankFree, totalPemasukan, totalPotongan, totalPengeluaranReal, totalInvestasi, totalTabungan, totalGram, totalGoldValue, netSaving, monthStats, budgetData, byMonth, totalHutang, totalBayar, sisaHutang, hutangMasuk, bayarHutang, totalPiutangOut, totalPiutangIn, sisaPiutang, piutangKeluar, piutangMasuk, healthScore, healthLabel, savingRate, savingScore, budgetScore, ddScore, hutangScore, diversScore, ddTarget, ddCurrent, ddProgress, topSpending, burnRate, spendingByKat, activeAkun };
  }, [tx, settings, akunList, akunVirtual, akunReal, kategoriSpending]);

  const addTx = useCallback((newTx) => { setTx(prev => [...prev, { ...newTx, id: uid() }]); }, []);
  const updateTx = useCallback((id, updated) => { setTx(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t)); }, []);
  const deleteTx = useCallback((id) => { setTx(prev => prev.filter(t => t.id !== id)); }, []);
  const resetData = useCallback(() => { setTx(INITIAL_TX.map(t => ({ ...t, id: uid() }))); setSettings(DEFAULT_SETTINGS); }, []);
  const renameKategori = useCallback((oldName, newName) => {
    setTx(prev => prev.map(t => t.kategori === oldName ? { ...t, kategori: newName } : t));
    setSettings(prev => { const nb = { ...prev.budgets }; if (nb[oldName] !== undefined) { nb[newName] = nb[oldName]; delete nb[oldName]; } return { ...prev, budgets: nb, kategoriSpending: (prev.kategoriSpending || DEFAULT_KATEGORI_SPENDING).map(k => k === oldName ? newName : k) }; });
  }, []);
  const renameAkun = useCallback((oldName, newName) => {
    setTx(prev => prev.map(t => t.akun === oldName ? { ...t, akun: newName } : t));
    setSettings(prev => ({ ...prev, akunList: (prev.akunList || DEFAULT_AKUN_LIST).map(a => a === oldName ? newName : a), akunVirtual: (prev.akunVirtual || DEFAULT_AKUN_VIRTUAL).map(a => a === oldName ? newName : a) }));
  }, []);

  const handleExportCSV = () => {
    const csv = generateCSV(tx);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `smart-finance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Premium loading screen
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 text-slate-800 font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-[120px]" />
      </div>
      <div className="text-center relative">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center shadow-2xl shadow-pink-900/40 animate-float">
          <span className="text-2xl">💰</span>
        </div>
        <h1 className="text-lg font-bold gradient-text-pink mb-1">Smart Finance</h1>
        <p className="text-xs text-slate-500">Memuat data keuangan...</p>
        <div className="mt-4 w-48 h-1 mx-auto rounded-full overflow-hidden bg-white border border-pink-100">
          <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full animate-shimmer" style={{ width: '70%' }} />
        </div>
      </div>
    </div>
  );

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} settings={settings} setSettings={setSettings} />;

  const lists = { akunList, akunVirtual, akunReal, kategoriSpending, kategoriAll };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <><DashboardView c={computed} lists={lists} settings={settings} /><div className="mt-6"><MonthlyChart monthStats={computed.monthStats} /></div></>;
      case "analisis": return <AnalisisView c={computed} lists={lists} />;
      case "input": return <InputView tx={tx} addTx={addTx} updateTx={updateTx} deleteTx={deleteTx} settings={settings} lists={lists} />;
      case "saldo": return <SaldoView c={computed} lists={lists} settings={settings} />;
      case "darurat": return <DanaView c={computed} settings={settings} setSettings={setSettings} />;
      case "hutang": return <HutangView c={computed} tx={tx} />;
      case "rekap": return <RekapView c={computed} />;
      case "bulanan": return <BulananView c={computed} tx={tx} settings={settings} lists={lists} selMonth={selMonth} setSelMonth={setSelMonth} />;
      case "settings": return <SettingsView settings={settings} setSettings={setSettings} tx={tx} setTx={setTx} renameKategori={renameKategori} renameAkun={renameAkun} resetData={resetData} lists={lists} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 text-slate-800 font-sans">
      {/* Background ambiance */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/6 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-pink-50/85 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center shadow-lg shadow-pink-900/30">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold gradient-text-pink">Smart Finance</h1>
                <p className="text-[9px] text-slate-500 -mt-0.5 uppercase tracking-widest">Pro Edition</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saving && <span className="text-[11px] text-pink-600 animate-pulse">💾 Syncing...</span>}
              <button onClick={handleExportCSV} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm shadow-pink-100/50 hover:bg-pink-100 border border-pink-100 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 transition-all duration-200">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-0.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {TABS.map(t => {
              const Icon = TAB_ICONS[t.id];
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => switchTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-pink-500/12 text-pink-600 shadow-sm shadow-pink-900/10'
                      : 'text-slate-500 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content with tab transition */}
      <main className="relative max-w-5xl mx-auto px-4 py-6 pb-24">
        <div key={tabKey} className="animate-tab-switch">
          {renderContent()}
        </div>
      </main>

      {/* Mobile FAB — quick add */}
      <button onClick={() => { switchTab("input"); }} className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-xl shadow-pink-900/40 active:scale-90 transition-transform">
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Footer */}
      <footer className="relative border-t border-pink-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between text-[11px] text-slate-600">
          <p>© 2026 Smart Finance</p>
          <p>Powered by Supabase</p>
        </div>
      </footer>
    </div>
  );
}
