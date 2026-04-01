'use client'

import { useState } from 'react'

interface Application {
  id: string
  job_title: string
  company: string
  job_url?: string
  status: string
  apply_result?: string
  apply_method?: string
  apply_error?: string
  auto_applied?: boolean
  applied_at: string
  last_reply_at?: string
  notes?: string
}

interface EmailThread {
  id: string
  job_application_id?: string
  from_email: string
  subject?: string
  body?: string
  direction: string
  received_at: string
}

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
  applied:      { bg: 'var(--accent-light)',   border: 'var(--accent-border)',  text: 'var(--accent)' },
  viewed:       { bg: '#EFF6FF',               border: '#BFDBFE',               text: '#1D4ED8' },
  interviewing: { bg: 'var(--success-light)',  border: '#B8DCCC',               text: 'var(--success)' },
  offered:      { bg: '#F0FDF4',               border: '#BBF7D0',               text: '#166534' },
  rejected:     { bg: 'var(--error-light)',    border: '#F0B8B4',               text: 'var(--error)' },
  withdrawn:    { bg: 'var(--bg-subtle)',      border: 'var(--border)',         text: 'var(--text-3)' },
}

const applyResultLabel: Record<string, string> = {
  success:         'Auto-applied',
  failed:          'Apply failed',
  manual_required: 'Manual required',
  pending:         'Applying...',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ApplicationsClient({
  applications,
  threads,
}: {
  applications: Application[]
  threads: EmailThread[]
}) {
  const [selected, setSelected] = useState<Application | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter)

  const appThreads = selected
    ? threads.filter(t => t.job_application_id === selected.id)
    : []

  const statusCounts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '4px' }}>
          Applications
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Track every application and recruiter reply.
        </p>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['all', 'applied', 'viewed', 'interviewing', 'offered', 'rejected'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              fontSize: '12px', padding: '5px 12px', borderRadius: '100px', border: '1px solid',
              cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif', fontWeight: filter === s ? 500 : 400,
              background: filter === s ? 'var(--accent)' : 'var(--bg-card)',
              color: filter === s ? '#fff' : 'var(--text-2)',
              borderColor: filter === s ? 'var(--accent)' : 'var(--border)',
            }}>
            {s === 'all' ? `All (${applications.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${statusCounts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
            No applications yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
            Use the Jobs page to find roles and trigger auto-apply
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: '16px', alignItems: 'start' }}>
          {/* Applications list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(app => {
              const sc = statusColors[app.status] ?? statusColors.applied
              const isSelected = selected?.id === app.id
              return (
                <div key={app.id}
                  onClick={() => setSelected(isSelected ? null : app)}
                  style={{
                    background: 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--accent-border)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '16px 18px', cursor: 'pointer',
                    transition: 'border-color 0.12s',
                  }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)' }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif' }}>
                          {app.job_title}
                        </p>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${sc.border}`, background: sc.bg, color: sc.text, fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500 }}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
                        {app.company}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                        {timeAgo(app.applied_at)}
                      </p>
                      {app.auto_applied && app.apply_result && (
                        <p style={{ fontSize: '10px', color: app.apply_result === 'success' ? 'var(--success)' : app.apply_result === 'pending' ? 'var(--accent)' : 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif', marginTop: '2px' }}>
                          {applyResultLabel[app.apply_result]}
                        </p>
                      )}
                    </div>
                  </div>

                  {app.apply_error && (
                    <p style={{ fontSize: '11px', color: 'var(--error)', marginTop: '6px', fontFamily: 'Instrument Sans, sans-serif', background: 'var(--error-light)', padding: '4px 8px', borderRadius: '4px', border: '1px solid #F0B8B4' }}>
                      {app.apply_error}
                    </p>
                  )}

                  {app.last_reply_at && (
                    <p style={{ fontSize: '11px', color: 'var(--success)', marginTop: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
                      Recruiter replied {timeAgo(app.last_reply_at)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Email thread panel */}
          {selected && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', position: 'sticky', top: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                  Email Thread
                </p>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px', lineHeight: 1 }}>
                  ×
                </button>
              </div>

              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px', fontFamily: 'Instrument Sans, sans-serif' }}>
                {selected.job_title}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '16px', fontFamily: 'Instrument Sans, sans-serif' }}>
                {selected.company}
              </p>

              {appThreads.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif', textAlign: 'center', padding: '24px 0' }}>
                  No emails yet for this application
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
                  {appThreads.map(thread => (
                    <div key={thread.id} style={{
                      padding: '10px 12px', borderRadius: '8px',
                      background: thread.direction === 'inbound' ? 'var(--bg)' : 'var(--accent-light)',
                      border: `1px solid ${thread.direction === 'inbound' ? 'var(--border)' : 'var(--accent-border)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 500, color: thread.direction === 'inbound' ? 'var(--text-2)' : 'var(--accent)', fontFamily: 'Instrument Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {thread.direction === 'inbound' ? 'From recruiter' : 'Your reply'}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                          {timeAgo(thread.received_at)}
                        </span>
                      </div>
                      {thread.subject && (
                        <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
                          {thread.subject}
                        </p>
                      )}
                      <p style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5, fontFamily: 'Instrument Sans, sans-serif', whiteSpace: 'pre-wrap' }}>
                        {(thread.body ?? '').slice(0, 300)}{(thread.body?.length ?? 0) > 300 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
