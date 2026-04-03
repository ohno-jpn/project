"use client";

// 翌日練習提案ページ（スケルトン）
// TODO: AI提案生成・フィードバック記録

export default function AdvicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← ダッシュボード</a>
          <span className="font-bold text-gray-900">明日の練習提案</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* 提案カード */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="font-bold text-gray-900">AIからの提案</h2>
              <p className="text-xs text-gray-400">練習記録・目標・疲労度をもとに生成</p>
            </div>
          </div>
          <div className="bg-orange-50 rounded-xl p-6">
            <p className="text-gray-500 text-sm text-center py-4">
              練習記録を追加すると、AIがメニューを提案します
            </p>
          </div>
        </section>

        {/* 週間見通し */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-bold text-gray-900 mb-4">今週の見通し</h2>
          <p className="text-gray-400 text-sm text-center py-4">データが蓄積されると表示されます</p>
        </section>

        {/* フィードバック */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-bold text-gray-900 mb-4">前回の提案へのフィードバック</h2>
          <p className="text-gray-400 text-sm text-center py-4">前回の提案への評価を記録できます</p>
        </section>

      </main>
    </div>
  );
}
