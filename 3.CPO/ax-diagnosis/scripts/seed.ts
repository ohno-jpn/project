/**
 * AX-Diagnosis シードスクリプト
 * 実行: npx tsx scripts/seed.ts
 * 事前に .env.local の NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import {
  OH_HOOK, OH_CHECKUP, OH_BIOPSY, OH_LAB,
  OS_HOOK, OS_CHECKUP, OS_BIOPSY, OS_LAB,
  PH_HOOK, PH_CHECKUP, PH_BIOPSY, PH_LAB,
  PS_HOOK, PS_CHECKUP, PS_BIOPSY, PS_LAB,
  type QuestionEntry,
} from "../lib/question-reference-data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// ── ヘルパー ────────────────────────────────────────────────────────

type QRow = {
  id: string; axis: string; depth: string; area: string | null;
  keyword: string; text: string; format: string; respondent: string; sort_order: number;
};
type CRow = { question_id: string; label: string; text: string; is_correct: boolean; sort_order: number };

function collectSingle(axis: string, depth: string, q: QuestionEntry, sortBase = 0) {
  const qRow: QRow = { id: q.id, axis, depth, area: null, keyword: q.keyword, text: q.text, format: q.format, respondent: q.respondent, sort_order: sortBase };
  const cRows: CRow[] = (q.choices ?? []).map((c, i) => ({ question_id: q.id, label: c.label, text: c.text, is_correct: c.correct ?? false, sort_order: i }));
  return { qRows: [qRow], cRows };
}

function collectArray(axis: string, depth: string, qs: QuestionEntry[]) {
  const qRows: QRow[] = [];
  const cRows: CRow[] = [];
  qs.forEach((q, i) => {
    qRows.push({ id: q.id, axis, depth, area: null, keyword: q.keyword, text: q.text, format: q.format, respondent: q.respondent, sort_order: i });
    (q.choices ?? []).forEach((c, j) => cRows.push({ question_id: q.id, label: c.label, text: c.text, is_correct: c.correct ?? false, sort_order: j }));
  });
  return { qRows, cRows };
}

function collectGrouped(axis: string, depth: string, groups: { area: string; questions: QuestionEntry[] }[]) {
  const qRows: QRow[] = [];
  const cRows: CRow[] = [];
  groups.forEach((g, gi) => {
    g.questions.forEach((q, qi) => {
      qRows.push({ id: q.id, axis, depth, area: g.area, keyword: q.keyword, text: q.text, format: q.format, respondent: q.respondent, sort_order: gi * 100 + qi });
      (q.choices ?? []).forEach((c, j) => cRows.push({ question_id: q.id, label: c.label, text: c.text, is_correct: c.correct ?? false, sort_order: j }));
    });
  });
  return { qRows, cRows };
}

// ── 設問データ収集 ──────────────────────────────────────────────────

const allQRows: QRow[] = [];
const allCRows: CRow[] = [];

function push(r: { qRows: QRow[]; cRows: CRow[] }) {
  allQRows.push(...r.qRows);
  allCRows.push(...r.cRows);
}

push(collectSingle("OH", "hook",    OH_HOOK));
push(collectArray ("OH", "checkup", OH_CHECKUP));
push(collectGrouped("OH","biopsy",  OH_BIOPSY));
push(collectGrouped("OH","lab",     OH_LAB));

push(collectSingle("OS", "hook",    OS_HOOK));
push(collectArray ("OS", "checkup", OS_CHECKUP));
push(collectGrouped("OS","biopsy",  OS_BIOPSY));
push(collectGrouped("OS","lab",     OS_LAB));

push(collectSingle("PH", "hook",    PH_HOOK));
push(collectArray ("PH", "checkup", PH_CHECKUP));
push(collectGrouped("PH","biopsy",  PH_BIOPSY));
push(collectGrouped("PH","lab",     PH_LAB));

push(collectSingle("PS", "hook",    PS_HOOK));
push(collectArray ("PS", "checkup", PS_CHECKUP));
push(collectGrouped("PS","biopsy",  PS_BIOPSY));
push(collectGrouped("PS","lab",     PS_LAB));

// ── Hook レベル定義データ ───────────────────────────────────────────

const HOOK_LEVELS = [
  { id: "H-01", axis: "OH", axis_label: "組織 Hard", title: "戦略・基盤（総合）", sort_order: 0, levels: [
    { level: 1, keyword: "未整備",   description: "全社戦略（KGI・ロードマップ）とルールが未整備で、現場で利用可能なAI環境も十分に提供されていない状態である。" },
    { level: 2, keyword: "ツール導入", description: "ChatGPT等のツールは導入されているが、全社戦略や利用ルールが明確に整備されていない状態である。" },
    { level: 3, keyword: "部分整備",  description: "一部の部署では活用が進んでいるが、全社的な戦略やルール、環境整備が統合されていない状態である。" },
    { level: 4, keyword: "基盤整備",  description: "ガイドラインと利用環境は整備されているが、KGI達成に向けたロードマップの共有・運用は途上の状態である。" },
    { level: 5, keyword: "統合運用",  description: "全社戦略に基づき環境とルールが整備され、現場での運用に組み込まれて継続的に活用されている状態である。" },
  ]},
  { id: "H-02", axis: "OS", axis_label: "組織 Soft", title: "文化・風土（総合）", sort_order: 1, levels: [
    { level: 1, keyword: "減点主義・属人化", description: "失敗が不利益として扱われやすく、学びや事例が個人や部門内に留まり、共有が進まない状態である。" },
    { level: 2, keyword: "静観",             description: "挑戦は抑制されがちで、現状維持が選ばれやすく、AI活用や改善行動が評価に結びつきにくい状態である。" },
    { level: 3, keyword: "限定的挑戦",       description: "一部の部署や個人は試行しているが、取組みは限定的で、支援や共有の仕組みが十分に機能していない状態である。" },
    { level: 4, keyword: "推奨・共有",       description: "挑戦は支持され成功事例の共有は行われるが、失敗事例の共有や学びの横展開は限定的な状態である。" },
    { level: 5, keyword: "称賛・学習",       description: "挑戦が失敗も含めて組織的に奨励され、知見が部門を越えて共有され、改善が継続的に循環している状態である。" },
  ]},
  { id: "H-03", axis: "PH", axis_label: "個人 Hard", title: "テクニカルスキル（総合）", sort_order: 2, levels: [
    { level: 1, keyword: "未活用層", description: "AIの仕組みやリスクを理解しておらず、活用していないか、危険な使い方をしている状態。" },
    { level: 2, keyword: "実践開始", description: "基本的な仕組みを理解し、単タスクでAIを日常的に使っている状態。" },
    { level: 3, keyword: "自律活用", description: "主要モデルやツールの特性を理解し、目的に応じて適切に選択・活用できている状態。" },
    { level: 4, keyword: "業務統合", description: "技術動向を自律的に追跡し、業務フロー全体にAIを最適に組み込んで運用している状態。" },
    { level: 5, keyword: "組織波及", description: "ビジネス価値と技術的妥当性からAI活用機会を評価し、組織全体の技術水準を底上げしている状態。" },
  ]},
  { id: "H-04", axis: "PS", axis_label: "個人 Soft", title: "ポータブルスキル・スタンス（総合）", sort_order: 3, levels: [
    { level: 1, keyword: "無自覚層", description: "業務でのAI活用を自分事にできず、回答を盲信するか過度に疑い、変化を拒んでいる状態。" },
    { level: 2, keyword: "受動利用", description: "明確な目的を持たず、与えられた課題に対して受動的・指示待ちでAIを利用するにとどまる状態。" },
    { level: 3, keyword: "自律活用", description: "AIの回答を疑い、自身のタスクで批判的視点と柔軟な試行錯誤を日常的に発揮できる状態。" },
    { level: 4, keyword: "業務統合", description: "今の仕事のやり方自体が最適かを疑い、AI前提で業務プロセス全体を再構築できる状態。" },
    { level: 5, keyword: "組織波及", description: "自らの姿勢を周囲に伝播させ、組織全体へAI活用を促す影響力を広げているリーダーの状態。" },
  ]},
];

// ── Checkup レベル定義データ ────────────────────────────────────────

const CHECKUP_LEVELS = [
  { id: "C-01", axis: "OH", axis_label: "組織 Hard", title: "戦略・KGI",           sort_order: 0,  levels: [
    { level: 1, keyword: "未定義",   description: "全社の経営課題とAI活用の目的が明確に定義されておらず、導入自体が目的化している状態である。" },
    { level: 2, keyword: "部分設定", description: "部署単位では改善目標が設定されているが、全社の経営課題とは明確に接続されていない状態である。" },
    { level: 3, keyword: "定性",     description: "全社方針は示されているが、ROIや削減額などの定量指標が具体的に設定されていない状態である。" },
    { level: 4, keyword: "定量",     description: "経営課題に連動した削減額や創出額などの数値目標が設定され、進捗管理が行われている状態である。" },
    { level: 5, keyword: "浸透",     description: "経営課題に紐づく数値目標が全社で共有され、業務上の意思決定基準として活用されている状態である。" },
  ]},
  { id: "C-02", axis: "OH", axis_label: "組織 Hard", title: "ガバナンス",           sort_order: 1,  levels: [
    { level: 1, keyword: "未整備",   description: "利用に関する明確なガイドラインや倫理規定が整備されておらず、各自の判断で利用している状態である。" },
    { level: 2, keyword: "禁止",     description: "リスク回避を優先し、原則禁止または極めて限定的な利用に制限している運用状態である。" },
    { level: 3, keyword: "形式",     description: "ガイドラインは策定されているが、周知や遵守を担保する仕組みが十分に機能していない状態である。" },
    { level: 4, keyword: "運用",     description: "明確な利用ルールと承認プロセスが整備され、定期的な見直しが実施されている状態である。" },
    { level: 5, keyword: "自動運用", description: "入力制御や監視機能がシステムとして実装され、安全性と利便性を両立した運用が行われている状態である。" },
  ]},
  { id: "C-03", axis: "OH", axis_label: "組織 Hard", title: "データ・基盤",         sort_order: 2,  levels: [
    { level: 1, keyword: "未導入", description: "業務で利用可能なAIツールが組織として導入されておらず、正式な利用環境が整備されていない状態である。" },
    { level: 2, keyword: "汎用",   description: "ChatGPT等の汎用チャットツールは導入されているが、社内データとの連携は行われていない状態である。" },
    { level: 3, keyword: "連携",   description: "データ活用基盤は構築されているが、データ整備や精度の課題により十分に活用されていない状態である。" },
    { level: 4, keyword: "統合",   description: "社内データと連携した専用アプリが業務フローに組み込まれ、継続的に利用されている状態である。" },
    { level: 5, keyword: "高度化", description: "API連携やFine-tuning（追加学習）を活用し、自社要件に最適化された基盤が構築されている状態である。" },
  ]},
  { id: "C-04", axis: "OH", axis_label: "組織 Hard", title: "プロセス・オペレーション", sort_order: 3, levels: [
    { level: 1, keyword: "属人化",   description: "一部の担当者が個別にAIを利用しているが、組織として標準化や共有は行われていない状態である。" },
    { level: 2, keyword: "散発的",   description: "議事録要約など特定の業務では利用されているが、全体最適を意識した設計には至っていない状態である。" },
    { level: 3, keyword: "標準化中", description: "特定業務において標準フローの整備を進めているが、定着や横展開が十分ではない状態である。" },
    { level: 4, keyword: "定着",     description: "標準プロセスとして文書化され、担当者に依存せず一定品質で運用されている状態である。" },
    { level: 5, keyword: "自律改善", description: "標準プロセスを基盤に、現場主導でフローやプロンプトの継続的な改善が行われている状態である。" },
  ]},
  { id: "C-05", axis: "OS", axis_label: "組織 Soft", title: "挑戦文化",             sort_order: 4,  levels: [
    { level: 1, keyword: "減点主義", description: "業務上の失敗に対する評価が厳しく、新しい取り組みよりも既存手法の維持が優先される傾向にある状態である。" },
    { level: 2, keyword: "静観",     description: "新しい技術や方法を試すことは制限されていないが、自発的な実験や提案がほとんど見られない状態である。" },
    { level: 3, keyword: "一部挑戦", description: "特定の部署や個人は試行を行っているが、組織全体へ広がる仕組みは十分に機能していない状態である。" },
    { level: 4, keyword: "推奨",     description: "挑戦や実験が明示的に支持され、試行結果が組織内で共有・活用されている状態である。" },
    { level: 5, keyword: "称賛",     description: "失敗も含めた挑戦が組織的に奨励され、挑戦者が称賛される文化が根付いている状態である。" },
  ]},
  { id: "C-06", axis: "OS", axis_label: "組織 Soft", title: "機敏性",               sort_order: 5,  levels: [
    { level: 1, keyword: "硬直",   description: "意思決定に時間がかかり、変化への対応が遅く、現場に裁量権がほとんどない状態である。" },
    { level: 2, keyword: "調整中", description: "スピードの重要性は認識されているが、決裁フローや組織構造がボトルネックになっている状態である。" },
    { level: 3, keyword: "部分権限", description: "一部の業務では現場が自律的に動いているが、全体としてはまだ承認コストが高い状態である。" },
    { level: 4, keyword: "分権",    description: "明確な権限委譲のもとで現場が意思決定でき、変化への対応速度が高い状態である。" },
    { level: 5, keyword: "自律組織", description: "組織全体がアジャイルに動き、継続的な学習と自律的な改善サイクルが回っている状態である。" },
  ]},
  { id: "C-07", axis: "OS", axis_label: "組織 Soft", title: "HR・評価",             sort_order: 6,  levels: [
    { level: 1, keyword: "無関係",   description: "AI活用や変革への取り組みが、人事評価や採用基準にまったく反映されていない状態である。" },
    { level: 2, keyword: "検討中",   description: "評価制度の見直しは議論されているが、具体的な制度変更には至っていない状態である。" },
    { level: 3, keyword: "一部反映", description: "AI活用推進者を評価する試みはあるが、制度として体系化されていない状態である。" },
    { level: 4, keyword: "制度化",   description: "AI活用や変革への貢献が評価基準として明示化され、昇進・報酬に反映されている状態である。" },
    { level: 5, keyword: "変革人材軸", description: "採用・評価・育成のすべてにAI変革スキルが統合され、組織の人材戦略の中核になっている状態である。" },
  ]},
  { id: "C-08", axis: "OS", axis_label: "組織 Soft", title: "知の共有",             sort_order: 7,  levels: [
    { level: 1, keyword: "属人化",   description: "ナレッジが個人や特定チームに留まり、組織として共有・蓄積される仕組みがない状態である。" },
    { level: 2, keyword: "散発的",   description: "共有は行われるが、不定期かつ特定の個人・部署の主導に依存している状態である。" },
    { level: 3, keyword: "仕組みあり", description: "共有の場やツールは整備されているが、活用が限定的で形骸化しやすい状態である。" },
    { level: 4, keyword: "活発",     description: "ナレッジが継続的に蓄積・更新され、組織横断での活用が日常化している状態である。" },
    { level: 5, keyword: "学習組織", description: "知の共有が組織文化として根付き、外部知識も取り込みながら自律的に進化している状態である。" },
  ]},
  { id: "C-09", axis: "PH", axis_label: "個人 Hard", title: "AIの基本的理解",       sort_order: 8,  levels: [
    { level: 1, keyword: "未理解",   description: "AIの仕組みやリスクをほとんど理解しておらず、誤った使い方や過信・過度な不信が見られる状態。" },
    { level: 2, keyword: "概念理解", description: "LLMやプロンプトなど基本概念を理解しており、一般的な使い方ができる状態。" },
    { level: 3, keyword: "特性把握", description: "主要モデルの強み・弱みとリスク（幻覚・著作権等）を実務で活かせるレベルで把握している状態。" },
    { level: 4, keyword: "深い理解", description: "マルチモーダルやRAG、エージェントなど応用技術を理解し、業務設計に組み込める状態。" },
    { level: 5, keyword: "技術牽引", description: "最新技術を評価・実装し、組織の技術選定や教育に貢献できる状態。" },
  ]},
  { id: "C-10", axis: "PH", axis_label: "個人 Hard", title: "AIの使いこなし力",     sort_order: 9,  levels: [
    { level: 1, keyword: "未活用",     description: "AIを業務でほとんど利用しておらず、活用イメージが持てていない状態。" },
    { level: 2, keyword: "単純利用",   description: "要約・翻訳など単発タスクにAIを使えるが、複雑な業務への応用は難しい状態。" },
    { level: 3, keyword: "目的適合",   description: "タスクに合わせてAIを選択・組み合わせて使いこなせる状態。" },
    { level: 4, keyword: "高度活用",   description: "Few-shot・CoTなどの高度なプロンプト技法を使い、精度の高い成果物を生み出せる状態。" },
    { level: 5, keyword: "設計・改善", description: "AIを組み込んだワークフローを設計・改善し、チームの生産性を高められる状態。" },
  ]},
  { id: "C-11", axis: "PH", axis_label: "個人 Hard", title: "AIの活用深度",         sort_order: 10, levels: [
    { level: 1, keyword: "チャットのみ", description: "ChatGPT等のチャット機能のみを使っており、他の活用形態を知らない状態。" },
    { level: 2, keyword: "ツール活用",   description: "Copilot等の業務ツール組み込みAIを日常的に使っている状態。" },
    { level: 3, keyword: "API活用",      description: "APIを利用した簡単な自動化・連携を実現できる状態。" },
    { level: 4, keyword: "RAG・Agent",   description: "RAGやエージェントを活用した高度な業務自動化を実現できる状態。" },
    { level: 5, keyword: "アーキテクト", description: "複合的なAIシステムを設計・実装し、組織全体のAI活用基盤を構築できる状態。" },
  ]},
  { id: "C-12", axis: "PH", axis_label: "個人 Hard", title: "リスク管理・ガバナンス", sort_order: 11, levels: [
    { level: 1, keyword: "無自覚",   description: "AIのリスク（情報漏洩・著作権侵害・幻覚等）をほとんど認識していない状態。" },
    { level: 2, keyword: "認識",     description: "主なリスクは認識しているが、具体的な対策行動が伴っていない状態。" },
    { level: 3, keyword: "自己管理", description: "個人レベルで情報管理やファクトチェックを実践できている状態。" },
    { level: 4, keyword: "組織貢献", description: "ガイドライン策定やレビューに参画し、組織全体のリスク低減に貢献できる状態。" },
    { level: 5, keyword: "ガバナンス構築", description: "AI利用の安全基準を設計し、組織のガバナンス体制を主導できる状態。" },
  ]},
  { id: "C-13", axis: "PS", axis_label: "個人 Soft", title: "課題設定力",           sort_order: 12, levels: [
    { level: 1, keyword: "指示待ち", description: "与えられた作業のみを行い、AIで解くべき業務課題を自ら設定できない状態。" },
    { level: 2, keyword: "表面的",   description: "「○○が大変」という感覚はあるが、AIで解決できる具体的な問いを立てられない状態。" },
    { level: 3, keyword: "課題特定", description: "業務の非効率や課題を自ら特定し、AIで解決可能な問いに言語化できる状態。" },
    { level: 4, keyword: "戦略的",   description: "業務全体を俯瞰して優先課題を選定し、ROIを意識してAI活用を設計できる状態。" },
    { level: 5, keyword: "組織変革", description: "組織全体の課題構造を把握し、AI活用による事業変革の方向を提言できる状態。" },
  ]},
  { id: "C-14", axis: "PS", axis_label: "個人 Soft", title: "目的志向",             sort_order: 13, levels: [
    { level: 1, keyword: "ツール目的化", description: "AIを使うこと自体が目的化しており、業務成果との接続が意識されていない状態。" },
    { level: 2, keyword: "成果意識薄",   description: "成果を意識してはいるが、AIの活用が業務アウトカムに紐づいていない状態。" },
    { level: 3, keyword: "成果逆算",     description: "求める成果から逆算してAIの使いどころを決められる状態。" },
    { level: 4, keyword: "最適化",       description: "成果最大化の観点から、AI・人・プロセスを組み合わせて最適な手段を選べる状態。" },
    { level: 5, keyword: "価値創造",     description: "AIを活用して既存の枠を超えた新たな価値・サービスを創出できる状態。" },
  ]},
  { id: "C-15", axis: "PS", axis_label: "個人 Soft", title: "批判的思考",           sort_order: 14, levels: [
    { level: 1, keyword: "盲信",     description: "AIの回答をそのまま正しいと判断し、検証する意識がない状態。" },
    { level: 2, keyword: "漠然不信", description: "AIを過度に疑い、根拠なく拒否するか、全面的に信頼するかに偏りがある状態。" },
    { level: 3, keyword: "事実確認", description: "重要な情報はファクトチェックし、誤りを発見・修正できる状態。" },
    { level: 4, keyword: "多角検証", description: "出力の前提・バイアス・限界を複数の観点から体系的に評価できる状態。" },
    { level: 5, keyword: "教育・普及", description: "批判的思考の手法を組織に広め、集団的な判断品質の向上に貢献できる状態。" },
  ]},
  { id: "C-16", axis: "PS", axis_label: "個人 Soft", title: "開放性・柔軟性",       sort_order: 15, levels: [
    { level: 1, keyword: "拒絶",     description: "新技術やAIへの変化を拒み、現状維持を強く好む状態。" },
    { level: 2, keyword: "受動的",   description: "変化を受け入れはするが、自ら探索・試行しようとする姿勢が乏しい状態。" },
    { level: 3, keyword: "試行",     description: "新しいツールや手法を積極的に試し、学びを業務に活かそうとしている状態。" },
    { level: 4, keyword: "自律学習", description: "自ら学習計画を立て、継続的にAIスキルを更新し続けられる状態。" },
    { level: 5, keyword: "変化牽引", description: "変化を組織に積極的に取り込み、周囲の柔軟性を高める役割を果たしている状態。" },
  ]},
];

// ── シード実行 ──────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 シード開始...\n");

  // 1. 設問の投入
  console.log(`📝 設問 ${allQRows.length} 件を投入中...`);
  const { error: qErr } = await supabase.from("questions").upsert(allQRows, { onConflict: "id" });
  if (qErr) { console.error("設問エラー:", qErr); process.exit(1); }

  // 2. 選択肢の投入（既存を削除してから再投入）
  console.log(`📋 選択肢 ${allCRows.length} 件を投入中...`);
  const questionIds = [...new Set(allCRows.map(c => c.question_id))];
  for (const qId of questionIds) {
    await supabase.from("question_choices").delete().eq("question_id", qId);
  }
  const { error: cErr } = await supabase.from("question_choices").insert(allCRows);
  if (cErr) { console.error("選択肢エラー:", cErr); process.exit(1); }

  // 3. Hook レベル定義
  console.log(`📊 Hook レベル定義 ${HOOK_LEVELS.length} 件を投入中...`);
  const hookRows = HOOK_LEVELS.map(({ id, axis, axis_label, title, sort_order }) => ({ id, axis, axis_label, title, sort_order }));
  const { error: hlErr } = await supabase.from("hook_levels").upsert(hookRows, { onConflict: "id" });
  if (hlErr) { console.error("Hook レベルエラー:", hlErr); process.exit(1); }

  const hookItemRows = HOOK_LEVELS.flatMap(h => h.levels.map(l => ({ hook_id: h.id, level: l.level, keyword: l.keyword, description: l.description })));
  for (const h of HOOK_LEVELS) await supabase.from("hook_level_items").delete().eq("hook_id", h.id);
  const { error: hliErr } = await supabase.from("hook_level_items").insert(hookItemRows);
  if (hliErr) { console.error("Hook レベルアイテムエラー:", hliErr); process.exit(1); }

  // 4. Checkup レベル定義
  console.log(`📊 Checkup レベル定義 ${CHECKUP_LEVELS.length} 件を投入中...`);
  const checkupRows = CHECKUP_LEVELS.map(({ id, axis, axis_label, title, sort_order }) => ({ id, axis, axis_label, title, sort_order }));
  const { error: clErr } = await supabase.from("checkup_levels").upsert(checkupRows, { onConflict: "id" });
  if (clErr) { console.error("Checkup レベルエラー:", clErr); process.exit(1); }

  const checkupItemRows = CHECKUP_LEVELS.flatMap(c => c.levels.map(l => ({ checkup_id: c.id, level: l.level, keyword: l.keyword, description: l.description })));
  for (const c of CHECKUP_LEVELS) await supabase.from("checkup_level_items").delete().eq("checkup_id", c.id);
  const { error: cliErr } = await supabase.from("checkup_level_items").insert(checkupItemRows);
  if (cliErr) { console.error("Checkup レベルアイテムエラー:", cliErr); process.exit(1); }

  console.log("\n✅ シード完了！");
  console.log(`   設問: ${allQRows.length} 件`);
  console.log(`   選択肢: ${allCRows.length} 件`);
  console.log(`   Hook レベル: ${hookRows.length} 件`);
  console.log(`   Checkup レベル: ${checkupRows.length} 件`);
}

seed().catch(err => { console.error(err); process.exit(1); });
