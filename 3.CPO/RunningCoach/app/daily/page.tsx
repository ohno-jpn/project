"use client";

import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip as PieTooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight, Scale, Moon, Activity, Star } from "lucide-react";

// ── 型 ───────────────────────────────────────────────────────
interface Activity {
  id: string;
  date: string;
  title: string;
  activity_type: string;
  distance_km: number | null;
  duration_sec: number | null;
  avg_pace_sec_per_km: number | null;
  avg_hr: number | null;
  max_hr: number | null;
  avg_cadence: number | null;
  avg_stride_length: number | null;
  avg_ground_contact_time: number | null;
  avg_vertical_oscillation: number | null;
  avg_vertical_ratio: number | null;
  avg_gct_balance: string | null;
  training_stress_score: number | null;
  aerobic_te: number | null;
  calories: number | null;
  total_ascent: number | null;
}

interface HrZone {
  activity_id: string;
  zone: number;
  seconds: number;
  percentage: number;
}

interface SleepData {
  totalHours: number;
  deepMin: number;
  lightMin: number;
  remMin: number;
}

interface Assessment {
  rating: number;
  comment: string;
}

// ── 定数 ─────────────────────────────────────────────────────
const ZONE_COLORS = ["#94a3b8", "#60a5fa", "#34d399", "#f59e0b", "#f87171"];
const ZONE_LABELS = ["Z1 回復", "Z2 有酸素", "Z3 有酸素強化", "Z4 閾値", "Z5 最大"];

// ── ユーティリティ ────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

function fmtPace(sec: number | null) {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

function fmtDuration(sec: number | null) {
  if (!sec) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function shiftDate(date: string, days: number) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function loadAssessment(date: string): Assessment {
  try {
    const raw = localStorage.getItem(`daily-assessment-${date}`);
    return raw ? JSON.parse(raw) : { rating: 0, comment: "" };
  } catch {
    return { rating: 0, comment: "" };
  }
}

function saveAssessment(date: string, a: Assessment) {
  localStorage.setItem(`daily-assessment-${date}`, JSON.stringify(a));
}

// ── カスタム Tooltip ──────────────────────────────────────────
function PieCustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: { zone: number; seconds: number; percentage: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const m = Math.floor(d.seconds / 60);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-gray-800">{ZONE_LABELS[d.zone - 1]}</p>
      <p className="mt-1 font-semibold">{m}分 <span className="text-gray-400">({d.percentage}%)</span></p>
    </div>
  );
}

// ── TE バッジ ─────────────────────────────────────────────────
function TEBadge({ te }: { te: number | null }) {
  if (!te) return <span className="text-gray-400 text-sm">—</span>;
  const labels = ["", "軽い", "維持", "改善", "高強度", "過負荷"];
  const colors = ["", "bg-slate-100 text-slate-600", "bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-amber-100 text-amber-700", "bg-red-100 text-red-700"];
  const idx = Math.min(Math.max(Math.floor(te), 1), 5);
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[idx]}`}>
      {te.toFixed(1)} {labels[idx]}
    </span>
  );
}

// ── ページ ────────────────────────────────────────────────────
export default function DailySummaryPage() {
  const [date, setDate] = useState(todayStr());
  const [activity, setActivity] = useState<Activity | null>(null);
  const [zones, setZones] = useState<HrZone[]>([]);
  const [weight, setWeight] = useState<number | null>(null);
  const [sleep, setSleep] = useState<SleepData | null>(null);
  const [assessment, setAssessment] = useState<Assessment>({ rating: 0, comment: "" });
  const [loadingAct, setLoadingAct] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);

  // アクティビティ＋心拍ゾーン
  const loadActivity = useCallback(async (d: string) => {
    setLoadingAct(true);
    const res = await fetch(`/api/daily-summary?date=${d}`);
    const json = await res.json();
    if (res.ok && json.activities.length > 0) {
      setActivity(json.activities[0]);
      setZones(json.zones ?? []);
    } else {
      setActivity(null);
      setZones([]);
    }
    setLoadingAct(false);
  }, []);

  // 体重・睡眠
  const loadHealth = useCallback(async (d: string) => {
    setLoadingHealth(true);
    setHealthError(null);
    const res = await fetch(`/api/garmin/health?date=${d}`);
    const json = await res.json();
    if (res.ok) {
      setWeight(json.weight ?? null);
      setSleep(json.sleep ?? null);
    } else {
      setHealthError(json.error ?? "Garmin データ取得エラー");
      setWeight(null);
      setSleep(null);
    }
    setLoadingHealth(false);
  }, []);

  useEffect(() => {
    loadActivity(date);
    loadHealth(date);
    setAssessment(loadAssessment(date));
  }, [date, loadActivity, loadHealth]);

  function handleRating(r: number) {
    const next = { ...assessment, rating: r };
    setAssessment(next);
    saveAssessment(date, next);
  }

  function handleComment(c: string) {
    const next = { ...assessment, comment: c };
    setAssessment(next);
    saveAssessment(date, next);
  }

  // 心拍ゾーンのパイデータ（Zone5から時計回り）
  const actZones = [1, 2, 3, 4, 5].map((z) => {
    const r = zones.find((x) => x.zone === z);
    return { zone: z, seconds: r?.seconds ?? 0, percentage: r?.percentage ?? 0 };
  });
  const pieData = [...actZones.filter((z) => z.seconds > 0)].reverse();
  const hasZones = pieData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-orange-500 text-base tracking-tight">RunningCoach</a>
            <span className="text-gray-300 text-sm">/</span>
            <span className="text-gray-600 text-sm font-medium">デイリーサマリー</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* ── 日付ナビ ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <button
            onClick={() => setDate(d => shiftDate(d, -1))}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={e => setDate(e.target.value)}
            className="flex-1 text-sm text-center font-semibold text-gray-800 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            onClick={() => setDate(d => shiftDate(d, 1))}
            disabled={date >= todayStr()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-gray-500" />
          </button>
          <button
            onClick={() => setDate(todayStr())}
            className="text-xs text-orange-500 font-semibold shrink-0"
          >
            今日
          </button>
        </div>

        {/* ── ランニングデータ ── */}
        {loadingAct ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : !activity ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <Activity size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">この日のランニングデータはありません</p>
          </div>
        ) : (
          <>
            {/* アクティビティタイトル */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <p className="text-xs text-gray-400 mb-0.5">{activity.activity_type}</p>
              <h2 className="font-bold text-gray-900">{activity.title || "ランニング"}</h2>
            </div>

            {/* 基本スタッツ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">ランニング</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "走行距離", value: activity.distance_km ? `${activity.distance_km.toFixed(2)} km` : "—" },
                  { label: "走行時間", value: fmtDuration(activity.duration_sec) },
                  { label: "平均ペース", value: fmtPace(activity.avg_pace_sec_per_km) },
                  { label: "平均心拍数", value: activity.avg_hr ? `${activity.avg_hr} bpm` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 心拍ゾーン円グラフ */}
            {hasZones && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-700 mb-3">心拍ゾーン</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="seconds"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pieData.map((z) => (
                        <Cell key={z.zone} fill={ZONE_COLORS[z.zone - 1]} />
                      ))}
                    </Pie>
                    <PieTooltip content={<PieCustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                  {[...actZones].reverse().map((z) => (
                    <div key={z.zone} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: ZONE_COLORS[z.zone - 1] }} />
                      <span className="text-xs text-gray-600 truncate">{ZONE_LABELS[z.zone - 1]}</span>
                      <span className="text-xs font-semibold text-gray-800 ml-auto">{z.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ランニングダイナミクス */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">ランニングダイナミクス</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "ピッチ", value: activity.avg_cadence ? `${activity.avg_cadence} spm` : "—" },
                  { label: "歩幅", value: activity.avg_stride_length ? `${(activity.avg_stride_length * 100).toFixed(0)} cm` : "—" },
                  { label: "接地時間", value: activity.avg_ground_contact_time ? `${activity.avg_ground_contact_time} ms` : "—" },
                  { label: "上下動", value: activity.avg_vertical_oscillation ? `${activity.avg_vertical_oscillation} cm` : "—" },
                  { label: "上下動比", value: activity.avg_vertical_ratio ? `${activity.avg_vertical_ratio}%` : "—" },
                  { label: "左右バランス", value: activity.avg_gct_balance ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 運動強度 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3">運動強度</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">有酸素TE</p>
                  <TEBadge te={activity.aerobic_te} />
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">トレーニングストレス</p>
                  <p className="text-sm font-bold text-gray-900">
                    {activity.training_stress_score ? `${Math.round(activity.training_stress_score)} TSS` : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">消費カロリー</p>
                  <p className="text-sm font-bold text-gray-900">
                    {activity.calories ? `${activity.calories} kcal` : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">最大心拍数</p>
                  <p className="text-sm font-bold text-gray-900">
                    {activity.max_hr ? `${activity.max_hr} bpm` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── 体重・睡眠 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">健康データ</h3>
          {loadingHealth ? (
            <p className="text-gray-400 text-sm text-center py-3">Garmin から取得中...</p>
          ) : healthError ? (
            <p className="text-red-400 text-xs text-center py-2">{healthError}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* 体重 */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-1">
                <Scale size={20} className="text-blue-400" />
                <p className="text-xs text-gray-400">体重</p>
                <p className="text-2xl font-bold text-gray-900">
                  {weight ? `${weight}` : "—"}
                </p>
                {weight && <p className="text-xs text-gray-400">kg</p>}
              </div>
              {/* 睡眠 */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center gap-1">
                <Moon size={20} className="text-indigo-400" />
                <p className="text-xs text-gray-400">睡眠時間</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sleep ? `${sleep.totalHours}` : "—"}
                </p>
                {sleep && <p className="text-xs text-gray-400">時間</p>}
              </div>
              {sleep && (
                <div className="col-span-2 bg-indigo-50 rounded-xl p-3 flex justify-around text-center">
                  <div>
                    <p className="text-xs text-indigo-400">深い眠り</p>
                    <p className="text-sm font-bold text-indigo-800">{sleep.deepMin}分</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400">浅い眠り</p>
                    <p className="text-sm font-bold text-indigo-800">{sleep.lightMin}分</p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400">REM</p>
                    <p className="text-sm font-bold text-indigo-800">{sleep.remMin}分</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 自己評価 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3">自己評価</h3>
          {/* 星評価 */}
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                onClick={() => handleRating(r)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  fill={assessment.rating >= r ? "#f59e0b" : "none"}
                  stroke={assessment.rating >= r ? "#f59e0b" : "#d1d5db"}
                />
              </button>
            ))}
            {assessment.rating > 0 && (
              <span className="text-sm text-amber-500 font-semibold ml-1">
                {["", "悪い", "やや悪い", "普通", "良い", "最高"][assessment.rating]}
              </span>
            )}
          </div>
          <textarea
            value={assessment.comment}
            onChange={(e) => handleComment(e.target.value)}
            placeholder="今日の調子・気づいたことを記録..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
          />
        </div>

      </main>
    </div>
  );
}
