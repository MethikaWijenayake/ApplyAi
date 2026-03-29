import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResumeUploadClient from './ResumeUploadClient'

export default async function ResumePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If user already has a resume, send them straight to their profile
  const { data: existing } = await supabase
    .from('resumes')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (existing) {
    redirect('/resume/profile')
  }

  // No resume yet — show the upload UI
  return <ResumeUploadClient />
}
