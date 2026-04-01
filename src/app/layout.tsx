import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ApplyAI — Intelligent Job Search',
  description: 'AI-powered resume matching, job discovery, and automated applications.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
