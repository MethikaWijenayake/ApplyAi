import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postingId: string }> }
) {
  const { postingId } = await params
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const res = await fetch(`${apiUrl}/screening/postings/${postingId}/results`)
  const data = await res.json()
  return NextResponse.json(data)
}
