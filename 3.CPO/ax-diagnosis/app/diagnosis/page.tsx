"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronLeft, CheckCircle, RotateCcw, BarChart3 } from "lucide-react";
import {
  getQuestionsByLevel,
  computeAxisScores,
  scoreQuestion,
  AXIS_LABELS,
  AXIS_DESC,
  type Question,
  type Axis,
} from "@/lib/questions";

type Level = 1 | 2 | 3;
type Step = "intro" | "question" | "result";

const LEVEL_META: Record<Level, { label: string; questions: string; time: string; desc: string }> = {
  1: { label: "Hook", questions: "4問", time: "約2分", desc: "4軸それぞれの代表質問で現状を素早く把握します。" },
  2: { label: "Checkup", questions: "16問", time: "約8分", desc: "各軸4問ずつ、シナリオ選択と知識問題で詳細を診断します。" },
  3: { label: "Biopsy", questions: "64問", time: "約20分", desc: "全64問の詳細診断で組織・個人の強みと弱点を完全把握します。" },
};

const AXIS_ORDER: Axis[] = ["org_hard", "org_soft", "ind_hard", "ind_soft"];

const AXIS_COLOR: Record<Axis, string> = {
  org_hard: "#2563eb",
  org_soft: "#7c3aed",
  ind_hard: "#ea580c",
  ind_soft: "#16a34a",
};

const SCORE_LEVELS = [
  { min: 80, label: "先進", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { min: 60, label: "発展", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { min: 40, label: "整備中", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { min: 0, label: "初期", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
];

function getScoreLevel(score: number) {
  return SCORE_LEVELS.find((l) => score >= l.min) ?? SCORE_LEVELS[3];
}

function ScoreRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" className="-rotate-90">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <circle
        cx="18" cy="18" r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DiagnosisPage() {
  const [step, setStep] = useState<Step>("intro");
  const [level, setLevel] = useState<Level>(2);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [cbSelections, setCbSelections] = useState<number[]>([]);

  const questions = useMemo(() => getQuestionsByLevel(level), [level]);
  const totalQ = questions.length;
  const currentQ: Question | undefined = questions[currentIndex];

  function startDiagnosis() {
    setAnswers({});
    setCbSelections([]);
    setCurrentIndex(0);
    setStep("question");
  }

  function handleMcSelect(idx: number) {
    if (!currentQ) return;
    const next = { ...answers, [currentQ.id]: idx };
    setAnswers(next);
    setTimeout(() => advance(next), 300);
  }

  function handleCbToggle(idx: number) {
    setCbSelections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }

  function submitCb() {
    if (!currentQ) return;
    const next = { ...answers, [currentQ.id]: cbSelections };
    setAnswers(next);
    setCbSelections([]);
    advance(next);
  }

  function advance(ans: Record<string, number | number[]>) {
    if (currentIndex + 1 >= totalQ) {
      setAnswers(ans);
      setStep("result");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (currentIndex === 0) {
      setStep("intro");
    } else {
      setCurrentIndex((i) => i - 1);
      if (currentQ?.type === "cb") setCbSelections([]);
    }
  }

  function reset() {
    setAnswers({});
    setCbSelections([]);
    setCurrentIndex(0);
    setStep("intro");
  }

  const axisScores = useMemo(
    () => computeAxisScores(questions, answers),
    [questions, answers]
  );

  const totalScore = useMemo(() => {
    const vals = Object.values(axisScores);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  }, [axisScores]);

  // ── Intro screen ──────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-6 py-16">
        <a href="/" className="text-blue-600 text-sm font-semibold mb-10 hover:underline">
          ← トップに戻る
        </a>
        <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
          AX診断スタート
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
          診断レベルを選択してください
        </h1>
        <p className="text-gray-500 text-center mb-10 max-w-lg">
          組織のAXトランスフォーメーション準備状況を、4軸（組織×Hard・Soft、個人×Hard・Soft）でスコアリングします。
        </p>

        <div className="grid md:grid-cols-3 gap-6 w-full max-w-3xl mb-10">
          {([1, 2, 3] as Level[]).map((lv) => {
            const meta = LEVEL_META[lv];
            const selected = level === lv;
            return (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                className={`rounded-2xl border-2 p-6 text-left transition-all ${
                  selected
                    ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold uppercase tracking-widest ${selected ? "text-blue-600" : "text-gray-400"}`}>
                    Level {lv}
                  </span>
                  {selected && <CheckCircle size={18} className="text-blue-600" />}
                </div>
                <p className="text-xl font-extrabold text-gray-900 mb-1">{meta.label}</p>
                <p className="text-sm text-gray-500 mb-3">{meta.questions}・{meta.time}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{meta.desc}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={startDiagnosis}
          className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold px-12 py-4 rounded-full shadow-lg shadow-orange-200 transition-all hover:scale-105"
        >
          診断を始める →
        </button>
        <p className="mt-4 text-sm text-gray-400">所要時間: {LEVEL_META[level].time}</p>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (step === "result") {
    const totalLevel = getScoreLevel(totalScore);

    const axisAdvice: Record<Axis, string> = {
      org_hard: axisScores.org_hard >= 60
        ? "戦略・基盤の整備が進んでいます。さらなる高度化（API連携・継続改善ループ）を目指しましょう。"
        : "全社AI戦略のKGI設定・ガバナンス整備・データ基盤構築を優先的に進めることを推奨します。",
      org_soft: axisScores.org_soft >= 60
        ? "学習する組織文化が醸成されています。ナレッジ共有の仕組みと評価制度のさらなる連動を検討しましょう。"
        : "挑戦文化の醸成と、失敗を許容する心理的安全性の向上が急務です。まずは経営層の率先垂範から始めましょう。",
      ind_hard: axisScores.ind_hard >= 60
        ? "AI技術の理解度が高い状態です。RAG・ワークフロー設計など応用・実装スキルの深化を図りましょう。"
        : "AIの基礎知識・セキュリティリスク・プロンプト技術の習得が必要です。体系的なリスキリングプログラムを設計しましょう。",
      ind_soft: axisScores.ind_soft >= 60
        ? "AI活用の姿勢・思考習慣が身についています。周囲への横展開・メンタリングで組織全体を牽引しましょう。"
        : "業務課題の設定力・批判的思考・開放的なスタンスを育てる研修や1on1フォローを実施しましょう。",
    };

    return (
      <div className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className={`inline-block text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase ${totalLevel.bg} ${totalLevel.color}`}>
              診断結果
            </span>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              総合スコア&nbsp;
              <span style={{ color: AXIS_COLOR.org_hard }}>{totalScore}</span>
              <span className="text-2xl text-gray-400">/100</span>
            </h1>
            <p className={`inline-block font-bold text-lg px-4 py-1 rounded-full ${totalLevel.bg} ${totalLevel.color} ${totalLevel.border} border`}>
              成熟度レベル：{totalLevel.label}
            </p>
          </div>

          {/* Axis scores */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" /> 4軸スコア
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {AXIS_ORDER.map((axis) => {
                const score = axisScores[axis];
                const lv = getScoreLevel(score);
                const color = AXIS_COLOR[axis];
                return (
                  <div key={axis} className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <ScoreRing score={score} color={color} size={72} />
                      <span className="absolute inset-0 flex items-center justify-center text-base font-bold" style={{ color }}>
                        {score}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{AXIS_LABELS[axis]}</p>
                      <p className="text-xs text-gray-400">{AXIS_DESC[axis]}</p>
                      <span className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${lv.bg} ${lv.color}`}>
                        {lv.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advice per axis */}
          <div className="space-y-3 mb-8">
            {AXIS_ORDER.map((axis) => (
              <div key={axis} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <p className="font-bold text-gray-900 text-sm mb-1">
                  <span style={{ color: AXIS_COLOR[axis] }}>■</span>{" "}
                  {AXIS_LABELS[axis]}（{AXIS_DESC[axis]}）
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{axisAdvice[axis]}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-blue-600 rounded-2xl p-8 text-center text-white shadow-xl shadow-blue-200">
            <p className="text-xl font-extrabold mb-2">次のステップ</p>
            <p className="text-blue-200 text-sm mb-6">
              詳細な課題分析・改善ロードマップの作成はProプランで。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/#pricing"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-orange-300"
              >
                Proプランで詳細レポートを見る
              </a>
              <button
                onClick={reset}
                className="flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold py-3 px-8 rounded-full hover:bg-white/10 transition-colors"
              >
                <RotateCcw size={16} /> もう一度診断する
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────────────────
  if (!currentQ) return null;

  const progress = ((currentIndex) / totalQ) * 100;
  const isAnswered = answers[currentQ.id] !== undefined;
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top nav */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 z-40">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ChevronLeft size={18} /> 戻る
          </button>
          <span className="text-sm font-semibold text-gray-500">
            {currentIndex + 1} / {totalQ}
          </span>
          <span className="text-sm font-bold text-blue-600">{AXIS_LABELS[currentQ.axis]}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Subsection badge */}
          {currentQ.subsection && (
            <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
              {currentQ.subsection}
            </span>
          )}

          {/* Question text */}
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-8 leading-relaxed whitespace-pre-line">
            {currentQ.text}
          </h2>

          {/* Choices */}
          {currentQ.type === "mc" ? (
            <div className="space-y-3">
              {currentQ.choices.map((choice, idx) => {
                const selected = currentAnswer === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleMcSelect(idx)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm leading-relaxed font-medium ${
                      selected
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <span className="font-bold mr-2 text-gray-400">{idx + 1}.</span>
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            /* cb: checkbox multi-select */
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-2">当てはまるものをすべて選択してください</p>
              {currentQ.choices.map((choice, idx) => {
                const checked = cbSelections.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleCbToggle(idx)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-sm leading-relaxed font-medium flex items-start gap-3 ${
                      checked
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <span className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                      checked ? "bg-blue-600 border-blue-600" : "border-gray-300"
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {choice}
                  </button>
                );
              })}
              <button
                onClick={submitCb}
                disabled={cbSelections.length === 0}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                次へ <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
