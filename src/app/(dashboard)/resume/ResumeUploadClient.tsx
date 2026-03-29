'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

type UploadState = 'idle' | 'uploading' | 'parsing' | 'saving' | 'done' | 'error'

const MAX_SIZE = 5 * 1024 * 1024

export default function ResumeUploadClient() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Block browser from opening dropped files anywhere on the page
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault()
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => {
      document.removeEventListener('dragover', prevent)
      document.removeEventListener('drop', prevent)
    }
  }, [])

  const statusMessages: Record<UploadState, string> = {
    idle: '',
    uploading: 'Uploading to secure storage…',
    parsing: 'Extracting text from your resume…',
    saving: 'Saving parsed profile…',
    done: 'Done! Redirecting to your profile…',
    error: '',
  }

  async function handleFile(file: File) {
    setError(null)
    setFileName(file.name)

    const isAllowed =
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      /\.(pdf|docx)$/i.test(file.name)

    if (!isAllowed) { setError('Only PDF and DOCX files are supported.'); return }
    if (file.size > MAX_SIZE) { setError('File is too large. Maximum size is 5 MB.'); return }

    setState('uploading')
    setProgress(20)
    const formData = new FormData()
    formData.append('file', file)

    try {
      setState('parsing')
      setProgress(50)

      const res = await fetch('/api/resume/upload', { method: 'POST', body: formData })
      setProgress(80)
      setState('saving')

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed.')

      setProgress(100)
      setState('done')
      setTimeout(() => router.push('/resume/profile'), 1200)
    } catch (err: unknown) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false)
  }, [])

  const isProcessing = ['uploading', 'parsing', 'saving'].includes(state)

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Resume</h1>
        <p className="text-slate-400">
          Upload your resume and we&apos;ll extract your skills, experience, and education automatically.
        </p>
      </div>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnter={onDragOver}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isProcessing || state === 'done' ? 'cursor-default' : 'cursor-pointer'
        } ${
          dragOver ? 'border-indigo-400 bg-indigo-950/40'
          : state === 'done' ? 'border-emerald-500 bg-emerald-950/20'
          : state === 'error' ? 'border-red-500 bg-red-950/20'
          : 'border-slate-700 bg-slate-900 hover:border-indigo-500 hover:bg-slate-800/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
            state === 'done' ? 'bg-emerald-500/20'
            : state === 'error' ? 'bg-red-500/20'
            : dragOver ? 'bg-indigo-600/20'
            : 'bg-slate-800'
          }`}>
            {state === 'done' ? (
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : state === 'error' ? (
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isProcessing ? (
              <svg className="w-8 h-8 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : dragOver ? (
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </div>

          {isProcessing ? (
            <>
              <p className="text-white font-medium mb-1">{statusMessages[state]}</p>
              {fileName && <p className="text-slate-500 text-sm truncate max-w-xs">{fileName}</p>}
              <div className="w-48 h-1 bg-slate-800 rounded-full mt-5 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : state === 'done' ? (
            <p className="text-emerald-400 font-medium">{statusMessages.done}</p>
          ) : dragOver ? (
            <p className="text-indigo-300 font-medium">Release to upload</p>
          ) : (
            <>
              <p className="text-white font-medium mb-1">Drop your resume here</p>
              <p className="text-slate-500 text-sm mb-5">or</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mb-5"
              >
                Browse files
              </button>
              <div className="flex items-center gap-2">
                <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-md border border-slate-700">PDF</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-md border border-slate-700">DOCX</span>
                <span className="text-slate-600 text-xs">· max 5 MB</span>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl flex items-start gap-3">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {(state === 'idle' || state === 'error') && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm font-medium mb-3">Tips for best results</p>
          <ul className="space-y-2">
            {[
              'Use a text-based PDF, not a scanned image',
              'Include clear section headings: Experience, Education, Skills',
              'Make sure your name is on the first line of the document',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-slate-500 text-sm">
                <span className="text-indigo-500 mt-0.5">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {state === 'error' && (
        <button
          onClick={() => { setState('idle'); setError(null); setFileName(null) }}
          className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
        >
          ← Try a different file
        </button>
      )}
    </div>
  )
}
