export default function InterviewPage() {
  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '4px' }}>
          Interview Prep
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Practice with an AI interviewer tailored to each role you apply for.
        </p>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
          No sessions yet
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
          AI mock interviews coming in Phase 5 — apply to a few jobs first
        </p>
      </div>
    </div>
  )
}
