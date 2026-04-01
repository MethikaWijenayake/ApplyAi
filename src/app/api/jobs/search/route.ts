import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') ?? ''
  const location = searchParams.get('location') ?? ''
  const page = searchParams.get('page') ?? '1'

  if (!query.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  try {
    const params = new URLSearchParams({ query, location, page })
    const res = await fetch(`${apiUrl}/jobs/search?${params}`)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      // Fall back to mock if backend unavailable
      return NextResponse.json({
        data: getMockJobs(query, location),
        total: 6,
        mock: true,
        debug: err.detail ?? `Backend returned ${res.status}`,
      })
    }

    const data = await res.json()

    // Normalize backend response to frontend shape
    const jobs = (data.jobs ?? []).map((j: Record<string, unknown>) => ({
      id: j.job_id,
      title: j.title,
      company: j.company,
      location: j.location,
      description: j.description_full ?? j.description,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      salary_currency: j.salary_currency ?? 'USD',
      salary_period: j.salary_period,
      employment_type: j.employment_type,
      apply_url: j.apply_link,
      posted_at: j.posted_at,
      logo: j.logo,
    }))

    return NextResponse.json({ data: jobs, total: jobs.length, mock: false })

  } catch (err) {
    console.error('Jobs search error:', err)
    return NextResponse.json({
      data: getMockJobs(query, location),
      total: 6,
      mock: true,
      debug: `Could not reach backend: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}

function getMockJobs(query: string, location: string) {
  const loc = location || 'Remote'
  return [
    {
      id: 'mock-1', title: `Senior ${query}`, company: 'Acme Technologies', location: loc,
      description: `We are looking for an experienced ${query} to join our growing team. Requirements: 3+ years experience, strong problem-solving skills, excellent communication. Competitive salary and great benefits.`,
      salary_min: 120000, salary_max: 160000, salary_currency: 'USD', salary_period: 'YEAR',
      employment_type: 'FULLTIME', apply_url: '#', posted_at: new Date(Date.now() - 86400000).toISOString(), logo: null,
    },
    {
      id: 'mock-2', title: `${query} Lead`, company: 'Bright Solutions Inc', location: loc,
      description: `Lead a team of 4 engineers, drive technical decisions, and deliver high-impact products. Remote-first culture with quarterly team meetups.`,
      salary_min: 140000, salary_max: 180000, salary_currency: 'USD', salary_period: 'YEAR',
      employment_type: 'FULLTIME', apply_url: '#', posted_at: new Date(Date.now() - 172800000).toISOString(), logo: null,
    },
    {
      id: 'mock-3', title: `Mid-level ${query}`, company: 'StartupXYZ', location: 'Remote',
      description: `Own features end-to-end, work directly with the founding team, and have real impact on product direction. We move fast and value initiative.`,
      salary_min: 90000, salary_max: 120000, salary_currency: 'USD', salary_period: 'YEAR',
      employment_type: 'FULLTIME', apply_url: '#', posted_at: new Date(Date.now() - 259200000).toISOString(), logo: null,
    },
    {
      id: 'mock-4', title: `${query} Contractor`, company: 'Global Consulting', location: loc,
      description: `6-month contract. Work with enterprise clients to deliver solutions on time. Must be comfortable in ambiguous environments.`,
      salary_min: 80, salary_max: 110, salary_currency: 'USD', salary_period: 'HOUR',
      employment_type: 'CONTRACTOR', apply_url: '#', posted_at: new Date(Date.now() - 345600000).toISOString(), logo: null,
    },
    {
      id: 'mock-5', title: `Junior ${query}`, company: 'DataDriven Co', location: 'Remote',
      description: `Great for someone early in their career. Mentorship, structured growth paths, and a supportive team. Increasing responsibility over time.`,
      salary_min: 65000, salary_max: 85000, salary_currency: 'USD', salary_period: 'YEAR',
      employment_type: 'FULLTIME', apply_url: '#', posted_at: new Date(Date.now() - 432000000).toISOString(), logo: null,
    },
    {
      id: 'mock-6', title: `${query} — Series B`, company: 'NovaTech', location: loc,
      description: `Join a 20-person team disrupting the industry with AI-powered tools. Modern tooling, real ownership, equity included.`,
      salary_min: 110000, salary_max: 145000, salary_currency: 'USD', salary_period: 'YEAR',
      employment_type: 'FULLTIME', apply_url: '#', posted_at: new Date(Date.now() - 518400000).toISOString(), logo: null,
    },
  ]
}