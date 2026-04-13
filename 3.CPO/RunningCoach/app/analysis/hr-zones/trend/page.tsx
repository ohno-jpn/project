"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { ChevronLeft } from "lucide-react";

// ── 型 ───────────────────────────────────────────────────────
type RangeType    = "week" | "month" | "halfyear" | "year";
type IntervalType = "day" | "week" | "month";

interface PerActivity {
  activity_id: string;
  date: string;
  distance_km: number;
  has_zone_data: boolean;
  zones: { zone: number; seconds: number; percentage: number }[];
}

interface BarEntry {
  label: string;
  startDate: string;
  endDate: string;
  z1: number; z2: number; z3: number; z4: number; z5: number;
  totalSec: number;
  actCount: number;
}

// ── 定数 ─────────────────────────────────────────────────────
const ZONE_COLORS = ["#94a3b8", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];
const ZONE_LABELS = ["Z1 回復", "Z2 有酸素", "Z3 有酸素強化", "Z4 閾値", "Z5 最大"];

const NUM_BARS_OPTIONS: number[]  = [5, 7, 10, 14, 20, 30];
const INTERVAL_OPTIONS: { key: IntervalType; label: string }[] = [
  { key: "day",   label: "日" },
  { key: "week",  label: "週" },
  { key: "month", label: "月" },
];
const RANGE_OPTIONS: { key: RangeType; label: string }[] = [
  { key: "week",     label: "週" },
  { key: "month",    label: "月" },
  { key: "halfyear", label: "半年" },
  { key: "year",     label: "1年" },
];

// ── ユーティリティ ────────────────────────────────────────────
const fmt = (d: Date) => d.toISOString().slice(0, 10);
const todayStr = () => fmt(new Date());

function getBarStart(endDate: string, range: RangeType): string {
  const d = new Date(endDate);
  switch (range) {
    case "week":     d.setDate(d.getDate() - 6); break;
    case "month":    d.setMonth(d.getMonth() - 1); d.setDate(d.getDate() + 1); break;
    case "halfyear": d.setMonth(d.getMonth() - 6); d.setDate(d.getDate() + 1); break;
    case "year":     d.setFullYear(d.getFullYear() - 1); d.setDate(d.getDate() + 1); break;
  }
  return fmt(d);
}

function subtractInterval(date: string, interval: IntervalType, count = 1): string {
  const d = new Date(date);
  switch (interval) {
    case "day":   d.setDate(d.getDate() - count); break;
    case "week":  d.setDate(d.getDate() - count * 7); break;
    case "month": d.setMonth(d.getMonth() - count); break;
  }
  return fmt(d);
}

function buildBars(
  data: PerActivity[],
  baseDate: string,
  numBars: number,
  interval: IntervalType,
  range: RangeType,
): BarEntry[] {
  return Array.from({ length: numBars }, (_, i) => {
    const idx       = numBars - 1 - i; // 左から古い順
    const endDate   = subtractInterval(baseDate, interval, idx);
    const startDate = getBarStart(endDate, range);
    const label     = endDate.slice(5);

    const acts  = data.filter(a => a.date >= startDate && a.date <= endDate);
    const secs  = [0, 0, 0, 0, 0];
    acts.forEach(a => a.zones.forEach(z => { secs[z.zone - 1] += z.seconds; }));

    const total = secs.reduce((s, v) => s + v, 0);
    const pct   = secs.map(s => total > 0 ? Math.round(s / total * 1000) / 10 : 0);
    return { label, startDate, endDate, z1: pct[0], z2: pct[1], z3: pct[2], z4: pct[3], z5: pct[4], totalSec: total, actCount: acts.length };
  });
}

// ── カスタム Tooltip ──────────────────────────────────────────
function BarCustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.filter(p => p.value > 0).map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: ZONE_COLORS[Number(p.name.replace("z","")) - 1] }} />
          <span className="text-gray-600">{ZONE_LABELS[Number(p.name.replace("z","")) - 1]}</span>
          <span className="font-bold ml-auto pl-3">{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

const selectCls = "flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white";

// ── ページ ────────────────────────────────────────────────────
export default function HrZonesTrendPage() {
  const [perActivity, setPerActivity] = useState<PerActivity[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [baseDate, setBaseDate]       = useState(todayStr());
  const [numBars,  setNumBars]        = useState(10);
  const [interval, setInterval]       = useState<IntervalType>("day");
  const [range,    setRange]          = useState<RangeType>("week");

  const fetchFrom = useMemo(() => {
    const oldestEnd = subtractInterval(baseDate, interval, numBars - 1);
    return getBarStart(oldestEnd, range);
  }, [baseDate, numBars, interval, range]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res  = await fetch(`/api/hr-zones?from=${fetchFrom}&to=${baseDate}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "読み込みエラー");
    } else {
      setPerActivity((json.per_activity ?? []).filter((a: PerActivity) => a.has_zone_data));
    }
    setLoading(false);
  }, [fetchFrom, baseDate]);

  useEffect(() => { load(); }, [load]);

  const bars    = useMemo(() => buildBars(perActivity, baseDate, numBars, interval, range), [perActivity, baseDate, numBars, interval, range]);
  const hasData = bars.some(b => b.totalSec > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/analysis/hr-zones" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors">
            <ChevronLeft size={18} />
          </a>
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-orange-500 text-base tracking-tight">RunningCoach</a>
            <span className="text-gray-300 text-sm">/</span>
            <span className="text-gray-600 text-sm font-medium">心拍ゾーン トレンド</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* ── コントロール ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 space-y-3">

          {/* 基準日 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 w-20 shrink-0">基準日</span>
            <input
              type="date"
              value={baseDate}
              max={todayStr()}
              onChange={e => setBaseDate(e.target.value)}
              className={selectCls}
            />
            <button onClick={() => setBaseDate(todayStr())} className="text-xs text-orange-500 font-semibold shrink-0">今日</button>
          </div>

          {/* バーの本数 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 w-20 shrink-0">バーの本数</span>
            <select value={numBars} onChange={e => setNumBars(Number(e.target.value))} className={selectCls}>
              {NUM_BARS_OPTIONS.map(n => <option key={n} value={n}>{n}本</option>)}
            </select>
          </div>

          {/* バーの間隔 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 w-20 shrink-0">バーの間隔</span>
            <select value={interval} onChange={e => setInterval(e.target.value as IntervalType)} className={selectCls}>
              {INTERVAL_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>

          {/* レンジ */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-600 w-20 shrink-0">レンジ</span>
            <select value={range} onChange={e => setRange(e.target.value as RangeType)} className={selectCls}>
              {RANGE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>

          <p className="text-xs text-gray-400 pt-1 border-t border-gray-50">
            取得範囲: {fetchFrom} 〜 {baseDate}　／　各バーは{RANGE_OPTIONS.find(o=>o.key===range)?.label}分を集計
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">読み込み中...</div>
        ) : !hasData ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">この期間のデータがありません</p>
          </div>
        ) : (
          <>
            {/* ── トレンドグラフ ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <h2 className="font-bold text-gray-900 mb-1">心拍ゾーン トレンド</h2>
              <p className="text-xs text-gray-400 mb-4">右端 = {baseDate}　各ラベルはバー終端日</p>

              {/* 横スクロール対応 */}
              <div className="overflow-x-auto -mx-1 px-1">
                <div style={{ minWidth: `${Math.max(bars.length * 40, 320)}px` }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={bars} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                        domain={[0, 100]}
                      />
                      <Tooltip content={<BarCustomTooltip />} />
                      {[1,2,3,4,5].map(z => (
                        <Bar key={z} dataKey={`z${z}`} stackId="a" fill={ZONE_COLORS[z-1]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 凡例 */}
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {ZONE_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ZONE_COLORS[i] }} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── バー期間一覧 ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">各バーの集計期間</h2>
              <div className="space-y-2">
                {bars.slice().reverse().map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700 w-12">{b.label}</span>
                      <span className="text-xs text-gray-400">{b.startDate.slice(5)} 〜 {b.endDate.slice(5)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* ミニゾーンバー */}
                      <div className="flex h-4 w-24 rounded overflow-hidden gap-px">
                        {[b.z1,b.z2,b.z3,b.z4,b.z5].map((pct, zi) =>
                          pct > 0 ? (
                            <div
                              key={zi}
                              title={`${ZONE_LABELS[zi]}: ${pct}%`}
                              style={{ width: `${pct}%`, backgroundColor: ZONE_COLORS[zi] }}
                            />
                          ) : null
                        )}
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{b.actCount}件</span>
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
