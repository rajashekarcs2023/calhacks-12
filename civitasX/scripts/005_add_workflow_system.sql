-- Add workflow tracking and enhanced intent fields to citizen_feedback

-- Workflow audit trail table
create table if not exists public.workflow_log (
  id bigserial primary key,
  created_at timestamptz default now(),
  intent_category text not null,
  intent_service text not null,
  status text not null check (status in ('queued','running','done','error')),
  details jsonb,              -- payload of the workflow
  updated_at timestamptz default now()
);

-- Add intent fields to citizen_feedback
alter table public.citizen_feedback 
  add column if not exists intent_category text,
  add column if not exists intent_service text;

-- Indexes for workflow queries
create index if not exists idx_workflow_created_at on public.workflow_log(created_at);
create index if not exists idx_workflow_status on public.workflow_log(status);
create index if not exists idx_workflow_intent on public.workflow_log(intent_category, intent_service);

create index if not exists idx_feedback_intent on public.citizen_feedback(intent_category, intent_service);

-- RLS for workflow_log
alter table public.workflow_log enable row level security;

create policy "public read workflow" on public.workflow_log 
  for select to anon, authenticated using (true);

create policy "insert workflow" on public.workflow_log 
  for insert to anon, authenticated with check (true);

create policy "update workflow" on public.workflow_log 
  for update to anon, authenticated using (true);
