import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import {
  getPushSettingsDue,
  createPushToken,
  updateNextSendAt,
  type PushAxis,
} from "@/lib/db/push-settings";
import { ALL_QUESTIONS, type Axis } from "@/lib/questions";

const resend = new Resend(process.env.RESEND_API_KEY!);

const AXIS_TO_QUESTION_AXIS: Record<PushAxis, Axis> = {
  OH: "org_hard",
  OS: "org_soft",
  PH: "ind_hard",
  PS: "ind_soft",
};

const AXIS_LABELS: Record<PushAxis, string> = {
  OH: "OH 組織Hard（戦略・基盤）",
  OS: "OS 組織Soft（文化・風土）",
  PH: "PH 個人Hard（テクニカルスキル）",
  PS: "PS 個人Soft（スタンス・特性）",
};

export async function GET(req: NextRequest) {
  // Vercel Cron 認証
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
      // Clerkからユーザー情報を取得
      const user = await clerk.users.getUser(setting.clerk_user_id);
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (!email) continue;

      const userName = user.firstName ?? user.lastName ?? "ユーザー";

      // 該当軸のLevel 2設問を取得
      const questionAxis = AXIS_TO_QUESTION_AXIS[setting.axis];
      const questions = ALL_QUESTIONS.filter(
        (q) => q.level === 2 && q.axis === questionAxis
      );
      if (questions.length === 0) continue;

      const questionIds = questions.map((q) => q.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // トークン生成
      const tokenResult = await createPushToken(
        setting.clerk_user_id,
        setting.axis,
        questionIds,
        expiresAt
      );
      if ("error" in tokenResult) {
        failed++;
        continue;
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const answerUrl = `${appUrl}/push/${tokenResult.token}`;
      const axisLabel = AXIS_LABELS[setting.axis];

      // メール送信
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "AX-Diagnosis <onboarding@resend.dev>",
        to: email,
        subject: `【AX-Diagnosis】定期診断：${axisLabel}`,
        html: buildPushEmailHtml(userName, axisLabel, answerUrl, expiresAt),
      });

      if (error) {
        failed++;
        continue;
      }

      // 次回送信日時を更新
      await updateNextSendAt(setting.clerk_user_id, setting.axis, setting.interval_days);
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ processed: settings.length, sent, failed });
}

function buildPushEmailHtml(
  userName: string,
  axisLabel: string,
  answerUrl: string,
  expiresAt: Date
): string {
  const deadline = expiresAt.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:#111827;padding:32px 40px;">
      <p style="font-size:12px;color:#6b7280;font-weight:700;letter-spacing:0.12em;margin:0 0 8px;">AX-DIAGNOSIS</p>
      <h1 style="font-size:20px;font-weight:800;color:#ffffff;margin:0;line-height:1.3;">定期診断が届きました</h1>
      <p style="font-size:13px;color:#9ca3af;margin:8px 0 0;">${axisLabel}</p>
    </div>

    <div style="padding:32px 40px;">
      <p style="font-size:15px;color:#374151;margin:0 0 8px;">${escapeHtml(userName)}さん、こんにちは。</p>
      <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.8;">
        定期プッシュ診断の時間です。<strong style="color:#111827;">${axisLabel}</strong> の設問（4問）に回答してください。<br>
        回答は約3〜5分で完了します。
      </p>

      <div style="text-align:center;margin:32px 0;">
        <a href="${answerUrl}"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;padding:14px 40px;border-radius:9999px;text-decoration:none;letter-spacing:0.02em;">
          診断に回答する →
        </a>
      </div>

      <div style="background:#f9fafb;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="font-size:12px;color:#6b7280;margin:0;">
          ⏰ このリンクの有効期限は <strong>${deadline}</strong> までです。
        </p>
      </div>

      <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.7;">
        このメールはAX-Diagnosisの定期診断設定に基づき自動送信されています。<br>
        設定変更は <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard/settings" style="color:#3b82f6;">ダッシュボード設定</a> から行えます。
      </p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
