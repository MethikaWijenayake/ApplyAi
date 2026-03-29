export default function ApplicationsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-2">Applications</h1>
      <p className="text-slate-400 mb-8">Track every job application and recruiter reply in one place.</p>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
        <span className="text-5xl mb-4">📋</span>
        <p className="text-white font-medium mb-1">No applications yet</p>
        <p className="text-slate-500 text-sm">Applications will appear here once auto-apply is set up — coming in Phase 4</p>
      </div>
    </div>
  )
}
