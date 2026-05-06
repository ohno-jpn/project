"use client";

import { useState, useTransition } from "react";
import type { PushSetting, PushAxis } from "@/lib/db/push-settings";

const AXES: { key: PushAxis; label: string; desc: string; color: string; accent: string }[] = [
  { key: "OH", label: "OH 組織Hard", desc: "戦略・基盤", color: "bg-blue-900/30 border-blue-500/30", accent: "text-blue-400" },
  { key: "OS", label: "OS 組織Soft", desc: "文化・風土", color: "bg-violet-900/30 border-violet-500/30", accent: "text-violet-400" },
  { key: "PH", label: "PH 個人Hard", desc: "テクニカルスキル", color: "bg-orange-900/30 border-orange-500/30", accent: "text-orange-400" },
  { key: "PS", label: "PS 個人Soft", desc: "スタンス・特性", color: "bg-green-900/30 border-green-500/30", accent: "text-green-400" },
];

type IntervalOption = { value: number; label: string };

const INTERVAL_OPTIONS: { group: string; options: IntervalOption[] }[] = [
  {
    group: "テスト用",
    options: [
      { value: 5,   label: "5分" },
      { value: 15,  label: "15分" },
      { value: 30,  label: "30分" },
    ],
  },
  {
    group: "時間",
    options: [
      { value: 60,  label: "1時間" },
      { value: 180, label: "3時間" },
      { value: 360, label: "6時間" },
      { value: 720, label: "12時間" },
    ],
  },
  {
    group: "日数",
    options: [
      { value: 1440,  label: "1日" },
      { value: 10080, label: "7日" },
      { value: 20160, label: "14日" },
      { value: 40320, label: "28日" },
    ],
  },
];

function formatInterval(minutes: number): string {
  if (minutes < 60)  return `${minutes}分ごと`;
  if (minutes < 1440) return `${minutes / 60}時間ごと`;
  return `${minutes / 1440}日ごと`;
}

export function SettingsForm({
  settings,
  saveAction,
  testSendAction,
}: {
  settings: PushSetting[];
  saveAction: (axis: PushAxis, intervalMinutes: number, enabled: boolean) => Promise<void>;
  testSendAction: (axis: PushAxis) => Promise<{ sent: boolean; error?: string }>;
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
            initialInterval={s?.interval_minutes && s.interval_minutes > 0 ? s.interval_minutes : 60}
            nextSendAt={s?.next_send_at ?? null}
            saveAction={saveAction}
            testSendAction={testSendAction}
          />
        );
      })}
    </div>
  );
}

function AxisCard({
  axisKey, label, desc, color, accent,
  initialEnabled, initialInterval, nextSendAt,
  saveAction, testSendAction,
}: {
  axisKey: PushAxis;
  label: string;
  desc: string;
  color: string;
  accent: string;
  initialEnabled: boolean;
  initialInterval: number;
  nextSendAt: string | null;
  saveAction: (axis: PushAxis, intervalMinutes: number, enabled: boolean) => Promise<void>;
  testSendAction: (axis: PushAxis) => Promise<{ sent: boolean; error?: string }>;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [intervalMinutes, setIntervalMinutes] = useState(initialInterval);
  const [savedMsg, setSavedMsg] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [isSaving, startSave] = useTransition();
  const [isTesting, startTest] = useTransition();

  function handleSave() {
    startSave(async () => {
      await saveAction(axisKey, intervalMinutes, enabled);
      setSavedMsg("保存しました ✓");
      setTimeout(() => setSavedMsg(""), 2500);
    });
  }

  function handleTest() {
    startTest(async () => {
      setTestMsg("送信中...");
      const result = await testSendAction(axisKey);
      if (result.sent) {
        setTestMsg("メール送信しました ✉️");
      } else {
        setTestMsg(`失敗: ${result.error ?? "不明なエラー"}`);
      }
      setTimeout(() => setTestMsg(""), 4000);
    });
  }

  return (
    <div className={`rounded-2xl border p-6 ${color}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className={`text-sm font-extrabold ${accent}`}>{label}</span>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
        <button
          onClick={() => setEnabled((v) => !v)}
          aria-label={enabled ? "無効にする" : "有効にする"}
          className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${
            enabled ? "bg-blue-500" : "bg-gray-700"
          }`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`} />
        </button>
      </div>

      {/* 間隔選択 */}
      {enabled && (
        <div className="mb-5 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">送信間隔</p>
          {INTERVAL_OPTIONS.map(({ group, options }) => (
            <div key={group}>
              <p className="text-xs text-gray-600 mb-1.5">{group}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(({ value, label: optLabel }) => (
                  <button
                    key={value}
                    onClick={() => setIntervalMinutes(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      intervalMinutes === value
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {optLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {nextSendAt && (
            <p className="text-xs text-gray-600 pt-1">
              次回送信予定：{new Date(nextSendAt).toLocaleString("ja-JP", {
                year: "numeric", month: "long", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}（{formatInterval(intervalMinutes)}）
            </p>
          )}
        </div>
      )}

      {/* アクションボタン */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors disabled:opacity-50"
        >
          {isSaving ? "保存中..." : savedMsg || "保存する"}
        </button>

        {enabled && (
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="text-xs font-bold px-4 py-1.5 rounded-full bg-blue-700/40 hover:bg-blue-700/60 text-blue-300 border border-blue-600/40 transition-colors disabled:opacity-50"
          >
            {isTesting ? "送信中..." : testMsg || "今すぐテスト送信 ✉"}
          </button>
        )}
      </div>
    </div>
  );
}
