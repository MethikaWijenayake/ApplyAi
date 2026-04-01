'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface MatchResult {
  match_score: number; strengths: string[]; skill_gaps: string[]
  recommendations: string[]; summary?: string; ai_powered?: boolean; cached?: boolean
}

function ScoreRing({ score }: { score: number }) {
  const r = 40, c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? '#C0862A' : 'var(--error)'
  return (
    <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: '22px', color: 'var(--text)', lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>/ 100</span>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawData = searchParams.get('data')
  const job = rawData ? JSON.parse(decodeURIComponent(rawData)) : null
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [matching, setMatching] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)

  if (!job) return (
    <div><p style={{ color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>Job not found.{' '}
      <button onClick={() => router.back()} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif' }}>Go back</button>
    </p></div>
  )

  const salary = (() => {
    if (!job.salary_min && !job.salary_max) return null
    const period = job.salary_period === 'HOUR' ? '/hr' : '/yr'
    const fmt = (n: number) => job.salary_period === 'HOUR' ? `$${n}` : `$${(n / 1000).toFixed(0)}k`
    if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)} ${job.salary_currency ?? 'USD'}${period}`
    return `${fmt(job.salary_min ?? job.salary_max ?? 0)} ${job.salary_currency ?? 'USD'}${period}`
  })()

  async function handleCheckMatch() {
    setMatching(true); setMatchError(null)
    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, job_title: job.title, job_description: job.description }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Match failed')
      setMatchResult(data)
    } catch (err: unknown) {
      setMatchError(err instanceof Error ? err.message : 'Something went wrong')
    } finally { setMatching(false) }
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Back */}
      <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0, fontFamily: 'Instrument Sans, sans-serif' }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to search
      </button>

      {/* Header card */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px 24px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '22px', color: 'var(--text)', marginBottom: '6px' }}>{job.title}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
              {job.company} · {job.location}
              {job.employment_type && ` · ${job.employment_type.replace('_', ' ')}`}
            </p>
          </div>
          {salary && <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--success)', fontFamily: 'Instrument Sans, sans-serif', whiteSpace: 'nowrap' }}>{salary}</span>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCheckMatch} disabled={matching || !!matchResult}
            style={{ background: matchResult ? 'var(--bg-subtle)' : 'var(--accent)', color: matchResult ? 'var(--text-2)' : '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 500, cursor: matching || !!matchResult ? 'not-allowed' : 'pointer', fontFamily: 'Instrument Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px', opacity: matching ? 0.7 : 1 }}>
            {matching ? (
              <><svg style={{ animation: 'spin 1s linear infinite' }} width="14" height="14" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Analyzing...</>
            ) : matchResult ? 'Matched' : 'Check my match'}
          </button>
          {job.apply_url && job.apply_url !== '#' && (
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
              style={{ border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontFamily: 'Instrument Sans, sans-serif' }}>
              Apply directly
            </a>
          )}
        </div>
      </div>

      {/* Match error */}
      {matchError && (
        <div style={{ marginBottom: '10px', background: 'var(--error-light)', border: '1px solid #F0B8B4', color: 'var(--error)', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>
          {matchError}
        </div>
      )}

      {/* Match result */}
      {matchResult && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px 24px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
              Match Analysis
            </p>
            <span style={{ fontSize: '10px', color: matchResult.ai_powered ? 'var(--accent)' : 'var(--text-3)', border: `1px solid ${matchResult.ai_powered ? 'var(--accent-border)' : 'var(--border)'}`, background: matchResult.ai_powered ? 'var(--accent-light)' : 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif' }}>
              {matchResult.ai_powered ? 'AI-powered' : 'Mock data'}
            </span>
            {matchResult.cached && <span style={{ fontSize: '10px', color: 'var(--text-3)', border: '1px solid var(--border)', background: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif' }}>cached</span>}
          </div>

          {/* Score + summary */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
            <ScoreRing score={matchResult.match_score} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>Overall match</p>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, fontFamily: 'Instrument Sans, sans-serif', maxWidth: '380px' }}>
                {matchResult.summary ?? 'Analysis complete.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            {/* Strengths */}
            <div style={{ background: 'var(--success-light)', border: '1px solid #B8DCCC', borderRadius: '8px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', marginBottom: '10px', fontFamily: 'Instrument Sans, sans-serif' }}>Strengths</p>
              {matchResult.strengths.map(s => (
                <p key={s} style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', flexShrink: 0 }} />{s}
                </p>
              ))}
            </div>
            {/* Gaps */}
            <div style={{ background: 'var(--warning-light)', border: '1px solid #E8D0B0', borderRadius: '8px', padding: '14px 16px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--warning)', marginBottom: '10px', fontFamily: 'Instrument Sans, sans-serif' }}>Skill gaps</p>
              {matchResult.skill_gaps.map(s => (
                <p key={s} style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--warning)', display: 'inline-block', flexShrink: 0 }} />{s}
                </p>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-border)', borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '10px', fontFamily: 'Instrument Sans, sans-serif' }}>Recommendations</p>
            {matchResult.recommendations.map((r, i) => (
              <p key={i} style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif', display: 'flex', gap: '8px' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>{r}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px 24px' }}>
        <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '16px', fontFamily: 'Instrument Sans, sans-serif' }}>
          Job Description
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.7, fontFamily: 'Instrument Sans, sans-serif', whiteSpace: 'pre-line' }}>
          {job.description}
        </p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
