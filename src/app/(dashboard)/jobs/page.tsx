'use client'

import { useState } from 'react'
import JobCard from '@/components/jobs/JobCard'
import MatchModal from '@/components/jobs/MatchModal'

interface Job {
  job_id: string
  title: string
  company: string
  location: string
  employment_type: string
  is_remote: boolean
  description: string
  description_full: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  salary_period: string
  apply_link: string
  posted_at: string
  logo: string
}

export default function JobsPage() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [matchJob, setMatchJob] = useState<Job | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setJobs([])
    setSearched(true)

    try {
      const params = new URLSearchParams({ query, location })
      const res = await fetch(`/api/jobs/search?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setJobs(data.jobs ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Job Search</h1>
        <p className="text-slate-400">
          Search across LinkedIn, Indeed, Glassdoor and more — then check how well your resume matches.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Job title, skills, or keywords"
            className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="relative sm:w-52">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Location (optional)"
            className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
        >
          {loading ? 'Searching…' : 'Search jobs'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-48" />
                  <div className="h-3 bg-slate-800 rounded w-32" />
                  <div className="h-3 bg-slate-800 rounded w-full" />
                  <div className="h-3 bg-slate-800 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && jobs.length > 0 && (
        <>
          <p className="text-slate-500 text-sm mb-4">{jobs.length} jobs found</p>
          <div className="space-y-4">
            {jobs.map(job => (
              <JobCard
                key={job.job_id}
                job={job}
                onViewDetails={() => setSelectedJob(job)}
                onCheckMatch={() => setMatchJob(job)}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && searched && jobs.length === 0 && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white font-medium mb-1">No jobs found</p>
          <p className="text-slate-500 text-sm">Try different keywords or a broader location</p>
        </div>
      )}

      {/* Initial empty state */}
      {!loading && !searched && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-white font-medium mb-1">Search for your next role</p>
          <p className="text-slate-500 text-sm">Enter a job title above to see matching positions</p>
        </div>
      )}

      {/* Job detail modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onCheckMatch={() => { setMatchJob(selectedJob); setSelectedJob(null) }}
        />
      )}

      {/* Match modal */}
      {matchJob && (
        <MatchModal
          job={matchJob}
          onClose={() => setMatchJob(null)}
        />
      )}
    </div>
  )
}

function JobDetailModal({ job, onClose, onCheckMatch }: {
  job: Job
  onClose: () => void
  onCheckMatch: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800">
          <div className="flex items-start gap-4">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-contain bg-white p-1 flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 text-lg font-bold flex-shrink-0">
                {job.company[0]}
              </div>
            )}
            <div>
              <h2 className="text-white font-semibold text-lg">{job.title}</h2>
              <p className="text-slate-400 text-sm">{job.company} · {job.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {job.employment_type && (
              <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{job.employment_type}</span>
            )}
            {job.is_remote && (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-3 py-1 rounded-full">Remote</span>
            )}
            {(job.salary_min || job.salary_max) && (
              <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">
                {formatSalary(job)}
              </span>
            )}
          </div>
          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {job.description_full || job.description}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onCheckMatch}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            Check My Match
          </button>
          {job.apply_link && (
            <a
              href={job.apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold py-2.5 rounded-xl transition-colors text-sm text-center"
            >
              Apply →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function formatSalary(job: Job): string {
  const fmt = (n: number) =>
    n >= 1000 ? `${job.salary_currency === 'USD' ? '$' : ''}${Math.round(n / 1000)}k` : `${n}`
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`
  if (job.salary_min) return `From ${fmt(job.salary_min)}`
  if (job.salary_max) return `Up to ${fmt(job.salary_max)}`
  return ''
}
