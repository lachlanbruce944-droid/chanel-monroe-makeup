// Browser supplies only a booking UID. Fetch Cal's record before trusting time/status.
// This endpoint never accepts a client-supplied CRM ID, date, status or email.
const SB_URL = Deno.env.get('SUPABASE_URL')!;
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CORS = {'Access-Control-Allow-Origin':'https://lachlanbruce944-droid.github.io','Access-Control-Allow-Headers':'content-type, apikey, authorization','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status,headers:{...CORS,'Content-Type':'application/json','Cache-Control':'no-store'}});
async function db(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, {...init, headers:{apikey:SB_KEY,Authorization:`Bearer ${SB_KEY}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(10000)});
  if(!r.ok) throw new Error('Database unavailable');
  return r.json();
}
export function verifiedBooking(b: any, enquiry: any, enquiryId: string, uid: string) {
  if(!b || typeof b !== 'object') return null;
  const notes = b.bookingFieldsResponses?.notes ?? b.responses?.notes?.value ?? '';
  const reference = b.metadata?.cmmEnquiryId === enquiryId || (typeof notes === 'string' && notes.includes(`Enquiry reference: ${enquiryId}`));
  const host = (b.hosts || []).some((h: any) => h.username === 'chanelmonroe') || b.user?.username === 'chanelmonroe';
  const slug = b.eventType?.slug ?? b.eventType?.eventSlug;
  const email = String(enquiry.email || '').trim().toLowerCase();
  const attendee = email && (b.attendees || []).some((a: any) => String(a.email || '').trim().toLowerCase() === email);
  const start = new Date(b.start ?? b.startTime), end = new Date(b.end ?? b.endTime);
  const status = String(b.status || '').toUpperCase();
  if(b.uid !== uid || !host || slug !== 'enquiry' || !reference || !attendee || !Number.isFinite(+start) || !Number.isFinite(+end) || end <= start) return null;
  if(!['ACCEPTED','CONFIRMED','PENDING','UNCONFIRMED','AWAITING_HOST'].includes(status)) return null;
  return {uid,startTime:start.toISOString(),endTime:end.toISOString(),status:['ACCEPTED','CONFIRMED'].includes(status) ? 'confirmed' : 'pending'};
}
Deno.serve(async req => {
  if(req.method === 'OPTIONS') return new Response(null,{status:204,headers:CORS});
  if(req.method !== 'POST') return json({error:'Method not allowed'},405);
  if(Number(req.headers.get('content-length') || 0) > 2048) return json({error:'Request too large'},413);
  try {
    const raw = await req.text(); if(raw.length > 2048) return json({error:'Request too large'},413);
    let input; try {input = JSON.parse(raw)} catch {return json({error:'Invalid request'},400)}
    const {enquiryId,uid} = input || {};
    if(typeof enquiryId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(enquiryId) || typeof uid !== 'string' || !/^[A-Za-z0-9_-]{8,100}$/.test(uid)) return json({error:'Invalid reference'},400);
    const rows = await db(`enquiries?id=eq.${enquiryId}&select=email&limit=1`);
    if(!rows.length) return json({error:'Unable to link booking'},404);
    const headers: Record<string,string> = {'cal-api-version':'2024-08-13'};
    const apiKey = Deno.env.get('CAL_API_KEY'); if(apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const response = await fetch(`https://api.cal.com/v2/bookings/${encodeURIComponent(uid)}`,{headers,signal:AbortSignal.timeout(10000)});
    if(!response.ok) return json({error:'Cal verification unavailable; retry shortly'},502);
    const result = await response.json();
    const booking = verifiedBooking(result.data,rows[0],enquiryId,uid);
    if(!booking) return json({error:'Booking does not match this enquiry'},422);
    await db('rpc/crm_link_consultation',{method:'POST',body:JSON.stringify({p_enquiry:enquiryId,p_consultation:booking})});
    return json(booking);
  } catch { return json({error:'Link pending; please retry'},503) }
});
