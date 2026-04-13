"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

// ── 型 ───────────────────────────────────────────────────────
type RangeType    = "week" | "month" | "halfyear" | "year";
type IntervalType = "day"  | "week"  | "month";

interface ZoneSummary {
  zone: number;
  total_seconds: number;
  minutes: number;
  percentage: number;
}

interface PerActivity {
  activity_id: string;
  date: string;
  distance_km: number;
  duration_sec: number;
  has_zone_data: boolean;
  zones: { zone: number; seconds: number; percentage: number }[];
}

// ── 定数 ─────────────────────────────────────────────────────
const ZONE_COLORS = ["#94a3b8", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];
const ZONE_LABELS = ["Z1 回復", "Z2 有酸素", "Z3 有酸素強化", "Z4 閾値", "Z5 最大"];
const ZONE_DESC   = [
  "非常に軽い — 〜50%HRmax",
  "軽い — 50〜60%",
  "中程度 — 60〜70%",
  "高強度 — 70〜80%",
  "最大強度 — 80%〜",
];

const NUM_BARS_OPTIONS  = [5, 7, 10, 14, 20, 30];
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

// ── 日付ユーティリティ ────────────────────────────────────────
const fmt = (d: Date) => d.toISOString().slice(0, 10);

function todayStr() { return fmt(new Date()); }

/** endDate からレンジ分遡った startDate を返す */
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

/** date からインターバル × count 分遡った日付を返す */
function subtractInterval(date: string, interval: IntervalType, count = 1): string {
  const d = new Date(date);
  switch (interval) {
    case "day":   d.setDate(d.getDate() - count); break;
    case "week":  d.setDate(d.getDate() - count * 7); break;
    case "month": d.setMonth(d.getMonth() - count); break;
  }
  return fmt(d);
}

// ── バーデータ生成 ────────────────────────────────────────────
interface BarEntry {
  label: string;
  startDate: string;
  endDate: string;
  z1: number; z2: number; z3: number; z4: number; z5: number;
  totalSec: number;
  actCount: number;
}

function buildBars(
  perActivity: PerActivity[],
  baseDate: string,
  numBars: number,
  interval: IntervalType,
  range: RangeType,
): BarEntry[] {
  const bars: BarEntry[] = [];

  for (let i = numBars - 1; i >= 0; i--) {
    const endDate   = subtractInterval(baseDate, interval, i);
    const startDate = getBarStart(endDate, range);
    const label     = endDate.slice(5); // MM/DD

    const acts = perActivity.filter(a => a.date >= startDate && a.date <= endDate);
    const secs = [0, 0, 0, 0, 0];
    acts.forEach(a => a.zones.forEach(z => { secs[z.zone - 1] += z.seconds; }));

    const total = secs.reduce((s, v) => s + v, 0);
    const pct   = secs.map(s => total > 0 ? Math.round(s / total * 1000) / 10 : 0);

    bars.push({
      label, startDate, endDate,
      z1: pct[0], z2: pct[1], z3: pct[2], z4: pct[3], z5: pct[4],
      totalSec: total,
      actCount: acts.length,
    });
  }
  return bars; // 左から古い順
}

// ── ゾーンサマリー（ドーナツ用）────────────────────────────────
function buildSummary(perActivity: PerActivity[], startDate: string, endDate: string): ZoneSummary[] {
  const secs = [0, 0, 0, 0, 0];
  perActivity
    .filter(a => a.date >= startDate && a.date <= endDate)
    .forEach(a => a.zones.forEach(z => { secs[z.zone - 1] += z.seconds; }));

  const grand = secs.reduce((s, v) => s + v, 0);
  return secs.map((sec, i) => ({
    zone: i + 1,
    total_seconds: sec,
    minutes: Math.round(sec / 60),
    percentage: grand > 0 ? Math.round(sec / grand * 10000) / 100 : 0,
  }));
}

// ── ユーティリティ ────────────────────────────────────────────
function fmtMin(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}時間${m}分` : `${m}分`;
}

// ── カスタム Tooltip ──────────────────────────────────────────
function PieCustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: ZoneSummary }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-gray-800">{ZONE_LABELS[d.zone - 1]}</p>
      <p className="text-gray-500 text-xs">{ZONE_DESC[d.zone - 1]}</p>
      <p className="mt-1 font-semibold">{fmtMin(d.total_seconds)} <span className="text-gray-400">({d.percentage}%)</span></p>
    </div>
  );
}

function BarCustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: ZONE_COLORS[Number(p.name.replace("z", "")) - 1] }} />
          <span className="text-gray-600">{ZONE_LABELS[Number(p.name.replace("z", "")) - 1]}</span>
          <span className="font-semibold ml-auto pl-4">{Number(p.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

// ── セレクト共通スタイル ──────────────────────────────────────
const selectCls = "text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white";

// ── メインページ ─────────────────────────────────────────────
export default function HrZonesPage() {
  const [perActivity, setPerActivity] = useState<PerActivity[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // 4つのパラメータ
  const [baseDate, setBaseDate]   = useState(todayStr());
  const [numBars,  setNumBars]    = useState(10);
  const [interval, setInterval]   = useState<IntervalType>("day");
  const [range,    setRange]      = useState<RangeType>("week");

  // フェッチ範囲: 全バーをカバーする最広範囲
  const fetchFrom = useMemo(() => {
    const oldestEnd   = subtractInterval(baseDate, interval, numBars - 1);
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

  // バーデータ・サマリー（メモ化）
  const bars = useMemo(
    () => buildBars(perActivity, baseDate, numBars, interval, range),
    [perActivity, baseDate, numBars, interval, range],
  );

  const rightBarStart = useMemo(() => getBarStart(baseDate, range), [baseDate, range]);
  const summary       = useMemo(
    () => buildSummary(perActivity, rightBarStart, baseDate),
    [perActivity, rightBarStart, baseDate],
  );

  const hasData  = summary.some(s => s.total_seconds > 0);
  const totalMin = summary.reduce((s, z) => s + z.minutes, 0);
  const rightActCount = perActivity.filter(a => a.date >= rightBarStart && a.date <= baseDate).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="font-bold text-orange-500 text-lg tracking-tight">RunningCoach</a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 text-sm font-medium">心拍ゾーン分析</span>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <a href="/activities" className="hover:text-gray-900 transition-colors">一覧</a>
            <a href="/analysis/hr-zones" className="text-gray-900 font-semibold">心拍ゾーン分析</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── コントロールパネル ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

            {/* 基準日 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600 shrink-0">基準日</span>
              <input
                type="date"
                value={baseDate}
                max={todayStr()}
                onChange={e => setBaseDate(e.target.value)}
                className={selectCls}
              />
              <button
                onClick={() => setBaseDate(todayStr())}
                className="text-xs text-orange-500 hover:text-orange-700 font-medium"
              >
                今日
              </button>
            </div>

            {/* バーの本数 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600 shrink-0">バーの本数</span>
              <select value={numBars} onChange={e => setNumBars(Number(e.target.value))} className={selectCls}>
                {NUM_BARS_OPTIONS.map(n => (
                  <option key={n} value={n}>{n}本</option>
                ))}
              </select>
            </div>

            {/* バーの間隔 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600 shrink-0">バーの間隔</span>
              <select value={interval} onChange={e => setInterval(e.target.value as IntervalType)} className={selectCls}>
                {INTERVAL_OPTIONS.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* レンジ */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600 shrink-0">レンジ</span>
              <select value={range} onChange={e => setRange(e.target.value as RangeType)} className={selectCls}>
                {RANGE_OPTIONS.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 集計範囲の説明 */}
          <div className="mt-3 text-xs text-gray-400 space-y-0.5">
            <p>最新バー: {rightBarStart} 〜 {baseDate}　／　全体取得範囲: {fetchFrom} 〜 {baseDate}</p>
            <p>各バーは <strong className="text-gray-500">{RANGE_OPTIONS.find(o=>o.key===range)?.label}</strong> 分のデータを集計、
               右から <strong className="text-gray-500">{INTERVAL_OPTIONS.find(o=>o.key===interval)?.label}</strong> ずつシフト</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">読み込み中...</div>
        ) : !hasData ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-1">この期間の心拍ゾーンデータがありません</p>
            <p className="text-gray-400 text-xs">基準日やレンジを変更してみてください</p>
          </div>
        ) : (
          <>
            {/* ── ドーナツ + ゾーン別詳細（最新バーの集計） ── */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-1">ゾーン別比率</h2>
                <p className="text-xs text-gray-400 mb-4">
                  {rightBarStart} 〜 {baseDate}　合計 {totalMin} 分 / {rightActCount} 回
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={summary.filter(s => s.total_seconds > 0)}
                      dataKey="total_seconds"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {summary.map((_, i) => <Cell key={i} fill={ZONE_COLORS[i]} />)}
                    </Pie>
                    <PieTooltip content={<PieCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">ゾーン別詳細</h2>
                <div className="space-y-3">
                  {summary.map((s, i) => (
                    <div key={s.zone}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-700">{ZONE_LABELS[i]}</span>
                        <span className="text-sm text-gray-500">{fmtMin(s.total_seconds)} ({s.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${s.percentage}%`, backgroundColor: ZONE_COLORS[i] }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{ZONE_DESC[i]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── トレンドグラフ ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="font-bold text-gray-900 mb-1">心拍ゾーン トレンド (%)</h2>
              <p className="text-xs text-gray-400 mb-5">
                右端 = {baseDate}　各バーのラベルはバー終端日（MM/DD）
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bars} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip content={<BarCustomTooltip />} />
                  {[1, 2, 3, 4, 5].map(z => (
                    <Bar key={z} dataKey={`z${z}`} stackId="a" fill={ZONE_COLORS[z - 1]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>

              {/* 凡例 */}
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {ZONE_LABELS.map((label, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: ZONE_COLORS[i] }} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* バー一覧（期間確認用） */}
              <div className="mt-5 border-t border-gray-50 pt-4">
                <p className="text-xs font-semibold text-gray-400 mb-2">各バーの集計期間</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {bars.map((b, i) => (
                    <div key={i} className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      <p className="font-semibold text-gray-600">{b.label}</p>
                      <p>{b.startDate.slice(5)} 〜 {b.endDate.slice(5)}</p>
                      <p>{b.actCount}件</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── アクティビティ別一覧 ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">アクティビティ別ゾーン時間</h2>
              <div className="space-y-3">
                {perActivity.slice().reverse().map(a => {
                  const totalSec = a.zones.reduce((s, z) => s + z.seconds, 0);
                  return (
                    <div key={a.activity_id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800">{a.date}</span>
                        <span className="text-xs text-gray-400">{a.distance_km?.toFixed(2)} km</span>
                      </div>
                      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                        {a.zones.map(z =>
                          z.seconds > 0 ? (
                            <div
                              key={z.zone}
                              title={`${ZONE_LABELS[z.zone - 1]}: ${Math.round(z.seconds / 60)}分 (${z.percentage}%)`}
                              style={{
                                width: `${totalSec > 0 ? (z.seconds / totalSec) * 100 : 0}%`,
                                backgroundColor: ZONE_COLORS[z.zone - 1],
                              }}
                            />
                          ) : null
                        )}
                      </div>
                      <div className="flex gap-3 mt-2 flex-wrap">
                        {a.zones.filter(z => z.seconds > 0).map(z => (
                          <span key={z.zone} className="text-xs text-gray-400">
                            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: ZONE_COLORS[z.zone - 1] }} />
                            Z{z.zone}: {Math.round(z.seconds / 60)}分
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
