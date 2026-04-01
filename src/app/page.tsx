import Link from 'next/link'

const features = [
  {
    title: 'Resume Parsing',
    description: 'Upload a PDF or Word document. We extract your skills, experience, and education with precision — ready for matching in seconds.',
  },
  {
    title: 'Job Discovery',
    description: 'Search across millions of listings aggregated from LinkedIn, Indeed, and Glassdoor. One query, unified results.',
  },
  {
    title: 'AI Match Scoring',
    description: 'Every job gets a match score against your resume. See exactly which skills you have, which you are missing, and what to do about it.',
  },
  {
    title: 'Automated Applications',
    description: 'ApplyAI fills and submits applications on your behalf using intelligent browser automation — built on the same engine as the best auto-apply tools.',
  },
  {
    title: 'Email Tracking',
    description: 'Every recruiter reply is captured and threaded. You get a dedicated email address so nothing falls through the cracks.',
  },
  {
    title: 'Interview Preparation',
    description: 'Practice with an AI interviewer that knows the job description and your resume. Targeted questions, honest feedback.',
  },
]

const steps = [
  { number: '01', title: 'Upload your resume', body: 'Drop your PDF or DOCX. We parse it and build a structured profile automatically.' },
  { number: '02', title: 'Search for roles', body: 'Enter a title and location. We pull live listings and score each one against your profile.' },
  { number: '03', title: 'Apply intelligently', body: 'Review your top matches and let ApplyAI handle the applications while you prepare for interviews.' },
]

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2.5rem', height: '64px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', background: 'var(--accent)',
            borderRadius: '6px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: '13px',
            fontFamily: 'Instrument Sans, sans-serif',
          }}>A</div>
          <span style={{ fontFamily: 'Instrument Sans, sans-serif', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em' }}>
            ApplyAI
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/login" style={{
            color: 'var(--text-2)', fontSize: '14px', textDecoration: 'none',
            padding: '8px 16px', borderRadius: '8px',
            fontFamily: 'Instrument Sans, sans-serif',
          }}>
            Sign in
          </Link>
          <Link href="/signup" style={{
            background: 'var(--accent)', color: '#fff', fontSize: '14px',
            textDecoration: 'none', padding: '8px 18px', borderRadius: '8px',
            fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500,
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '96px 2rem 80px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontSize: '12px', fontFamily: 'Instrument Sans, sans-serif',
          color: 'var(--accent)', background: 'var(--accent-light)',
          border: '1px solid var(--accent-border)',
          padding: '4px 12px', borderRadius: '100px', marginBottom: '32px',
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          Now in beta
        </div>
        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1.15,
          fontFamily: 'Instrument Serif, serif', fontWeight: 400,
          color: 'var(--text)', marginBottom: '24px', letterSpacing: '-0.02em',
        }}>
          Your job search,<br />handled intelligently
        </h1>
        <p style={{
          fontSize: '17px', color: 'var(--text-2)', lineHeight: 1.7,
          maxWidth: '520px', margin: '0 auto 40px',
          fontFamily: 'Instrument Sans, sans-serif',
        }}>
          ApplyAI parses your resume, finds matched roles, scores your fit, and submits applications — so you spend your time preparing, not applying.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/signup" style={{
            background: 'var(--accent)', color: '#fff', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 500,
            fontFamily: 'Instrument Sans, sans-serif',
          }}>
            Start for free
          </Link>
          <Link href="/login" style={{
            background: 'transparent', color: 'var(--text)', textDecoration: 'none',
            padding: '12px 28px', borderRadius: '10px', fontSize: '15px', fontWeight: 500,
            border: '1px solid var(--border)', fontFamily: 'Instrument Sans, sans-serif',
          }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '960px', margin: '0 auto', borderTop: '1px solid var(--border)' }} />

      {/* How it works */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 2rem' }}>
        <p style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif',
          marginBottom: '48px',
        }}>
          How it works
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '48px' }}>
          {steps.map((step) => (
            <div key={step.number}>
              <div style={{
                fontSize: '12px', fontFamily: 'Instrument Sans, sans-serif',
                color: 'var(--accent)', fontWeight: 600, marginBottom: '16px',
                letterSpacing: '0.04em',
              }}>
                {step.number}
              </div>
              <h3 style={{
                fontFamily: 'Instrument Serif, serif', fontWeight: 400,
                fontSize: '20px', color: 'var(--text)', marginBottom: '10px',
              }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'Instrument Sans, sans-serif' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '960px', margin: '0 auto', borderTop: '1px solid var(--border)' }} />

      {/* Features grid */}
      <section style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 2rem' }}>
        <p style={{
          fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif',
          marginBottom: '48px',
        }}>
          Everything included
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2px' }}>
          {features.map((f, i) => (
            <div key={f.title} style={{
              padding: '32px',
              background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-subtle)',
              borderRadius: i === 0 ? '12px 0 0 0' : i === 1 ? '0 12px 0 0' : i === features.length - 2 ? '0 0 0 12px' : i === features.length - 1 ? '0 0 12px 0' : '0',
            }}>
              <h3 style={{
                fontFamily: 'Instrument Serif, serif', fontWeight: 400,
                fontSize: '18px', color: 'var(--text)', marginBottom: '10px',
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, fontFamily: 'Instrument Sans, sans-serif' }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '960px', margin: '0 auto 80px',
        padding: '64px 2rem',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        textAlign: 'center',
        border: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: 'Instrument Serif, serif', fontWeight: 400,
          fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: 'var(--text)',
          marginBottom: '16px', letterSpacing: '-0.01em',
        }}>
          Ready to apply smarter?
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-2)', marginBottom: '32px',
          fontFamily: 'Instrument Sans, sans-serif',
        }}>
          Free to start. No credit card required.
        </p>
        <Link href="/signup" style={{
          background: 'var(--accent)', color: '#fff', textDecoration: 'none',
          padding: '13px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: 500,
          fontFamily: 'Instrument Sans, sans-serif',
        }}>
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '24px 2.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        maxWidth: '100%',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
          ApplyAI
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Built to help you land roles faster
        </span>
      </footer>
    </div>
  )
}
