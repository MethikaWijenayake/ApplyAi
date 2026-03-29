'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface MatchResult {
  match_score: number
  strengths: string[]
  skill_gaps: string[]
  recommendations: string[]
  summary?: string
  ai_powered?: boolean
  ai_enabled?: boolean
  cached?: boolean
}

function CircularScore({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const color =
    score >= 75 ? '#34d399' :
    score >= 50 ? '#fbbf24' :
    '#f87171'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-slate-400 text-xs">/ 100</span>
      </div>
    </div>
  )
}

export default function JobDetailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const rawData = searchParams.get('data')
  const job = rawData ? JSON.parse(decodeURIComponent(rawData)) : null

  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [matching, setMatching] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)

  if (!job) {
    return (
      <div className="max-w-3xl">
        <p className="text-slate-400">Job not found. <button onClick={() => router.back()} className="text-indigo-400">Go back</button></p>
      </div>
    )
  }

  const salary = (() => {
    if (!job.salary_min && !job.salary_max) return null
    const period = job.salary_period === 'HOUR' ? '/hr' : '/yr'
    const fmt = (n: number) => job.salary_period === 'HOUR' ? `$${n}` : `$${(n / 1000).toFixed(0)}k`
    if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)} ${job.salary_currency ?? 'USD'}${period}`
    return `${fmt(job.salary_min ?? job.salary_max ?? 0)} ${job.salary_currency ?? 'USD'}${period}`
  })()

  async function handleCheckMatch() {
    setMatching(true)
    setMatchError(null)

    try {
      const res = await fetch('/api/jobs/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          job_description: job.description,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Match failed')
      setMatchResult(data)
    } catch (err: unknown) {
      setMatchError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setMatching(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to search
      </button>

      {/* Job header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-white mb-1">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="font-medium text-slate-300">{job.company}</span>
              <span className="text-slate-700">·</span>
              <span>{job.location}</span>
              {job.employment_type && (
                <>
                  <span className="text-slate-700">·</span>
                  <span>{job.employment_type.replace('_', ' ')}</span>
                </>
              )}
            </div>
          </div>
          {salary && (
            <span className="text-emerald-400 font-semibold text-sm whitespace-nowrap">{salary}</span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCheckMatch}
            disabled={matching || !!matchResult}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            {matching ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : matchResult ? (
              '✓ Matched'
            ) : (
              '🎯 Check My Match'
            )}
          </button>

          {job.apply_url && job.apply_url !== '#' && (
            <a
              href={job.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all"
            >
              Apply ↗
            </a>
          )}
        </div>
      </div>

      {/* Match error */}
      {matchError && (
        <div className="mb-5 bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl">
          {matchError}
        </div>
      )}

      {/* Match result */}
      {matchResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-white font-semibold">Resume Match Analysis</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              matchResult.ai_powered
                ? 'bg-indigo-950/60 border-indigo-800/50 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              {matchResult.ai_powered ? '✨ AI-powered' : '🔧 Mock data'}
            </span>
            {matchResult.cached && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                cached
              </span>
            )}
          </div>

          {/* Score + summary */}
          <div className="flex items-center gap-8 mb-6">
            <CircularScore score={matchResult.match_score} />
            <div>
              <p className="text-slate-300 text-sm font-medium mb-1">Overall match</p>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                {matchResult.summary ?? 'Analysis complete. See details below.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Strengths */}
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-4">
              <p className="text-emerald-400 text-sm font-medium mb-3 flex items-center gap-1.5">
                <span>✅</span> Your strengths
              </p>
              <ul className="space-y-1.5">
                {matchResult.strengths.map((s) => (
                  <li key={s} className="text-slate-300 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill gaps */}
            <div className="bg-amber-950/30 border border-amber-800/30 rounded-lg p-4">
              <p className="text-amber-400 text-sm font-medium mb-3 flex items-center gap-1.5">
                <span>⚡</span> Skill gaps
              </p>
              <ul className="space-y-1.5">
                {matchResult.skill_gaps.map((s) => (
                  <li key={s} className="text-slate-300 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-lg p-4">
            <p className="text-indigo-300 text-sm font-medium mb-3 flex items-center gap-1.5">
              <span>💡</span> Recommendations
            </p>
            <ul className="space-y-2">
              {matchResult.recommendations.map((r, i) => (
                <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                  <span className="text-indigo-400 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Full description */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Job Description</h2>
        <div className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
          {job.description}
        </div>
      </div>
    </div>
  )
}
