'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Candidate { id: string; candidate_name: string; candidate_email?: string; uploaded_at: string }
interface Posting { id: string; title: string; description: string; department?: string; location?: string; candidates: Candidate[] }
interface ScreeningResult {
  id: string
  candidate_resume_id: string
  match_score: number
  rank: number
  strengths: string[]
  skill_gaps: string[]
  recommendations: string[]
  bias_flags: Array<{ type: string; severity: string; detail: string }>
  summary: string
  ai_powered: boolean
  candidate_resumes: { candidate_name: string; candidate_email?: string }
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? '#C0862A' : 'var(--error)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: '13px', fontWeight: 600, color, fontFamily: 'Instrument Sans, sans-serif', minWidth: '36px', textAlign: 'right' }}>
        {score}
      </span>
    </div>
  )
}

const severityColor: Record<string, string> = {
  high: 'var(--error)', medium: '#C0862A', low: 'var(--text-3)'
}

export default function PostingDetailPage() {
  const { postingId } = useParams<{ postingId: string }>()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [posting, setPosting] = useState<Posting | null>(null)
  const [results, setResults] = useState<ScreeningResult[]>([])
  const [loading, setLoading] = useState(true)
  const [screening, setScreening] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)
  const [selected, setSelected] = useState<ScreeningResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault()
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => { document.removeEventListener('dragover', prevent); document.removeEventListener('drop', prevent) }
  }, [])

  useEffect(() => {
    fetchPosting()
    fetchResults()
  }, [postingId])

  async function fetchPosting() {
    setLoading(true)
    try {
      const res = await fetch(`/api/screening/postings?id=${postingId}`)
      // fetch from backend directly for single posting
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const r = await fetch(`/api/screening/postings`)
      const all = await r.json()
      const found = Array.isArray(all) ? all.find((p: Posting) => p.id === postingId) : null
      if (found) setPosting(found)
    } catch {} finally { setLoading(false) }
  }

  async function fetchResults() {
    try {
      const res = await fetch(`/api/screening/postings/${postingId}/results`)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch { setResults([]) }
  }

  async function handleFiles(files: FileList) {
    setUploadError(null)
    setUploading(true)
    let count = 0

    for (const file of Array.from(files)) {
      if (!file.name.match(/\.(pdf|docx)$/i)) continue
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch(`/api/screening/postings/${postingId}/upload`, { method: 'POST', body: fd })
        if (res.ok) count++
        else {
          const err = await res.json()
          setUploadError(err.error ?? 'Upload failed for one or more files')
        }
      } catch { setUploadError('Upload failed') }
    }

    setUploadCount(count)
    setUploading(false)
    if (count > 0) fetchPosting()
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }, [postingId])

  async function runScreening() {
    setScreening(true)
    try {
      const res = await fetch(`/api/screening/postings/${postingId}/screen`, { method: 'POST' })
      if (res.ok) await fetchResults()
    } finally { setScreening(false) }
  }

  const candidateCount = posting?.candidates?.length ?? 0

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* Back */}
      <button onClick={() => router.push('/screening')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', padding: 0, fontFamily: 'Instrument Sans, sans-serif' }}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        All postings
      </button>

      {loading ? (
        <div style={{ height: '60px', background: 'var(--bg-subtle)', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : posting && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '22px', color: 'var(--text)', marginBottom: '4px' }}>{posting.title}</h1>
              <p style={{ fontSize: '12px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
                {[posting.department, posting.location].filter(Boolean).join(' · ')}
              </p>
            </div>
            <button onClick={runScreening} disabled={screening || candidateCount === 0}
              style={{ background: candidateCount === 0 ? 'var(--bg-subtle)' : 'var(--accent)', color: candidateCount === 0 ? 'var(--text-3)' : '#fff', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: 500, cursor: candidateCount === 0 || screening ? 'not-allowed' : 'pointer', fontFamily: 'Instrument Sans, sans-serif', whiteSpace: 'nowrap', opacity: screening ? 0.7 : 1 }}>
              {screening ? 'Screening...' : `Screen ${candidateCount} candidate${candidateCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: results.length > 0 && selected ? '1fr 340px' : '1fr', gap: '16px', alignItems: 'start' }}>
        <div>
          {/* Upload zone */}
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
            onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
            onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
            onClick={() => !uploading && inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '10px', padding: '28px 24px', textAlign: 'center',
              cursor: uploading ? 'default' : 'pointer', marginBottom: '16px',
              background: dragOver ? 'var(--accent-light)' : 'var(--bg-card)',
              transition: 'all 0.15s',
            }}
          >
            <input ref={inputRef} type="file" multiple accept=".pdf,.docx" onChange={e => { if (e.target.files) handleFiles(e.target.files) }} style={{ display: 'none' }} />
            {uploading ? (
              <p style={{ fontSize: '13px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>Uploading resumes...</p>
            ) : dragOver ? (
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)', fontFamily: 'Instrument Sans, sans-serif' }}>Release to upload</p>
            ) : (
              <>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
                  Drop candidate resumes here
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                  PDF or DOCX · multiple files supported · click to browse
                </p>
              </>
            )}
          </div>

          {uploadError && (
            <div style={{ marginBottom: '12px', background: 'var(--error-light)', border: '1px solid #F0B8B4', color: 'var(--error)', fontSize: '12px', padding: '8px 12px', borderRadius: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>
              {uploadError}
            </div>
          )}

          {/* Results */}
          {results.length > 0 ? (
            <div>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '12px', fontFamily: 'Instrument Sans, sans-serif' }}>
                Ranked candidates — {results.length} screened
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.map(r => {
                  const name = r.candidate_resumes?.candidate_name ?? 'Unknown'
                  const isSelected = selected?.id === r.id
                  const hasBias = r.bias_flags?.length > 0
                  return (
                    <div key={r.id}
                      onClick={() => setSelected(isSelected ? null : r)}
                      style={{ background: 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--accent-border)' : 'var(--border)'}`, borderRadius: '10px', padding: '14px 18px', cursor: 'pointer', transition: 'border-color 0.12s' }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)' }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif', minWidth: '20px' }}>
                          #{r.rank}
                        </span>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Instrument Sans, sans-serif', flex: 1 }}>
                          {name}
                        </p>
                        {hasBias && (
                          <span style={{ fontSize: '10px', color: '#C0862A', background: 'var(--warning-light)', border: '1px solid #E8D0B0', padding: '2px 7px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif' }}>
                            Bias flag
                          </span>
                        )}
                        {r.ai_powered && (
                          <span style={{ fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-light)', border: '1px solid var(--accent-border)', padding: '2px 7px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif' }}>
                            AI
                          </span>
                        )}
                      </div>
                      <ScoreBar score={r.match_score} />
                      {r.skill_gaps?.length > 0 && (
                        <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
                          Gaps: {r.skill_gaps.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : candidateCount > 0 ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
                {candidateCount} resume{candidateCount !== 1 ? 's' : ''} ready to screen
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                Click "Screen candidates" to run AI analysis
              </p>
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                Upload candidate resumes above to get started
              </p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>
                Candidate Report
              </p>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '18px', lineHeight: 1 }}>×</button>
            </div>

            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px', fontFamily: 'Instrument Sans, sans-serif' }}>
              {selected.candidate_resumes?.candidate_name}
            </p>
            {selected.candidate_resumes?.candidate_email && (
              <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '14px', fontFamily: 'Instrument Sans, sans-serif' }}>
                {selected.candidate_resumes.candidate_email}
              </p>
            )}

            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>Match score</p>
              <ScoreBar score={selected.match_score} />
            </div>

            {selected.summary && (
              <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-2)', lineHeight: 1.6, fontFamily: 'Instrument Sans, sans-serif' }}>{selected.summary}</p>
              </div>
            )}

            {selected.strengths?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--success)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>Strengths</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selected.strengths.map(s => (
                    <span key={s} style={{ fontSize: '11px', background: 'var(--success-light)', border: '1px solid #B8DCCC', color: 'var(--success)', padding: '2px 8px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.skill_gaps?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--warning)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>Skill gaps</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selected.skill_gaps.map(s => (
                    <span key={s} style={{ fontSize: '11px', background: 'var(--warning-light)', border: '1px solid #E8D0B0', color: 'var(--warning)', padding: '2px 8px', borderRadius: '100px', fontFamily: 'Instrument Sans, sans-serif' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.recommendations?.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>Recommendations</p>
                {selected.recommendations.map((r, i) => (
                  <p key={i} style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif', display: 'flex', gap: '6px' }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>{r}
                  </p>
                ))}
              </div>
            )}

            {selected.bias_flags?.length > 0 && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#C0862A', marginBottom: '8px', fontFamily: 'Instrument Sans, sans-serif' }}>
                  Bias audit flags
                </p>
                {selected.bias_flags.map((flag, i) => (
                  <div key={i} style={{ background: 'var(--warning-light)', border: '1px solid #E8D0B0', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, color: severityColor[flag.severity] ?? 'var(--text-2)', marginBottom: '3px', fontFamily: 'Instrument Sans, sans-serif', textTransform: 'capitalize' }}>
                      {flag.type.replace(/_/g, ' ')} · {flag.severity}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: 1.5, fontFamily: 'Instrument Sans, sans-serif' }}>
                      {flag.detail}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  )
}
