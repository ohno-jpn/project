import { auth } from "@clerk/nextjs/server";
import { UserButton, SignInButton } from "@clerk/nextjs";

async function NavActions() {
  const { userId } = await auth();
  return (
    <div className="flex items-center gap-2">
      {userId ? (
        <>
          <a href="/dashboard" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">ダッシュボード</a>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="redirect">
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            サインイン
          </button>
        </SignInButton>
      )}
    </div>
  );
}

const AXES = [
  {
    code: "OH", label: "組織 Hard", title: "戦略・基盤",
    color: "blue",
    desc: "全社AI戦略・KGI、ガバナンス・倫理規定、データ基盤、業務プロセスの標準化度を診断。",
  },
  {
    code: "OS", label: "組織 Soft", title: "文化・風土",
    color: "violet",
    desc: "挑戦文化・心理的安全性、意思決定の機敏性、AI人材評価制度、ナレッジ共有の仕組みを診断。",
  },
  {
    code: "PH", label: "個人 Hard", title: "テクニカルスキル",
    color: "orange",
    desc: "AI基礎知識、セキュリティ・リスク理解、プロンプトエンジニアリング、ワークフロー活用力を診断。",
  },
  {
    code: "PS", label: "個人 Soft", title: "スタンス・特性",
    color: "green",
    desc: "業務課題の設定力、成果逆算の目的志向、AIへの批判的思考、新技術への開放性を診断。",
  },
];

const COLOR = {
  blue:   { border: "border-blue-500/30",   bg: "bg-blue-950/60",   badge: "bg-blue-500/20 text-blue-300",   code: "text-blue-400"   },
  violet: { border: "border-violet-500/30", bg: "bg-violet-950/60", badge: "bg-violet-500/20 text-violet-300", code: "text-violet-400" },
  orange: { border: "border-orange-500/30", bg: "bg-orange-950/60", badge: "bg-orange-500/20 text-orange-300", code: "text-orange-400" },
  green:  { border: "border-green-500/30",  bg: "bg-green-950/60",  badge: "bg-green-500/20 text-green-300",  code: "text-green-400"  },
} as const;

export default async function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">

      {/* ── ナビゲーション ── */}
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-white tracking-tight">AX-Diagnosis</span>
          <nav className="flex items-center gap-2">
            <a href="/questions/hook/oh" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">設問</a>
            <a href="/level-definitions/hook" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">レベル定義</a>
            <a href="/diagnosis" className="text-gray-400 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">診断を試す</a>
            <NavActions />
          </nav>
        </div>
      </header>

      {/* ── 1. ヒーロー ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_80%_70%,rgba(124,58,237,0.1),transparent)]" />

        <div className="relative z-10">
          <span className="inline-block bg-blue-500/10 text-blue-400 text-xs font-bold px-4 py-1.5 rounded-full mb-8 tracking-widest uppercase border border-blue-500/20">
            AI Transformation Diagnostic
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
            AXへの準備状況を<br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">診断する</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            組織・個人の4軸診断で、AIトランスフォーメーションの現状と優先アクションが明確になります。
          </p>

          {/* スコアプレビュー */}
          <div className="mt-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 px-10 py-8 inline-flex gap-12 items-center">
            {[
              { label: "OH 戦略・基盤", score: 72, color: "#3b82f6" },
              { label: "OS 文化・風土", score: 58, color: "#8b5cf6" },
              { label: "PH テクニカル", score: 84, color: "#f97316" },
              { label: "PS スタンス",   score: 45, color: "#22c55e" },
            ].map(({ label, score, color }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke={color} strokeWidth="3"
                      strokeDasharray={`${(score / 100) * 87.96} 87.96`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{score}</span>
                </div>
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. 4軸フレームワーク ── */}
      <section id="framework" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Framework</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">4軸で組織のAX成熟度を測る</h2>
            <p className="text-gray-400 text-base max-w-lg mx-auto">
              組織 / 個人 × Hard / Soft の4象限で、AX準備状況を多角的に可視化します。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {AXES.map(({ code, label, title, color, desc }) => {
              const c = COLOR[color as keyof typeof COLOR];
              return (
                <div key={code} className={`rounded-2xl border ${c.border} ${c.bg} p-7 backdrop-blur-sm`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-2xl font-extrabold ${c.code}`}>{code}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.badge}`}>{label}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── フッター ── */}
      <footer className="py-10 px-6 border-t border-white/5 text-center">
        <p className="text-white font-bold text-base mb-1">AX-Diagnosis</p>
        <p className="text-gray-600 text-sm">© 2026 vast fields inc. All rights reserved.</p>
      </footer>

    </div>
  );
}
