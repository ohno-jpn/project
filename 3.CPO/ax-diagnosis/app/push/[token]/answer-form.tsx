"use client";

import { useState } from "react";
import type { Question } from "@/lib/questions";

type AnswerMap = Record<string, number | number[]>;

export function AnswerForm({
  token,
  questions,
  axisLabel,
}: {
  token: string;
  questions: Question[];
  axisLabel: string;
}) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function choiceLabel(q: Question, idx: number): string {
    return q.type === "cb" || q.correctIndices ? String.fromCharCode(65 + idx) : String(idx + 1);
  }

  function handleMcSelect(qId: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  }

  function handleCbToggle(qId: string, idx: number, totalChoices: number) {
    setAnswers((prev) => {
      const cur = (prev[qId] as number[] | undefined) ?? [];
      const next = cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx];
      return { ...prev, [qId]: next };
    });
    void totalChoices;
  }

  const allAnswered = questions.every((q) => {
    const a = answers[q.id];
    if (q.type === "cb") return Array.isArray(a) && (a as number[]).length > 0;
    return typeof a === "number";
  });

  async function handleSubmit() {
    if (!allAnswered) return;
    setStatus("submitting");

    const serialized: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers)) {
      serialized[k] = JSON.stringify(v);
    }

    const res = await fetch("/api/push/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, answers: serialized }),
    });

    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "送信に失敗しました");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-6">✅</div>
        <h2 className="text-2xl font-extrabold text-white mb-3">回答を受け付けました</h2>
        <p className="text-gray-400 text-sm mb-8">
          {axisLabel} の診断結果がダッシュボードに保存されました。
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-8 py-3 rounded-full transition-colors"
        >
          ダッシュボードを見る
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {questions.map((q, qIdx) => {
        const selected = answers[q.id];
        return (
          <div key={q.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500">Q{qIdx + 1}</span>
              {q.subsection && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                  {q.subsection}
                </span>
              )}
              <span className="ml-auto text-xs text-gray-600">
                {q.type === "cb" ? "複数選択" : q.isLikert ? "5段階評価" : "単一選択"}
              </span>
            </div>

            <div className="px-6 pt-5 pb-4">
              <p className="text-sm text-gray-100 font-medium leading-relaxed mb-5">{q.text}</p>

              {q.type === "cb" ? (
                <div className="space-y-2">
                  {q.choices.map((choice, idx) => {
                    const isSelected = Array.isArray(selected) && (selected as number[]).includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleCbToggle(q.id, idx, q.choices.length)}
                        className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-blue-500/50 bg-blue-900/25 text-blue-100"
                            : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20 hover:text-gray-300"
                        }`}
                      >
                        <span className={`shrink-0 w-6 h-6 rounded border flex items-center justify-center text-xs font-bold mt-0.5 ${isSelected ? "border-blue-400 bg-blue-600 text-white" : "border-gray-600 text-gray-500"}`}>
                          {isSelected ? "✓" : choiceLabel(q, idx)}
                        </span>
                        <span className="leading-relaxed">{choice}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {q.choices.map((choice, idx) => {
                    const isSelected = selected === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleMcSelect(q.id, idx)}
                        className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          isSelected
                            ? "border-blue-500/50 bg-blue-900/25 text-blue-100"
                            : "border-white/10 bg-white/3 text-gray-400 hover:border-white/20 hover:text-gray-300"
                        }`}
                      >
                        <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5 ${isSelected ? "border-blue-400 bg-blue-600 text-white" : "border-gray-600 text-gray-500"}`}>
                          {choiceLabel(q, idx)}
                        </span>
                        <span className="leading-relaxed">{choice}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {status === "error" && (
        <p className="text-sm text-red-400 text-center">{errorMsg}</p>
      )}

      <div className="text-center pt-4">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || status === "submitting"}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-10 py-3.5 rounded-full transition-colors"
        >
          {status === "submitting" ? "送信中..." : "回答を送信する"}
        </button>
        {!allAnswered && (
          <p className="text-xs text-gray-600 mt-2">すべての問いに回答してから送信できます</p>
        )}
      </div>
    </div>
  );
}
