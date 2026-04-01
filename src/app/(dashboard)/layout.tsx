import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/ui/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, custom_email')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar user={profile ?? { full_name: '', email: user.email ?? '', custom_email: null }} />
      <main style={{ flex: 1, marginLeft: '220px', minHeight: '100vh' }}>
        <div style={{ padding: '40px 48px' }}>{children}</div>
      </main>
    </div>
  )
}
