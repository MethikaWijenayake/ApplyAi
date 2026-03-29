import { createClient } from '@/lib/supabase/server'

const statCards = [
  { label: 'Resume uploaded', value: '—', sub: 'Upload your first resume', color: 'indigo' },
  { label: 'Jobs matched', value: '0', sub: 'Add a resume to see matches', color: 'violet' },
  { label: 'Applications sent', value: '0', sub: 'No applications yet', color: 'sky' },
  { label: 'Interviews scheduled', value: '0', sub: 'Keep applying!', color: 'emerald' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good morning, {firstName} 👋
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s what&apos;s happening with your job search today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5"
          >
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-slate-500 text-xs">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Get started</h2>
        <div className="space-y-3">
          {[
            {
              step: '1',
              title: 'Upload your resume',
              desc: 'We&apos;ll parse it and find matching jobs automatically.',
              href: '/resume',
              cta: 'Upload resume →',
              done: false,
            },
            {
              step: '2',
              title: 'Browse matched jobs',
              desc: 'See how well your profile fits each role.',
              href: '/jobs',
              cta: 'Browse jobs →',
              done: false,
            },
            {
              step: '3',
              title: 'Enable auto-apply',
              desc: 'Let ApplyAI submit applications on your behalf.',
              href: '/jobs',
              cta: 'Set up auto-apply →',
              done: false,
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.title}</p>
                <p className="text-slate-500 text-xs mt-0.5"
                   dangerouslySetInnerHTML={{ __html: item.desc }} />
              </div>
              <a
                href={item.href}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors whitespace-nowrap"
              >
                {item.cta}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Coming soon banner */}
      <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          🤖
        </div>
        <div>
          <p className="text-indigo-200 font-medium text-sm">AI features coming soon</p>
          <p className="text-indigo-400/70 text-xs mt-0.5">
            Resume scoring, job matching, auto-apply, and interview prep are being wired up. Upload your resume to get started.
          </p>
        </div>
      </div>
    </div>
  )
}
