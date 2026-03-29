export default function InterviewPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">Interview Prep</h1>
      <p className="text-slate-400 mb-8">
        Practice with an AI interviewer tailored to each job you apply for.
      </p>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
        <span className="text-5xl mb-4">🎤</span>
        <p className="text-white font-medium mb-1">No sessions yet</p>
        <p className="text-slate-500 text-sm">
          AI mock interviews coming in Phase 5 — apply to a few jobs first
        </p>
      </div>
    </div>
  )
}
