create table public.image_removal_events (
 id uuid primary key,
 created_at timestamptz not null default now(),
 device_id uuid not null,
 action text not null check (action in ('flag','undo')),
 source text not null check (char_length(source) between 1 and 1000),
 section text not null check (section in ('about','gallery')),
 details jsonb not null check (jsonb_typeof(details) = 'object' and octet_length(details::text) <= 10000)
);
alter table public.image_removal_events enable row level security;
revoke all on public.image_removal_events from anon, authenticated;
grant insert (id,device_id,action,source,section,details) on public.image_removal_events to anon,authenticated;
grant all on public.image_removal_events to service_role;
create policy "Submit image review events" on public.image_removal_events for insert to anon,authenticated with check (created_at = now());
create index image_removal_events_source_idx on public.image_removal_events(source,created_at desc);
comment on table public.image_removal_events is 'Private editorial requests only; never automatically hide or delete media. Latest event per device_id/source determines that device request. Anonymous visitors cannot read or modify submissions.';
