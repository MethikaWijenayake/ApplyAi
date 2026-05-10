'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Posting {
  id: string
  title: string
  department?: string
  location?: string
  is_active: boolean
  created_at: string
  candidate_resumes?: { count: number }[]
}

export default function ScreeningPage() {
  const router = useRouter()
  const [postings, setPostings] = useState<Posting[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', requirements: '', department: '', location: '' })

  useEffect(() => { fetchPostings() }, [])

  async function fetchPostings() {
    setLoading(true)
    try {
      const res = await fetch('/api/screening/postings')
      const data = await res.json()
      setPostings(Array.isArray(data) ? data : [])
    } catch { setPostings([]) } finally { setLoading(false) }
  }

  async function createPosting(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/screening/postings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', description: '', requirements: '', department: '', location: '' })
        fetchPostings()
      }
    } finally { setCreating(false) }
  }

  const inputStyle = {
    width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
    color: 'var(--text)', borderRadius: '8px', padding: '9px 12px',
    fontSize: '13px', fontFamily: 'Instrument Sans, sans-serif', outline: 'none',
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '4px' }}>
            Resume Screening
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
            Create job postings, upload candidate resumes, and run AI screening.
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif', whiteSpace: 'nowrap' }}>
          New posting
        </button>
      </div>

      {/* Create posting form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px 24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '18px', fontFamily: 'Instrument Sans, sans-serif' }}>
            New Job Posting
          </p>
          <form onSubmit={createPosting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '5px', fontFamily: 'Instrument Sans, sans-serif' }}>Job title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Software Engineer" style={inputStyle} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '5px', fontFamily: 'Instrument Sans, sans-serif' }}>Department</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Engineering" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '5px', fontFamily: 'Instrument Sans, sans-serif' }}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Remote, New York, etc." style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '5px', fontFamily: 'Instrument Sans, sans-serif' }}>Job description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the role, responsibilities, and ideal candidate..."
                rows={4} required
                style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text)', marginBottom: '5px', fontFamily: 'Instrument Sans, sans-serif' }}>Requirements</label>
              <textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                placeholder="Required skills, experience, qualifications..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif' }}>
                Cancel
              </button>
              <button type="submit" disabled={creating}
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1, fontFamily: 'Instrument Sans, sans-serif' }}>
                {creating ? 'Creating...' : 'Create posting'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Postings list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ height: '14px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '40%', marginBottom: '10px' }} />
              <div style={{ height: '11px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '25%' }} />
            </div>
          ))}
        </div>
      ) : postings.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>No job postings yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>Create your first posting to start screening candidates</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {postings.map(p => {
            const count = p.candidate_resumes?.[0]?.count ?? 0
            const date = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <div key={p.id}
                onClick={() => router.push(`/hr/screening/${p.id}`)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
                      {p.title}
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {p.department && <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>{p.department}</span>}
                      {p.location && <span style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>{p.location}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)', fontFamily: 'Instrument Sans, sans-serif', marginBottom: '2px' }}>
                      {count} candidate{count !== 1 ? 's' : ''}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>{date}</p>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '12px', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500 }}>
                  Open posting →
                </p>
              </div>
            )
          })}
        </div>
      )}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  )
}
