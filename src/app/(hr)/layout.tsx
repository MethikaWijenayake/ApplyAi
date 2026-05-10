import Link from 'next/link'
import HRSidebar from '@/components/ui/HRSidebar'

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <HRSidebar />
      <main style={{ flex: 1, marginLeft: '220px', minHeight: '100vh' }}>
        <div style={{ padding: '40px 48px' }}>{children}</div>
      </main>
    </div>
  )
}
