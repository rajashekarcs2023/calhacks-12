-- Safe query functions for NL→SQL execution
-- These functions provide a whitelist of allowed queries with parameterization

-- Top complaint types in a time window
create or replace function public.q_top_complaints(start_ts timestamptz, end_ts timestamptz)
returns table(type text, count bigint)
language sql stable as $$
  select type, count(*)::bigint
  from public.requests_311
  where created_at >= start_ts and created_at < end_ts
  group by type
  order by count desc
  limit 200;
$$;

-- Open potholes by district in time window
create or replace function public.q_open_potholes_by_district(start_ts timestamptz, end_ts timestamptz, d text)
returns table(id bigint, created_at timestamptz, status text, type text, district text, lat double precision, lng double precision)
language sql stable as $$
  select id, created_at, status, type, district, lat, lng
  from public.requests_311
  where type='pothole' and status='open'
    and created_at >= start_ts and created_at < end_ts
    and (d is null or district = d)
  limit 200;
$$;

-- Budget comparison by year
create or replace function public.q_budget_compare(year int)
returns table(department text, amount_usd bigint)
language sql stable as $$
  select department, amount_usd
  from public.budget
  where fiscal_year = year
  limit 200;
$$;

-- Events in time window
create or replace function public.q_events_window(start_ts timestamptz, end_ts timestamptz, d text)
returns table(date date, title text, category text, district text)
language sql stable as $$
  select date, title, category, district
  from public.events
  where date >= start_ts::date and date < end_ts::date
    and (d is null or district = d)
  order by date asc
  limit 200;
$$;

-- All requests by type and status
create or replace function public.q_requests_by_type_status(req_type text, req_status text, start_ts timestamptz, end_ts timestamptz, d text)
returns table(id bigint, created_at timestamptz, status text, type text, district text, lat double precision, lng double precision)
language sql stable as $$
  select id, created_at, status, type, district, lat, lng
  from public.requests_311
  where (req_type is null or type = req_type)
    and (req_status is null or status = req_status)
    and created_at >= start_ts and created_at < end_ts
    and (d is null or district = d)
  order by created_at desc
  limit 200;
$$;
