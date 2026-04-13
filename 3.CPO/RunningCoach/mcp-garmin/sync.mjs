#!/usr/bin/env node
/**
 * Garmin → Supabase 同期スクリプト（単体実行用）
 * 使い方: node mcp-garmin/sync.mjs [days]
 */

import { createClient } from "@supabase/supabase-js";
import { GarminConnect } from "garmin-connect";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const TOKEN_DIR = join(ROOT_DIR, ".garmin-tokens");

// .env.local 読み込み
const envPath = join(ROOT_DIR, ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq > 0) {
      const k = t.slice(0, eq).trim();
      const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fetchHrZones(garmin, activityId) {
  try {
    const zones = await garmin.get(
      `https://connectapi.garmin.com/activity-service/activity/${activityId}/hrTimeInZones`
    );
    if (Array.isArray(zones) && zones.length > 0) {
      return zones.map((z) => ({
        zone: z.zoneNumber,
        seconds: Math.round(z.secsInZone ?? 0),
      }));
    }
  } catch {
    // 取得失敗は無視
  }
  return null;
}

async function upsertActivity(garmin, raw) {
  const distanceKm = Number(raw.distance ?? 0) / 1000;
  const durationSec = Number(raw.duration ?? 0);
  const avgPaceSec = distanceKm > 0 ? Math.round(durationSec / distanceKm) : null;

  const row = {
    id: String(raw.activityId),
    date: (raw.startTimeLocal ?? raw.startTimeGMT ?? "").slice(0, 10),
    title: raw.activityName ?? "",
    activity_type: raw.activityType?.typeKey ?? "running",
    distance_km: Math.round(distanceKm * 1000) / 1000,
    duration_sec: Math.round(durationSec),
    calories: Math.round(Number(raw.calories ?? 0)),
    avg_hr: raw.averageHR ? Math.round(Number(raw.averageHR)) : null,
    max_hr: raw.maxHR ? Math.round(Number(raw.maxHR)) : null,
    aerobic_te: raw.aerobicTrainingEffect ? Number(raw.aerobicTrainingEffect) : null,
    avg_pace_sec_per_km: avgPaceSec,
    avg_cadence: raw.averageRunningCadenceInStepsPerMinute ? Math.round(Number(raw.averageRunningCadenceInStepsPerMinute)) : null,
    max_cadence: raw.maxRunningCadenceInStepsPerMinute ? Math.round(Number(raw.maxRunningCadenceInStepsPerMinute)) : null,
    avg_stride_length: raw.avgStrideLength ? Number(raw.avgStrideLength) : null,
    avg_vertical_oscillation: raw.avgVerticalOscillation ? Number(raw.avgVerticalOscillation) : null,
    avg_ground_contact_time: raw.avgGroundContactTime ? Math.round(Number(raw.avgGroundContactTime)) : null,
    avg_vertical_ratio: raw.avgVerticalRatio ? Number(raw.avgVerticalRatio) : null,
    normalized_power: raw.normPower ? Math.round(Number(raw.normPower)) : null,
    avg_power: raw.avgPower ? Math.round(Number(raw.avgPower)) : null,
    max_power: raw.maxPower ? Math.round(Number(raw.maxPower)) : null,
    training_stress_score: raw.trainingStressScore ? Number(raw.trainingStressScore) : null,
    total_ascent: raw.elevationGain ? Number(raw.elevationGain) : null,
    total_descent: raw.elevationLoss ? Number(raw.elevationLoss) : null,
    min_temp: raw.minTemperature ? Number(raw.minTemperature) : null,
    max_temp: raw.maxTemperature ? Number(raw.maxTemperature) : null,
    steps: raw.steps ? Number(raw.steps) : null,
    raw_json: raw,
    synced_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("activities").upsert(row, { onConflict: "id" });
  if (error) throw new Error(`activities upsert 失敗: ${error.message}`);

  const hrZonesData = await fetchHrZones(garmin, row.id);
  if (hrZonesData) {
    const totalSec = hrZonesData.reduce((s, z) => s + z.seconds, 0);
    const zoneRows = hrZonesData.map((z) => ({
      activity_id: row.id,
      zone: z.zone,
      seconds: z.seconds,
      percentage: totalSec > 0 ? Math.round((z.seconds / totalSec) * 10000) / 100 : 0,
    }));
    const { error: zErr } = await supabase.from("hr_zones").upsert(zoneRows, { onConflict: "activity_id,zone" });
    if (zErr) throw new Error(`hr_zones upsert 失敗: ${zErr.message}`);
  }

  return { ...row, _hasZone: !!hrZonesData };
}

async function main() {
  const days = Number(process.argv[2] ?? 90);
  console.log(`\n=== Garmin → Supabase 同期 (直近 ${days} 日) ===\n`);

  const garmin = new GarminConnect({ username: "", password: "" });
  garmin.loadTokenByFile(TOKEN_DIR);
  console.log("[1/3] Garmin トークン読み込み完了");

  const rawList = await garmin.getActivities(0, 200);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = rawList.filter((a) => {
    const d = new Date(a.startTimeLocal ?? a.startTimeGMT ?? 0);
    const type = String(a.activityType?.typeKey ?? "").toLowerCase();
    return d >= cutoff && (type.includes("running") || Number(a.distance ?? 0) > 0);
  });

  console.log(`[2/3] 対象アクティビティ: ${filtered.length} 件`);

  let saved = 0;
  let withZones = 0;
  for (const raw of filtered) {
    const row = await upsertActivity(garmin, raw);
    saved++;

    const hasZone = row._hasZone;
    if (hasZone) withZones++;

    const paceStr = row.avg_pace_sec_per_km
      ? `${Math.floor(row.avg_pace_sec_per_km / 60)}:${String(row.avg_pace_sec_per_km % 60).padStart(2, "0")}/km`
      : "—";
    console.log(`  ✓ ${row.date}  ${row.distance_km?.toFixed(2)}km  ${paceStr}  HR:${row.avg_hr ?? "—"}${hasZone ? " [ゾーンあり]" : ""}`);
  }

  console.log(`\n[3/3] 完了: ${saved} 件保存 (うち心拍ゾーンデータ: ${withZones} 件)\n`);
}

main().catch((e) => {
  console.error("\nエラー:", e.message);
  process.exit(1);
});
