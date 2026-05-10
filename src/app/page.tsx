import Link from 'next/link'

const candidateFeatures = [
  'Resume parsing and profile extraction',
  'AI-powered job matching with match scores',
  'Skill gap analysis and recommendations',
  'Job search across major job boards',
  'Interview preparation with AI coaching',
]

const hrFeatures = [
  'Bulk candidate resume upload',
  'AI screening and ranked shortlists',
  'Skill gap reports per candidate',
  'Bias audit flags on every result',
  'Role-specific scoring against job description',
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '64px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '13px' }}>A</div>
          <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em' }}>ApplyAI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/login" style={{ color: 'var(--text-2)', fontSize: '14px', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px' }}>
            Sign in
          </Link>
          <Link href="/signup" style={{ background: 'var(--accent)', color: '#fff', fontSize: '14px', textDecoration: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 500 }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 2rem 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: '11px', fontFamily: 'Instrument Sans, sans-serif', color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', padding: '4px 12px', borderRadius: '100px', marginBottom: '28px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Now in beta
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.15, fontFamily: 'Instrument Serif, serif', fontWeight: 400, color: 'var(--text)', marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Intelligent hiring,<br />for both sides of the table
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 16px', fontFamily: 'Instrument Sans, sans-serif' }}>
          ApplyAI helps job seekers find and match roles — and helps HR teams screen and rank candidates fairly using AI.
        </p>
      </section>

      {/* Two audience cards */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '0 2rem 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Job Seekers */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--accent)" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--accent)', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 600, marginBottom: '8px' }}>
              For job seekers
            </p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '22px', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>
              Find your next role faster
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'Instrument Sans, sans-serif', marginBottom: '24px' }}>
              Upload your resume, get matched to jobs, see exactly where you fit and where you fall short, and prepare for interviews.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {candidateFeatures.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '7px', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: 'var(--accent)', color: '#fff', textDecoration: 'none', padding: '11px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, fontFamily: 'Instrument Sans, sans-serif' }}>
              Start as a job seeker
            </Link>
            <Link href="/login" style={{ display: 'block', textAlign: 'center', color: 'var(--text-3)', textDecoration: 'none', padding: '10px', fontSize: '12px', fontFamily: 'Instrument Sans, sans-serif', marginTop: '8px' }}>
              Already have an account? Sign in
            </Link>
          </div>

          {/* HR Teams */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '36px 32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--success-light)', border: '1px solid #B8DCCC', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--success)', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 600, marginBottom: '8px' }}>
              For HR teams
            </p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '22px', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>
              Screen candidates at scale
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'Instrument Sans, sans-serif', marginBottom: '24px' }}>
              Create job postings, upload applicant resumes in bulk, and let AI rank and score every candidate against your requirements — with bias auditing built in.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {hrFeatures.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)', marginTop: '7px', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/hr/dashboard" style={{ display: 'block', textAlign: 'center', background: 'var(--success)', color: '#fff', textDecoration: 'none', padding: '11px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, fontFamily: 'Instrument Sans, sans-serif' }}>
              Start screening candidates
            </Link>
            <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', fontFamily: 'Instrument Sans, sans-serif', marginTop: '8px', padding: '10px 0' }}>
              No account needed to try the demo
            </p>
          </div>
        </div>

        {/* Research note */}
        <div style={{ marginTop: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif', marginBottom: '8px' }}>
            Research-backed
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'Instrument Sans, sans-serif' }}>
            ApplyAI uses semantic NLP matching — not keyword filtering — reducing false negatives by up to 31% (Ferrara et al., 2019). Bias auditing flags gendered language and structural disadvantages in every screening result (Raghavan et al., 2020).
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>ApplyAI</span>
        <span style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>Intelligent hiring for both sides of the table</span>
      </footer>
    </div>
  )
}
