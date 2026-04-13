"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

// ── 型 ───────────────────────────────────────────────────────
type RangeType = "week" | "month" | "3month" | "6month" | "year";

interface ZoneSummary {
  zone: number;
  total_seconds: number;
  minutes: number;
  percentage: number;
}

// ── 定数 ─────────────────────────────────────────────────────
const ZONE_COLORS = ["#94a3b8", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];
const ZONE_LABELS = ["Z1 回復", "Z2 有酸素", "Z3 有酸素強化", "Z4 閾値", "Z5 最大"];
const ZONE_DESC   = ["〜50%HRmax", "50〜60%", "60〜70%", "70〜80%", "80%〜"];

const RANGE_OPTIONS: { key: RangeType; label: string }[] = [
  { key: "week",    label: "1週間" },
  { key: "month",   label: "1ヶ月" },
  { key: "3month",  label: "3ヶ月" },
  { key: "6month",  label: "6ヶ月" },
  { key: "year",    label: "1年" },
];

// ── ユーティリティ ────────────────────────────────────────────
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const todayStr = () => fmt(new Date());

function calcRange(base: string, range: RangeType): { from: string; to: string } {
  const d = new Date(base);
  switch (range) {
    case "week":   { const f = new Date(d); f.setDate(f.getDate() - 6); return { from: fmt(f), to: base }; }
    case "month":  { const f = new Date(d); f.setMonth(f.getMonth() - 1); f.setDate(f.getDate() + 1); return { from: fmt(f), to: base }; }
    case "3month": { const f = new Date(d); f.setMonth(f.getMonth() - 3); f.setDate(f.getDate() + 1); return { from: fmt(f), to: base }; }
    case "6month": { const f = new Date(d); f.setMonth(f.getMonth() - 6); f.setDate(f.getDate() + 1); return { from: fmt(f), to: base }; }
    case "year":   { const f = new Date(d); f.setFullYear(f.getFullYear() - 1); f.setDate(f.getDate() + 1); return { from: fmt(f), to: base }; }
  }
}

function fmtMin(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}分`;
}

// ── カスタム Tooltip ──────────────────────────────────────────
function PieCustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ZoneSummary }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-gray-800">{ZONE_LABELS[d.zone - 1]}</p>
      <p className="text-gray-500">{ZONE_DESC[d.zone - 1]}</p>
      <p className="mt-1 font-semibold">{fmtMin(d.total_seconds)} <span className="text-gray-400">({d.percentage}%)</span></p>
    </div>
  );
}

// ── ページ ────────────────────────────────────────────────────
export default function HrZonesPage() {
  const [summary, setSummary]   = useState<ZoneSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [actCount, setActCount] = useState(0);
  const [baseDate, setBaseDate] = useState(todayStr());
  const [range, setRange]       = useState<RangeType>("month");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { from, to } = calcRange(baseDate, range);
    const res  = await fetch(`/api/hr-zones?from=${from}&to=${to}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "読み込みエラー");
    } else {
      setSummary(json.zones_summary ?? []);
      setActCount((json.per_activity ?? []).filter((a: { has_zone_data: boolean }) => a.has_zone_data).length);
    }
    setLoading(false);
  }, [baseDate, range]);

  useEffect(() => { load(); }, [load]);

  const { from } = calcRange(baseDate, range);
  const hasData  = summary.some(s => s.total_seconds > 0);
  const totalMin = summary.reduce((s, z) => s + z.minutes, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-orange-500 text-base tracking-tight">RunningCoach</a>
            <span className="text-gray-300 text-sm">/</span>
            <span className="text-gray-600 text-sm font-medium">心拍ゾーン</span>
          </div>
          <a
            href="/analysis/hr-zones/trend"
            className="flex items-center gap-1.5 text-sm font-medium text-orange-500 bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
          >
            <TrendingUp size={14} />
            トレンド
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* ── コントロール ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          {/* 基準日 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-600 w-14 shrink-0">基準日</span>
            <input
              type="date"
              value={baseDate}
              max={todayStr()}
              onChange={e => setBaseDate(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={() => setBaseDate(todayStr())}
              className="text-xs text-orange-500 font-semibold shrink-0"
            >
              今日
            </button>
          </div>

          {/* レンジ */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 w-14 shrink-0">レンジ</span>
            <div className="flex gap-2 flex-wrap">
              {RANGE_OPTIONS.map(o => (
                <button
                  key={o.key}
                  onClick={() => setRange(o.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    range === o.key
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">{from} 〜 {baseDate}　{actCount}回のラン</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">読み込み中...</div>
        ) : !hasData ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">この期間のデータがありません</p>
            <p className="text-gray-400 text-xs mt-1">基準日やレンジを変更してみてください</p>
          </div>
        ) : (
          <>
            {/* ── ドーナツグラフ ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-gray-900">ゾーン別比率</h2>
                <span className="text-xs text-gray-400">合計 {totalMin} 分</span>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={summary.filter(s => s.total_seconds > 0)}
                    dataKey="total_seconds"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {summary.map((_, i) => <Cell key={i} fill={ZONE_COLORS[i]} />)}
                  </Pie>
                  <PieTooltip content={<PieCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* 凡例 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {summary.map((s, i) => (
                  <div key={s.zone} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: ZONE_COLORS[i] }} />
                    <span className="text-xs text-gray-600 truncate">{ZONE_LABELS[i]}</span>
                    <span className="text-xs font-semibold text-gray-800 ml-auto">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ゾーン別詳細バー ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">ゾーン別詳細</h2>
              <div className="space-y-4">
                {summary.map((s, i) => (
                  <div key={s.zone}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ZONE_COLORS[i] }} />
                        <span className="text-sm font-semibold text-gray-800">{ZONE_LABELS[i]}</span>
                        <span className="text-xs text-gray-400">{ZONE_DESC[i]}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{s.percentage}%</span>
                        <span className="text-xs text-gray-400 ml-2">{fmtMin(s.total_seconds)}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.percentage}%`, backgroundColor: ZONE_COLORS[i] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
