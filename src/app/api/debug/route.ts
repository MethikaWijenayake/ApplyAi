import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    supabase_service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    app_url: process.env.NEXT_PUBLIC_APP_URL ? 'SET' : 'MISSING',
    node_env: process.env.NODE_ENV,
  })
}