import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getPushSettingsDue } from "@/lib/db/push-settings";
import { sendPushEmail } from "@/lib/push-sender";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getPushSettingsDue();
  if (settings.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const clerk = await clerkClient();
  let sent = 0;
  let failed = 0;

  for (const setting of settings) {
    try {
      const user = await clerk.users.getUser(setting.clerk_user_id);
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (!email) { failed++; continue; }

      const userName = user.firstName ?? user.lastName ?? "ユーザー";

      const result = await sendPushEmail({
        userId: setting.clerk_user_id,
        email,
        userName,
        axis: setting.axis,
        intervalMinutes: setting.interval_minutes,
      });

      result.sent ? sent++ : failed++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ processed: settings.length, sent, failed });
}
