import { useMemo } from "react";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar as ReBar, PieChart, Pie, Cell } from "recharts";
import { fmt, MONTHS } from "../utils";
import { Card, Label } from "./UI";

const PINK_COLORS = ["#ec4899", "#f472b6", "#a855f7", "#8b5cf6", "#6366f1", "#818cf8", "#c084fc"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1025] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
};

export default function MonthlyChart({ monthStats, spendingByKat }) {
  const barData = useMemo(() =>
    MONTHS.map(m => ({
      month: m.slice(0, 3),
      Pemasukan: monthStats[m]?.pemasukan || 0,
      Pengeluaran: monthStats[m]?.pengeluaran || 0,
    })).filter(d => d.Pemasukan > 0 || d.Pengeluaran > 0)
  , [monthStats]);

  if (barData.length === 0) return null;

  const fmtY = (v) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v;
  };

  return (
    <Card>
      <Label className="mb-1">📊 Pemasukan vs Pengeluaran</Label>
      <p className="text-[11px] text-slate-600 mb-4">Perbandingan bulanan</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={barData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <YAxis tickFormatter={fmtY} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
          <Tooltip content={<CustomTooltip />} />
          <ReBar dataKey="Pemasukan" fill="#10b981" radius={[6, 6, 0, 0]} />
          <ReBar dataKey="Pengeluaran" fill="#ec4899" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
