import { createClient } from '@/lib/supabase/server'

const stats = [
  { label: 'Resume', value: '—', sub: 'Not uploaded' },
  { label: 'Jobs matched', value: '0', sub: 'Upload resume first' },
  { label: 'Applications', value: '0', sub: 'None sent yet' },
  { label: 'Interviews', value: '0', sub: 'Keep applying' },
]

const steps = [
  { n: '1', title: 'Upload your resume', desc: 'We parse it and build your profile automatically.', href: '/resume', cta: 'Upload resume' },
  { n: '2', title: 'Browse matched jobs', desc: 'See your match score for every listing.', href: '/jobs', cta: 'Browse jobs' },
  { n: '3', title: 'Enable auto-apply', desc: 'ApplyAI submits applications on your behalf.', href: '/jobs', cta: 'Set up auto-apply' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('full_name').eq('id', user!.id).single()
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif', fontWeight: 400,
          fontSize: '26px', color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.01em',
        }}>
          Good morning, {firstName}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Here is where your job search stands today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '20px 20px 18px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', color: 'var(--text)', marginBottom: '2px', lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Getting started */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '20px', fontFamily: 'Instrument Sans, sans-serif' }}>
          Getting started
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {steps.map((step) => (
            <div key={step.n} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '14px 16px', borderRadius: '8px',
              background: 'var(--bg)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', fontSize: '12px', fontWeight: 600, flexShrink: 0,
                fontFamily: 'Instrument Sans, sans-serif',
              }}>
                {step.n}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '1px', fontFamily: 'Instrument Sans, sans-serif' }}>
                  {step.title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                  {step.desc}
                </p>
              </div>
              <a href={step.href} style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: 'Instrument Sans, sans-serif' }}>
                {step.cta} →
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* AI notice */}
      <div style={{
        background: 'var(--accent-light)', border: '1px solid var(--accent-border)',
        borderRadius: '12px', padding: '16px 20px',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', marginTop: '7px', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)', marginBottom: '2px', fontFamily: 'Instrument Sans, sans-serif' }}>
            AI features active
          </p>
          <p style={{ fontSize: '12px', color: '#A0522D', fontFamily: 'Instrument Sans, sans-serif' }}>
            Resume scoring, job matching, and interview prep are ready. Upload your resume to begin.
          </p>
        </div>
      </div>
    </div>
  )
}
