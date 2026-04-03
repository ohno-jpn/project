import type { GarminActivity } from "./types";

/**
 * GARMIN ConnectからエクスポートしたCSVを解析してGarminActivity[]に変換する
 */
export function parseGarminCSV(csvText: string): GarminActivity[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const activities: GarminActivity[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 5) continue;

    const get = (key: string): string => {
      const idx = headers.indexOf(key);
      return idx >= 0 ? (values[idx] ?? "").trim() : "";
    };

    const toNum = (key: string): number | undefined => {
      const v = get(key);
      const n = parseFloat(v.replace(/[^\d.-]/g, ""));
      return isNaN(n) ? undefined : n;
    };

    const activity: GarminActivity = {
      activityType: get("Activity Type"),
      date: get("Date"),
      title: get("Title"),
      distanceKm: toNum("Distance") ?? 0,
      calories: toNum("Calories") ?? 0,
      time: get("Time"),
      movingTime: get("Moving Time"),
      elapsedTime: get("Elapsed Time"),

      avgHR: toNum("Avg HR"),
      maxHR: toNum("Max HR"),
      aerobicTE: toNum("Aerobic TE"),

      avgPacePerKm: get("Avg Pace"),
      bestPacePerKm: get("Best Pace"),
      avgGAP: get("Avg GAP"),

      avgCadence: toNum("Avg Run Cadence"),
      maxCadence: toNum("Max Run Cadence"),
      avgStrideLength: toNum("Avg Stride Length"),
      avgVerticalRatio: toNum("Avg Vertical Ratio"),
      avgVerticalOscillation: toNum("Avg Vertical Oscillation"),
      avgGroundContactTime: toNum("Avg Ground Contact Time"),
      avgGCTBalance: get("Avg GCT Balance"),

      normalizedPower: toNum("Normalized Power\u00ae (NP\u00ae)"),
      avgPower: toNum("Avg Power"),
      maxPower: toNum("Max Power"),
      trainingStressScore: toNum("Training Stress Score\u00ae"),

      totalAscent: toNum("Total Ascent"),
      totalDescent: toNum("Total Descent"),
      minElevation: toNum("Min Elevation"),
      maxElevation: toNum("Max Elevation"),

      minTemp: toNum("Min Temp"),
      maxTemp: toNum("Max Temp"),
      avgResp: toNum("Avg Resp"),
      minResp: toNum("Min Resp"),
      maxResp: toNum("Max Resp"),
      bodyBatteryDrain: toNum("Body Battery Drain"),
      steps: toNum("Steps"),
      numberOfLaps: toNum("Number of Laps"),
      bestLapTime: get("Best Lap Time"),
    };

    activities.push(activity);
  }

  return activities;
}

/** ダブルクォートを考慮したCSVの1行パース */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * ペース文字列 "MM:SS" を秒に変換
 */
export function paceToSeconds(pace: string): number {
  if (!pace) return 0;
  const [min, sec] = pace.split(":").map(Number);
  return (min || 0) * 60 + (sec || 0);
}

/**
 * 秒をペース文字列 "MM:SS" に変換
 */
export function secondsToPace(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

/**
 * 目標タイム "HH:MM:SS" と距離(km)からkm/paceを計算
 */
export function calcTargetPace(targetTime: string, distanceKm: number): string {
  const [h, m, s] = targetTime.split(":").map(Number);
  const totalSeconds = h * 3600 + m * 60 + s;
  const paceSeconds = totalSeconds / distanceKm;
  return secondsToPace(paceSeconds);
}

/**
 * 2つの日付の差を日数で返す
 */
export function daysUntil(targetDate: string): number {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
