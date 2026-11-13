-- Enquiry emails: run once in Supabase > SQL editor (project makeup-website), or approve it when Claude asks.
-- After each new enquiry the trigger asks the enquiry-email Edge Function (already deployed) to send
-- Chanel the full enquiry and the client a confirmation, through Resend.
create extension if not exists pg_net with schema extensions;

alter table public.enquiries
  add column if not exists emailed_business_at timestamptz,
  add column if not exists emailed_client_at timestamptz,
  add column if not exists email_error text;

create or replace function public.notify_enquiry_email()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url := 'https://qxiugfatpybldluipcyy.supabase.co/functions/v1/enquiry-email',
    body := jsonb_build_object('id', new.id),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    timeout_milliseconds := 10000
  );
  return new;
end;
$$;
revoke all on function public.notify_enquiry_email() from public, anon, authenticated;

drop trigger if exists enquiries_send_emails on public.enquiries;
create trigger enquiries_send_emails
  after insert on public.enquiries
  for each row execute function public.notify_enquiry_email();
