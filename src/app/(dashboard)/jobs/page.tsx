'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  salary_period?: string
  employment_type?: string
  apply_url?: string
  posted_at?: string
  logo?: string
}

function formatSalary(job: Job): string | null {
  if (!job.salary_min && !job.salary_max) return null
  const period = job.salary_period === 'HOUR' ? '/hr' : '/yr'
  const currency = job.salary_currency ?? 'USD'
  const fmt = (n: number) => job.salary_period === 'HOUR' ? `$${n}` : `$${(n / 1000).toFixed(0)}k`
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)} ${currency}${period}`
  return `${fmt(job.salary_min ?? job.salary_max ?? 0)} ${currency}${period}`
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
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
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({ query, location })
      const res = await fetch(`/api/jobs/search?${params}`)
      const data = await res.json()
      setJobs(data.data ?? [])
      setIsMock(data.mock ?? false)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Jobs</h1>
        <p className="text-slate-400">Search and match jobs against your resume.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, role, or keyword…"
          className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location or Remote"
          className="w-48 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {isMock && (
        <div className="mb-5 bg-amber-950/40 border border-amber-800/50 text-amber-300 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>Showing demo data — add a <code className="bg-amber-900/50 px-1 rounded">JSEARCH_API_KEY</code> to Vercel to see real jobs</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-1/4 mb-4" />
              <div className="h-3 bg-slate-800 rounded w-full mb-2" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : searched && jobs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-white font-medium mb-1">No jobs found</p>
          <p className="text-slate-500 text-sm">Try a different search term or location</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const salary = formatSalary(job)
            return (
              <div
                key={job.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 transition-all cursor-pointer group"
                onClick={() => router.push(`/jobs/${encodeURIComponent(job.id)}?data=${encodeURIComponent(JSON.stringify(job))}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold group-hover:text-indigo-300 transition-colors truncate">
                        {job.title}
                      </h3>
                      {job.employment_type && (
                        <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          {job.employment_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400 mb-3">
                      <span>{job.company}</span>
                      <span className="text-slate-700">·</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                      {job.description?.slice(0, 180)}…
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {salary && <span className="text-emerald-400 text-sm font-medium whitespace-nowrap">{salary}</span>}
                    {job.posted_at && <span className="text-slate-600 text-xs">{timeAgo(job.posted_at)}</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <span className="text-indigo-400 text-sm group-hover:text-indigo-300 transition-colors">
                    View details & match →
                  </span>
                  {job.apply_url && job.apply_url !== '#' && (
                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-slate-500 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Apply directly ↗
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!searched && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center text-center">
          <span className="text-4xl mb-3">💼</span>
          <p className="text-white font-medium mb-1">Search for jobs</p>
          <p className="text-slate-500 text-sm">Enter a job title above to find matching opportunities</p>
        </div>
      )}
    </div>
  )
}
