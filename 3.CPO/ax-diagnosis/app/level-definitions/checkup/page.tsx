import { ClipboardList } from "lucide-react";

const LEVEL_COLORS = [
  { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700"    },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
  { bg: "bg-lime-50",   border: "border-lime-200",   text: "text-lime-700",   badge: "bg-lime-100 text-lime-700"   },
  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700"  },
];

interface CheckupItem {
  id: string;
  axis: string;
  axisLabel: string;
  title: string;
  levels: { num: number; keyword: string; desc: string }[];
}

const CHECKUP_GROUPS: { axis: string; axisLabel: string; color: string; headerBg: string; items: CheckupItem[] }[] = [
  {
    axis: "OH",
    axisLabel: "組織 Hard — 戦略・基盤",
    color: "blue",
    headerBg: "bg-blue-600",
    items: [
      {
        id: "C-01", axis: "OH", axisLabel: "組織 Hard", title: "戦略・KGI",
        levels: [
          { num: 1, keyword: "未定義", desc: "全社の経営課題とAI活用の目的が明確に定義されておらず、導入自体が目的化している状態である。" },
          { num: 2, keyword: "部分設定", desc: "部署単位では改善目標が設定されているが、全社の経営課題とは明確に接続されていない状態である。" },
          { num: 3, keyword: "定性", desc: "全社方針は示されているが、ROIや削減額などの定量指標が具体的に設定されていない状態である。" },
          { num: 4, keyword: "定量", desc: "経営課題に連動した削減額や創出額などの数値目標が設定され、進捗管理が行われている状態である。" },
          { num: 5, keyword: "浸透", desc: "経営課題に紐づく数値目標が全社で共有され、業務上の意思決定基準として活用されている状態である。" },
        ],
      },
      {
        id: "C-02", axis: "OH", axisLabel: "組織 Hard", title: "ガバナンス",
        levels: [
          { num: 1, keyword: "未整備", desc: "利用に関する明確なガイドラインや倫理規定が整備されておらず、各自の判断で利用している状態である。" },
          { num: 2, keyword: "禁止", desc: "リスク回避を優先し、原則禁止または極めて限定的な利用に制限している運用状態である。" },
          { num: 3, keyword: "形式", desc: "ガイドラインは策定されているが、周知や遵守を担保する仕組みが十分に機能していない状態である。" },
          { num: 4, keyword: "運用", desc: "明確な利用ルールと承認プロセスが整備され、定期的な見直しが実施されている状態である。" },
          { num: 5, keyword: "自動運用", desc: "入力制御や監視機能がシステムとして実装され、安全性と利便性を両立した運用が行われている状態である。" },
        ],
      },
      {
        id: "C-03", axis: "OH", axisLabel: "組織 Hard", title: "データ・基盤",
        levels: [
          { num: 1, keyword: "未導入", desc: "業務で利用可能なAIツールが組織として導入されておらず、正式な利用環境が整備されていない状態である。" },
          { num: 2, keyword: "汎用", desc: "ChatGPT等の汎用チャットツールは導入されているが、社内データとの連携は行われていない状態である。" },
          { num: 3, keyword: "連携", desc: "データ活用基盤は構築されているが、データ整備や精度の課題により十分に活用されていない状態である。" },
          { num: 4, keyword: "統合", desc: "社内データと連携した専用アプリが業務フローに組み込まれ、継続的に利用されている状態である。" },
          { num: 5, keyword: "高度化", desc: "API連携やFine-tuning（追加学習）を活用し、自社要件に最適化された基盤が構築されている状態である。" },
        ],
      },
      {
        id: "C-04", axis: "OH", axisLabel: "組織 Hard", title: "プロセス・オペレーション",
        levels: [
          { num: 1, keyword: "属人化", desc: "一部の担当者が個別にAIを利用しているが、組織として標準化や共有は行われていない状態である。" },
          { num: 2, keyword: "散発的", desc: "議事録要約など特定の業務では利用されているが、全体最適を意識した設計には至っていない状態である。" },
          { num: 3, keyword: "標準化中", desc: "特定業務において標準フローの整備を進めているが、定着や横展開が十分ではない状態である。" },
          { num: 4, keyword: "定着", desc: "標準プロセスとして文書化され、担当者に依存せず一定品質で運用されている状態である。" },
          { num: 5, keyword: "自律改善", desc: "標準プロセスを基盤に、現場主導でフローやプロンプトの継続的な改善が行われている状態である。" },
        ],
      },
    ],
  },
  {
    axis: "OS",
    axisLabel: "組織 Soft — 文化・風土",
    color: "violet",
    headerBg: "bg-violet-600",
    items: [
      {
        id: "C-05", axis: "OS", axisLabel: "組織 Soft", title: "挑戦文化",
        levels: [
          { num: 1, keyword: "減点主義", desc: "業務上の失敗に対する評価が厳しく、新しい取り組みよりも既存手法の維持が優先される傾向にある状態である。" },
          { num: 2, keyword: "静観", desc: "新しい技術や方法を試すことは制限されていないが、自発的な実験や提案がほとんど見られない状態である。" },
          { num: 3, keyword: "一部挑戦", desc: "特定の部署や個人は試行を行っているが、組織全体へ広がる仕組みは十分に機能していない状態である。" },
          { num: 4, keyword: "推奨", desc: "挑戦や実験が明示的に支持され、試行結果が組織内で共有・活用されている状態である。" },
          { num: 5, keyword: "称賛", desc: "挑戦行動が評価やフィードバックと連動し、継続的に行われる状態である。" },
        ],
      },
      {
        id: "C-06", axis: "OS", axisLabel: "組織 Soft", title: "機敏性",
        levels: [
          { num: 1, keyword: "重厚長大", desc: "意思決定に長期間を要し、一度決定した計画や方針の変更がほとんど行われない状態である。" },
          { num: 2, keyword: "トップダウン", desc: "経営層主導で迅速に決定は行われるが、現場への権限移譲は限定的な状態である。" },
          { num: 3, keyword: "サイロ化", desc: "部署単位では意思決定が行われるが、部門横断の施策は調整負荷により停滞しやすい状態である。" },
          { num: 4, keyword: "アジャイル", desc: "状況変化に応じて計画や役割を見直し、小規模な試行を通じて改善を進める状態である。" },
          { num: 5, keyword: "自律分散", desc: "現場が一定の裁量を持ち、継続的な改善活動を通じて組織全体が変化している状態である。" },
        ],
      },
      {
        id: "C-07", axis: "OS", axisLabel: "組織 Soft", title: "HR・評価",
        levels: [
          { num: 1, keyword: "未対応", desc: "既存の評価制度のままで、AI活用やデジタルスキルが明確な評価項目として位置づけられていない状態である。" },
          { num: 2, keyword: "定性評価", desc: "取り組みは評価対象とされているが、報酬や昇進などの処遇に十分には反映されていない状態である。" },
          { num: 3, keyword: "特別枠", desc: "デジタル人材向けの特別制度は設けられているが、全従業員に適用される仕組みにはなっていない状態である。" },
          { num: 4, keyword: "制度化", desc: "新しいスキルや変革行動が評価項目として制度に組み込まれ、処遇へ反映されている状態である。" },
          { num: 5, keyword: "風土化", desc: "制度運用に加えて称賛や抜擢が行われ、挑戦行動が組織内で継続的に評価される状態である。" },
        ],
      },
      {
        id: "C-08", axis: "OS", axisLabel: "組織 Soft", title: "知識の共有",
        levels: [
          { num: 1, keyword: "暗黙知", desc: "ナレッジや成功事例が個人の中に留まり、組織として体系的に蓄積・共有されていない状態である。" },
          { num: 2, keyword: "一方向", desc: "事例共有は行われているが発信元が限定され、双方向の知見循環が生まれていない状態である。" },
          { num: 3, keyword: "散在", desc: "チャット等で共有はされるが整理や構造化が不十分で、検索や再利用が難しい状態である。" },
          { num: 4, keyword: "仕組化", desc: "成功事例がデータベースとして整理され、誰でも検索・再利用できる形で管理されている状態である。" },
          { num: 5, keyword: "エコシステム", desc: "共有行動が評価や称賛と連動し、新たな知見が継続的に創出される循環が形成されている状態である。" },
        ],
      },
    ],
  },
  {
    axis: "PH",
    axisLabel: "個人 Hard — テクニカルスキル",
    color: "orange",
    headerBg: "bg-orange-500",
    items: [
      {
        id: "C-09", axis: "PH", axisLabel: "個人 Hard", title: "AIの基本的理解",
        levels: [
          { num: 1, keyword: "未理解", desc: "AIを使ったことがない、または活用方法を理解していない。" },
          { num: 2, keyword: "基礎理解", desc: "基本的な仕組みを理解しできること/できないことを把握できる。" },
          { num: 3, keyword: "選択活用", desc: "主要モデルやツールの特性を理解し目的別に選択できる。" },
          { num: 4, keyword: "自律追跡", desc: "技術動向を自律的に追跡し有効なAI技術を判断できる。" },
          { num: 5, keyword: "価値評価", desc: "ビジネス価値と技術的妥当性からAI活用機会を評価できる。" },
        ],
      },
      {
        id: "C-10", axis: "PH", axisLabel: "個人 Hard", title: "AIの使いこなし力",
        levels: [
          { num: 1, keyword: "未経験", desc: "AIを使ったことがない、またはプロンプト入力の経験がない。" },
          { num: 2, keyword: "試行改善", desc: "追加指示やフィードバックで出力の改善を試みることができる。" },
          { num: 3, keyword: "文脈設計", desc: "マルチターン対話と文脈設計で高品質な出力を引き出せる。" },
          { num: 4, keyword: "テンプレート化", desc: "再利用可能なテンプレートやワークフローを構築できる。" },
          { num: 5, keyword: "手法設計", desc: "業務目的に応じて最適なAI活用手法を選定・設計できる。" },
        ],
      },
      {
        id: "C-11", axis: "PH", axisLabel: "個人 Hard", title: "AIの活用深度",
        levels: [
          { num: 1, keyword: "未活用", desc: "AIを使ったことがない、または数回試した程度にとどまっている。" },
          { num: 2, keyword: "単タスク活用", desc: "メール要約や翻訳など単タスクでAIを日常的に活用できる。" },
          { num: 3, keyword: "役割明確化", desc: "主要業務をAI前提で設計しAIと人の役割を明確化できる。" },
          { num: 4, keyword: "全体俯瞰", desc: "業務フロー全体を俯瞰しAIと人の役割分担を設計できる。" },
          { num: 5, keyword: "プロジェクト主導", desc: "業務フロー全体でAI活用プロジェクトを自ら主導できる。" },
        ],
      },
      {
        id: "C-12", axis: "PH", axisLabel: "個人 Hard", title: "リスク管理・ガバナンス",
        levels: [
          { num: 1, keyword: "リスク無自覚", desc: "AI利用に伴うリスクを知らない、またはリスク意識なく使っている。" },
          { num: 2, keyword: "ルール遵守", desc: "AI利用ポリシーを理解し基本ルールを遵守して利用できる。" },
          { num: 3, keyword: "自律判断", desc: "ファクトチェックとグレーゾーン判断を自律的に行える。" },
          { num: 4, keyword: "ガイドライン策定", desc: "業務運用レベルでリスク評価とガイドラインを策定できる。" },
          { num: 5, keyword: "最大化判断", desc: "リスクを踏まえてAI活用範囲を最大化する判断ができる。" },
        ],
      },
    ],
  },
  {
    axis: "PS",
    axisLabel: "個人 Soft — ポータブルスキル・スタンス",
    color: "green",
    headerBg: "bg-green-600",
    items: [
      {
        id: "C-13", axis: "PS", axisLabel: "個人 Soft", title: "課題設定力",
        levels: [
          { num: 1, keyword: "課題未認識", desc: "業務の中からAIで解決すべき課題そのものに気づけていない。" },
          { num: 2, keyword: "事例模倣", desc: "他者の事例を真似して与えられた課題を処理するにとどまっている。" },
          { num: 3, keyword: "自己言語化", desc: "自身の業務課題を自ら言語化しAIに解かせる形に落とし込める。" },
          { num: 4, keyword: "本質再定義", desc: "本質的な問いを立て前後工程を含めた業務課題を再定義できる。" },
          { num: 5, keyword: "組織課題定義", desc: "組織全体の課題をAI視点で定義し解決の方向性を提示できる。" },
        ],
      },
      {
        id: "C-14", axis: "PS", axisLabel: "個人 Soft", title: "目的志向",
        levels: [
          { num: 1, keyword: "手段目的化", desc: "手段（AIを使うこと）が目的化し成果への意識が希薄である。" },
          { num: 2, keyword: "受動利用", desc: "利便性を理由とした受動的なAI利用にとどまっている。" },
          { num: 3, keyword: "逆算活用", desc: "業務成果から逆算してAIをツールとして自律的に使いこなせる。" },
          { num: 4, keyword: "最適化追求", desc: "プロセス全体の最適化を考え最小工数で最大成果を追求できる。" },
          { num: 5, keyword: "ROI判断", desc: "組織の価値創造を最大化する観点でAI投資のROIを判断できる。" },
        ],
      },
      {
        id: "C-15", axis: "PS", axisLabel: "個人 Soft", title: "批判的思考",
        levels: [
          { num: 1, keyword: "盲信・過疑", desc: "AIの回答を無批判に盲信するか、過度に疑ってしまっている。" },
          { num: 2, keyword: "違和感察知", desc: "出力への違和感は持てるが根拠の確認や裏取りまでは行えていない。" },
          { num: 3, keyword: "事実裏取り", desc: "回答を疑い、批判的視点を持って事実の裏取りを行える。" },
          { num: 4, keyword: "多角検証", desc: "多角的な視点から既存の仕事のやり方自体の矛盾を検証できる。" },
          { num: 5, keyword: "倫理判断", desc: "社会的・倫理的責任まで含め組織のAI利用の妥当性を判断できる。" },
        ],
      },
      {
        id: "C-16", axis: "PS", axisLabel: "個人 Soft", title: "開放性・柔軟性",
        levels: [
          { num: 1, keyword: "保守的", desc: "変化に対して保守的で過去のやり方を手放せず新しい手法を拒んでいる。" },
          { num: 2, keyword: "条件付き試行", desc: "必要性を感じれば試すが、失敗すると自己流のやり方に戻ってしまう。" },
          { num: 3, keyword: "継続試行", desc: "失敗を恐れず改善に向けて柔軟な試行錯誤を継続的に重ねられる。" },
          { num: 4, keyword: "再設計", desc: "既存のルールを疑いAI前提でプロセスを再設計・最適化できる。" },
          { num: 5, keyword: "機運醸成", desc: "自らの姿勢を周囲に伝播させ組織全体のAI活用機運を広げられる。" },
        ],
      },
    ],
  },
];

const GROUP_COLORS: Record<string, { tab: string; dot: string }> = {
  blue:   { tab: "bg-blue-600 text-white",   dot: "bg-blue-500"   },
  violet: { tab: "bg-violet-600 text-white", dot: "bg-violet-500" },
  orange: { tab: "bg-orange-500 text-white", dot: "bg-orange-400" },
  green:  { tab: "bg-green-600 text-white",  dot: "bg-green-500"  },
};

export default function CheckupLevelDefinitionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ナビゲーション */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600 tracking-tight">AX-Diagnosis</a>
          <div className="flex items-center gap-3">
            <a href="/level-definitions/hook" className="text-gray-500 hover:text-gray-800 text-sm font-semibold transition-colors">
              Hook レベル定義
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
          <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            <ClipboardList size={14} /> Depth 2
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Checkup レベル定義
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            16領域それぞれの成熟度レベル（1〜5）の定義です。<br />
            4象限 × 各4領域で構成されています。
          </p>
        </div>

        {/* 象限グループ */}
        <div className="space-y-14">
          {CHECKUP_GROUPS.map((group) => {
            const gc = GROUP_COLORS[group.color];
            return (
              <section key={group.axis}>
                {/* グループタイトル */}
                <div className={`${group.headerBg} rounded-2xl px-8 py-5 mb-6`}>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{group.axis}</p>
                  <h2 className="text-xl font-extrabold text-white">{group.axisLabel}</h2>
                </div>

                {/* 4領域カード */}
                <div className="grid md:grid-cols-2 gap-6">
                  {group.items.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* カードヘッダー */}
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${gc.dot}`} />
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.id}</span>
                          <h3 className="text-base font-extrabold text-gray-900">{item.title}</h3>
                        </div>
                      </div>

                      {/* レベル一覧 */}
                      <div className="p-4 space-y-2">
                        {[...item.levels].reverse().map((lv) => {
                          const c = LEVEL_COLORS[lv.num - 1];
                          return (
                            <div key={lv.num} className={`flex gap-3 rounded-lg border px-3 py-2.5 ${c.bg} ${c.border}`}>
                              <div className="shrink-0 flex flex-col items-center gap-0.5 w-16 pt-0.5">
                                <span className={`text-xs font-extrabold leading-none ${c.text}`}>Lv.{lv.num}</span>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-tight text-center ${c.badge}`}>
                                  {lv.keyword}
                                </span>
                              </div>
                              <p className={`text-xs leading-relaxed ${c.text}`}>{lv.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* 下部ナビ */}
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/questions/checkup"
            className="text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
          >
            Checkup 設問一覧を見る →
          </a>
          <a
            href="/level-definitions/hook"
            className="text-center border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
          >
            ← Hook レベル定義を見る
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
