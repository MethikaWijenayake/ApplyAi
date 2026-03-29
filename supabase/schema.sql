-- ApplyAI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  custom_email text unique,
  full_name text,
  created_at timestamptz default now() not null
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- RESUMES
-- ============================================================
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  file_url text,
  parsed_text text,
  parsed_json jsonb,
  uploaded_at timestamptz default now() not null
);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================
create table public.job_applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  job_id text,
  job_title text not null,
  company text not null,
  job_url text,
  status text default 'applied' check (status in ('applied', 'viewed', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  applied_at timestamptz default now() not null,
  last_reply_at timestamptz
);

-- ============================================================
-- JOB MATCHES
-- ============================================================
create table public.job_matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  job_id text not null,
  match_score integer check (match_score >= 0 and match_score <= 100),
  skill_gaps jsonb,
  recommendations jsonb,
  created_at timestamptz default now() not null
);

-- ============================================================
-- EMAIL THREADS
-- ============================================================
create table public.email_threads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  job_application_id uuid references public.job_applications(id) on delete set null,
  from_email text not null,
  subject text,
  body text,
  direction text default 'inbound' check (direction in ('inbound', 'outbound')),
  received_at timestamptz default now() not null
);

-- ============================================================
-- INTERVIEW SESSIONS
-- ============================================================
create table public.interview_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  job_id text,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users enable row level security;
alter table public.resumes enable row level security;
alter table public.job_applications enable row level security;
alter table public.job_matches enable row level security;
alter table public.email_threads enable row level security;
alter table public.interview_sessions enable row level security;

-- Users: can only see/edit their own row
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Resumes
create policy "Users can CRUD own resumes" on public.resumes
  for all using (auth.uid() = user_id);

-- Job applications
create policy "Users can CRUD own applications" on public.job_applications
  for all using (auth.uid() = user_id);

-- Job matches
create policy "Users can view own matches" on public.job_matches
  for all using (auth.uid() = user_id);

-- Email threads
create policy "Users can view own threads" on public.email_threads
  for all using (auth.uid() = user_id);

-- Interview sessions
create policy "Users can CRUD own sessions" on public.interview_sessions
  for all using (auth.uid() = user_id);
