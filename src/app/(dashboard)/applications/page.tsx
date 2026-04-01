import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApplicationsClient from './ApplicationsClient'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch applications with email threads
  const { data: applications } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('applied_at', { ascending: false })

  // Fetch email threads grouped by application
  const { data: threads } = await supabase
    .from('email_threads')
    .select('*')
    .eq('user_id', user.id)
    .order('received_at', { ascending: false })

  return (
    <ApplicationsClient
      applications={applications ?? []}
      threads={threads ?? []}
    />
  )
}
