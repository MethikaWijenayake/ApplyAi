import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">
            C
          </div>
          <span className="font-semibold text-lg tracking-tight">ApplyAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-slate-400 hover:text-white text-sm transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          AI-powered job search — now in beta
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-tight mb-6">
          Land your dream job{' '}
          <span className="text-indigo-400">10× faster</span>
        </h1>

        <p className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed">
          Upload your resume. ApplyAI finds matching jobs, scores your fit,
          fills applications automatically, and preps you for interviews — all
          in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/signup"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
          >
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-16">
          {[
            '📄 Resume parsing',
            '🎯 Job matching',
            '🤖 Auto-apply',
            '📧 Email tracking',
            '🎤 Interview prep',
          ].map((f) => (
            <span
              key={f}
              className="bg-slate-900 border border-slate-800 text-slate-400 text-sm px-4 py-2 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
