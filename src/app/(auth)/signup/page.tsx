'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const inputStyle = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: '8px', padding: '10px 14px',
  fontSize: '14px', fontFamily: 'Instrument Sans, sans-serif', outline: 'none',
  transition: 'border-color 0.15s',
}

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <>
      <h1 style={{
        fontFamily: 'Instrument Serif, serif', fontWeight: 400,
        fontSize: '26px', color: 'var(--text)', marginBottom: '6px', letterSpacing: '-0.01em',
      }}>
        Create your account
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: '28px', fontFamily: 'Instrument Sans, sans-serif' }}>
        Free to start — no credit card needed
      </p>

      {error && (
        <div style={{
          background: 'var(--error-light)', border: '1px solid #F0B8B4',
          color: 'var(--error)', fontSize: '13px', padding: '10px 14px',
          borderRadius: '8px', marginBottom: '20px', fontFamily: 'Instrument Sans, sans-serif',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
            Full name
          </label>
          <input
            type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
            Email
          </label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '6px', fontFamily: 'Instrument Sans, sans-serif' }}>
            Password
            <span style={{ fontWeight: 400, color: 'var(--text-3)', marginLeft: '6px' }}>min. 8 characters</span>
          </label>
          <input
            type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <button
          type="submit" disabled={loading}
          style={{
            background: loading ? 'var(--bg-subtle)' : 'var(--accent)',
            color: loading ? 'var(--text-2)' : '#fff',
            border: 'none', borderRadius: '8px', padding: '11px',
            fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Instrument Sans, sans-serif', marginTop: '4px',
          }}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-3)', marginTop: '24px', fontFamily: 'Instrument Sans, sans-serif' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </>
  )
}
