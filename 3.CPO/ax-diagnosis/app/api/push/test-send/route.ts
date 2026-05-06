import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import {
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

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const { axis, intervalMinutes } = await req.json() as {
    axis: PushAxis;
    intervalMinutes: number;
  };

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "メールアドレスが取得できません" }, { status: 400 });
  }

  const userName = user?.firstName ?? user?.lastName ?? "ユーザー";

  // Checkup(level2) + Biopsy(level3) からランダムに4問選択
  const questionAxis = AXIS_TO_QUESTION_AXIS[axis];
  const pool = ALL_QUESTIONS.filter(
    (q) => (q.level === 2 || q.level === 3) && q.axis === questionAxis
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  const questionIds = selected.map((q) => q.id);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const tokenResult = await createPushToken(userId, axis, questionIds, expiresAt);
  if ("error" in tokenResult) {
    return NextResponse.json({ error: tokenResult.error }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const answerUrl = `${appUrl}/push/${tokenResult.token}`;
  const axisLabel = AXIS_LABELS[axis];

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "AX-Diagnosis <onboarding@resend.dev>",
    to: email,
    subject: `【テスト】AX-Diagnosis 定期診断：${axisLabel}`,
    html: buildPushEmailHtml(userName, axisLabel, answerUrl, expiresAt),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 次回送信時刻を更新
  if (intervalMinutes > 0) {
    await updateNextSendAt(userId, axis, intervalMinutes);
  }

  void clerkClient;
  return NextResponse.json({ sent: true });
}

function buildPushEmailHtml(
  userName: string,
  axisLabel: string,
  answerUrl: string,
  expiresAt: Date
): string {
  const deadline = expiresAt.toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
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
        <strong style="color:#111827;">${axisLabel}</strong> の設問（4問）をランダムに選びました。<br>
        回答は約3〜5分で完了します。
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${answerUrl}"
           style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;padding:14px 40px;border-radius:9999px;text-decoration:none;">
          診断に回答する →
        </a>
      </div>
      <div style="background:#f9fafb;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <p style="font-size:12px;color:#6b7280;margin:0;">
          ⏰ このリンクの有効期限は <strong>${deadline}</strong> までです。
        </p>
      </div>
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        このメールはAX-Diagnosisの定期診断設定に基づき送信されています。<br>
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
