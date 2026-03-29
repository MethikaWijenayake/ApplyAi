import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface ParsedResume {
  name?: string
  email?: string
  phone?: string
  skills?: string[]
  work_experience?: Array<{
    company: string
    title: string
    dates: string
    description: string
  }>
  education?: Array<{
    institution: string
    degree: string
    year: string
  }>
  sections_found?: string[]
}

export default async function ResumeProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (!resume) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-white mb-2">Resume Profile</h1>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
          <span className="text-5xl mb-4">📄</span>
          <p className="text-white font-medium mb-2">No resume uploaded yet</p>
          <p className="text-slate-500 text-sm mb-6">
            Upload your resume to see your extracted profile here
          </p>
          <Link
            href="/resume"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Upload resume
          </Link>
        </div>
      </div>
    )
  }

  const parsed = (resume.parsed_json ?? {}) as ParsedResume
  const uploadedAt = new Date(resume.uploaded_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Resume Profile</h1>
          <p className="text-slate-500 text-sm">Uploaded {uploadedAt}</p>
        </div>
        <Link
          href="/resume"
          className="text-sm text-indigo-400 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500 px-4 py-2 rounded-lg transition-all"
        >
          Replace resume
        </Link>
      </div>

      {/* Identity card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xl font-bold flex-shrink-0">
            {parsed.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-white text-lg font-semibold">{parsed.name ?? 'Name not detected'}</p>
            <div className="flex flex-wrap gap-3 mt-1">
              {parsed.email && (
                <span className="text-slate-400 text-sm flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {parsed.email}
                </span>
              )}
              {parsed.phone && (
                <span className="text-slate-400 text-sm flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {parsed.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {parsed.skills && parsed.skills.length > 0 && (
        <Section title="Skills" icon="⚡">
          <div className="flex flex-wrap gap-2">
            {parsed.skills.map((skill) => (
              <span
                key={skill}
                className="bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Work Experience */}
      {parsed.work_experience && parsed.work_experience.length > 0 && (
        <Section title="Work Experience" icon="💼">
          <div className="space-y-5">
            {parsed.work_experience.map((job, i) => (
              <div key={i} className="relative pl-4 border-l-2 border-slate-700">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div>
                    <p className="text-white font-medium">{job.title || '—'}</p>
                    <p className="text-slate-400 text-sm">{job.company || '—'}</p>
                  </div>
                  {job.dates && (
                    <span className="text-slate-500 text-xs whitespace-nowrap mt-0.5 bg-slate-800 px-2 py-0.5 rounded-md">
                      {job.dates}
                    </span>
                  )}
                </div>
                {job.description && (
                  <p className="text-slate-500 text-sm mt-2 leading-relaxed whitespace-pre-line">
                    {job.description.slice(0, 400)}{job.description.length > 400 ? '…' : ''}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {parsed.education && parsed.education.length > 0 && (
        <Section title="Education" icon="🎓">
          <div className="space-y-4">
            {parsed.education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-medium">{edu.institution || '—'}</p>
                  {edu.degree && <p className="text-slate-400 text-sm">{edu.degree}</p>}
                </div>
                {edu.year && (
                  <span className="text-slate-500 text-xs bg-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {edu.year}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Parser note */}
      <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <span className="text-slate-500 text-sm mt-0.5">ℹ️</span>
        <p className="text-slate-500 text-sm">
          This is what our parser extracted from your resume. If something looks wrong or
          missing, check that your PDF has selectable text (not a scanned image) and uses
          clear section headings.{' '}
          <Link href="/resume" className="text-indigo-400 hover:text-indigo-300">
            Re-upload
          </Link>{' '}
          anytime.
        </p>
      </div>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
      <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  )
}
