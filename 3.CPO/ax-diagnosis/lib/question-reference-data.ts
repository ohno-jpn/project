export type Format = "state" | "quiz-multi" | "quiz-single" | "likert";

export interface Choice { label: string; text: string; correct?: boolean; }
export interface QuestionEntry {
  id: string;
  keyword: string;
  text: string;
  format: Format;
  respondent: string;
  choices?: Choice[];
}

// ── Likert共通選択肢 ──────────────────────────────────────────────
export const LIKERT_CHOICES: Choice[] = [
  { label: "1", text: "まったくあてはまらない" },
  { label: "2", text: "あまりあてはまらない" },
  { label: "3", text: "どちらともいえない" },
  { label: "4", text: "ややあてはまる" },
  { label: "5", text: "非常によくあてはまる" },
];

// ── OH 組織 Hard ──────────────────────────────────────────────────
export const OH_HOOK: QuestionEntry = {
  id: "OH-H1", keyword: "戦略・基盤（総合）",
  text: "全社的なDX/AI活用戦略（KGI・ロードマップ）が策定され、現場が使えるIT環境とルールがセットで整備されていますか？",
  format: "state", respondent: "DX部署担当者",
  choices: [
    { label: "5", text: "【統合運用】全社戦略に基づき環境とルールが整備され、現場での運用に組み込まれて継続的に活用されている状態である。" },
    { label: "4", text: "【基盤整備】ガイドラインと利用環境は整備されているが、KGI達成に向けたロードマップの共有・運用は途上の状態である。" },
    { label: "3", text: "【部分整備】一部の部署では活用が進んでいるが、全社的な戦略やルール、環境整備が統合されていない状態である。" },
    { label: "2", text: "【ツール導入】ChatGPT等のツールは導入されているが、全社戦略や利用ルールが明確に整備されていない状態である。" },
    { label: "1", text: "【未整備】全社戦略（KGI・ロードマップ）とルールが未整備で、現場で利用可能なAI環境も十分に提供されていない状態である。" },
  ],
};
export const OH_CHECKUP: QuestionEntry[] = [
  {
    id: "OH-C1", keyword: "戦略・KGI",
    text: "全社の経営課題と紐づいたAI活用の「目的」と「達成条件（KGI）」が明確ですか？",
    format: "state", respondent: "DX部署担当者",
    choices: [
      { label: "5", text: "【浸透】経営課題に紐づく数値目標が全社で共有され、業務上の意思決定基準として活用されている状態である。" },
      { label: "4", text: "【定量】経営課題に連動した削減額や創出額などの数値目標が設定され、進捗管理が行われている状態である。" },
      { label: "3", text: "【定性】全社方針は示されているが、ROIや削減額などの定量指標が具体的に設定されていない状態である。" },
      { label: "2", text: "【部分設定】部署単位では改善目標が設定されているが、全社の経営課題とは明確に接続されていない状態である。" },
      { label: "1", text: "【未定義】全社の経営課題とAI活用の目的が明確に定義されておらず、導入自体が目的化している状態である。" },
    ],
  },
  {
    id: "OH-C2", keyword: "ガバナンス",
    text: "リスクを抑えつつ活用を促進するためのガイドラインや倫理規定が運用されていますか？",
    format: "state", respondent: "DX部署担当者",
    choices: [
      { label: "5", text: "【自動運用】入力制御や監視機能がシステムとして実装され、安全性と利便性を両立した運用が行われている状態である。" },
      { label: "4", text: "【運用】明確な利用ルールと承認プロセスが整備され、定期的な見直しが実施されている状態である。" },
      { label: "3", text: "【形式】ガイドラインは策定されているが、周知や遵守を担保する仕組みが十分に機能していない状態である。" },
      { label: "2", text: "【禁止】リスク回避を優先し、原則禁止または極めて限定的な利用に制限している運用状態である。" },
      { label: "1", text: "【未整備】利用に関する明確なガイドラインや倫理規定が整備されておらず、各自の判断で利用している状態である。" },
    ],
  },
  {
    id: "OH-C3", keyword: "データ・基盤",
    text: "従業員がAIツールをすぐに使えるIT環境や、データを活用できる基盤（RAG等）がありますか？",
    format: "state", respondent: "DX部署担当者",
    choices: [
      { label: "5", text: "【高度化】API連携やFine-tuning（追加学習）を活用し、自社要件に最適化された基盤が構築されている状態である。" },
      { label: "4", text: "【統合】社内データと連携した専用アプリが業務フローに組み込まれ、継続的に利用されている状態である。" },
      { label: "3", text: "【連携】データ活用基盤は構築されているが、データ整備や精度の課題により十分に活用されていない状態である。" },
      { label: "2", text: "【汎用】ChatGPT等の汎用チャットツールは導入されているが、社内データとの連携は行われていない状態である。" },
      { label: "1", text: "【未導入】業務で利用可能なAIツールが組織として導入されておらず、正式な利用環境が整備されていない状態である。" },
    ],
  },
  {
    id: "OH-C4", keyword: "プロセス・オペレーション",
    text: "属人的な活用ではなく、標準化された業務プロセスとして組み込まれていますか？",
    format: "state", respondent: "DX部署担当者",
    choices: [
      { label: "5", text: "【自律改善】標準プロセスを基盤に、現場主導でフローやプロンプトの継続的な改善が行われている状態である。" },
      { label: "4", text: "【定着】標準プロセスとして文書化され、担当者に依存せず一定品質で運用されている状態である。" },
      { label: "3", text: "【標準化中】特定業務において標準フローの整備を進めているが、定着や横展開が十分ではない状態である。" },
      { label: "2", text: "【散発的】議事録要約など特定の業務では利用されているが、全体最適を意識した設計には至っていない状態である。" },
      { label: "1", text: "【属人化】一部の担当者が個別にAIを利用しているが、組織として標準化や共有は行われていない状態である。" },
    ],
  },
];
export const OH_BIOPSY: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "① 戦略・KGI",
    questions: [
      { id: "OH-B01", keyword: "目的", text: "AI活用が「コスト削減」や「売上増」など、具体的な経営数字にどう貢献するかのロジックが整理されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B02", keyword: "ロードマップ", text: "AIを活用し「いつまでに・どの部署で・何を実現するか」という時系列の導入計画が整備されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B03", keyword: "予算", text: "AI推進のための予算と、専任の人員（推進室など）が確保されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B04", keyword: "現場浸透", text: "経営層のメッセージとして、AI活用の重要性が従業員に伝えられていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "② ガバナンス",
    questions: [
      { id: "OH-B05", keyword: "ガイドライン", text: "AI利用に関するガイドラインが策定・周知されており、データや用途に応じた柔軟性を持たせつつ、定期的に見直す仕組みが構築されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B06", keyword: "監視", text: "情報漏洩や著作権侵害を防ぐためのフィルタリングや監視の仕組みが、現場が判断に迷わない運用粒度で整備されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B07", keyword: "倫理規定", text: "AIの判断に対する責任の所在や、公平性・バイアス（偏り）に関する方針が決まっていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B08", keyword: "シャドーIT", text: "従業員が勝手にツールを使うのではなく、認可ツールを安全に使う承認プロセスが整備されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "③ データ・基盤",
    questions: [
      { id: "OH-B09", keyword: "ツール導入", text: "ChatGPT等のLLMや、業務に必要なSaaS（クラウドサービスのソフトウェア）のアカウントが従業員に付与されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B10", keyword: "データ連携", text: "社内ドキュメント（規定やマニュアル）はAI活用に向け検索・参照しやすい形で整備されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B11", keyword: "開発環境", text: "独自のアプリケーションを開発するためのAPI利用環境やサンドボックスが整備されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B12", keyword: "組織資産", text: "AI活用のために整備したデータが、「組織資産」として複数用途で利活用されやすいよう蓄積・管理されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "④ プロセス・オペレーション",
    questions: [
      { id: "OH-B13", keyword: "標準化", text: "目的に応じて「どの業務でAIを使うか」の標準プロセス（SOP）が整備されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B14", keyword: "テンプレート", text: "効果的なプロンプトや使い方のテンプレートが共有・管理されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B15", keyword: "品質管理", text: "AIが出力した成果物の品質チェック（Human-in-the-loop）のフローが整備されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OH-B16", keyword: "改善ループ", text: "定期的にプロセスを見直し、AIの進化に合わせて業務フローを改善していますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
];

// ── OS 組織 Soft ──────────────────────────────────────────────────
export const OS_HOOK: QuestionEntry = {
  id: "OS-H1", keyword: "文化・風土（総合）",
  text: "新しい技術への挑戦による「失敗」が許容され、部門を超えてナレッジを共有する「学習する風土」がありますか？",
  format: "state", respondent: "DX部署担当者 / 従業員",
  choices: [
    { label: "5", text: "【称賛・学習】挑戦が失敗も含めて組織的に奨励され、知見が部門を越えて共有され、改善が継続的に循環している状態である。" },
    { label: "4", text: "【推奨・共有】挑戦は支持され成功事例の共有は行われるが、失敗事例の共有や学びの横展開は限定的な状態である。" },
    { label: "3", text: "【限定的挑戦】一部の部署や個人は試行しているが、取組みは限定的で、支援や共有の仕組みが十分に機能していない状態である。" },
    { label: "2", text: "【静観】挑戦は抑制されがちで、現状維持が選ばれやすく、AI活用や改善行動が評価に結びつきにくい状態である。" },
    { label: "1", text: "【減点主義・属人化】失敗が不利益として扱われやすく、学びや事例が個人や部門内に留まり、共有が進まない状態である。" },
  ],
};
export const OS_CHECKUP: QuestionEntry[] = [
  {
    id: "OS-C1", keyword: "挑戦文化",
    text: "失敗を恐れず、新しい技術や方法論を実験的に試すことが推奨される風土ですか？",
    format: "state", respondent: "DX部署担当者 / 従業員",
    choices: [
      { label: "5", text: "【称賛】挑戦行動が評価やフィードバックと連動し、継続的に行われる状態である。" },
      { label: "4", text: "【推奨】挑戦や実験が明示的に支持され、試行結果が組織内で共有・活用されている状態である。" },
      { label: "3", text: "【一部挑戦】特定の部署や個人は試行を行っているが、組織全体へ広がる仕組みは十分に機能していない状態である。" },
      { label: "2", text: "【静観】新しい技術や方法を試すことは制限されていないが、自発的な実験や提案がほとんど見られない状態である。" },
      { label: "1", text: "【減点主義】業務上の失敗に対する評価が厳しく、新しい取り組みよりも既存手法の維持が優先される傾向にある状態である。" },
    ],
  },
  {
    id: "OS-C2", keyword: "機敏性",
    text: "変化に対して迅速に意思決定を行い、柔軟に組織や役割を変えることができる風土ですか？",
    format: "state", respondent: "DX部署担当者 / 従業員",
    choices: [
      { label: "5", text: "【自律分散】現場が一定の裁量を持ち、継続的な改善活動を通じて組織全体が変化している状態である。" },
      { label: "4", text: "【アジャイル】状況変化に応じて計画や役割を見直し、小規模な試行を通じて改善を進める状態である。" },
      { label: "3", text: "【サイロ化】部署単位では意思決定が行われるが、部門横断の施策は調整負荷により停滞しやすい状態である。" },
      { label: "2", text: "【トップダウン】経営層主導で迅速に決定は行われるが、現場への権限移譲は限定的な状態である。" },
      { label: "1", text: "【重厚長大】意思決定に長期間を要し、一度決定した計画や方針の変更がほとんど行われない状態である。" },
    ],
  },
  {
    id: "OS-C3", keyword: "HR・評価",
    text: "AI活用やスキル習得に積極的な人材が、人事評価や報酬で報われる仕組み（評価制度など）がありますか？",
    format: "state", respondent: "DX部署担当者 / 従業員",
    choices: [
      { label: "5", text: "【風土化】制度運用に加えて称賛や抜擢が行われ、挑戦行動が組織内で継続的に評価される状態である。" },
      { label: "4", text: "【制度化】新しいスキルや変革行動が評価項目として制度に組み込まれ、処遇へ反映されている状態である。" },
      { label: "3", text: "【特別枠】デジタル人材向けの特別制度は設けられているが、全従業員に適用される仕組みにはなっていない状態である。" },
      { label: "2", text: "【定性評価】取り組みは評価対象とされているが、報酬や昇進などの処遇に十分には反映されていない状態である。" },
      { label: "1", text: "【未対応】既存の評価制度のままで、AI活用やデジタルスキルが明確な評価項目として位置づけられていない状態である。" },
    ],
  },
  {
    id: "OS-C4", keyword: "知の共有",
    text: "個人が得たナレッジや成功事例が、組織全体にスムーズに流通する仕組みがありますか？",
    format: "state", respondent: "DX部署担当者 / 従業員",
    choices: [
      { label: "5", text: "【エコシステム】共有行動が評価や称賛と連動し、新たな知見が継続的に創出される循環が形成されている状態である。" },
      { label: "4", text: "【仕組化】成功事例がデータベースとして整理され、誰でも検索・再利用できる形で管理されている状態である。" },
      { label: "3", text: "【散在】チャット等で共有はされるが整理や構造化が不十分で、検索や再利用が難しい状態である。" },
      { label: "2", text: "【一方向】事例共有は行われているが発信元が限定され、双方向の知見循環が生まれていない状態である。" },
      { label: "1", text: "【暗黙知】ナレッジや成功事例が個人の中に留まり、組織として体系的に蓄積・共有されていない状態である。" },
    ],
  },
];
export const OS_BIOPSY: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "① 挑戦文化",
    questions: [
      { id: "OS-B01", keyword: "心理的安全性", text: "若手がAIを使った新しい提案をした際、頭ごなしに否定されない風土がありますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B02", keyword: "失敗活用", text: "「うまくいかなかったPoC（実証実験）」も、知見として評価・称賛される文化がありますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B03", keyword: "余白", text: "業務時間の一部を、AIツールの試行錯誤や学習に使っても良いという合意がありますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B04", keyword: "率先垂範", text: "経営陣や管理職自らが、新しい技術を楽しんで使っている姿を見せていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "② 機敏性",
    questions: [
      { id: "OS-B05", keyword: "速度", text: "AIツール導入などの意思決定において、過剰な承認フローがなく迅速ですか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B06", keyword: "権限", text: "現場レベルでのツール選定や活用方法の決定権限が移譲されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B07", keyword: "前提更新", text: "過去の成功体験や従来の業務前提にとらわれず、「これまでのやり方をゼロベースで見直す」姿勢が組織として受け入れられていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B08", keyword: "高速試行", text: "完璧な計画よりも「まずは小さく試して、短いサイクルで仮説検証と改善を回す」という進め方が推奨されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "③ HR・評価",
    questions: [
      { id: "OS-B09", keyword: "評価項目", text: "新しいツール活用による効率化や変革への貢献が、人事評価項目に含まれていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B10", keyword: "加点主義", text: "減点主義（ミスしないこと）ではなく、加点主義（新たな挑戦）が評価されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B11", keyword: "キャリア", text: "デジタル・AIスキルを身につけた人材の、昇進やキャリアパスが明確ですか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B12", keyword: "採用", text: "AIリテラシーや変化への適応力を踏まえた新卒・中途採用を行っていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "④ 知の共有",
    questions: [
      { id: "OS-B13", keyword: "共有の場", text: "社内チャットや勉強会など、AI活用の知見を共有する公式あるいは非公式の場がありますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B14", keyword: "事例", text: "「誰がどう使って成功したか」の事例が、従業員が見える形で蓄積されていますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B15", keyword: "表彰", text: "良いナレッジを共有した人が、社内で表彰されたり注目されたりする仕組みがありますか？", format: "likert", respondent: "DX部署担当者" },
      { id: "OS-B16", keyword: "コミュニティ", text: "部署を超えた有志によるAI活用コミュニティなどの活動が活発ですか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
];

// ── PH 個人 Hard ──────────────────────────────────────────────────
export const PH_HOOK: QuestionEntry = {
  id: "PH-H1", keyword: "テクニカルスキル（総合）",
  text: "AIの構造および利用上の注意点に関する記述として、適切なものをすべて選んでください。",
  format: "quiz-multi", respondent: "従業員",
  choices: [
    { label: "A", text: "LLMは、内部に保存された知識データベースをもとに入力文の意味を解析し、その結果に基づいて回答を生成する。", correct: false },
    { label: "B", text: "学習利用が無効化されていない外部AIへ機密情報を入力する際は、固有名詞をマスキングすることで情報漏洩を防止できる。", correct: false },
    { label: "C", text: "プロンプトを入力する際は、大量に情報を渡さずに、情報を優先度などの観点でまとめ、構造化して提示するアプローチをとる。", correct: true },
    { label: "D", text: "RAGは、AIがすでに学習済みの社内データへ効率よくアクセスさせることを目的に構築する仕組みである。", correct: false },
  ],
};
export const PH_CHECKUP: QuestionEntry[] = [
  {
    id: "PH-C1", keyword: "AIの基本的理解",
    text: "LLM（大規模言語モデル）の基本的な動作原理として、最も適切なものを選んでください。",
    format: "quiz-single", respondent: "従業員",
    choices: [
      { label: "A", text: "与えられた文脈に基づき、統計的に次に続く可能性の高い語を推定しながら文章を生成する仕組みである。", correct: true },
      { label: "B", text: "内部に保存された知識データベースを参照し、該当する情報を組み合わせて回答を構成する仕組みである。" },
      { label: "C", text: "あらかじめ定義されたルールと条件分岐に基づき、入力に対する最適な応答を導出する仕組みである。" },
      { label: "D", text: "外部の情報源をリアルタイムに検索し、取得した最新の情報に基づいて回答を生成する仕組みである。" },
    ],
  },
  {
    id: "PH-C2", keyword: "AIの使いこなし力",
    text: "AIの出力精度を高めるためのプロンプト設計手法として、最も適切なものを選んでください。",
    format: "quiz-single", respondent: "従業員",
    choices: [
      { label: "A", text: "制約条件を与える際に、出力してほしくない要素を否定形で列挙することは、精度向上の基本的な手法である。" },
      { label: "B", text: "Few-shotプロンプティングは、期待する出力の具体例を提示することで精度を安定させる手法である。", correct: true },
      { label: "C", text: "Chain of Thought（思考の連鎖）は、複数のモデルを直列に連結することで精度を高める構成手法である。" },
      { label: "D", text: "背景情報は省略して出力形式のみを厳密に指定することは、回答の焦点を絞り精度を向上させる手法である。" },
    ],
  },
  {
    id: "PH-C3", keyword: "AIの活用深度",
    text: "社内の問い合わせ対応を自動化するシステムを構築する際、最も適切なアプローチを選んでください。",
    format: "quiz-single", respondent: "従業員",
    choices: [
      { label: "A", text: "自社の業務データでモデルにFine-tuning（追加学習）を施し、専用の特化型モデルを構築する方法をとる。" },
      { label: "B", text: "想定されるQ&Aをあらかじめ登録し、キーワードに応じて定型文を返すシナリオ型ボットを導入する方法をとる。" },
      { label: "C", text: "APIを利用し、社内データベースをRAG（検索拡張生成）で参照するチャットボットを構築する方法をとる。", correct: true },
      { label: "D", text: "LLMのプロンプトにデータベースの内容を直接入力し、都度回答を生成する方法をとる。" },
    ],
  },
  {
    id: "PH-C4", keyword: "リスク管理・ガバナンス",
    text: "業務でAIを利用する際のリスクに関する記述として、不適切なものを選んでください。",
    format: "quiz-single", respondent: "従業員",
    choices: [
      { label: "A", text: "学習データに含まれる偏りがAIの出力に反映され、特定の傾向を持つ内容が生成されることがある。" },
      { label: "B", text: "学習利用が無効化されていない外部AIに入力した情報が、モデルの学習に利用されることがある。" },
      { label: "C", text: "特定のキャラクター名を入力していなくても、外見的特徴の指定が著作権侵害に該当することがある。" },
      { label: "D", text: "同じ質問を複数回入力して回答が一致することは、出力内容の客観性の一つの根拠になることがある。", correct: true },
    ],
  },
];
export const PH_BIOPSY: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "① AIの基本的理解",
    questions: [
      {
        id: "PH-B01", keyword: "動作原理",
        text: "LLM（大規模言語モデル）の基本的な動作の説明として、最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "与えられた文脈に基づき、次に続く語の確率分布を推定しながら文章を生成する。", correct: true },
          { label: "B", text: "内部に保存された知識データベースに基づき、意味解析を行ったうえで回答を生成する。" },
          { label: "C", text: "事前に定義されたルールベースの推論エンジンに基づき、論理的に最適解を生成する。" },
          { label: "D", text: "最新情報を引用・参照するため、外部検索結果に基づき回答を生成する。" },
        ],
      },
      {
        id: "PH-B02", keyword: "苦手タスク",
        text: "外部ツールを使わず、LLM単体で実行する場合に、構造的にミスが起きやすいタスクとして最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "長文の要点整理（論旨の抽出・箇条書き化）" },
          { label: "B", text: "与えられた仕様に沿った一般的なコード断片の生成" },
          { label: "C", text: "アイデアの発散（代替案の列挙、観点出し）" },
          { label: "D", text: "数値演算（多桁の計算、会計計算の整合性チェック）", correct: true },
        ],
      },
      {
        id: "PH-B03", keyword: "トークン",
        text: "AIが言葉を処理する際の基本単位である「トークン」に関する理解として、不適切なものはどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "トークンは文章を数値化した単位であり、扱える情報量に関係するものである。" },
          { label: "B", text: "トークン数は、API利用料などのコスト算定の基準となるものである。" },
          { label: "C", text: "トークンは、単語だけではなく文字列の一部や記号単位でも区切られるものである。" },
          { label: "D", text: "トークン数は、増えるほど回答の正確性が安定的に高まるものである。", correct: true },
        ],
      },
      {
        id: "PH-B04", keyword: "知識継続アップデート",
        text: "AI技術の進化が速い中、業務でAIを使う人が取るべき行動として、最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "一度習得したプロンプト技法やツール選定の基準は、業務効率を保つため当面は変更せず使い続ける。" },
          { label: "B", text: "新しいモデルやツールが出ても、社内事例や業界標準が固まってから本格導入を検討するようにする。" },
          { label: "C", text: "半年前に有効だった使い方や前提が現在も妥当かを定期的に検証し、必要に応じて手法を更新する。", correct: true },
          { label: "D", text: "公式リリースノートや技術ブログより、社内の先輩や上司の経験則を優先して活用方法を決めていく。" },
        ],
      },
    ],
  },
  {
    area: "② AIの使いこなし力",
    questions: [
      {
        id: "PH-B05", keyword: "コンテキスト設計",
        text: "社内の特定業務に関するコンテクストをAIに提示する際、回答の精度と実用性を最大化するための利用方法として最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "最小限の目的のみを伝え、不足情報は対話の中で補完するアプローチをとる。" },
          { label: "B", text: "関連資料を包括的に入力し、AIに全体像を把握させるアプローチをとる。" },
          { label: "C", text: "情報を優先度などの観点でまとめ、構造化して提示するアプローチをとる。", correct: true },
          { label: "D", text: "回答形式を厳密に指定し、背景情報は極力省略するアプローチをとる。" },
        ],
      },
      {
        id: "PH-B06", keyword: "Few-shot",
        text: "AIに期待する回答形式を教える「Few-shotプロンプティング」の手法として正しいものはどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "回答の根拠を段階的に説明させる指示を入力する。" },
          { label: "B", text: "関連する背景知識のいくつかをあらかじめ入力する。" },
          { label: "C", text: "質問に対する回答例を提示した上で、本来の質問を入力する。", correct: true },
          { label: "D", text: "同じ質問を形式は変えないままで複数回入力する。" },
        ],
      },
      {
        id: "PH-B07", keyword: "制約条件",
        text: "AIの出力を特定のルールや形式に縛る「制約条件」の与え方として、回答が最も安定し、意図しない出力を防げるアプローチはどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "禁止事項を明文化して、箇条書きで列挙する方法をとる。" },
          { label: "B", text: "出力すべき状態を肯定的に定義する方法をとる。", correct: true },
          { label: "C", text: "記号や区切りを指定して出力形式を整える方法をとる。" },
          { label: "D", text: "制約条件をできるだけ詳細に網羅する方法をとる。" },
        ],
      },
      {
        id: "PH-B08", keyword: "Chain of Thought",
        text: "「Chain of Thought（思考の連鎖）」の概念の説明として、最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "複数モデルを連結して回答を導く構成手法である。" },
          { label: "B", text: "長い履歴から重要文脈を抽出し維持する手法である。" },
          { label: "C", text: "推論を段階的に出力させることで正確性を高める手法である。", correct: true },
          { label: "D", text: "複数回答を比較し最適解を選ぶ合議型手法である。" },
        ],
      },
    ],
  },
  {
    area: "③ AIの活用深度",
    questions: [
      {
        id: "PH-B09", keyword: "RAG",
        text: "社内規定やマニュアルなど、AIが学習していない自社独自の情報を参照させて回答させる技術を何と呼びますか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "Fine-tuning（追加学習）" },
          { label: "B", text: "RAG（検索拡張生成）", correct: true },
          { label: "C", text: "Reinforcement Learning（強化学習）" },
          { label: "D", text: "GAN（敵対的生成ネットワーク）" },
        ],
      },
      {
        id: "PH-B10", keyword: "データ形式",
        text: "AIにデータを読み込ませたり、抽出したりする際、最も処理精度が高くなりやすく、コスト効率の観点でも優れたデータ形式はどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "固定レイアウトで構成された、検索可能なテキストレイヤー付きの「PDF」" },
          { label: "B", text: "セルの結合や色付け、マクロなどを用いて視覚的に整理された「Excel（.xlsx）」" },
          { label: "C", text: "JSON、Markdown、CSVなどの、意味構造が明示された「構造化・半構造化データ」", correct: true },
          { label: "D", text: "接続詞や装飾を省き、事実のみを羅列した「プレーンテキスト（.txt）」の長文" },
        ],
      },
      {
        id: "PH-B11", keyword: "ワークフロー設計",
        text: "AIとノーコードツールを連携させた業務ワークフローを構築する際、中長期的な運用の安定性と信頼性を保証するアプローチとして、最も適切なものはどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "現行の手順をツール上で忠実に再現し、全工程の進捗管理までAIに委ねる処理構成にする。" },
          { label: "B", text: "データの加工から出力までを一つのプロンプトに集約する。" },
          { label: "C", text: "業務工程を「決まった手順で処理する部分」と「AIで処理する部分」に明確に切り分け、小さな機能単位に分割する。", correct: true },
          { label: "D", text: "AIが最適な処理手順を自律的に判断できる構成にする。" },
        ],
      },
      {
        id: "PH-B12", keyword: "API・ツール選定",
        text: "「自社のWebサイト上の問い合わせフォームに来た質問に対し、自社データベースを参照して自動回答するシステムを作りたい」場合、最も適切な手段はどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "自社データをAIモデルに「Fine-tuning（追加学習）」させ、専用の特化型モデルを構築する。" },
          { label: "B", text: "事前に想定されるQ&Aを登録し、キーワードに反応して定型文を返す「シナリオ型ボット」を導入する。" },
          { label: "C", text: "APIを利用し、RAG（検索拡張生成）を持ったチャットボットシステムを構築（または導入）する。", correct: true },
          { label: "D", text: "LLMのコンテキストウィンドウを活用し、プロンプトにデータベースの情報を入力する。" },
        ],
      },
    ],
  },
  {
    area: "④ リスク管理・ガバナンス",
    questions: [
      {
        id: "PH-B13", keyword: "情報漏洩",
        text: "業務で学習利用が無効化されていない外部のAIツールを利用する際、行動として最も不適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "すでに一般公開されている自社のプレスリリースの要約をする。" },
          { label: "B", text: "自社製品に使用しているプログラミングコード（公開済みOSS）の修正をする。" },
          { label: "C", text: "未発表の売上データを自社名・顧客名をマスキングした状態で入力する。", correct: true },
          { label: "D", text: "構想中の新卒採用の募集要項の一部を入力し、キャッチコピーを作成する。" },
        ],
      },
      {
        id: "PH-B14", keyword: "ハルシネーション対策",
        text: "AIがもっともらしい誤り（ハルシネーション）を出すことへの対策として、最も不適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "根拠が不明な場合は不明である旨を明示するようAIに指示する。" },
          { label: "B", text: "精度や安全性が改善された上位モデルに切り替える。" },
          { label: "C", text: "重要な主張は一次情報に当たり、根拠を確認したうえで利用する。" },
          { label: "D", text: "同じ質問を複数回入力し、回答が一致したものを採用する。", correct: true },
        ],
      },
      {
        id: "PH-B15", keyword: "著作権",
        text: "AIを使った画像生成において、著作権侵害のリスクが高まるケースはどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "「19世紀の印象派風」など、一般的な作風（スタイル）のみを指定して風景画を生成する。" },
          { label: "B", text: "特定のキャラクター名は一切使わず、そのキャラクターを象徴する外見的特徴をプロンプトで指定して生成する。", correct: true },
          { label: "C", text: "自社が権利を持つオリジナルキャラクターの「公式デザイン指示書」を参照させて生成する。" },
          { label: "D", text: "著作権の保護期間が満了しているパブリックドメインの古典絵画を、背景資料として参照させて生成する。" },
        ],
      },
      {
        id: "PH-B16", keyword: "バイアス",
        text: "AIの出力に含まれる可能性のある「バイアス（偏り）」に関する説明として、最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "AIは学習データや評価基準の偏りに影響を受け、出力が特定の方向に偏る。", correct: true },
          { label: "B", text: "AIが大量のデータで学習した場合、出力において個別の偏見は平均化する。" },
          { label: "C", text: "バイアスはユーザーの入力が原因であり、モデル側のデータや設計とはあまり関係なく発生する。" },
          { label: "D", text: "バイアスは主にランダムな生成ゆらぎによるもので、データの偏りとは独立に発生する。" },
        ],
      },
    ],
  },
];

// ── PS 個人 Soft ──────────────────────────────────────────────────
export const PS_HOOK: QuestionEntry = {
  id: "PS-H1", keyword: "ポータブルスキル・スタンス（総合）",
  text: "あなたは、日々の業務課題を自ら設定し、AIの回答を批判的に検証しながら使いこなす「主体的な姿勢」を持っていますか？",
  format: "state", respondent: "従業員",
  choices: [
    { label: "5", text: "【変革・創造】AI活用を前提に業務フローを設計・改善し、その実践内容を共有することで周囲の業務にも変化を生んでいる。" },
    { label: "4", text: "【自律的活用】業務課題を自分で設定し、目的に応じてAIを使い分け、出力内容の検証も一定の頻度で行っている。" },
    { label: "3", text: "【限定的工夫】特定のタスクでは使い方を工夫しているが、課題設定の見直しや出力の批判的検証が継続的には行えていない。" },
    { label: "2", text: "【部分的利用】必要に応じてAIを利用することはあるが、業務課題の設定や使い方の改善を自分で行うことは少ない。" },
    { label: "1", text: "【受動的利用】依頼や指示がある場面でのみAIを利用し、出力内容の妥当性を確認する行動はほとんど行っていない。" },
  ],
};
export const PS_CHECKUP: QuestionEntry[] = [
  {
    id: "PS-C1", keyword: "課題設定力",
    text: "あなたは、業務の中から「AIで解くべき問い」を見つけ、目的から逆算して活用を設計できていますか？",
    format: "state", respondent: "従業員",
    choices: [
      { label: "5", text: "【再設計】「そもそもこの業務は必要か？」の観点も含め、目的から業務とAI活用を再設計している。" },
      { label: "4", text: "【構造化】複雑な業務をAIが処理できるタスクに分解し、使い方を設計できている。" },
      { label: "3", text: "【単発】目の前の作業を楽にする目的で、使いどころを思いつくことがある。" },
      { label: "2", text: "【模倣】他人の活用事例（議事録など）を参考にし、同じ用途で試すことが多い。" },
      { label: "1", text: "【なし】どの業務にAIを使えばよいか、判断の切り口がまだ定まっていない。" },
    ],
  },
  {
    id: "PS-C2", keyword: "目的志向",
    text: "あなたは、AIを使うこと自体を目的にせず、「業務改善」や「成果」から逆算してAI活用の設計ができていますか？",
    format: "state", respondent: "従業員",
    choices: [
      { label: "5", text: "【ROI視点】かけた時間や労力に対して得られた成果を指標で振り返り、検討している。" },
      { label: "4", text: "【全体最適】自分の工程に加え、前後工程やチーム全体への影響も考慮して活用している。" },
      { label: "3", text: "【品質意識】時間短縮に加え、アウトプットの質の向上も意識して活用している。" },
      { label: "2", text: "【効率化】主に自分の作業の効率化による時間短縮を目的として活用している。" },
      { label: "1", text: "【目的未整理】AIを使うこと自体が目的になり、成果との紐づけが明確でないことがある。" },
    ],
  },
  {
    id: "PS-C3", keyword: "批判的思考",
    text: "あなたは、AIの出力結果を鵜呑みにせず、「真偽や妥当性を批判的に考える」プロセスを経て業務に利用していますか？",
    format: "state", respondent: "従業員",
    choices: [
      { label: "5", text: "【最終判断】AIの出力は補佐として扱い、最終的な判断・品質確認は自分が担う前提で運用している。" },
      { label: "4", text: "【論理検証】結論だけでなく前提・条件・推論のつながりに矛盾がないかを確認している。" },
      { label: "3", text: "【事実確認】数字や固有名詞など、検証しやすい点を中心にファクトチェックしている。" },
      { label: "2", text: "【形式確認】誤字脱字や体裁は確認するが、内容の根拠や論理の確認は十分でないことがある。" },
      { label: "1", text: "【未検証】AIの出力を前提確認せず、そのまま使うことがある。" },
    ],
  },
  {
    id: "PS-C4", keyword: "開放性・柔軟性",
    text: "あなたは、新しいAIツールや機能がリリースされた際、抵抗感や先入観を持たず「まずは一度触ってみる」行動をとっていますか？",
    format: "state", respondent: "従業員",
    choices: [
      { label: "5", text: "【探索・学習】新情報を把握し、業務での使いどころを小さく試して適用可否を判断している。" },
      { label: "4", text: "【自発的試行】必要性や関心がある機能は、指示がなくても自分で試すことがある。" },
      { label: "3", text: "【受容】推奨されたツールは、案内に沿ってとりあえず試してみる。" },
      { label: "2", text: "【段階導入】周囲が使い始めて、運用上の注意点や安全面が分かってから使い始める。" },
      { label: "1", text: "【未着手】新しいツールは、業務影響やリスクが読めず後回しにしがちで、触らないことが多い。" },
    ],
  },
];
export const PS_BIOPSY: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "⑤ 課題設定力",
    questions: [
      { id: "PS-B01", keyword: "課題発見", text: "あなたは、日々の定型業務に対し、「AIで代替可能な部分はあるか？」という問いを自ら立てていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B02", keyword: "As-Is/To-Be", text: "あなたは、AI活用後の理想状態（所要時間の短縮など）と現状の業務課題とのギャップを言語化できていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B03", keyword: "選別眼", text: "あなたは、AIを使わない方が適切な業務（既存手法で対応可能なもの）を判別できていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B04", keyword: "分解力", text: "あなたは、複雑または曖昧な課題を、AIが処理可能な単位のタスクに分解できていますか？", format: "likert", respondent: "従業員" },
    ],
  },
  {
    area: "⑥ 目的志向",
    questions: [
      { id: "PS-B05", keyword: "逆算思考", text: "あなたは、「AIを使うこと」自体を目的とせず、業務成果（時間短縮・品質向上）から逆算できていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B06", keyword: "全体俯瞰", text: "あなたは、自分の工程だけでなく、全体の業務フローへの影響を考慮できていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B07", keyword: "ROI", text: "あなたは、AI利用にかかる時間・コストと得られる成果のバランス（投資対効果）を意識していますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B08", keyword: "完了定義", text: "あなたは、AIに指示を出す前に、どんな状態になったら完成かをあらかじめ決めていますか？", format: "likert", respondent: "従業員" },
    ],
  },
  {
    area: "⑦ 批判的思考",
    questions: [
      { id: "PS-B09", keyword: "ファクトチェック", text: "あなたは、AIの出力結果について、一次情報や事実を確認していますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B10", keyword: "論理検証", text: "あなたは、AIが出力した内容のロジックに飛躍や矛盾がないか、自身で検討していますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B11", keyword: "当事者意識", text: "あなたは、AIが出力した内容であっても、自分自身の仕事の成果物として品質を担保する意識を持っていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B12", keyword: "倫理観", text: "あなたは、AIの利用方法や出力結果について、倫理的・道徳的観点からチェックしていますか？", format: "likert", respondent: "従業員" },
    ],
  },
  {
    area: "⑧ 開放性・柔軟性",
    questions: [
      { id: "PS-B13", keyword: "受容性", text: "あなたは、新しいAIツールや機能が公開された際に、一度は試したいと思っていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B14", keyword: "試行錯誤", text: "あなたは、最初から完璧であることを求めずに、試行を重ねて改善しようとしていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B15", keyword: "学習意欲", text: "あなたは、既存の方法だけではなく、AI時代の新しい手法を学びたいと思っていますか？", format: "likert", respondent: "従業員" },
      { id: "PS-B16", keyword: "自走性", text: "あなたは、会社からの指示を待つだけでなく、自らアンラーニング（これまでの仕事のやり方や成功体験を手放した学び直し）を目的とした情報収集やスキル向上に取り組んでいますか？", format: "likert", respondent: "従業員" },
    ],
  },
];

// ── Lab 追加設問（Depth 4） ─────────────────────────────────────────

export const OH_LAB: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "C-01 対応: 戦略・KGI",
    questions: [
      { id: "OH-L01", keyword: "進捗レビュー", text: "AI活用のKGIについて、四半期ごとなど定期的な進捗レビューの場が設けられており、結果に応じた方針修正が行われていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "C-02 対応: ガバナンス",
    questions: [
      { id: "OH-L02", keyword: "インシデント対応", text: "AIの利用に関するインシデント（情報漏洩リスク等）が発生した際の対応手順が明確に定められており、担当者への周知がされていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "C-03 対応: データ・基盤",
    questions: [
      { id: "OH-L03", keyword: "データ品質", text: "AIに活用するデータの品質（正確性・最新性・網羅性）を維持・管理するための仕組みが整備されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "C-04 対応: プロセス・オペレーション",
    questions: [
      { id: "OH-L04", keyword: "定着度計測", text: "AI活用標準プロセスの定着度を測るための指標（利用率・エラー率・工数削減率など）が設けられており、定期的にモニタリングされていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
];

export const OS_LAB: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "C-05 対応: 挑戦文化",
    questions: [
      { id: "OS-L01", keyword: "実験的取組み", text: "部門横断のAI活用実験プロジェクトや、チーム内でのハッカソン的な取り組みが行われており、成功・失敗に関わらず知見が共有されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "C-06 対応: 機敏性",
    questions: [
      { id: "OS-L02", keyword: "効果計測・見直し", text: "AIを活用した施策の効果を短期間で計測し、その結果に基づいて優先度や方向性を迅速に見直す仕組みがありますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "C-07 対応: HR・評価",
    questions: [
      { id: "OS-L03", keyword: "学習支援", text: "従業員のAIスキルアップのために、研修プログラムや学習支援（費用補助・学習時間の確保等）が整備されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
  {
    area: "C-08 対応: 知の共有",
    questions: [
      { id: "OS-L04", keyword: "ナレッジ更新", text: "共有されたAI活用ナレッジが陳腐化しないよう、定期的な内容の見直しや更新の仕組みが整備されていますか？", format: "likert", respondent: "DX部署担当者" },
    ],
  },
];

export const PH_LAB: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "C-09 対応: AIの基本的理解",
    questions: [
      {
        id: "PH-L01", keyword: "マルチモーダル",
        text: "マルチモーダルAIの説明として最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "テキストだけでなく、画像・音声・動画など複数の形式のデータを入力・処理できるAI", correct: true },
          { label: "B", text: "複数のAIモデルを組み合わせて最終的な回答を多数決で決定するAI" },
          { label: "C", text: "複数のユーザーが同時にアクセスできるマルチテナント対応のAIサービス" },
          { label: "D", text: "物理的に複数のサーバーに分散して動作するAIインフラ" },
        ],
      },
    ],
  },
  {
    area: "C-10 対応: AIの使いこなし力",
    questions: [
      {
        id: "PH-L02", keyword: "ロールプロンプティング",
        text: "AIに専門家・役割を与える「ロールプロンプティング」の効果として最も適切なものはどれですか？",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "AIの応答速度が向上し、処理時間が短縮される" },
          { label: "B", text: "指定された役割に合わせた語調・専門性・視点で回答を生成しやすくなる", correct: true },
          { label: "C", text: "AIが役割に応じた外部ツールや検索エンジンを自動で選択する" },
          { label: "D", text: "AIが過去の会話履歴を自動でロールバックし、正確な情報のみを返す" },
        ],
      },
    ],
  },
  {
    area: "C-11 対応: AIの活用深度",
    questions: [
      {
        id: "PH-L03", keyword: "AIエージェント",
        text: "「AIエージェント」の主な特徴として最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "人間が入力するたびに単一のタスクを実行するAIアシスタント" },
          { label: "B", text: "AIが目標に向けて自律的に計画・実行・検証のサイクルを繰り返す仕組み", correct: true },
          { label: "C", text: "AIが人間の代わりに意思決定の最終承認まで行う完全自動化システム" },
          { label: "D", text: "特定業種向けに業務フローが事前設定された業界特化型AIサービス" },
        ],
      },
    ],
  },
  {
    area: "C-12 対応: リスク管理・ガバナンス",
    questions: [
      {
        id: "PH-L04", keyword: "生成コードのリスク",
        text: "AIが生成したコードを業務利用する際のリスクとして最も適切なものを選んでください。",
        format: "quiz-single", respondent: "従業員",
        choices: [
          { label: "A", text: "AIはコードを生成する際に著作権を自動付与するため、利用に法的制限がかかる" },
          { label: "B", text: "動作するコードでもセキュリティ上の脆弱性が含まれている可能性がある", correct: true },
          { label: "C", text: "生成されたコードはAIサーバーにキャッシュされ、第三者に流出する可能性がある" },
          { label: "D", text: "AIはプログラミング言語ごとに精度が固定されており、特定言語では必ずエラーになる" },
        ],
      },
    ],
  },
];

export const PS_LAB: { area: string; questions: QuestionEntry[] }[] = [
  {
    area: "C-13 対応: 課題設定力",
    questions: [
      { id: "PS-L01", keyword: "仮説検証", text: "あなたは、AI活用の効果を事前に仮説として立て、実施後に検証するという仮説検証のサイクルを実践していますか？", format: "likert", respondent: "従業員" },
    ],
  },
  {
    area: "C-14 対応: 目的志向",
    questions: [
      { id: "PS-L02", keyword: "成果の共有・報告", text: "あなたは、AIを使った業務改善の成果を、上司や関係者に対して定期的に報告・共有していますか？", format: "likert", respondent: "従業員" },
    ],
  },
  {
    area: "C-15 対応: 批判的思考",
    questions: [
      { id: "PS-L03", keyword: "多角的視点", text: "あなたは、AIの出力が特定の視点や文化的背景に偏っていないか、複数の観点から検討していますか？", format: "likert", respondent: "従業員" },
    ],
  },
  {
    area: "C-16 対応: 開放性・柔軟性",
    questions: [
      { id: "PS-L04", keyword: "知見の横展開", text: "あなたは、自分が習得したAI活用の知見や有効なツールを、同僚や後輩に積極的に共有していますか？", format: "likert", respondent: "従業員" },
    ],
  },
];
