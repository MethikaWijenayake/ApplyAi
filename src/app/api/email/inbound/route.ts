import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxies inbound email webhooks from Cloudflare to the FastAPI backend.
 * Cloudflare Email Routing → this endpoint → FastAPI /email/inbound
 *
 * Set this URL in Cloudflare Email Routing as your webhook destination:
 * https://your-vercel-url.vercel.app/api/email/inbound
 */
export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  try {
    const body = await request.text()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Forward webhook secret if present
    const secret = request.headers.get('X-Webhook-Secret')
    if (secret) headers['X-Webhook-Secret'] = secret

    const res = await fetch(`${apiUrl}/email/inbound`, {
      method: 'POST',
      headers,
      body,
    })

    return NextResponse.json(await res.json(), { status: res.status })
  } catch (err) {
    console.error('Inbound email proxy error:', err)
    return NextResponse.json({ error: 'Failed to process inbound email' }, { status: 500 })
  }
}
