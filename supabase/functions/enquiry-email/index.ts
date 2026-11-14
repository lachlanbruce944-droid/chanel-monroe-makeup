// enquiry-email: emails Chanel (makeup@chanelmonroe.net) each new chat enquiry, and the client a confirmation.
// Called by the chat page right after it saves an enquiry (and by the optional database trigger) with { id }.
// It reads the row itself with the service role, only acts on enquiries less than 30 minutes old, and uses
// Resend idempotency keys (plus emailed_*_at columns when they exist), so each enquiry is emailed once.
// If the client sent a selfie (private "selfies" bucket), it is attached to Chanel's email and shown inline.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("FROM_EMAIL") ?? "Chanel Monroe Makeup <enquiries@chanelmonroe.net>";
const BUSINESS = Deno.env.get("BUSINESS_EMAIL") ?? "makeup@chanelmonroe.net";
const CAL = "https://cal.com/chanelmonroe/enquiry";
const SITE = "https://lachlanbruce944-droid.github.io/chanel-monroe-makeup/";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const money = (n: unknown) => n == null ? "" : "$" + Number(n).toLocaleString("en-AU");
const first = (n: string) => (n || "").trim().split(/\s+/)[0] || "there";
const fmtDate = (d?: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
const fmtTime = (t?: string) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`; };

async function db(path: string, init: RequestInit = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", ...(init.headers || {}) } });
  if (!r.ok) throw new Error(`db ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json();
}
// recording the send is best effort: the columns are optional (docs/enquiry-emails.sql)
const save = (id: string, fields: Record<string, unknown>) => db(`enquiries?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(fields), headers: { Prefer: "return=minimal" } }).catch(() => null);

// the client's selfie from the private bucket, as base64 for an email attachment (null if missing)
async function selfie(path?: string) {
  if (!path || !/^[0-9a-f-]{36}\.jpg$/i.test(path)) return null;
  try {
    const r = await fetch(`${SB_URL}/storage/v1/object/selfies/${path}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
    if (!r.ok) return null;
    const bytes = new Uint8Array(await r.arrayBuffer());
    let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  } catch { return null; }
}

async function send(msg: Record<string, unknown>, key: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(msg),
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
  return r.json();
}

function rows(e: Record<string, any>) {
  const when = [fmtDate(e.event_date), e.time && `${e.time_type === "start" ? "start" : "ready by"} ${fmtTime(e.time)}`].filter(Boolean).join(", ");
  const travel = e.travel_km_estimate != null ? ` (~${e.travel_km_estimate} km${e.travel_included ? ", travel included" : ", travel to confirm"})` : "";
  return [
    ["Booking", [e.category_name, e.look_name].filter(Boolean).join(" · ")],
    ["Style", e.sub_style || (e.lesson_focus?.length ? e.lesson_focus.join(", ") : "")],
    ["Date", when],
    ["Suburb", e.location ? e.location + travel : ""],
    ["How many", e.quantity],
    ["Trial", e.bridal_trial],
    ["Skin", e.skin_type],
    ["Allergies", e.allergies && e.allergies + (e.patch_test ? " · patch test requested" : "")],
    ["Lashes", e.lashes],
    ["Also booking", (e.extra_services || []).join(", ")],
    ["Notes", e.notes],
    ["Estimate", e.estimate_total != null ? `${e.estimate_is_from ? "from " : ""}${money(e.estimate_total)}` : ""],
  ].filter(([, v]) => v);
}

const table = (r: string[][]) => `<table style="border-collapse:collapse;width:100%;font-size:14px">${r.map(([k, v]) =>
  `<tr><td style="padding:6px 10px 6px 0;color:#7a5a50;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#3a2622">${esc(v)}</td></tr>`).join("")}</table>`;

const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f5e9e1;font-family:Helvetica,Arial,sans-serif;color:#3a2622">
<div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fbf3ee;border-radius:18px;padding:24px;border:1px solid #e2c3b2">
<div style="font-family:Georgia,serif;font-size:22px;margin-bottom:4px">Chanel Monroe <span style="font-size:11px;letter-spacing:.2em;color:#7a5a50">MAKEUP</span></div>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:14px 0">${title}</h1>${body}</div>
<p style="font-size:11px;color:#7a5a50;text-align:center">Chanel Monroe Makeup · Gold Coast · <a href="${SITE}" style="color:#7a5a50">website</a></p></div></body></html>`;

function calLink(e: Record<string, any>) {
  const p = new URLSearchParams();
  if (e.name) p.set("name", e.name);
  if (e.email) p.set("email", e.email);
  if (e.phone) { let ph = String(e.phone).replace(/[\s()-]/g, ""); if (/^0\d{9}$/.test(ph)) ph = "+61" + ph.slice(1); p.set("attendeePhoneNumber", ph); }
  p.set("notes", [e.look_name || e.category_name, e.sub_style, e.event_date && "event " + fmtDate(e.event_date), e.location, "Ref " + String(e.id).slice(0, 8)].filter(Boolean).join(" · "));
  return `${CAL}?${p}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const reply = (body: string, status = 200) => new Response(body, { status, headers: { ...CORS, "Content-Type": "application/json" } });
  let id = "";
  try {
    ({ id } = await req.json().catch(() => ({ id: "" })));
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) return reply('"bad id"', 400);
    const [e] = await db(`enquiries?id=eq.${id}&select=*`) as Record<string, any>[];
    if (!e) return reply('"not found"', 404);
    if (Date.now() - new Date(e.created_at).getTime() > 30 * 60 * 1000) return reply('"too old"', 409);
    if (!RESEND) throw new Error("RESEND_API_KEY is not set");
    const r = rows(e);
    const refs = (e.refs || []).slice(0, 12);
    const artists = (e.affiliates || []);
    const done: Record<string, string> = {};

    if (!e.emailed_business_at) {
      const pic = await selfie(e.selfie_path);
      const safe = first(e.name).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "client";
      const html = shell(`New enquiry from ${esc(e.name)}`,
        (pic ? `<p style="margin:0 0 12px"><img src="cid:selfie" width="160" style="width:160px;border-radius:14px;display:block" alt="Client selfie"></p>` : "") +
        `<p style="font-size:14px">${esc(e.phone)} · <a href="mailto:${esc(e.email)}" style="color:#b8846b">${esc(e.email)}</a></p>${table(r)}` +
        (refs.length ? `<p style="margin:18px 0 6px;color:#7a5a50;font-size:13px">Reference looks</p>${refs.map((x: any) => `<a href="${esc(x.src)}"><img src="${esc(String(x.src).replace(/\.webp$/, ".m.webp"))}" width="88" height="88" style="object-fit:cover;border-radius:10px;margin:0 6px 6px 0" alt=""></a>`).join("")}` : "") +
        (artists.length ? `<p style="margin:14px 0 6px;color:#7a5a50;font-size:13px">Beauty team</p><p style="font-size:14px">${artists.map((a: any) => `<a href="${esc(a.instagram)}" style="color:#b8846b">${esc(a.name || "@" + a.handle)}</a> (${esc(a.category)})`).join(", ")}</p>` : "") +
        `<p style="font-size:12px;color:#7a5a50;margin-top:18px">${pic ? "The selfie is attached. " : "No selfie sent. "}Reply to this email to answer ${esc(first(e.name))} directly. Ref ${esc(String(e.id).slice(0, 8))}</p>`);
      await send({ from: FROM, to: [BUSINESS], reply_to: e.email || undefined,
        subject: `New enquiry: ${e.name}${e.look_name ? " · " + e.look_name : ""}${e.event_date ? " · " + fmtDate(e.event_date) : ""}`, html,
        ...(pic ? { attachments: [{ filename: `selfie-${safe}.jpg`, content: pic, content_type: "image/jpeg", content_id: "selfie" }] } : {}) }, `biz-${e.id}`);
      done.emailed_business_at = new Date().toISOString();
      await save(id, { emailed_business_at: done.emailed_business_at });
    }

    if (e.email && !e.emailed_client_at) {
      const html = shell(`Thanks ${esc(first(e.name))}, your enquiry is in ✨`,
        `<p style="font-size:15px;line-height:1.5">Chanel has your details and will be in touch. If you haven't already, choose a time for your free 15-minute phone call so she can confirm your quote and lock in your date.</p>
<p style="margin:20px 0"><a href="${esc(calLink(e))}" style="display:inline-block;background:#b8846b;color:#fff;text-decoration:none;padding:13px 22px;border-radius:12px;font-weight:bold">Choose a time for your phone call</a></p>
<p style="margin:18px 0 6px;color:#7a5a50;font-size:13px">Your enquiry</p>${table(r)}
<p style="font-size:12px;color:#7a5a50;margin-top:18px">The estimate is a guide; Chanel confirms your final quote on the call. Questions? Just reply to this email.</p>`);
      await send({ from: FROM, to: [e.email], reply_to: BUSINESS, subject: "Your enquiry with Chanel Monroe Makeup", html }, `client-${e.id}`);
      done.emailed_client_at = new Date().toISOString();
      await save(id, { emailed_client_at: done.emailed_client_at, email_error: null });
    }
    return reply(JSON.stringify({ ok: true, ...done }));
  } catch (err) {
    const msg = String((err as Error).message || err).slice(0, 500);
    if (/^[0-9a-f-]{36}$/i.test(id)) await save(id, { email_error: msg });
    console.error(msg);
    return reply(JSON.stringify({ ok: false, error: msg }), 500);
  }
});
