-- Run this in Supabase SQL Editor AFTER the main schema.sql
-- Sets up the Storage bucket for resume files

-- Create the resumes storage bucket
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', true)
on conflict (id) do nothing;

-- Policy: users can upload to their own folder (user_id/filename)
create policy "Users can upload own resumes"
on storage.objects for insert
with check (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: users can update/replace their own files
create policy "Users can update own resumes"
on storage.objects for update
using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: users can delete their own files
create policy "Users can delete own resumes"
on storage.objects for delete
using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: anyone can read (files are public — needed for FastAPI to download)
create policy "Resume files are publicly readable"
on storage.objects for select
using (bucket_id = 'resumes');
