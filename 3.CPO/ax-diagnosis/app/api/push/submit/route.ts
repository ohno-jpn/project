import { NextRequest, NextResponse } from "next/server";
import {
  getPushToken,
  markTokenAnswered,
  savePushDiagnosis,
  type PushAxis,
} from "@/lib/db/push-settings";
import { ALL_QUESTIONS, scoreQuestion, type Axis } from "@/lib/questions";

const AXIS_TO_QUESTION_AXIS: Record<PushAxis, Axis> = {
  OH: "org_hard",
  OS: "org_soft",
  PH: "ind_hard",
  PS: "ind_soft",
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.token || !body?.answers) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const { token, answers } = body as { token: string; answers: Record<string, string> };

  const pushToken = await getPushToken(token);

  if (!pushToken) {
    return NextResponse.json({ error: "無効なトークンです" }, { status: 404 });
  }
  if (pushToken.answered_at) {
    return NextResponse.json({ error: "既に回答済みです" }, { status: 409 });
  }
  if (new Date(pushToken.expires_at) < new Date()) {
    return NextResponse.json({ error: "有効期限切れです" }, { status: 410 });
  }

  // スコア計算
  const questionIds: string[] = pushToken.question_ids ?? [];
  const questions = ALL_QUESTIONS.filter((q) => questionIds.includes(q.id));
  const questionAxis = AXIS_TO_QUESTION_AXIS[pushToken.axis];
  const axisQuestions = questions.filter((q) => q.axis === questionAxis);

  let totalScore = 0;
  let scored = 0;
  for (const q of axisQuestions) {
    const rawAnswer = answers[q.id];
    if (!rawAnswer) continue;
    try {
      const parsed = JSON.parse(rawAnswer) as number | number[];
      totalScore += scoreQuestion(q, parsed);
      scored++;
    } catch { /* ignore */ }
  }

  const axisScore = scored > 0 ? Math.round(totalScore / scored) : 0;

  // 診断結果を保存
  const result = await savePushDiagnosis(
    pushToken.clerk_user_id,
    pushToken.axis,
    axisScore,
    answers
  );

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // トークンに回答済みを記録
  await markTokenAnswered(pushToken.id, result.id);

  return NextResponse.json({ success: true, diagnosisId: result.id, score: axisScore });
}
