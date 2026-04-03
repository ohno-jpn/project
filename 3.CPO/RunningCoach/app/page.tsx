import { Target, Calendar, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-orange-500 text-lg tracking-tight">RunningCoach</span>
          <nav className="flex items-center gap-4 text-sm font-medium text-gray-500">
            <a href="/goal" className="hover:text-gray-900 transition-colors">目標・計画</a>
            <a href="/log/new" className="hover:text-gray-900 transition-colors">記録</a>
            <a href="/history" className="hover:text-gray-900 transition-colors">履歴</a>
            <a href="/advice" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-full transition-colors">
              今日の提案
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-8 text-white mb-8 shadow-lg shadow-orange-100">
          <p className="text-orange-100 text-sm font-semibold mb-1">次の目標</p>
          <h1 className="text-2xl font-extrabold mb-1">目標大会を設定してください</h1>
          <p className="text-orange-100 text-sm mb-4">目標タイムと大会日を登録すると、練習提案が始まります。</p>
          <a
            href="/goal"
            className="inline-block bg-white text-orange-500 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-orange-50 transition-colors"
          >
            目標を設定する →
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Target size={20} />, label: "大会まで", value: "— 日", color: "text-orange-500" },
            { icon: <Calendar size={20} />, label: "今週の走行", value: "0 km", color: "text-blue-500" },
            { icon: <TrendingUp size={20} />, label: "今月の走行", value: "0 km", color: "text-green-500" },
            { icon: <Zap size={20} />, label: "TSS（7日）", value: "—", color: "text-violet-500" },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className={`mb-2 ${color}`}>{icon}</div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">直近の練習</h2>
            <a href="/history" className="text-sm text-blue-500 hover:underline">すべて見る</a>
          </div>
          <p className="text-gray-400 text-sm text-center py-8">練習記録がまだありません</p>
        </div>

        {/* Latest Advice */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">最新の練習提案</h2>
            <a href="/advice" className="text-sm text-orange-500 hover:underline">詳細を見る</a>
          </div>
          <p className="text-gray-400 text-sm text-center py-8">練習記録を追加すると、AIがメニューを提案します</p>
        </div>

      </main>
    </div>
  );
}
