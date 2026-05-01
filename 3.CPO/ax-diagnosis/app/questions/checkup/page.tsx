import { FileQuestion, CheckCircle2 } from "lucide-react";

type QuestionFormat = "state" | "quiz";

interface Choice {
  label: string;
  text: string;
  correct?: boolean;
}

interface CheckupQuestion {
  id: string;
  areaCode: string;
  areaTitle: string;
  questionText: string;
  format: QuestionFormat;
  respondent: string;
  choices: Choice[];
}

interface CheckupGroup {
  axis: string;
  axisLabel: string;
  headerBg: string;
  dotColor: string;
  questions: CheckupQuestion[];
}

const CHECKUP_GROUPS: CheckupGroup[] = [
  {
    axis: "OH",
    axisLabel: "組織 Hard — 戦略・基盤",
    headerBg: "bg-blue-600",
    dotColor: "bg-blue-500",
    questions: [
      {
        id: "OH-C1", areaCode: "C-01", areaTitle: "戦略・KGI",
        questionText: "全社の経営課題と紐づいたAI活用の「目的」と「達成条件（KGI）」が明確ですか？",
        format: "state", respondent: "DX部署担当者",
        choices: [
          { label: "1", text: "【未定義】全社の経営課題とAI活用の目的が明確に定義されておらず、導入自体が目的化している状態である。" },
          { label: "2", text: "【部分設定】部署単位では改善目標が設定されているが、全社の経営課題とは明確に接続されていない状態である。" },
          { label: "3", text: "【定性】全社方針は示されているが、ROIや削減額などの定量指標が具体的に設定されていない状態である。" },
          { label: "4", text: "【定量】経営課題に連動した削減額や創出額などの数値目標が設定され、進捗管理が行われている状態である。" },
          { label: "5", text: "【浸透】経営課題に紐づく数値目標が全社で共有され、業務上の意思決定基準として活用されている状態である。" },
        ],
      },
      {
        id: "OH-C2", areaCode: "C-02", areaTitle: "ガバナンス",
        questionText: "リスクを抑えつつ活用を促進するためのガイドラインや倫理規定が運用されていますか？",
        format: "state", respondent: "DX部署担当者",
        choices: [
          { label: "1", text: "【未整備】利用に関する明確なガイドラインや倫理規定が整備されておらず、各自の判断で利用している状態である。" },
          { label: "2", text: "【禁止】リスク回避を優先し、原則禁止または極めて限定的な利用に制限している運用状態である。" },
          { label: "3", text: "【形式】ガイドラインは策定されているが、周知や遵守を担保する仕組みが十分に機能していない状態である。" },
          { label: "4", text: "【運用】明確な利用ルールと承認プロセスが整備され、定期的な見直しが実施されている状態である。" },
          { label: "5", text: "【自動運用】入力制御や監視機能がシステムとして実装され、安全性と利便性を両立した運用が行われている状態である。" },
        ],
      },
      {
        id: "OH-C3", areaCode: "C-03", areaTitle: "データ・基盤",
        questionText: "従業員がAIツールをすぐに使えるIT環境や、データを活用できる基盤（RAG等）がありますか？",
        format: "state", respondent: "DX部署担当者",
        choices: [
          { label: "1", text: "【未導入】業務で利用可能なAIツールが組織として導入されておらず、正式な利用環境が整備されていない状態である。" },
          { label: "2", text: "【汎用】ChatGPT等の汎用チャットツールは導入されているが、社内データとの連携は行われていない状態である。" },
          { label: "3", text: "【連携】データ活用基盤は構築されているが、データ整備や精度の課題により十分に活用されていない状態である。" },
          { label: "4", text: "【統合】社内データと連携した専用アプリが業務フローに組み込まれ、継続的に利用されている状態である。" },
          { label: "5", text: "【高度化】API連携やFine-tuning（追加学習）を活用し、自社要件に最適化された基盤が構築されている状態である。" },
        ],
      },
      {
        id: "OH-C4", areaCode: "C-04", areaTitle: "プロセス・オペレーション",
        questionText: "属人的な活用ではなく、標準化された業務プロセスとして組み込まれていますか？",
        format: "state", respondent: "DX部署担当者",
        choices: [
          { label: "1", text: "【属人化】一部の担当者が個別にAIを利用しているが、組織として標準化や共有は行われていない状態である。" },
          { label: "2", text: "【散発的】議事録要約など特定の業務では利用されているが、全体最適を意識した設計には至っていない状態である。" },
          { label: "3", text: "【標準化中】特定業務において標準フローの整備を進めているが、定着や横展開が十分ではない状態である。" },
          { label: "4", text: "【定着】標準プロセスとして文書化され、担当者に依存せず一定品質で運用されている状態である。" },
          { label: "5", text: "【自律改善】標準プロセスを基盤に、現場主導でフローやプロンプトの継続的な改善が行われている状態である。" },
        ],
      },
    ],
  },
  {
    axis: "OS",
    axisLabel: "組織 Soft — 文化・風土",
    headerBg: "bg-violet-600",
    dotColor: "bg-violet-500",
    questions: [
      {
        id: "OS-C1", areaCode: "C-05", areaTitle: "挑戦文化",
        questionText: "失敗を恐れず、新しい技術や方法論を実験的に試すことが推奨される風土ですか？",
        format: "state", respondent: "DX部署担当者 / 従業員",
        choices: [
          { label: "1", text: "【減点主義】業務上の失敗に対する評価が厳しく、新しい取り組みよりも既存手法の維持が優先される傾向にある状態である。" },
          { label: "2", text: "【静観】新しい技術や方法を試すことは制限されていないが、自発的な実験や提案がほとんど見られない状態である。" },
          { label: "3", text: "【一部挑戦】特定の部署や個人は試行を行っているが、組織全体へ広がる仕組みは十分に機能していない状態である。" },
          { label: "4", text: "【推奨】挑戦や実験が明示的に支持され、試行結果が組織内で共有・活用されている状態である。" },
          { label: "5", text: "【称賛】挑戦行動が評価やフィードバックと連動し、継続的に行われる状態である。" },
        ],
      },
      {
        id: "OS-C2", areaCode: "C-06", areaTitle: "機敏性",
        questionText: "変化に対して迅速に意思決定を行い、柔軟に組織や役割を変えることができる風土ですか？",
        format: "state", respondent: "DX部署担当者 / 従業員",
        choices: [
          { label: "1", text: "【重厚長大】意思決定に長期間を要し、一度決定した計画や方針の変更がほとんど行われない状態である。" },
          { label: "2", text: "【トップダウン】経営層主導で迅速に決定は行われるが、現場への権限移譲は限定的な状態である。" },
          { label: "3", text: "【サイロ化】部署単位では意思決定が行われるが、部門横断の施策は調整負荷により停滞しやすい状態である。" },
          { label: "4", text: "【アジャイル】状況変化に応じて計画や役割を見直し、小規模な試行を通じて改善を進める状態である。" },
          { label: "5", text: "【自律分散】現場が一定の裁量を持ち、継続的な改善活動を通じて組織全体が変化している状態である。" },
        ],
      },
      {
        id: "OS-C3", areaCode: "C-07", areaTitle: "HR・評価",
        questionText: "AI活用やスキル習得に積極的な人材が、人事評価や報酬で報われる仕組み（評価制度など）がありますか？",
        format: "state", respondent: "DX部署担当者 / 従業員",
        choices: [
          { label: "1", text: "【未対応】既存の評価制度のままで、AI活用やデジタルスキルが明確な評価項目として位置づけられていない状態である。" },
          { label: "2", text: "【定性評価】取り組みは評価対象とされているが、報酬や昇進などの処遇に十分には反映されていない状態である。" },
          { label: "3", text: "【特別枠】デジタル人材向けの特別制度は設けられているが、全従業員に適用される仕組みにはなっていない状態である。" },
          { label: "4", text: "【制度化】新しいスキルや変革行動が評価項目として制度に組み込まれ、処遇へ反映されている状態である。" },
          { label: "5", text: "【風土化】制度運用に加えて称賛や抜擢が行われ、挑戦行動が組織内で継続的に評価される状態である。" },
        ],
      },
      {
        id: "OS-C4", areaCode: "C-08", areaTitle: "知の共有",
        questionText: "個人が得たナレッジや成功事例が、組織全体にスムーズに流通する仕組みがありますか？",
        format: "state", respondent: "DX部署担当者 / 従業員",
        choices: [
          { label: "1", text: "【暗黙知】ナレッジや成功事例が個人の中に留まり、組織として体系的に蓄積・共有されていない状態である。" },
          { label: "2", text: "【一方向】事例共有は行われているが発信元が限定され、双方向の知見循環が生まれていない状態である。" },
          { label: "3", text: "【散在】チャット等で共有はされるが整理や構造化が不十分で、検索や再利用が難しい状態である。" },
          { label: "4", text: "【仕組化】成功事例がデータベースとして整理され、誰でも検索・再利用できる形で管理されている状態である。" },
          { label: "5", text: "【エコシステム】共有行動が評価や称賛と連動し、新たな知見が継続的に創出される循環が形成されている状態である。" },
        ],
      },
    ],
  },
  {
    axis: "PH",
    axisLabel: "個人 Hard — テクニカルスキル",
    headerBg: "bg-orange-500",
    dotColor: "bg-orange-400",
    questions: [
      {
        id: "PH-C1", areaCode: "C-09", areaTitle: "AIの基本的理解",
        questionText: "LLM（大規模言語モデル）の基本的な動作原理として、最も適切なものを選んでください。",
        format: "quiz", respondent: "従業員",
        choices: [
          { label: "A", text: "与えられた文脈に基づき、統計的に次に続く可能性の高い語を推定しながら文章を生成する仕組みである。", correct: true },
          { label: "B", text: "内部に保存された知識データベースを参照し、該当する情報を組み合わせて回答を構成する仕組みである。" },
          { label: "C", text: "あらかじめ定義されたルールと条件分岐に基づき、入力に対する最適な応答を導出する仕組みである。" },
          { label: "D", text: "外部の情報源をリアルタイムに検索し、取得した最新の情報に基づいて回答を生成する仕組みである。" },
        ],
      },
      {
        id: "PH-C2", areaCode: "C-10", areaTitle: "AIの使いこなし力",
        questionText: "AIの出力精度を高めるためのプロンプト設計手法として、最も適切なものを選んでください。",
        format: "quiz", respondent: "従業員",
        choices: [
          { label: "A", text: "制約条件を与える際に、出力してほしくない要素を否定形で列挙することは、精度向上の基本的な手法である。" },
          { label: "B", text: "Few-shotプロンプティングは、期待する出力の具体例を提示することで精度を安定させる手法である。", correct: true },
          { label: "C", text: "Chain of Thought（思考の連鎖）は、複数のモデルを直列に連結することで精度を高める構成手法である。" },
          { label: "D", text: "背景情報は省略して出力形式のみを厳密に指定することは、回答の焦点を絞り精度を向上させる手法である。" },
        ],
      },
      {
        id: "PH-C3", areaCode: "C-11", areaTitle: "AIの活用深度",
        questionText: "社内の問い合わせ対応を自動化するシステムを構築する際、最も適切なアプローチを選んでください。",
        format: "quiz", respondent: "従業員",
        choices: [
          { label: "A", text: "自社の業務データでモデルにFine-tuning（追加学習）を施し、専用の特化型モデルを構築する方法をとる。" },
          { label: "B", text: "想定されるQ&Aをあらかじめ登録し、キーワードに応じて定型文を返すシナリオ型ボットを導入する方法をとる。" },
          { label: "C", text: "APIを利用し、社内データベースをRAG（検索拡張生成）で参照するチャットボットを構築する方法をとる。", correct: true },
          { label: "D", text: "LLMのプロンプトにデータベースの内容を直接入力し、都度回答を生成する方法をとる。" },
        ],
      },
      {
        id: "PH-C4", areaCode: "C-12", areaTitle: "リスク管理・ガバナンス",
        questionText: "業務でAIを利用する際のリスクに関する記述として、不適切なものを選んでください。",
        format: "quiz", respondent: "従業員",
        choices: [
          { label: "A", text: "学習データに含まれる偏りがAIの出力に反映され、特定の傾向を持つ内容が生成されることがある。" },
          { label: "B", text: "学習利用が無効化されていない外部AIに入力した情報が、モデルの学習に利用されることがある。" },
          { label: "C", text: "特定のキャラクター名を入力していなくても、外見的特徴の指定が著作権侵害に該当することがある。" },
          { label: "D", text: "同じ質問を複数回入力して回答が一致することは、出力内容の客観性の一つの根拠になることがある。", correct: true },
        ],
      },
    ],
  },
  {
    axis: "PS",
    axisLabel: "個人 Soft — ポータブルスキル・スタンス",
    headerBg: "bg-green-600",
    dotColor: "bg-green-500",
    questions: [
      {
        id: "PS-C1", areaCode: "C-13", areaTitle: "課題設定力",
        questionText: "あなたは、業務の中から「AIで解くべき問い」を見つけ、目的から逆算して活用を設計できていますか？",
        format: "state", respondent: "従業員",
        choices: [
          { label: "1", text: "【なし】どの業務にAIを使えばよいか、判断の切り口がまだ定まっていない。" },
          { label: "2", text: "【模倣】他人の活用事例（議事録など）を参考にし、同じ用途で試すことが多い。" },
          { label: "3", text: "【単発】目の前の作業を楽にする目的で、使いどころを思いつくことがある。" },
          { label: "4", text: "【構造化】複雑な業務をAIが処理できるタスクに分解し、使い方を設計できている。" },
          { label: "5", text: "【再設計】「そもそもこの業務は必要か？」の観点も含め、目的から業務とAI活用を再設計している。" },
        ],
      },
      {
        id: "PS-C2", areaCode: "C-14", areaTitle: "目的志向",
        questionText: "あなたは、AIを使うこと自体を目的にせず、「業務改善」や「成果」から逆算してAI活用の設計ができていますか？",
        format: "state", respondent: "従業員",
        choices: [
          { label: "1", text: "【目的未整理】AIを使うこと自体が目的になり、成果との紐づけが明確でないことがある。" },
          { label: "2", text: "【効率化】主に自分の作業の効率化による時間短縮を目的として活用している。" },
          { label: "3", text: "【品質意識】時間短縮に加え、アウトプットの質の向上も意識して活用している。" },
          { label: "4", text: "【全体最適】自分の工程に加え、前後工程やチーム全体への影響も考慮して活用している。" },
          { label: "5", text: "【ROI視点】かけた時間や労力に対して得られた成果を指標で振り返り、検討している。" },
        ],
      },
      {
        id: "PS-C3", areaCode: "C-15", areaTitle: "批判的思考",
        questionText: "あなたは、AIの出力結果を鵜呑みにせず、「真偽や妥当性を批判的に考える」プロセスを経て業務に利用していますか？",
        format: "state", respondent: "従業員",
        choices: [
          { label: "1", text: "【未検証】AIの出力を前提確認せず、そのまま使うことがある。" },
          { label: "2", text: "【形式確認】誤字脱字や体裁は確認するが、内容の根拠や論理の確認は十分でないことがある。" },
          { label: "3", text: "【事実確認】数字や固有名詞など、検証しやすい点を中心にファクトチェックしている。" },
          { label: "4", text: "【論理検証】結論だけでなく前提・条件・推論のつながりに矛盾がないかを確認している。" },
          { label: "5", text: "【最終判断】AIの出力は補佐として扱い、最終的な判断・品質確認は自分が担う前提で運用している。" },
        ],
      },
      {
        id: "PS-C4", areaCode: "C-16", areaTitle: "開放性・柔軟性",
        questionText: "あなたは、新しいAIツールや機能がリリースされた際、抵抗感や先入観を持たず「まずは一度触ってみる」行動をとっていますか？",
        format: "state", respondent: "従業員",
        choices: [
          { label: "1", text: "【未着手】新しいツールは、業務影響やリスクが読めず後回しにしがちで、触らないことが多い。" },
          { label: "2", text: "【段階導入】周囲が使い始めて、運用上の注意点や安全面が分かってから使い始める。" },
          { label: "3", text: "【受容】推奨されたツールは、案内に沿ってとりあえず試してみる。" },
          { label: "4", text: "【自発的試行】必要性や関心がある機能は、指示がなくても自分で試すことがある。" },
          { label: "5", text: "【探索・学習】新情報を把握し、業務での使いどころを小さく試して適用可否を判断している。" },
        ],
      },
    ],
  },
];

const GROUP_BG: Record<string, string> = {
  "bg-blue-600":   "bg-blue-50 border-blue-100",
  "bg-violet-600": "bg-violet-50 border-violet-100",
  "bg-orange-500": "bg-orange-50 border-orange-100",
  "bg-green-600":  "bg-green-50 border-green-100",
};

const GROUP_BADGE: Record<string, string> = {
  "bg-blue-600":   "bg-blue-100 text-blue-700 border-blue-200",
  "bg-violet-600": "bg-violet-100 text-violet-700 border-violet-200",
  "bg-orange-500": "bg-orange-100 text-orange-700 border-orange-200",
  "bg-green-600":  "bg-green-100 text-green-700 border-green-200",
};

export default function CheckupQuestionsPage() {
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
          <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase">
            <FileQuestion size={14} /> Depth 2 · Checkup
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Checkup 設問一覧
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            16領域それぞれに対応する設問です。<br />
            状態選択（組織・個人Soft）とクイズ（個人Hard）の2種類の形式があります。
          </p>
        </div>

        {/* 形式の凡例 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> 状態選択：現在の状況に最も近い選択肢を選ぶ
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> クイズ：知識を問う4択問題（正答あり）
          </span>
        </div>

        {/* 象限グループ */}
        <div className="space-y-14">
          {CHECKUP_GROUPS.map((group) => {
            const cardBg = GROUP_BG[group.headerBg];
            const badge = GROUP_BADGE[group.headerBg];
            return (
              <section key={group.axis}>
                {/* グループヘッダー */}
                <div className={`${group.headerBg} rounded-2xl px-8 py-5 mb-6`}>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{group.axis}</p>
                  <h2 className="text-xl font-extrabold text-white">{group.axisLabel}</h2>
                </div>

                {/* 設問カード */}
                <div className="space-y-5">
                  {group.questions.map((q) => {
                    const isQuiz = q.format === "quiz";
                    return (
                      <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* カードヘッダー */}
                        <div className={`px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3`}>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${group.dotColor}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{q.areaCode} · {q.id}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badge}`}>
                                {q.areaTitle}
                              </span>
                              {isQuiz ? (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                  クイズ
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                  状態選択
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">回答者: {q.respondent}</p>
                          </div>
                        </div>

                        {/* 設問文 */}
                        <div className="px-6 pt-5 pb-4">
                          <p className="text-base font-bold text-gray-900 leading-relaxed mb-5">
                            {q.questionText}
                          </p>

                          {/* 選択肢 */}
                          <div className="space-y-2">
                            {q.choices.map((choice) => {
                              const isCorrect = choice.correct;
                              return (
                                <div
                                  key={choice.label}
                                  className={`flex gap-3 rounded-xl border px-4 py-3 ${
                                    isCorrect
                                      ? "bg-green-50 border-green-200"
                                      : "bg-gray-50 border-gray-200"
                                  }`}
                                >
                                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                                    isCorrect
                                      ? "bg-green-500 text-white"
                                      : "bg-white border-2 border-gray-300 text-gray-500"
                                  }`}>
                                    {choice.label}
                                  </span>
                                  <div className="flex-1 flex items-center gap-2">
                                    <p className={`text-sm leading-relaxed ${isCorrect ? "text-green-800 font-medium" : "text-gray-700"}`}>
                                      {choice.text}
                                    </p>
                                    {isCorrect && (
                                      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full ml-auto">
                                        <CheckCircle2 size={12} /> 正答
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* 下部ナビ */}
        <div className="mt-14 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/level-definitions/checkup"
            className="text-center border-2 border-blue-600 text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 transition-colors"
          >
            Checkup レベル定義を見る
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
