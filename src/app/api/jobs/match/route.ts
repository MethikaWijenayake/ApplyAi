import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { job_id, job_title, company, job_description } = body

  if (!job_id || !job_description) {
    return NextResponse.json({ error: 'job_id and job_description are required' }, { status: 400 })
  }

  // ── Check if we already have a saved match for this job ───────────────────
  const { data: existing } = await supabase
    .from('job_matches')
    .select('*')
    .eq('user_id', user.id)
    .eq('job_id', job_id)
    .single()

  if (existing) {
    return NextResponse.json({ ...existing.parsed_result, cached: true })
  }

  // ── Get user's resume ─────────────────────────────────────────────────────
  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_text, id')
    .eq('user_id', user.id)
    .single()

  if (!resume?.parsed_text) {
    return NextResponse.json(
      { error: 'No resume found. Please upload your resume first.' },
      { status: 400 }
    )
  }

  // ── Call FastAPI match endpoint ───────────────────────────────────────────
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  let matchResult
  try {
    const res = await fetch(`${apiUrl}/match/resume-to-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_text: resume.parsed_text,
        job_description,
        job_id,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail ?? 'Match analysis failed' },
        { status: res.status }
      )
    }

    matchResult = await res.json()
  } catch {
    return NextResponse.json(
      { error: 'Could not reach matching service. Is the backend running?' },
      { status: 502 }
    )
  }

  // ── Save to job_matches table ─────────────────────────────────────────────
  await supabase.from('job_matches').insert({
    user_id: user.id,
    resume_id: resume.id,
    job_id,
    match_score: matchResult.match_score,
    skill_gaps: matchResult.skill_gaps,
    recommendations: matchResult.recommendations,
    parsed_result: matchResult,
  })

  // Also upsert into job_applications so the job appears in the tracker
  const { data: existingApp } = await supabase
    .from('job_applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('job_id', job_id)
    .single()

  if (!existingApp) {
    await supabase.from('job_applications').insert({
      user_id: user.id,
      job_id,
      job_title: job_title ?? 'Unknown',
      company: company ?? 'Unknown',
      status: 'viewed',
    })
  }

  return NextResponse.json({ ...matchResult, cached: false })
}
