import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface ParsedResume {
  name?: string; email?: string; phone?: string; skills?: string[]
  work_experience?: Array<{ company: string; title: string; dates: string; description: string }>
  education?: Array<{ institution: string; degree: string; year: string }>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px 24px', marginBottom: '12px' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '16px', fontFamily: 'Instrument Sans, sans-serif' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

export default async function ResumeProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resume } = await supabase.from('resumes').select('*').eq('user_id', user.id)
    .order('uploaded_at', { ascending: false }).limit(1).single()

  if (!resume) {
    return (
      <div style={{ maxWidth: '560px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '24px' }}>Resume Profile</h1>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>No resume uploaded</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '20px', fontFamily: 'Instrument Sans, sans-serif' }}>Upload your resume to see your extracted profile here</p>
          <Link href="/resume" style={{ background: 'var(--accent)', color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, fontFamily: 'Instrument Sans, sans-serif' }}>
            Upload resume
          </Link>
        </div>
      </div>
    )
  }

  const parsed = (resume.parsed_json ?? {}) as ParsedResume
  const uploadedAt = new Date(resume.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const initials = parsed.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '4px' }}>Resume Profile</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>Uploaded {uploadedAt}</p>
        </div>
        <Link href="/resume" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', border: '1px solid var(--border)', padding: '7px 14px', borderRadius: '8px', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500 }}>
          Replace
        </Link>
      </div>

      {/* Identity */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px 24px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '14px', fontWeight: 600, flexShrink: 0, fontFamily: 'Instrument Sans, sans-serif' }}>
          {initials}
        </div>
        <div>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
            {parsed.name ?? 'Name not detected'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {parsed.email && <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>{parsed.email}</span>}
            {parsed.phone && <span style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>{parsed.phone}</span>}
          </div>
        </div>
      </div>

      {/* Skills */}
      {parsed.skills && parsed.skills.length > 0 && (
        <Section title="Skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {parsed.skills.map(skill => (
              <span key={skill} style={{ fontSize: '12px', color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', padding: '4px 10px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500 }}>
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {parsed.work_experience && parsed.work_experience.length > 0 && (
        <Section title="Work Experience">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {parsed.work_experience.map((job, i) => (
              <div key={i} style={{ paddingLeft: '14px', borderLeft: '2px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif' }}>{job.title || '—'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>{job.company || '—'}</p>
                  </div>
                  {job.dates && <span style={{ fontSize: '11px', color: 'var(--text-3)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap', fontFamily: 'Instrument Sans, sans-serif', alignSelf: 'flex-start' }}>{job.dates}</span>}
                </div>
                {job.description && <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6, fontFamily: 'Instrument Sans, sans-serif', marginTop: '6px' }}>{job.description.slice(0, 320)}{job.description.length > 320 ? '...' : ''}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {parsed.education && parsed.education.length > 0 && (
        <Section title="Education">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {parsed.education.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif' }}>{edu.institution || '—'}</p>
                  {edu.degree && <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>{edu.degree}</p>}
                </div>
                {edu.year && <span style={{ fontSize: '11px', color: 'var(--text-3)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap', fontFamily: 'Instrument Sans, sans-serif' }}>{edu.year}</span>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '16px', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1.6 }}>
        This is what our parser extracted. If something looks wrong, check that your PDF has selectable text and uses clear section headings.{' '}
        <Link href="/resume" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Re-upload</Link> anytime.
      </p>
    </div>
  )
}
