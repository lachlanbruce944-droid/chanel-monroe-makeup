-- Public availability exposes only slots and booleans, never CRM client data.
create or replace function public.crm_consult_slot_free(p_start timestamptz) returns boolean
language sql volatile security definer set search_path=public as $$
 select not exists(select 1 from public.crm_bookings b where b.status<>'lost' and (
  (b.call_at is not null and b.call_logged_at is null and b.stage in ('enquiry','call')
   and b.call_at < p_start+interval '15 minutes' and b.call_at+interval '15 minutes'>p_start)
  or (b.stage in ('booked','day') and (
   (b.extra->>'calendarStart' is not null and b.extra->>'calendarEnd' is not null
    and (b.extra->>'calendarStart')::timestamptz < p_start+interval '15 minutes'
    and (b.extra->>'calendarEnd')::timestamptz>p_start)
   or ((b.extra->>'calendarStart' is null or b.extra->>'calendarEnd' is null)
    and b.event_date=(p_start at time zone 'Australia/Brisbane')::date)
  ))
 ));
$$;
revoke all on function public.crm_consult_slot_free(timestamptz) from public,anon,authenticated;

create or replace function public.consultation_availability(p_month date)
returns table(local_start text,available boolean)
language plpgsql volatile security definer set search_path=public as $$
declare first_day date:=date_trunc('month',p_month)::date; today date:=(now() at time zone 'Australia/Brisbane')::date;
begin
 if p_month is null or first_day<date_trunc('month',today)::date or first_day>date_trunc('month',today+365)::date then raise exception 'Choose a month within the next year'; end if;
 return query select to_char((first_day+days.n)+make_time(hours.h,0,0),'YYYY-MM-DD"T"HH24:MI'),
   ((first_day+days.n)+make_time(hours.h,0,0)) at time zone 'Australia/Brisbane' > now()
   and first_day+days.n<=today+365
   and public.crm_consult_slot_free(((first_day+days.n)+make_time(hours.h,0,0)) at time zone 'Australia/Brisbane')
 from generate_series(0,extract(day from first_day+interval '1 month'-interval '1 day')::int-1) days(n)
 cross join generate_series(9,16) hours(h) order by days.n,hours.h;
end $$;
revoke all on function public.consultation_availability(date) from public;
grant execute on function public.consultation_availability(date) to anon,authenticated;

-- Serializes submission with CRM scheduling/approval: stale browser selections cannot double-book.
create or replace function public.crm_validate_public_consult_request() returns trigger
language plpgsql security definer set search_path=public as $$
declare local_at timestamp; event_at timestamptz;
begin
 if new.consult_requested_at is null then return new; end if;
 perform pg_advisory_xact_lock(hashtext('crm-consultation-calendar'));
 local_at:=new.consult_requested_at at time zone 'Australia/Brisbane';
 if new.consult_requested_at<=now() or local_at::date>(now() at time zone 'Australia/Brisbane')::date+365
   or extract(hour from local_at) not between 9 and 16 or extract(minute from local_at)<>0 or extract(second from local_at)<>0 then
  raise exception 'CONSULT_SLOT_INVALID: choose an hourly start between 9am and 4pm Brisbane time';
 end if;
 if new.event_date is null then raise exception 'Choose your makeup appointment date first'; end if;
 event_at:=(new.event_date+coalesce(new.time,time '00:00')) at time zone 'Australia/Brisbane';
 if new.consult_requested_at+interval '15 minutes'>=event_at then raise exception 'Phone consultation must finish before makeup'; end if;
 if not public.crm_consult_slot_free(new.consult_requested_at) then raise exception 'CONSULT_SLOT_UNAVAILABLE: choose another consultation time'; end if;
 return new;
end $$;
revoke all on function public.crm_validate_public_consult_request() from public,anon,authenticated;
drop trigger if exists crm_validate_public_consult_request on public.enquiries;
create trigger crm_validate_public_consult_request before insert on public.enquiries for each row execute function public.crm_validate_public_consult_request();

-- Enquiries must not silently accept a call when CRM sync failed.
create or replace function public.crm_capture_consult_request() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 if new.consult_requested_at is not null then
  update public.crm_bookings set call_at=new.consult_requested_at,
   extra=coalesce(extra,'{}')||jsonb_build_object('consultation',jsonb_build_object('provider','crm','status','pending','startTime',new.consult_requested_at,'durationMins',15))
   where website_enquiry_id=new.id;
  if not found then raise exception 'Consultation could not sync to the CRM. Please retry'; end if;
  update public.crm_reminders set kind='enquiry_review',title='Review enquiry and approve phone consultation',template_key=''
   where booking_id in(select id from public.crm_bookings where website_enquiry_id=new.id) and kind='reply' and status='pending';
 end if;
 return new;
end $$;
revoke all on function public.crm_capture_consult_request() from public,anon,authenticated;
