import { createServerClient } from "@/lib/supabase/server";

export type PushAxis = "OH" | "OS" | "PH" | "PS";

export interface PushSetting {
  id: string;
  clerk_user_id: string;
  axis: PushAxis;
  interval_days: number;
  enabled: boolean;
  next_send_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PushToken {
  id: string;
  clerk_user_id: string;
  axis: PushAxis;
  token: string;
  question_ids: string[];
  sent_at: string;
  expires_at: string;
  answered_at: string | null;
  diagnosis_id: string | null;
}

export async function getPushSettings(userId: string): Promise<PushSetting[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("push_settings")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("axis");
  return (data as PushSetting[]) ?? [];
}

export async function upsertPushSetting(
  userId: string,
  axis: PushAxis,
  intervalDays: number,
  enabled: boolean
): Promise<void> {
  const supabase = createServerClient();
  const nextSendAt =
    enabled && intervalDays > 0
      ? new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  await supabase.from("push_settings").upsert(
    {
      clerk_user_id: userId,
      axis,
      interval_days: intervalDays,
      enabled,
      next_send_at: nextSendAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id,axis" }
  );
}

export async function getPushSettingsDue(): Promise<PushSetting[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("push_settings")
    .select("*")
    .eq("enabled", true)
    .not("next_send_at", "is", null)
    .lte("next_send_at", new Date().toISOString());
  return (data as PushSetting[]) ?? [];
}

export async function createPushToken(
  userId: string,
  axis: PushAxis,
  questionIds: string[],
  expiresAt: Date
): Promise<{ token: string } | { error: string }> {
  const supabase = createServerClient();
  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, "");

  const { error } = await supabase.from("push_tokens").insert({
    clerk_user_id: userId,
    axis,
    token,
    question_ids: questionIds,
    expires_at: expiresAt.toISOString(),
  });

  if (error) return { error: error.message };
  return { token };
}

export async function getPushToken(token: string): Promise<PushToken | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("push_tokens")
    .select("*")
    .eq("token", token)
    .single();
  return (data as PushToken) ?? null;
}

export async function markTokenAnswered(
  tokenId: string,
  diagnosisId: string
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("push_tokens")
    .update({ answered_at: new Date().toISOString(), diagnosis_id: diagnosisId })
    .eq("id", tokenId);
}

export async function updateNextSendAt(
  userId: string,
  axis: PushAxis,
  intervalDays: number
): Promise<void> {
  const supabase = createServerClient();
  await supabase
    .from("push_settings")
    .update({
      next_send_at: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId)
    .eq("axis", axis);
}

export async function savePushDiagnosis(
  userId: string,
  axis: PushAxis,
  axisScore: number,
  answers: Record<string, string>
): Promise<{ id: string } | { error: string }> {
  const supabase = createServerClient();

  const scoreFields: Record<PushAxis, string> = {
    OH: "oh_score",
    OS: "os_score",
    PH: "ph_score",
    PS: "ps_score",
  };

  const { data, error } = await supabase
    .from("diagnoses")
    .insert({
      clerk_user_id: userId,
      depth: `push-${axis}`,
      [scoreFields[axis]]: axisScore,
      total_score: axisScore,
      status: "completed",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "保存に失敗しました" };

  const diagnosisId = (data as { id: string }).id;
  const answerRows = Object.entries(answers).map(([question_id, answer]) => ({
    diagnosis_id: diagnosisId,
    question_id,
    answer,
  }));

  if (answerRows.length > 0) {
    await supabase.from("diagnosis_answers").insert(answerRows);
  }

  return { id: diagnosisId };
}
