"use client";

// 目標・練習計画パネル（スケルトン）
// TODO: フォーム実装・localStorageへの保存

export default function GoalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← ダッシュボード</a>
          <span className="font-bold text-gray-900">目標・練習計画</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* 目標大会 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">目標大会・目標タイム</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">大会名</label>
              <input
                type="text"
                placeholder="例：東京マラソン2027"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開催日</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">距離</label>
              <select className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="42.195">フルマラソン（42.195km）</option>
                <option value="21.0975">ハーフマラソン（21.0975km）</option>
                <option value="10">10km</option>
                <option value="5">5km</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">目標タイム</label>
              <input
                type="text"
                placeholder="例：03:30:00"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">HH:MM:SS形式で入力</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-orange-50 rounded-xl">
            <p className="text-sm text-orange-700 font-medium">目安ペース：— / km</p>
            <p className="text-xs text-orange-500 mt-0.5">目標タイムを入力すると自動計算されます</p>
          </div>
          <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full transition-colors">
            保存する
          </button>
        </section>

        {/* 週次練習計画 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">週次練習計画</h2>
            <button className="text-sm text-orange-500 font-semibold hover:underline">+ メニューを追加</button>
          </div>
          <p className="text-gray-400 text-sm text-center py-8">練習計画がまだありません</p>
        </section>

      </main>
    </div>
  );
}
