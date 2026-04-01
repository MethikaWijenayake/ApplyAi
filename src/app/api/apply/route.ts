import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { job_url, job_title, company, job_description } = body

  if (!job_url || !job_title || !company) {
    return NextResponse.json({ error: 'job_url, job_title and company are required' }, { status: 400 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  try {
    const res = await fetch(`${apiUrl}/apply/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        job_url,
        job_title,
        company,
        job_description: job_description ?? '',
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Auto-apply error:', err)
    return NextResponse.json({ error: 'Could not reach auto-apply service' }, { status: 502 })
  }
}
