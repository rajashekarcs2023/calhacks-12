-- CivicMind Database Schema
-- Creates all tables for civic engagement platform

-- 311 Requests table
create table if not exists public.requests_311 (
  id bigserial primary key,
  created_at timestamptz default now(),
  status text check (status in ('open','closed','in_progress')),
  type text,          -- 'pothole'|'waste'|'streetlight'|'transit_delay'|'graffiti'
  district text,      -- 'North'|'South'|'East'|'West'|'Downtown'
  lat double precision,
  lng double precision
);

-- Budget table
create table if not exists public.budget (
  id bigserial primary key,
  fiscal_year int not null,
  department text not null,  -- 'Education'|'Public Safety'|'Sanitation'|'Parks'
  amount_usd bigint not null check (amount_usd >= 0)
);

-- Events table
create table if not exists public.events (
  id bigserial primary key,
  date date not null,
  title text not null,
  category text,             -- 'council_meeting'|'public_hearing'|'cleanup_drive'
  district text
);

-- Citizen feedback table
create table if not exists public.citizen_feedback (
  id bigserial primary key,
  created_at timestamptz default now(),
  text text not null,
  district text,
  sentiment text,            -- 'positive'|'neutral'|'negative'
  score double precision     -- -1..1
);

-- Create indexes for performance
create index if not exists idx_requests_311_type on public.requests_311(type);
create index if not exists idx_requests_311_status on public.requests_311(status);
create index if not exists idx_requests_311_district on public.requests_311(district);
create index if not exists idx_requests_311_created_at on public.requests_311(created_at);

create index if not exists idx_budget_year on public.budget(fiscal_year);
create index if not exists idx_budget_dept on public.budget(department);

create index if not exists idx_events_date on public.events(date);
create index if not exists idx_events_district on public.events(district);

create index if not exists idx_feedback_created_at on public.citizen_feedback(created_at);
create index if not exists idx_feedback_district on public.citizen_feedback(district);
