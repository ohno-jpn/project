"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";

export interface SaveDiagnosisInput {
  depth: "hook" | "checkup" | "biopsy";
  scores: { org_hard: number; org_soft: number; ind_hard: number; ind_soft: number };
  answers: Record<string, string>;
}

export interface DiagnosisRecord {
  id: string;
  depth: string;
  oh_score: number | null;
  os_score: number | null;
  ph_score: number | null;
  ps_score: number | null;
  total_score: number | null;
  status: string;
  created_at: string;
}

export async function saveDiagnosis(input: SaveDiagnosisInput): Promise<{ id: string } | { error: string }> {
  const { userId } = await auth();
  if (!userId) return { error: "認証が必要です" };

  const supabase = createServerClient();
  const total = Math.round(
    (input.scores.org_hard + input.scores.org_soft + input.scores.ind_hard + input.scores.ind_soft) / 4
  );

  const { data, error } = await supabase
    .from("diagnoses")
    .insert({
      clerk_user_id: userId,
      depth: input.depth,
      oh_score: input.scores.org_hard,
      os_score: input.scores.org_soft,
      ph_score: input.scores.ind_hard,
      ps_score: input.scores.ind_soft,
      total_score: total,
      status: "completed",
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "保存に失敗しました" };

  const diagnosisId = (data as { id: string }).id;

  const answerRows = Object.entries(input.answers).map(([question_id, answer]) => ({
    diagnosis_id: diagnosisId,
    question_id,
    answer,
  }));

  if (answerRows.length > 0) {
    await supabase.from("diagnosis_answers").insert(answerRows);
  }

  return { id: diagnosisId };
}

export async function getDiagnoses(): Promise<DiagnosisRecord[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const supabase = createServerClient();
  const { data } = await supabase
    .from("diagnoses")
    .select("id, depth, oh_score, os_score, ph_score, ps_score, total_score, status, created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data as DiagnosisRecord[]) ?? [];
}

export async function getDiagnosisById(id: string): Promise<(DiagnosisRecord & { answers: { question_id: string; answer: string }[] }) | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServerClient();
  const { data } = await supabase
    .from("diagnoses")
    .select("id, depth, oh_score, os_score, ph_score, ps_score, total_score, status, created_at")
    .eq("id", id)
    .eq("clerk_user_id", userId)
    .single();

  if (!data) return null;

  const { data: answers } = await supabase
    .from("diagnosis_answers")
    .select("question_id, answer")
    .eq("diagnosis_id", id);

  return { ...(data as DiagnosisRecord), answers: (answers as { question_id: string; answer: string }[]) ?? [] };
}
