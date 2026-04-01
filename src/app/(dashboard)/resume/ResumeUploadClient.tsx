'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

type UploadState = 'idle' | 'uploading' | 'parsing' | 'saving' | 'done' | 'error'
const MAX_SIZE = 5 * 1024 * 1024

const statusMessages: Record<UploadState, string> = {
  idle: '', uploading: 'Uploading...', parsing: 'Extracting text from your resume...',
  saving: 'Saving profile...', done: 'Done. Redirecting...', error: '',
}

export default function ResumeUploadClient() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)

  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault()
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => { document.removeEventListener('dragover', prevent); document.removeEventListener('drop', prevent) }
  }, [])

  async function handleFile(file: File) {
    setError(null); setFileName(file.name)
    const isAllowed = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.(pdf|docx)$/i.test(file.name)
    if (!isAllowed) { setError('Only PDF and DOCX files are supported.'); return }
    if (file.size > MAX_SIZE) { setError('File is too large. Maximum size is 5 MB.'); return }

    setState('uploading'); setProgress(20)
    const formData = new FormData(); formData.append('file', file)
    try {
      setState('parsing'); setProgress(50)
      const res = await fetch('/api/resume/upload', { method: 'POST', body: formData })
      setProgress(80); setState('saving')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed.')
      setProgress(100); setState('done')
      setTimeout(() => router.push('/resume/profile'), 1000)
    } catch (err: unknown) {
      setState('error'); setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false)
    const file = e.dataTransfer.files[0]; if (file) handleFile(file)
  }, [])

  const isProcessing = ['uploading', 'parsing', 'saving'].includes(state)

  const zoneBorder = dragOver ? 'var(--accent)' : state === 'done' ? 'var(--success)' : state === 'error' ? 'var(--error)' : 'var(--border)'
  const zoneBg = dragOver ? 'var(--accent-light)' : state === 'done' ? 'var(--success-light)' : state === 'error' ? 'var(--error-light)' : 'var(--bg-card)'

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontWeight: 400, fontSize: '24px', color: 'var(--text)', marginBottom: '6px' }}>
          Resume
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', fontFamily: 'Instrument Sans, sans-serif' }}>
          Upload your resume and we will extract your skills, experience, and education.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false) }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }}
        style={{
          border: `2px dashed ${zoneBorder}`, borderRadius: '12px',
          background: zoneBg, padding: '56px 40px', textAlign: 'center',
          cursor: isProcessing || state === 'done' ? 'default' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <input
          ref={inputRef} type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          style={{ display: 'none' }}
        />

        {/* Icon */}
        <div style={{ marginBottom: '16px' }}>
          {isProcessing ? (
            <svg style={{ animation: 'spin 1s linear infinite', margin: '0 auto', color: 'var(--accent)' }} width="32" height="32" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : state === 'done' ? (
            <svg style={{ margin: '0 auto', color: 'var(--success)' }} width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg style={{ margin: '0 auto', color: dragOver ? 'var(--accent)' : 'var(--text-3)' }} width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        {isProcessing ? (
          <>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
              {statusMessages[state]}
            </p>
            {fileName && <p style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>{fileName}</p>}
            <div style={{ width: '160px', height: '3px', background: 'var(--border)', borderRadius: '2px', margin: '16px auto 0', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px', width: `${progress}%`, transition: 'width 0.5s ease' }} />
            </div>
          </>
        ) : state === 'done' ? (
          <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--success)', fontFamily: 'Instrument Sans, sans-serif' }}>Done. Redirecting to your profile...</p>
        ) : (
          <>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
              {dragOver ? 'Release to upload' : 'Drop your resume here'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '20px', fontFamily: 'Instrument Sans, sans-serif' }}>or</p>
            <button
              type="button" onClick={() => inputRef.current?.click()}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '9px 20px', fontSize: '13px',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif',
                marginBottom: '16px',
              }}
            >
              Browse files
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {['PDF', 'DOCX'].map(f => (
                <span key={f} style={{
                  fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif',
                  border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px',
                  background: 'var(--bg)',
                }}>{f}</span>
              ))}
              <span style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'Instrument Sans, sans-serif' }}>· max 5 MB</span>
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '12px', background: 'var(--error-light)', border: '1px solid #F0B8B4',
          color: 'var(--error)', fontSize: '13px', padding: '10px 14px',
          borderRadius: '8px', fontFamily: 'Instrument Sans, sans-serif',
        }}>
          {error}
        </div>
      )}

      {/* Tips */}
      {(state === 'idle' || state === 'error') && (
        <div style={{ marginTop: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px' }}>
          <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: '10px', fontFamily: 'Instrument Sans, sans-serif' }}>
            Tips for best results
          </p>
          {[
            'Use a text-based PDF, not a scanned image',
            'Use clear section headings: Experience, Education, Skills',
            'Put your name on the first line of the document',
          ].map(tip => (
            <p key={tip} style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '4px', fontFamily: 'Instrument Sans, sans-serif' }}>
              — {tip}
            </p>
          ))}
        </div>
      )}

      {state === 'error' && (
        <button onClick={() => { setState('idle'); setError(null); setFileName(null) }}
          style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '13px', cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif' }}>
          Try a different file
        </button>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
