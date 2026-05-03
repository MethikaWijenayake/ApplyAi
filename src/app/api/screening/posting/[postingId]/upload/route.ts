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
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const fileBytes = await file.arrayBuffer()

  const proxyForm = new FormData()
  proxyForm.append('file', new Blob([fileBytes], { type: file.type }), file.name)

  const res = await fetch(
    `${apiUrl}/screening/postings/${postingId}/upload?user_id=${user.id}`,
    { method: 'POST', body: proxyForm }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
