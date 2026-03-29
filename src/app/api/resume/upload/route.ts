import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Ensure user row exists in public.users (handles users created before schema ran) ──
  await supabase.from('users').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? '',
    },
    { onConflict: 'id' }
  )

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|docx)$/i)) {
    return NextResponse.json(
      { error: 'Only PDF and DOCX files are supported.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File is too large. Maximum size is 5 MB.' },
      { status: 413 }
    )
  }

  const fileBytes = await file.arrayBuffer()
  const fileBuffer = Buffer.from(fileBytes)

  // ── 1. Upload to Supabase Storage ─────────────────────────────────────────
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
  const storagePath = `${user.id}/resume.${ext}`

  const { error: storageError } = await supabase.storage
    .from('resumes')
    .upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (storageError) {
    console.error('Storage error:', storageError)
    return NextResponse.json(
      { error: `Storage upload failed: ${storageError.message}` },
      { status: 500 }
    )
  }

  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(storagePath)
  const fileUrl = urlData.publicUrl

  // ── 2. Send to FastAPI for parsing ────────────────────────────────────────
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
  const parseFormData = new FormData()
  parseFormData.append('file', new Blob([fileBuffer], { type: file.type }), file.name)

  let parsedData: Record<string, unknown> = {}

  try {
    const parseResponse = await fetch(`${apiUrl}/resume/parse`, {
      method: 'POST',
      body: parseFormData,
    })

    if (!parseResponse.ok) {
      const err = await parseResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: err.detail ?? 'Resume parsing failed.' },
        { status: parseResponse.status }
      )
    }

    parsedData = await parseResponse.json()
  } catch (err) {
    console.error('FastAPI parse error:', err)
    return NextResponse.json(
      { error: 'Could not reach the parsing service. Is FastAPI running on port 8000?' },
      { status: 502 }
    )
  }

  // ── 3. Upsert into resumes table (one per user) ───────────────────────────
  await supabase.from('resumes').delete().eq('user_id', user.id)

  const { data: resumeRow, error: dbError } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      file_url: fileUrl,
      parsed_text: parsedData.raw_text as string,
      parsed_json: parsedData,
    })
    .select()
    .single()

  if (dbError) {
    console.error('DB error:', dbError)
    return NextResponse.json(
      { error: `Database save failed: ${dbError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    resume_id: resumeRow.id,
    parsed: parsedData,
  })
}
