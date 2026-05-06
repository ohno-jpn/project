import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getPushSettings, upsertPushSetting } from "@/lib/db/push-settings";
import type { PushAxis } from "@/lib/db/push-settings";
import { sendPushEmail } from "@/lib/push-sender";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const settings = await getPushSettings(userId);

  async function saveSetting(axis: PushAxis, intervalMinutes: number, enabled: boolean) {
    "use server";
    const { userId } = await auth();
    if (!userId) return;
    await upsertPushSetting(userId, axis, intervalMinutes, enabled);
  }

  async function testSendAction(axis: PushAxis): Promise<{ sent: boolean; error?: string }> {
    "use server";
    const { userId } = await auth();
    if (!userId) return { sent: false, error: "ログインが必要です" };

    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email) return { sent: false, error: "メールアドレスが取得できません" };

    const userName = user?.firstName ?? user?.lastName ?? "ユーザー";

    const currentSettings = await getPushSettings(userId);
    const s = currentSettings.find((x) => x.axis === axis);
    const intervalMinutes = s?.interval_minutes ?? 60;

    return sendPushEmail({ userId, email, userName, axis, intervalMinutes });
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← ダッシュボード</a>
            <span className="text-gray-700">/</span>
            <span className="text-sm font-semibold text-white">プッシュ診断 設定</span>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Push Diagnosis</p>
          <h1 className="text-2xl font-extrabold text-white mb-2">定期プッシュ診断の設定</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            各軸の設定を有効にすると、選択した間隔で診断問題がメールで届きます。<br />
            Checkup・Biopsyの設問からランダムに4問が選ばれて送信されます。
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-5 mb-8 space-y-2">
          <p className="text-xs font-bold text-yellow-400">送信内容</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Checkup（16問）＋ Biopsy（64問）の合計80問から、軸ごとに毎回ランダム4問を選択して送信します。<br />
            有効期限は送信から7日間です。
          </p>
          <p className="text-xs text-amber-500">
            ⚠️ 5分・15分などの短い間隔での自動送信はVercel Pro以上が必要です。テストは「今すぐテスト送信」ボタンをご利用ください。
          </p>
        </div>

        <SettingsForm
          settings={settings}
          saveAction={saveSetting}
          testSendAction={testSendAction}
        />
      </main>
    </div>
  );
}
