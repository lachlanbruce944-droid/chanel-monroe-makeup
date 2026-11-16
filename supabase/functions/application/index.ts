// application: the website's "Join the team" and "Become an affiliate" chat forms (apply.html) post here.
// 1. saves the application in the CRM (public.crm_people, status "applied": the CRM's Employees section)
// 2. emails Chanel (makeup@chanelmonroe.net, reply goes to the applicant) and sends the applicant a confirmation.
// Public endpoint (verify_jwt off): validates input, ignores bots (honeypot), caps every field, and uses an
// idempotency key per application so a double tap never sends twice. If the CRM table is missing, the emails still go.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("FROM_EMAIL") ?? "Chanel Monroe Makeup <enquiries@chanelmonroe.net>";
const BUSINESS = Deno.env.get("BUSINESS_EMAIL") ?? "makeup@chanelmonroe.net";
const SITE = "https://lachlanbruce944-droid.github.io/chanel-monroe-makeup/";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

const esc = (v: unknown) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const clip = (v: unknown, n = 300) => Array.isArray(v) ? v.slice(0, 12).map((x) => String(x).slice(0, 60)).join(", ") : String(v ?? "").trim().slice(0, n);
const first = (n: string) => (n || "").trim().split(/\s+/)[0] || "there";

const LABELS: Record<string, [string, string][]> = {
  team: [["name", "Name"], ["role", "Role"], ["experience", "Experience"], ["skills", "Skills"], ["availability", "Availability"], ["areas", "Based in"],
    ["instagram", "Instagram or portfolio"], ["abn", "ABN"], ["email", "Email"], ["phone", "Phone"], ["notes", "About them"]],
  affiliate: [["name", "Name"], ["business", "Business"], ["role", "Service"], ["instagram", "Instagram"], ["website", "Website"], ["areas", "Areas"],
    ["offer", "Offer for clients"], ["email", "Email"], ["phone", "Phone"], ["notes", "Anything else"]],
};

async function send(msg: Record<string, unknown>, key: string) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json", "Idempotency-Key": key }, body: JSON.stringify(msg),
  });
  if (!r.ok) throw new Error(`resend ${r.status}: ${await r.text()}`);
}
const table = (r: string[][]) => `<table style="border-collapse:collapse;width:100%;font-size:14px">${r.map(([k, v]) =>
  `<tr><td style="padding:6px 10px 6px 0;color:#7a5a50;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;color:#3a2622">${esc(v)}</td></tr>`).join("")}</table>`;
const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#f5e9e1;font-family:Helvetica,Arial,sans-serif;color:#3a2622">
<div style="max-width:600px;margin:0 auto;padding:24px"><div style="background:#fbf3ee;border-radius:18px;padding:24px;border:1px solid #e2c3b2">
<div style="font-family:Georgia,serif;font-size:22px;margin-bottom:4px">Chanel Monroe <span style="font-size:11px;letter-spacing:.2em;color:#7a5a50">MAKEUP</span></div>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:24px;margin:14px 0">${title}</h1>${body}</div>
<p style="font-size:11px;color:#7a5a50;text-align:center">Chanel Monroe Makeup · Gold Coast · <a href="${SITE}" style="color:#7a5a50">website</a></p></div></body></html>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
  if (req.method !== "POST") return reply({ ok: false, error: "POST only" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type === "affiliate" ? "affiliate" : "team";
    const id = /^[0-9a-f-]{36}$/i.test(String(body.id || "")) ? String(body.id) : crypto.randomUUID();
    if (body.hp) return reply({ ok: true });                       // bot filled the hidden field: pretend it worked
    const a: Record<string, string> = {};
    for (const [k] of LABELS[type]) a[k] = clip(body.answers?.[k], k === "notes" || k === "offer" ? 1500 : 300);
    if (a.name.length < 2) return reply({ ok: false, error: "name required" }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email)) return reply({ ok: false, error: "valid email required" }, 400);
    if (!RESEND) throw new Error("RESEND_API_KEY is not set");

    // 1. CRM (best effort: a missing table must not lose the application, the email still goes)
    const [fn, ...ln] = a.name.split(/\s+/);
    let saved = false;
    try {
      const r = await fetch(`${SB_URL}/rest/v1/crm_people`, {
        method: "POST", headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal,resolution=ignore-duplicates" },
        body: JSON.stringify({ id, kind: type, status: "applied", first_name: fn, last_name: ln.join(" ") || null, business_name: a.business || null, role: a.role || null,
          email: a.email, phone: a.phone || null, instagram: a.instagram || null, website: a.website || null, areas: a.areas || null,
          experience: a.experience || null, availability: a.availability || null, notes: [a.notes, a.offer, a.skills && `Skills: ${a.skills}`, a.abn && `ABN: ${a.abn}`].filter(Boolean).join("\n") || null,
          source: "website", application: body.answers ?? {} }),
      });
      saved = r.ok;
      if (!r.ok) console.warn("crm_people", r.status, (await r.text()).slice(0, 200));
    } catch (e) { console.warn("crm_people", String(e)); }

    // 2. emails
    const rows = LABELS[type].map(([k, l]) => [l, a[k]]).filter(([, v]) => v) as string[][];
    const what = type === "affiliate" ? "affiliate application" : "team application";
    await send({ from: FROM, to: [BUSINESS], reply_to: a.email,
      subject: `New ${what}: ${a.name}${a.role ? " · " + a.role : ""}${a.business ? " · " + a.business : ""}`,
      html: shell(`New ${what} from ${esc(a.name)}`, table(rows) +
        `<p style="font-size:12px;color:#7a5a50;margin-top:18px">${saved ? "Saved in the CRM under Employees → Applications. " : ""}Reply to this email to answer ${esc(first(a.name))} directly.</p>`) }, `app-biz-${id}`);
    await send({ from: FROM, to: [a.email], reply_to: BUSINESS, subject: type === "affiliate" ? "Your affiliate application · Chanel Monroe Makeup" : "Your application · Chanel Monroe Makeup",
      html: shell(`Thanks ${esc(first(a.name))} ✨`,
        `<p style="font-size:15px;line-height:1.5">Your ${what} is with Chanel. She reads every one herself and will be in touch. If anything changes, just reply to this email.</p>
<p style="margin:18px 0 6px;color:#7a5a50;font-size:13px">What you sent</p>${table(rows)}`) }, `app-you-${id}`);
    return reply({ ok: true, saved });
  } catch (err) {
    const msg = String((err as Error).message || err).slice(0, 300);
    console.error(msg);
    return reply({ ok: false, error: msg }, 500);
  }
});
