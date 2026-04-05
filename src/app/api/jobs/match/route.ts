import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { job_id, job_title, job_description } = body

  if (!job_id || !job_title || !job_description) {
    return NextResponse.json({ error: 'job_id, job_title and job_description are required' }, { status: 400 })
  }

  // ── Check for existing match result ───────────────────────────────────────
  const { data: existing } = await supabase
    .from('job_matches')
    .select('*')
    .eq('user_id', user.id)
    .eq('job_id', job_id)
    .single()

  if (existing) {
    return NextResponse.json({ ...existing.match_result, cached: true })
  }

  // ── Get user's resume text ────────────────────────────────────────────────
  const { data: resume } = await supabase
    .from('resumes')
    .select('parsed_text, id')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (!resume?.parsed_text) {
    return NextResponse.json(
      { error: 'No resume found. Please upload your resume first.' },
      { status: 404 }
    )
  }

  // ── Call FastAPI match endpoint ───────────────────────────────────────────
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  let matchResult
  try {
    const res = await fetch(`${apiUrl}/match/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_text: resume.parsed_text,
        job_title,
        job_description,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail ?? 'Match analysis failed')
    }

    matchResult = await res.json()
  } catch (err) {
    console.error('Match API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not reach the matching service.' },
      { status: 502 }
    )
  }

  // ── Save to job_matches table ─────────────────────────────────────────────
  await supabase.from('job_matches').upsert({
    user_id: user.id,
    resume_id: resume.id,
    job_id,
    match_score: matchResult.match_score,
    skill_gaps: matchResult.skill_gaps,
    recommendations: matchResult.recommendations,
    match_result: matchResult,
  }, { onConflict: 'user_id,job_id' })

  return NextResponse.json({ ...matchResult, cached: false })
}