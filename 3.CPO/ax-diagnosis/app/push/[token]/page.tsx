import { redirect } from "next/navigation";
import { getPushToken, type PushAxis } from "@/lib/db/push-settings";
import { ALL_QUESTIONS, type Axis } from "@/lib/questions";
import { AnswerForm } from "./answer-form";

const AXIS_TO_QUESTION_AXIS: Record<PushAxis, Axis> = {
  OH: "org_hard",
  OS: "org_soft",
  PH: "ind_hard",
  PS: "ind_soft",
};

const AXIS_LABELS: Record<PushAxis, string> = {
  OH: "OH 組織Hard（戦略・基盤）",
  OS: "OS 組織Soft（文化・風土）",
  PH: "PH 個人Hard（テクニカルスキル）",
  PS: "PS 個人Soft（スタンス・特性）",
};

const AXIS_ACCENT: Record<PushAxis, string> = {
  OH: "text-blue-400",
  OS: "text-violet-400",
  PH: "text-orange-400",
  PS: "text-green-400",
};

function ErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-100">
      <div className="text-center max-w-sm px-6">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-400 mb-6">{message}</p>
        <a href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
          トップに戻る
        </a>
      </div>
    </div>
  );
}

export default async function PushAnswerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const pushToken = await getPushToken(token);

  if (!pushToken) {
    return <ErrorPage title="リンクが無効です" message="このリンクは存在しないか、既に無効化されています。" />;
  }

  if (pushToken.answered_at) {
    return <ErrorPage title="回答済みです" message="この診断は既に回答されています。新しい診断はメールでお届けします。" />;
  }

  if (new Date(pushToken.expires_at) < new Date()) {
    return <ErrorPage title="有効期限切れ" message="このリンクの有効期限が切れています。次の定期診断メールをお待ちください。" />;
  }

  const questionIds: string[] = pushToken.question_ids ?? [];
  const questions = ALL_QUESTIONS.filter((q) => questionIds.includes(q.id));

  if (questions.length === 0) {
    void AXIS_TO_QUESTION_AXIS;
    redirect("/");
  }

  const axisLabel = AXIS_LABELS[pushToken.axis];
  const accent = AXIS_ACCENT[pushToken.axis];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-tight">AX-Diagnosis</span>
          <span className="text-gray-700">/</span>
          <span className={`text-sm font-bold ${accent}`}>{pushToken.axis} 定期診断</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-24">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Push Diagnosis</p>
          <h1 className="text-2xl font-extrabold text-white mb-2">{axisLabel}</h1>
          <p className="text-sm text-gray-400">
            全{questions.length}問に回答してください。回答後、結果がダッシュボードに保存されます。
          </p>
          <p className="text-xs text-gray-600 mt-1">
            有効期限：{new Date(pushToken.expires_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <AnswerForm token={token} questions={questions} axisLabel={axisLabel} />
      </main>
    </div>
  );
}
