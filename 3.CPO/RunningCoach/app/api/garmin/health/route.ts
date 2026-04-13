import { NextRequest, NextResponse } from "next/server";
import { GarminConnect } from "garmin-connect";
import { existsSync } from "fs";
import { join } from "path";

const TOKEN_DIR = join(process.cwd(), ".garmin-tokens");

async function getGarminClient() {
  const client = new GarminConnect({ username: "", password: "" });
  if (existsSync(join(TOKEN_DIR, "oauth2_token.json"))) {
    client.loadTokenByFile(TOKEN_DIR);
  } else if (process.env.GARMIN_EMAIL && process.env.GARMIN_PASSWORD) {
    await client.login(process.env.GARMIN_EMAIL, process.env.GARMIN_PASSWORD);
  } else {
    throw new Error("Garmin 認証トークンが見つかりません。`npm run garmin-auth` を実行してください。");
  }
  return client;
}

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const date = new Date(dateStr + "T00:00:00");

  let weight: number | null = null;
  let sleep: { totalHours: number; deepMin: number; lightMin: number; remMin: number } | null = null;

  try {
    const garmin = await getGarminClient();

    // 体重
    try {
      const weightData = await garmin.getDailyWeightData(date);
      const list = (weightData as { dateWeightList?: { weight: number }[] })?.dateWeightList;
      if (list && list.length > 0) {
        weight = Math.round((list[list.length - 1].weight / 1000) * 10) / 10;
      }
    } catch { /* 体重データ取得失敗は無視 */ }

    // 睡眠
    try {
      const sleepData = await garmin.getSleepData(date);
      const dto = (sleepData as {
        dailySleepDTO?: {
          sleepTimeSeconds?: number;
          deepSleepSeconds?: number;
          lightSleepSeconds?: number;
          remSleepSeconds?: number;
        }
      })?.dailySleepDTO;
      if (dto) {
        sleep = {
          totalHours: Math.round(((dto.sleepTimeSeconds ?? 0) / 3600) * 10) / 10,
          deepMin: Math.round((dto.deepSleepSeconds ?? 0) / 60),
          lightMin: Math.round((dto.lightSleepSeconds ?? 0) / 60),
          remMin: Math.round((dto.remSleepSeconds ?? 0) / 60),
        };
      }
    } catch { /* 睡眠データ取得失敗は無視 */ }

    return NextResponse.json({ weight, sleep });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: message, weight: null, sleep: null }, { status: 500 });
  }
}
