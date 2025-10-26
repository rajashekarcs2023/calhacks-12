-- Enable Row Level Security on all tables
-- This ensures data access is controlled by policies

alter table public.requests_311 enable row level security;
alter table public.budget enable row level security;
alter table public.events enable row level security;
alter table public.citizen_feedback enable row level security;

-- Read-only policies for public data (everyone can read)
create policy "public read requests_311"
on public.requests_311 for select
to anon, authenticated
using (true);

create policy "public read budget"
on public.budget for select
to anon, authenticated
using (true);

create policy "public read events"
on public.events for select
to anon, authenticated
using (true);

create policy "public read feedback"
on public.citizen_feedback for select
to anon, authenticated
using (true);

-- Allow inserts of feedback from anyone (for demo purposes)
create policy "allow insert feedback"
on public.citizen_feedback for insert
to anon, authenticated
with check (true);
