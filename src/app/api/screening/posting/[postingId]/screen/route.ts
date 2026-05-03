import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postingId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { postingId } = await params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const res = await fetch(
    `${apiUrl}/screening/postings/${postingId}/screen?user_id=${user.id}`,
    { method: 'POST' }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
