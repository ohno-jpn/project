"use client";

// 練習履歴ページ（スケルトン）
// TODO: 履歴一覧・グラフ表示

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← ダッシュボード</a>
          <span className="font-bold text-gray-900">練習履歴</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* グラフエリア */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-bold text-gray-900 mb-4">週間走行距離</h2>
          <div className="h-40 flex items-center justify-center bg-gray-50 rounded-xl">
            <p className="text-gray-400 text-sm">グラフ（Recharts実装予定）</p>
          </div>
        </section>

        {/* 履歴リスト */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="font-bold text-gray-900 mb-4">練習ログ</h2>
          <p className="text-gray-400 text-sm text-center py-8">練習記録がまだありません</p>
        </section>

      </main>
    </div>
  );
}
