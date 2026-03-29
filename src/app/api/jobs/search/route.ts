import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      return NextResponse.json(
        { error: err.detail ?? 'Job search failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: 'Could not reach job search service. Is the backend running?' },
      { status: 502 }
    )
  }
}
