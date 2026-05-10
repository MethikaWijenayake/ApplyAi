import Link from 'next/link'

const steps = [
  { n: '1', title: 'Create a job posting', desc: 'Add the title, description, and requirements for the role you are hiring for.', href: '/hr/screening', cta: 'Create posting' },
  { n: '2', title: 'Upload candidate resumes', desc: 'Drop in PDF or DOCX resumes — upload multiple at once.', href: '/hr/screening', cta: 'Upload resumes' },
  { n: '3', title: 'Run AI screening', desc: 'AI scores and ranks every candidate with skill gaps and bias audit flags.', href: '/hr/screening', cta: 'Screen candidates' },
]

export default function HRDashboardPage() {
  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '26px', color: 'var(--text)', marginBottom: '4px', letterSpacing: '-0.01em' }}>
          HR Screening Portal
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Screen and rank candidates fairly using AI — with bias auditing built in.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        {[
          { label: 'Job postings', value: '—', sub: 'None created yet' },
          { label: 'Candidates screened', value: '0', sub: 'Upload resumes first' },
          { label: 'Avg match score', value: '—', sub: 'Run screening to see' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', padding: '20px 20px 18px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>{s.label}</p>
            <p style={{ fontFamily: 'Instrument Serif, serif', fontSize: '28px', color: 'var(--text)', marginBottom: '2px', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '20px', fontFamily: 'Instrument Sans, sans-serif' }}>
          How it works
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {steps.map(step => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-light)', border: '1px solid #B8DCCC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontSize: '12px', fontWeight: 600, flexShrink: 0, fontFamily: 'Instrument Sans, sans-serif' }}>
                {step.n}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '1px', fontFamily: 'Instrument Sans, sans-serif' }}>{step.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>{step.desc}</p>
              </div>
              <Link href={step.href} style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: 'Instrument Sans, sans-serif' }}>
                {step.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Research note */}
      <div style={{ background: 'var(--success-light)', border: '1px solid #B8DCCC', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', marginTop: '7px', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--success)', marginBottom: '2px', fontFamily: 'Instrument Sans, sans-serif' }}>
            Bias-aware screening
          </p>
          <p style={{ fontSize: '12px', color: '#3D6B52', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1.6 }}>
            Every result includes a bias audit flag based on Raghavan et al. (2020). Gendered language, institution bias, and strict experience cutoffs are surfaced automatically so your team can make fairer decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
