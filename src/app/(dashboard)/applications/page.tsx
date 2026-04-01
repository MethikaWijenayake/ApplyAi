export default function ApplicationsPage() {
  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '4px' }}>
          Applications
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Track every application and recruiter reply in one place.
        </p>
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
          No applications yet
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Applications will appear here once auto-apply is set up — coming in Phase 4
        </p>
      </div>
    </div>
  )
}
