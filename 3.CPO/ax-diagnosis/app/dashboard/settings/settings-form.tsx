"use client";

import { useState, useTransition } from "react";
import type { PushSetting, PushAxis } from "@/lib/db/push-settings";

const AXES: { key: PushAxis; label: string; desc: string; color: string; accent: string }[] = [
  { key: "OH", label: "OH 組織Hard", desc: "戦略・基盤", color: "bg-blue-900/30 border-blue-500/30", accent: "text-blue-400" },
  { key: "OS", label: "OS 組織Soft", desc: "文化・風土", color: "bg-violet-900/30 border-violet-500/30", accent: "text-violet-400" },
  { key: "PH", label: "PH 個人Hard", desc: "テクニカルスキル", color: "bg-orange-900/30 border-orange-500/30", accent: "text-orange-400" },
  { key: "PS", label: "PS 個人Soft", desc: "スタンス・特性", color: "bg-green-900/30 border-green-500/30", accent: "text-green-400" },
];

export function SettingsForm({
  settings,
  saveAction,
}: {
  settings: PushSetting[];
  saveAction: (axis: PushAxis, intervalDays: number, enabled: boolean) => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {AXES.map((ax) => {
        const s = settings.find((x) => x.axis === ax.key);
        return (
          <AxisCard
            key={ax.key}
            axisKey={ax.key}
            label={ax.label}
            desc={ax.desc}
            color={ax.color}
            accent={ax.accent}
            initialEnabled={s?.enabled ?? false}
            initialInterval={s?.interval_days && s.interval_days > 0 ? s.interval_days : 7}
            nextSendAt={s?.next_send_at ?? null}
            saveAction={saveAction}
          />
        );
      })}
    </div>
  );
}

function AxisCard({
  axisKey,
  label,
  desc,
  color,
  accent,
  initialEnabled,
  initialInterval,
  nextSendAt,
  saveAction,
}: {
  axisKey: PushAxis;
  label: string;
  desc: string;
  color: string;
  accent: string;
  initialEnabled: boolean;
  initialInterval: number;
  nextSendAt: string | null;
  saveAction: (axis: PushAxis, intervalDays: number, enabled: boolean) => Promise<void>;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [intervalDays, setIntervalDays] = useState<number>(initialInterval);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await saveAction(axisKey, intervalDays, enabled);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className={`rounded-2xl border p-6 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className={`text-sm font-extrabold ${accent}`}>{label}</span>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        {/* トグル */}
        <button
          onClick={() => setEnabled((v) => !v)}
          aria-label={enabled ? "無効にする" : "有効にする"}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${
            enabled ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">送信間隔</p>
          <div className="flex gap-2">
            {([7, 14, 28] as const).map((d) => (
              <button
                key={d}
                onClick={() => setIntervalDays(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  intervalDays === d
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {d}日ごと
              </button>
            ))}
          </div>
          {nextSendAt && (
            <p className="text-xs text-gray-600 mt-2">
              次回送信予定：{new Date(nextSendAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={isPending}
        className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-50"
      >
        {isPending ? "保存中..." : saved ? "保存しました ✓" : "保存する"}
      </button>
    </div>
  );
}
