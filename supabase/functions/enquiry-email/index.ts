// enquiry-email: emails Chanel (makeup@chanelmonroe.net) each new chat enquiry, and the client a confirmation.
// Called by the chat page right after it saves an enquiry (and by the optional database trigger) with { id }.
// It reads the row itself with the service role, only acts on enquiries less than 24 hours old, and uses
// Resend idempotency keys (plus emailed_*_at columns when they exist), so each enquiry is emailed once.
// If the client sent a selfie (private "selfies" bucket), it is attached to Chanel's email and shown inline.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("FROM_EMAIL") ?? "Chanel Monroe Makeup <enquiries@chanelmonroe.net>";
const BUSINESS = Deno.env.get("BUSINESS_EMAIL") ?? "makeup@chanelmonroe.net";
const SITE = "https://chanelmonroe.net/";
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

const OPERATING = "6:00 am – 5:00 pm";
const hoursLabel = (h?: string) => h === "extended" ? `Outside operating hours (${OPERATING}) · extra fee to be confirmed`
  : h === "standard" ? `Within operating hours (${OPERATING})` : "";

function rows(e: Record<string, any>) {
  const when = [fmtDate(e.event_date), e.time && `${e.time_type === "start" ? "start" : "ready by"} ${fmtTime(e.time)}`].filter(Boolean).join(", ");
  const travel = e.travel_km_estimate != null ? ` (~${e.travel_km_estimate} km${e.travel_included ? ", travel included" : ", travel to confirm"})` : "";
  return [
    ["Booking", [e.category_name, e.look_name].filter(Boolean).join(" · ")],
    ["Style", e.sub_style || (e.lesson_focus?.length ? e.lesson_focus.join(", ") : "")],
    ["Date", when],
    ["Appointment hours", hoursLabel(e.viewing?.appointment_hours)],
    ["Phone consultation · confirmed · 30 minutes", e.consult_requested_at ? new Date(e.consult_requested_at).toLocaleString("en-AU", {timeZone:"Australia/Brisbane", dateStyle:"full", timeStyle:"short"}) + " · Brisbane time" : "Chanel will arrange a time"],
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

// Stacked rows avoid long labels forcing horizontal scrolling in phone mail apps.
const table = (r: string[][]) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px">${r.map(([k,v])=>
 `<tr><td style="padding:10px 0;border-bottom:1px solid #e2c3b2;word-wrap:break-word;overflow-wrap:anywhere"><div style="font-size:12px;line-height:18px;color:#7a5a50">${esc(k)}</div><div style="line-height:22px;color:#3a2622;white-space:pre-wrap;word-break:break-word">${esc(v)}</div></td></tr>`).join("")}</table>`;
const shell = (title: string,body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head><body style="margin:0;padding:0;background:#f5e9e1;font-family:Helvetica,Arial,sans-serif;color:#3a2622;-webkit-text-size-adjust:100%">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f5e9e1"><tr><td align="center" style="padding:12px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;table-layout:fixed;background:#fbf3ee;border-radius:18px"><tr><td style="padding:20px 16px;overflow-wrap:anywhere;word-break:break-word">
<div style="font-family:Georgia,serif;font-size:22px;line-height:30px">Chanel Monroe</div><div style="font-size:11px;letter-spacing:2px;color:#7a5a50">MAKEUP · GOLD COAST</div>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;line-height:32px;margin:18px 0">${title}</h1>${body}
</td></tr></table><p style="font-size:11px;line-height:18px;color:#7a5a50">Chanel Monroe Makeup · Gold Coast · <a href="${SITE}" style="color:#7a5a50">website</a></p></td></tr></table></body></html>`;
const mediaURL = (src: unknown) => {
 try { const u=new URL(/^https?:/.test(String(src||''))?String(src):String(src||'').replace(/^\/+/,''),"https://qxiugfatpybldluipcyy.supabase.co/storage/v1/object/public/media/");return u.protocol==='https:'?u.href:'' } catch { return '' }
};
// Small image tiles for the reference looks and the beauty-team artists (both emails).
const safeURL = (u: unknown) => { try { const x = new URL(String(u || "")); return x.protocol === "https:" ? x.href : ""; } catch { return ""; } };
const TEAM_LABEL: Record<string, string> = { Hair: "Hair", Nail: "Nails", Cosmetics: "Lashes & brows", Photography: "Photographer", Tattoo: "Tattoo" };
const handle = (v: unknown) => String(v || "").replace(/^@/, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);
let avatarCache: Record<string, string> | null = null;
async function avatars(): Promise<Record<string, string>> {   // older enquiries did not store the artist photo: look it up on the website
  if (avatarCache) return avatarCache;
  try {
    const txt = await (await fetch("https://chanelmonroe.net/data/affiliates.js")).text();
    const list = JSON.parse(txt.slice(txt.indexOf("["), txt.lastIndexOf("]") + 1));
    avatarCache = Object.fromEntries(list.map((x: any) => [x.h, safeURL(x.avatar)]));
  } catch { avatarCache = {}; }
  return avatarCache;
}
const label = (s: string) => `<p style="margin:20px 0 8px;color:#7a5a50;font-size:13px">${s}</p>`;
const grid = (cells: string[], per: number) => {
  const rowsOut: string[] = [];
  for (let i = 0; i < cells.length; i += per) {
    const row = cells.slice(i, i + per); while (row.length < per) row.push("");
    rowsOut.push(`<tr>${row.map(c => `<td valign="top" width="${Math.floor(100 / per)}%" style="width:${Math.floor(100 / per)}%;padding:0 6px 12px 0;vertical-align:top">${c}</td>`).join("")}</tr>`);
  }
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;table-layout:fixed;border-collapse:collapse">${rowsOut.join("")}</table>`;
};
async function tiles(e: Record<string, any>, forClient: boolean) {
  const refs = (e.refs || []).slice(0, 12).filter((x: any) => mediaURL(x.src));
  const refCells = refs.map((x: any) => {
    const img = mediaURL(x.src), post = safeURL(x.post), by = handle(x.by), name = x.sub_style || x.desc || "Reference look";
    return `<a href="${esc(post || img)}" style="text-decoration:none"><img src="${esc(img)}" width="160" height="160" alt="${esc(name)}" style="display:block;width:100%;max-width:160px;height:160px;object-fit:cover;border-radius:10px;border:0"></a>` +
      `<div style="font-size:12px;line-height:16px;color:#3a2622;margin-top:5px;word-break:break-word">${esc(name)}</div>` +
      (by ? `<div style="font-size:11px;line-height:15px;word-break:break-word"><a href="${esc(post || "https://www.instagram.com/" + by + "/")}" style="color:#b8846b">@${esc(by)}</a></div>` : "");
  });
  const team = (e.affiliates || []).slice(0, 12).filter((a: any) => handle(a.handle));
  const pics = team.some((a: any) => !safeURL(a.avatar)) ? await avatars() : {};
  const teamCells = team.map((a: any) => {
    const h = handle(a.handle), pic = safeURL(a.avatar) || pics[h] || "", ig = `https://www.instagram.com/${h}/`, site = safeURL(a.site);
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr>` +
      (pic ? `<td valign="top" style="padding:0 10px 0 0;vertical-align:top"><a href="${esc(ig)}"><img src="${esc(pic)}" width="56" height="56" alt="@${esc(h)}" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:28px;border:0"></a></td>` : "") +
      `<td valign="top" style="vertical-align:top;font-size:13px;line-height:18px;word-break:break-word"><a href="${esc(ig)}" style="color:#b8846b;font-weight:bold">@${esc(h)}</a>` +
      `<div style="font-size:12px;color:#7a5a50">${esc(TEAM_LABEL[a.category] || a.category || "")}</div>` +
      (a.name ? `<div style="font-size:11px;color:#7a5a50">${esc(String(a.name).slice(0, 60))}</div>` : "") +
      (site ? `<div style="font-size:11px"><a href="${esc(site)}" style="color:#b8846b">Website</a></div>` : "") + `</td></tr></table>`;
  });
  return (refCells.length ? label(forClient ? "The looks you saved" : "Reference looks") + grid(refCells, 3) : "") +
    (teamCells.length ? label(forClient ? "Beauty team you picked · contact each artist to book their service" : "Beauty team the client picked") + grid(teamCells, 2) : "");
}
const plainDetails = (e: Record<string,any>,r: string[][]) => ["Chanel Monroe Makeup",e.name,e.email,e.phone,...r.map(([k,v])=>`${k}: ${v}`),"Phone consultation confirmed for 30 minutes. Makeup booking still requires a quote and deposit."].filter(Boolean).join("\n");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const reply = (body: string, status = 200) => new Response(body, { status, headers: { ...CORS, "Content-Type": "application/json" } });
  let id = "";
  try {
    ({ id } = await req.json().catch(() => ({ id: "" })));
    if (!/^[0-9a-f-]{36}$/i.test(id || "")) return reply('"bad id"', 400);
    const [e] = await db(`enquiries?id=eq.${id}&select=*`) as Record<string, any>[];
    if (!e) return reply('"not found"', 404);
    if (Date.now() - new Date(e.created_at).getTime() > 24 * 60 * 60 * 1000) return reply('"too old"', 409);
    if (!RESEND) throw new Error("RESEND_API_KEY is not set");
    const r = rows(e);
    const done: Record<string, string> = {};

    if (!e.emailed_business_at) {
      const pic = await selfie(e.selfie_path);
      const safe = first(e.name).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "client";
      const html = shell(`New enquiry from ${esc(e.name)}`,
        (pic ? `<p style="margin:0 0 12px"><img src="cid:selfie" width="160" style="width:160px;border-radius:14px;display:block" alt="Client selfie"></p>` : "") +
        `<p style="font-size:14px;line-height:22px;word-break:break-word">${esc(e.phone)}<br><a href="mailto:${esc(e.email)}" style="color:#b8846b">${esc(e.email)}</a></p>${table(r)}` +
        await tiles(e, false) +
        `<p style="font-size:12px;color:#7a5a50;margin-top:18px">${pic ? "The selfie is attached. " : "No selfie sent. "}Reply to this email to answer ${esc(first(e.name))} directly. Ref ${esc(String(e.id).slice(0, 8))}</p>`);
      await send({ from: FROM, to: [BUSINESS], reply_to: e.email || undefined,
        subject: `New enquiry: ${e.name}${e.look_name ? " · " + e.look_name : ""}${e.event_date ? " · " + fmtDate(e.event_date) : ""}`, html, text:plainDetails(e,r),
        ...(pic ? { attachments: [{ filename: `selfie-${safe}.jpg`, content: pic, content_type: "image/jpeg", content_id: "selfie" }] } : {}) }, `biz-${e.id}`);
      done.emailed_business_at = new Date().toISOString();
      await save(id, { emailed_business_at: done.emailed_business_at });
    }

    if (e.email && !e.emailed_client_at) {
      const html = shell(`Thanks ${esc(first(e.name))}, your enquiry is in ✨`,
        `<p style="font-size:15px;line-height:1.5">Your 30-minute phone consultation is confirmed for the date and time shown above. Chanel will call your supplied phone number. Your makeup appointment still requires a quote and deposit. Consultations must be at least 24 hours before the makeup appointment.</p>
<p style="margin:18px 0 6px;color:#7a5a50;font-size:13px">Your enquiry</p>${table(r)}${await tiles(e, true)}
<p style="font-size:12px;color:#7a5a50;margin-top:18px">The estimate is a guide; Chanel confirms your final quote on the call. Questions? Just reply to this email.</p>`);
      await send({ from: FROM, to: [e.email], reply_to: BUSINESS, subject: "Your enquiry with Chanel Monroe Makeup", html, text:plainDetails(e,r) }, `client-${e.id}`);
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
