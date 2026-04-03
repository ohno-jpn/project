"use client";

// 練習記録入力（スケルトン）
// TODO: テーマ設定・CSVアップロード・評価入力・AI評価生成

export default function NewLogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← ダッシュボード</a>
          <span className="font-bold text-gray-900">練習を記録する</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* STEP 1: 練習前テーマ設定 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">1</span>
            <h2 className="font-bold text-gray-900">今日の練習テーマ</h2>
          </div>
          <textarea
            placeholder="例：LT走で心拍を160台に保つ。後半にペースが落ちないよう上下動を抑えることを意識する。"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["ペース制御", "心拍管理", "ケイデンス", "左右バランス", "接地時間", "上下動"].map((tag) => (
              <button
                key={tag}
                className="border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        {/* STEP 2: 体調入力 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">2</span>
            <h2 className="font-bold text-gray-900">練習前の体調</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">疲労感</p>
              <div className="flex gap-2">
                {["😫", "😔", "😐", "😊", "💪"].map((emoji, i) => (
                  <button key={i} className="text-xl w-10 h-10 rounded-lg border border-gray-200 hover:border-orange-400 transition-colors">
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">左＝疲労感強い　右＝絶好調</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">睡眠の質</p>
              <div className="flex gap-2">
                {["😫", "😔", "😐", "😊", "😴"].map((emoji, i) => (
                  <button key={i} className="text-xl w-10 h-10 rounded-lg border border-gray-200 hover:border-orange-400 transition-colors">
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">左＝不眠　右＝熟睡</p>
            </div>
          </div>
        </section>

        {/* STEP 3: GARMINデータ取込 */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">3</span>
            <h2 className="font-bold text-gray-900">GARMINデータを取り込む</h2>
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-orange-300 transition-colors cursor-pointer">
            <p className="text-gray-400 text-sm mb-2">GARMIN ConnectからエクスポートしたCSVをドロップ</p>
            <p className="text-gray-300 text-xs">またはクリックしてファイルを選択</p>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            GARMIN Connect → アクティビティ → エクスポート → CSVでダウンロード
          </p>
        </section>

        {/* STEP 4: 振り返りコメント */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-orange-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">4</span>
            <h2 className="font-bold text-gray-900">自己コメント・気づき</h2>
          </div>
          <textarea
            placeholder="テーマは達成できましたか？走っていて気づいたこと、体の感覚などを自由に記録してください。"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </section>

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-orange-100">
          記録してAI評価を生成する →
        </button>

      </main>
    </div>
  );
}
