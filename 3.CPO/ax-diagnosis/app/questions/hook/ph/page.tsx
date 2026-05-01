import { CheckCircle2 } from "lucide-react";
import {
  PH_HOOK, PH_CHECKUP, PH_BIOPSY, PH_LAB,
  type QuestionEntry,
} from "@/lib/question-reference-data";

const NAV = [
  { label: "OH · 戦略・基盤", href: "/questions/hook/oh", inactive: "hover:border-blue-400 hover:text-blue-600" },
  { label: "OS · 文化・風土", href: "/questions/hook/os", inactive: "hover:border-violet-400 hover:text-violet-600" },
  { label: "PH · テクニカル",  href: "/questions/hook/ph", inactive: "hover:border-orange-400 hover:text-orange-600" },
  { label: "PS · スタンス",    href: "/questions/hook/ps", inactive: "hover:border-green-400 hover:text-green-600" },
];
const AXIS_COLOR = { header: "bg-orange-500", badge: "text-orange-700 bg-orange-50 border-orange-200" };

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

function QuizCard({ q, headerBg }: { q: QuestionEntry; headerBg: string }) {
  const label = q.format === "quiz-multi" ? "クイズ（複数選択）" : "クイズ（単一選択）";
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className={`${headerBg} px-6 py-4`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-white/80 text-xs font-bold">{q.id}</span>
          <span className="text-white text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{q.keyword}</span>
          <span className="text-xs font-bold bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full">{label}</span>
        </div>
        <p className="text-white font-bold text-sm leading-relaxed">{q.text}</p>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">回答者: {q.respondent}</p>
        <QuizChoices q={q} />
      </div>
    </div>
  );
}

function QuizLikertRow({ q }: { q: QuestionEntry }) {
  const correct = (q.choices ?? []).find((c) => c.correct);
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 mb-2">
        <span className="shrink-0 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 mt-0.5">{q.id}</span>
        <div className="flex-1">
          <span className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full mr-2">《{q.keyword}》</span>
          <span className="text-sm text-gray-800">{q.text}</span>
        </div>
      </div>
      {correct && (
        <div className="ml-16 flex items-center gap-2">
          <CheckCircle2 size={12} className="text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium">正答: {correct.label}. {correct.text}</span>
        </div>
      )}
    </div>
  );
}

export default function HookPHPage() {
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
        <div className="flex gap-2 mb-10 overflow-x-auto pb-1">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href}
              className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full border transition-colors ${
                i === 2 ? "bg-orange-500 border-orange-500 text-white" : `bg-white text-gray-500 border-gray-200 ${n.inactive}`
              }`}>
              {n.label}
            </a>
          ))}
        </div>

        <div className="mb-10">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${AXIS_COLOR.badge}`}>PH · 個人 Hard</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-3">テクニカルスキル 設問一覧</h1>
          <p className="text-gray-500 text-sm mt-1">Hook 1問 ／ Checkup 4問 ／ Biopsy 16問（すべてクイズ形式）</p>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 1</span>
            <h2 className="text-lg font-extrabold text-gray-900">Hook <span className="text-gray-400 font-normal text-sm">— 1問</span></h2>
          </div>
          <QuizCard q={PH_HOOK} headerBg={AXIS_COLOR.header} />
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 2</span>
            <h2 className="text-lg font-extrabold text-gray-900">Checkup <span className="text-gray-400 font-normal text-sm">— 4問</span></h2>
          </div>
          <div className="space-y-4">
            {PH_CHECKUP.map((q) => <QuizCard key={q.id} q={q} headerBg={AXIS_COLOR.header} />)}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 3</span>
            <h2 className="text-lg font-extrabold text-gray-900">Biopsy <span className="text-gray-400 font-normal text-sm">— 16問（クイズ・単一選択）</span></h2>
          </div>
          <div className="space-y-4">
            {PH_BIOPSY.map((group) => (
              <div key={group.area} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className={`${AXIS_COLOR.header} px-5 py-3`}>
                  <p className="text-white text-sm font-bold">{group.area}</p>
                </div>
                <div className="px-5 py-2">
                  {group.questions.map((q) => <QuizLikertRow key={q.id} q={q} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">Depth 4</span>
            <h2 className="text-lg font-extrabold text-gray-900">Lab <span className="text-gray-400 font-normal text-sm">— 4問（クイズ・単一選択）</span></h2>
          </div>
          <div className="space-y-4">
            {PH_LAB.map((group) => (
              <div key={group.area} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-indigo-600 px-5 py-3">
                  <p className="text-white text-sm font-bold">{group.area}</p>
                </div>
                <div className="px-5 py-2">
                  {group.questions.map((q) => <QuizLikertRow key={q.id} q={q} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between">
          <a href="/questions/hook/os" className="text-blue-600 font-semibold text-sm hover:underline">← 前: OS · 文化・風土</a>
          <a href="/questions/hook/ps" className="text-blue-600 font-semibold text-sm hover:underline">次: PS · スタンス →</a>
        </div>
      </main>
    </div>
  );
}
