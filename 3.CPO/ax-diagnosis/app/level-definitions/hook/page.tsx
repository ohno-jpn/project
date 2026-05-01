import { BookOpen } from "lucide-react";

const LEVEL_COLORS = [
  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700"    },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
  { bg: "bg-lime-50",   border: "border-lime-200",   text: "text-lime-700",   badge: "bg-lime-100 text-lime-700"   },
  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700"  },
];

const HOOK_ITEMS = [
  {
    id: "H-01",
    axis: "OH",
    axisLabel: "組織 Hard",
    title: "戦略・基盤（総合）",
    color: "blue",
    headerBg: "bg-blue-600",
    levels: [
      { num: 1, keyword: "未整備", desc: "全社戦略（KGI・ロードマップ）とルールが未整備で、現場で利用可能なAI環境も十分に提供されていない状態である。" },
      { num: 2, keyword: "ツール導入", desc: "ChatGPT等のツールは導入されているが、全社戦略や利用ルールが明確に整備されていない状態である。" },
      { num: 3, keyword: "部分整備", desc: "一部の部署では活用が進んでいるが、全社的な戦略やルール、環境整備が統合されていない状態である。" },
      { num: 4, keyword: "基盤整備", desc: "ガイドラインと利用環境は整備されているが、KGI達成に向けたロードマップの共有・運用は途上の状態である。" },
      { num: 5, keyword: "統合運用", desc: "全社戦略に基づき環境とルールが整備され、現場での運用に組み込まれて継続的に活用されている状態である。" },
    ],
  },
  {
    id: "H-02",
    axis: "OS",
    axisLabel: "組織 Soft",
    title: "文化・風土（総合）",
    color: "violet",
    headerBg: "bg-violet-600",
    levels: [
      { num: 1, keyword: "減点主義・属人化", desc: "失敗が不利益として扱われやすく、学びや事例が個人や部門内に留まり、共有が進まない状態である。" },
      { num: 2, keyword: "静観", desc: "挑戦は抑制されがちで、現状維持が選ばれやすく、AI活用や改善行動が評価に結びつきにくい状態である。" },
      { num: 3, keyword: "限定的挑戦", desc: "一部の部署や個人は試行しているが、取組みは限定的で、支援や共有の仕組みが十分に機能していない状態である。" },
      { num: 4, keyword: "推奨・共有", desc: "挑戦は支持され成功事例の共有は行われるが、失敗事例の共有や学びの横展開は限定的な状態である。" },
      { num: 5, keyword: "称賛・学習", desc: "挑戦が失敗も含めて組織的に奨励され、知見が部門を越えて共有され、改善が継続的に循環している状態である。" },
    ],
  },
  {
    id: "H-03",
    axis: "PH",
    axisLabel: "個人 Hard",
    title: "テクニカルスキル（総合）",
    color: "orange",
    headerBg: "bg-orange-500",
    levels: [
      { num: 1, keyword: "未活用層", desc: "AIの仕組みやリスクを理解しておらず、活用していないか、危険な使い方をしている状態。" },
      { num: 2, keyword: "実践開始", desc: "基本的な仕組みを理解し、単タスクでAIを日常的に使っている状態。" },
      { num: 3, keyword: "自律活用", desc: "主要モデルやツールの特性を理解し、目的に応じて適切に選択・活用できている状態。" },
      { num: 4, keyword: "業務統合", desc: "技術動向を自律的に追跡し、業務フロー全体にAIを最適に組み込んで運用している状態。" },
      { num: 5, keyword: "組織波及", desc: "ビジネス価値と技術的妥当性からAI活用機会を評価し、組織全体の技術水準を底上げしている状態。" },
    ],
  },
  {
    id: "H-04",
    axis: "PS",
    axisLabel: "個人 Soft",
    title: "ポータブルスキル・スタンス（総合）",
    color: "green",
    headerBg: "bg-green-600",
    levels: [
      { num: 1, keyword: "無自覚層", desc: "業務でのAI活用を自分事にできず、回答を盲信するか過度に疑い、変化を拒んでいる状態。" },
      { num: 2, keyword: "受動利用", desc: "明確な目的を持たず、与えられた課題に対して受動的・指示待ちでAIを利用するにとどまる状態。" },
      { num: 3, keyword: "自律活用", desc: "AIの回答を疑い、自身のタスクで批判的視点と柔軟な試行錯誤を日常的に発揮できる状態。" },
      { num: 4, keyword: "業務統合", desc: "今の仕事のやり方自体が最適かを疑い、AI前提で業務プロセス全体を再構築できる状態。" },
      { num: 5, keyword: "組織波及", desc: "自らの姿勢を周囲に伝播させ、組織全体へAI活用を促す影響力を広げているリーダーの状態。" },
    ],
  },
];

export default function HookLevelDefinitionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ナビゲーション */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600 tracking-tight">AX-Diagnosis</a>
          <div className="flex items-center gap-3">
            <a href="/level-definitions/checkup" className="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">
              Checkup レベル定義
            </a>
            <a href="/diagnosis" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
              診断を試す
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-20">

        {/* ヘッダー */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            <BookOpen size={14} /> Depth 1
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Hook レベル定義
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            4象限それぞれの成熟度レベル（1〜5）の定義です。<br />
            Hook診断では各象限の総合状態を判定します。
          </p>
        </div>

        {/* 各Hook項目 */}
        <div className="space-y-10">
          {HOOK_ITEMS.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

              {/* カードヘッダー */}
              <div className={`${item.headerBg} px-8 py-5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-white/70 text-xs font-bold uppercase tracking-widest block mb-1">
                      {item.id} · {item.axisLabel}
                    </span>
                    <h2 className="text-xl font-extrabold text-white">{item.title}</h2>
                  </div>
                </div>
              </div>

              {/* レベル一覧 */}
              <div className="p-6 space-y-3">
                {[...item.levels].reverse().map((lv) => {
                  const c = LEVEL_COLORS[lv.num - 1];
                  return (
                    <div key={lv.num} className={`flex gap-4 rounded-xl border p-4 ${c.bg} ${c.border}`}>
                      <div className="shrink-0 flex flex-col items-center gap-1 w-20">
                        <span className={`text-xs font-extrabold ${c.text}`}>Level {lv.num}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>
                          {lv.keyword}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${c.text}`}>{lv.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 下部ナビ */}
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/level-definitions/checkup"
            className="text-center border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
          >
            Checkup レベル定義を見る →
          </a>
          <a
            href="/diagnosis"
            className="text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            診断を始める →
          </a>
          <a href="/" className="text-center text-gray-500 hover:text-gray-800 font-semibold py-3 px-8 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
            ← トップに戻る
          </a>
        </div>
      </main>
    </div>
  );
}
