'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Job {
  id: string; title: string; company: string; location: string; description: string
  salary_min?: number; salary_max?: number; salary_currency?: string; salary_period?: string
  employment_type?: string; apply_url?: string; posted_at?: string; logo?: string
}

function formatSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null
  const period = job.salary_period === 'HOUR' ? '/hr' : '/yr'
  const fmt = (n: number) => job.salary_period === 'HOUR' ? `$${n}` : `$${(n / 1000).toFixed(0)}k`
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)} ${job.salary_currency ?? 'USD'}${period}`
  return `${fmt(job.salary_min ?? job.salary_max ?? 0)} ${job.salary_currency ?? 'USD'}${period}`
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const inputStyle = {
  background: 'var(--bg-card)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: '8px', padding: '10px 14px',
  fontSize: '14px', fontFamily: 'Instrument Sans, sans-serif', outline: 'none',
}

export default function JobsPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [isMock, setIsMock] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setSearched(true)
    try {
      const res = await fetch(`/api/jobs/search?${new URLSearchParams({ query, location })}`)
      const data = await res.json()
      setJobs(data.data ?? []); setIsMock(data.mock ?? false)
    } catch { setJobs([]) } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '4px' }}>Jobs</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>Search and match roles against your resume.</p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title or keyword" style={{ ...inputStyle, flex: 1 }}
          onFocus={(e) => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
          onBlur={(e) => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
        />
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="Location or Remote" style={{ ...inputStyle, width: '180px' }}
          onFocus={(e) => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
          onBlur={(e) => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
        />
        <button type="submit" disabled={loading || !query.trim()}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: 500, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', opacity: loading || !query.trim() ? 0.6 : 1, fontFamily: 'Instrument Sans, sans-serif', whiteSpace: 'nowrap' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {isMock && (
        <div style={{ marginBottom: '16px', background: 'var(--warning-light)', border: '1px solid #E8D0B0', color: 'var(--warning)', fontSize: '12px', padding: '10px 14px', borderRadius: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>
          Showing demo data — add a JSEARCH_API_KEY to see live listings
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', animation: 'pulse 1.5s ease-in-out infinite' }}>
              <div style={{ height: '14px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '35%', marginBottom: '10px' }} />
              <div style={{ height: '12px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '25%', marginBottom: '14px' }} />
              <div style={{ height: '11px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '90%', marginBottom: '6px' }} />
              <div style={{ height: '11px', background: 'var(--bg-subtle)', borderRadius: '4px', width: '75%' }} />
            </div>
          ))}
        </div>
      ) : searched && jobs.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>No results found</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>Try a different search term or location</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jobs.map(job => {
            const salary = formatSalary(job)
            return (
              <div key={job.id}
                onClick={() => router.push(`/jobs/${encodeURIComponent(job.id)}?data=${encodeURIComponent(JSON.stringify(job))}`)}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px', cursor: 'pointer', transition: 'border-color 0.12s' }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.title}
                      </p>
                      {job.employment_type && (
                        <span style={{ fontSize: '10px', color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px', whiteSpace: 'nowrap', fontFamily: 'Instrument Sans, sans-serif' }}>
                          {job.employment_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>
                      {job.company} · {job.location}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.55, fontFamily: 'Instrument Sans, sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description?.slice(0, 160)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    {salary && <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--success)', fontFamily: 'Instrument Sans, sans-serif' }}>{salary}</span>}
                    {job.posted_at && <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>{timeAgo(job.posted_at)}</span>}
                  </div>
                </div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 500 }}>
                    View details and check match →
                  </span>
                  {job.apply_url && job.apply_url !== '#' && (
                    <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '11px', color: 'var(--text-3)', textDecoration: 'none', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
                      Apply directly
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!searched && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>Search for roles</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>Enter a job title above to find matching opportunities</p>
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  )
}
