import { CheckCircle2 } from "lucide-react";
import {
  OH_HOOK, OH_CHECKUP, OH_BIOPSY, OH_LAB,
  type QuestionEntry,
} from "@/lib/question-reference-data";

const NAV = [
  { label: "OH · 戦略・基盤", href: "/questions/hook/oh", color: "bg-blue-600 border-blue-600 text-white", inactive: "hover:border-blue-400 hover:text-blue-600" },
  { label: "OS · 文化・風土", href: "/questions/hook/os", color: "", inactive: "hover:border-violet-400 hover:text-violet-600" },
  { label: "PH · テクニカル",  href: "/questions/hook/ph", color: "", inactive: "hover:border-orange-400 hover:text-orange-600" },
  { label: "PS · スタンス",    href: "/questions/hook/ps", color: "", inactive: "hover:border-green-400 hover:text-green-600" },
];
const AXIS_COLOR = { header: "bg-blue-600", badge: "text-blue-600 bg-blue-50 border-blue-200", dot: "bg-blue-500" };

// ── 共通レンダラー ────────────────────────────────────────────────
const STATE_COLORS = [
  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-800",  badge: "bg-green-100 text-green-700"  },
  { bg: "bg-lime-50",   border: "border-lime-200",   text: "text-lime-800",   badge: "bg-lime-100 text-lime-700"   },
  { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-700" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-700" },
  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-800",    badge: "bg-red-100 text-red-700"    },
];

function StateChoices({ q }: { q: QuestionEntry }) {
  return (
    <div className="space-y-2">
      {(q.choices ?? []).map((c, i) => {
        const sc = STATE_COLORS[i];
        return (
          <div key={c.label} className={`flex gap-3 rounded-xl border p-3 ${sc.bg} ${sc.border}`}>
            <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${sc.badge}`}>{c.label}</span>
            <p className={`text-sm leading-relaxed ${sc.text}`}>{c.text}</p>
          </div>
        );
      })}
    </div>
  );
}

function QuizChoices({ q }: { q: QuestionEntry }) {
  return (
    <div className="space-y-2">
      {(q.choices ?? []).map((c) => (
        <div key={c.label} className={`flex gap-3 rounded-xl border px-3 py-2.5 ${c.correct ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
          <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${c.correct ? "bg-green-500 text-white" : "bg-white border-2 border-gray-300 text-gray-500"}`}>{c.label}</span>
          <div className="flex-1 flex items-center gap-2">
            <p className={`text-sm leading-relaxed ${c.correct ? "text-green-800 font-medium" : "text-gray-700"}`}>{c.text}</p>
            {c.correct && <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full ml-auto"><CheckCircle2 size={12} />正答</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionCard({ q, headerBg }: { q: QuestionEntry; headerBg: string }) {
  const isQuiz = q.format === "quiz-single" || q.format === "quiz-multi";
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`${headerBg} px-6 py-4`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-white/80 text-xs font-bold">{q.id}</span>
          <span className="text-white text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{q.keyword}</span>
          {isQuiz
            ? <span className="text-xs font-bold bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full">{q.format === "quiz-multi" ? "クイズ（複数選択）" : "クイズ（単一選択）"}</span>
            : <span className="text-xs font-bold bg-white/30 text-white px-2 py-0.5 rounded-full">状態選択</span>
          }
        </div>
        <p className="text-white font-bold text-sm leading-relaxed">{q.text}</p>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">回答者: {q.respondent}</p>
        {isQuiz ? <QuizChoices q={q} /> : <StateChoices q={q} />}
      </div>
    </div>
  );
}

function LikertRow({ q }: { q: QuestionEntry }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="shrink-0 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 mt-0.5">{q.id}</span>
      <div className="flex-1">
        <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full mr-2">《{q.keyword}》</span>
        <span className="text-sm text-gray-800">{q.text}</span>
      </div>
    </div>
  );
}

export default function HookOHPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600 tracking-tight">AX-Diagnosis</a>
          <div className="flex items-center gap-3">
            <a href="/level-definitions/hook" className="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">Hook レベル定義</a>
            <a href="/diagnosis" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">診断を試す</a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        {/* タブナビ */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-colors ${
                i === 0 ? n.color : `bg-white text-gray-500 border-gray-200 ${n.inactive}`
              }`}>
              {n.label}
            </a>
          ))}
        </div>

        {/* ページタイトル */}
        <div className="mb-10">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${AXIS_COLOR.badge}`}>OH · 組織 Hard</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">戦略・基盤 設問一覧</h1>
          <p className="text-gray-500 text-sm mt-1">Hook 1問 ／ Checkup 4問 ／ Biopsy 16問</p>
        </div>

        {/* DEPTH 1: HOOK */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 1</span>
            <h2 className="text-lg font-extrabold text-gray-900">Hook <span className="text-gray-400 font-normal text-sm">— 1問</span></h2>
          </div>
          <QuestionCard q={OH_HOOK} headerBg={AXIS_COLOR.header} />
        </section>

        {/* DEPTH 2: CHECKUP */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 2</span>
            <h2 className="text-lg font-extrabold text-gray-900">Checkup <span className="text-gray-400 font-normal text-sm">— 4問</span></h2>
          </div>
          <div className="space-y-4">
            {OH_CHECKUP.map((q) => <QuestionCard key={q.id} q={q} headerBg={AXIS_COLOR.header} />)}
          </div>
        </section>

        {/* DEPTH 3: BIOPSY */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 3</span>
            <h2 className="text-lg font-extrabold text-gray-900">Biopsy <span className="text-gray-400 font-normal text-sm">— 16問（リッカート5段階）</span></h2>
          </div>
          <div className="space-y-4">
            {OH_BIOPSY.map((group) => (
              <div key={group.area} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className={`${AXIS_COLOR.header} px-5 py-3`}>
                  <p className="text-white text-sm font-bold">{group.area}</p>
                </div>
                <div className="px-5 py-2">
                  {group.questions.map((q) => <LikertRow key={q.id} q={q} />)}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">※ Biopsy は「1: まったくあてはまらない」〜「5: 非常によくあてはまる」の5段階で回答</p>
        </section>

        {/* DEPTH 4: LAB */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 4</span>
            <h2 className="text-lg font-extrabold text-gray-900">Lab <span className="text-gray-400 font-normal text-sm">— 4問（追加検証）</span></h2>
          </div>
          <div className="space-y-4">
            {OH_LAB.map((group) => (
              <div key={group.area} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 px-5 py-3">
                  <p className="text-white text-sm font-bold">{group.area}</p>
                </div>
                <div className="px-5 py-2">
                  {group.questions.map((q) => <LikertRow key={q.id} q={q} />)}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">※ Lab は「1: まったくあてはまらない」〜「5: 非常によくあてはまる」の5段階で回答</p>
        </section>

        {/* 下部ナビ */}
        <div className="flex justify-end">
          <a href="/questions/hook/os" className="text-blue-600 font-semibold text-sm hover:underline">次: OS · 文化・風土 →</a>
        </div>
      </main>
    </div>
  );
}
