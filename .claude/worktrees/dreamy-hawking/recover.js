import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SUPABASE_URL = "https://bvrtunobcfrtzzipgivl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kufk62lRMxPmW9xLTRAPZg_VNNtUbZi";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const REVERSE_AKUN_MIGRATE = {
  "BCA": "Yucho Bank",
  "BRI": "ICOCA",
  "Mandiri": "Everica",
  "GoPay": "Wise",
  "OVO": "PayPay",
  "Dana": "Self Reward"
};

async function recover() {
  console.log("Downloading current data from Yen DB...");
  const { data: txData, error: txErr } = await supabase.from("laporan").select("value").eq("key", "transactions").single();
  const { data: settingsData, error: setErr } = await supabase.from("laporan").select("value").eq("key", "settings").single();

  if (!txData || !settingsData) {
    console.error("Failed to load data from Supabase:", txErr, setErr);
    return;
  }

  // Backup to local file just in case
  fs.writeFileSync("backup_tx.json", JSON.stringify(txData.value, null, 2));
  fs.writeFileSync("backup_settings.json", JSON.stringify(settingsData.value, null, 2));
  console.log("Local backup saved to backup_tx.json and backup_settings.json");

  // Reverse transactions
  const oldTx = txData.value;
  const newTx = oldTx.map(t => {
    return { ...t, akun: REVERSE_AKUN_MIGRATE[t.akun] || t.akun };
  });

  // Reverse settings
  const oldSettings = settingsData.value;
  const newSettings = { ...oldSettings };
  
  // Fix akunList
  if (newSettings.akunList) {
    newSettings.akunList = newSettings.akunList.map(a => REVERSE_AKUN_MIGRATE[a] || a);
    if (!newSettings.akunList.includes("Kirim Indonesia")) newSettings.akunList.push("Kirim Indonesia");
  }
  
  // Fix akunVirtual
  if (newSettings.akunVirtual) {
    newSettings.akunVirtual = newSettings.akunVirtual.map(a => REVERSE_AKUN_MIGRATE[a] || a);
    if (!newSettings.akunVirtual.includes("Kirim Indonesia")) newSettings.akunVirtual.push("Kirim Indonesia");
  }

  // Upload back to Supabase
  console.log("Uploading recovered data back to Yen DB...");
  await supabase.from("laporan").upsert({ key: "transactions", value: newTx, updated_at: new Date().toISOString() });
  await supabase.from("laporan").upsert({ key: "settings", value: newSettings, updated_at: new Date().toISOString() });
  console.log("Recovery complete! Your Yen database has been restored.");
}

recover();
