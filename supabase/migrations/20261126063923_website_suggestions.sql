create table public.website_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null check (category in ('design','navigation','booking','content','other')),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  source text not null default 'mobile_navigation' check (source = 'mobile_navigation'),
  status text not null default 'new' check (status in ('new','reviewed','planned','completed'))
);
alter table public.website_suggestions enable row level security;
revoke all on public.website_suggestions from anon, authenticated;
grant insert (category, message, source) on public.website_suggestions to anon, authenticated;
grant all on public.website_suggestions to service_role;
create policy "Visitors may submit website suggestions"
on public.website_suggestions for insert to anon, authenticated
with check (status = 'new' and created_at = now());
comment on table public.website_suggestions is 'Private website improvement suggestions; public access is submit-only. Review through Supabase Dashboard.';
