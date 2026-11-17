-- Atomic, idempotent link. Only the existing service role may call this function.
create or replace function public.crm_link_consultation(p_enquiry uuid, p_consultation jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare b public.crm_bookings%rowtype; previous jsonb; accepted boolean;
begin
  select * into b from public.crm_bookings where website_enquiry_id = p_enquiry order by created_at limit 1 for update;
  if not found then raise exception 'CRM enquiry not ready'; end if;
  previous := b.extra->'consultation';
  if previous = p_consultation then return; end if;
  accepted := p_consultation->>'status' = 'confirmed';
  update public.crm_bookings set extra = coalesce(extra,'{}'::jsonb) || jsonb_build_object('consultation',p_consultation),
    call_at = case when accepted then (p_consultation->>'startTime')::timestamptz else call_at end,
    stage = case when accepted and stage = 'enquiry' and status = 'open' then 'call' else stage end,
    updated_at = now() where id = b.id;
  if accepted and b.status = 'open' and b.stage in ('enquiry','call') then
    update public.crm_reminders set due_at = (p_consultation->>'startTime')::timestamptz
      where booking_id = b.id and kind = 'call' and status = 'pending';
    if not found then
      insert into public.crm_reminders(booking_id,client_id,kind,title,due_at,template_key,channel,status)
      values(b.id,b.client_id,'call','Phone consultation',(p_consultation->>'startTime')::timestamptz,'call_reminder','email','pending');
    end if;
  end if;
  insert into public.crm_activity(booking_id,client_id,type,text)
    values(b.id,b.client_id,'call','Cal.com consultation ' || (p_consultation->>'status') || ' · ' || (p_consultation->>'startTime'));
end $$;
revoke all on function public.crm_link_consultation(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.crm_link_consultation(uuid,jsonb) to service_role;
