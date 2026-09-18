const enc = new TextEncoder();

export default {
  async fetch(req, env) {
    const u = new URL(req.url);

    if (u.pathname === "/admin") return Response.redirect(new URL("/admin.html", u), 302);
    if (u.pathname === "/painel") return Response.redirect(new URL("/painel.html", u), 302);

    if (u.pathname === "/api/leads" && req.method === "POST") return createLead(req, env);
    if (u.pathname === "/api/admin/login" && req.method === "POST") return adminLogin(req, env);
    if (u.pathname === "/api/admin/logout" && req.method === "POST") return adminLogout();
    if (u.pathname === "/api/admin/session" && req.method === "GET") return adminSession(req, env);

    if (u.pathname.startsWith("/api/admin/")) {
      const auth = await isAdmin(req, env);
      if (!auth) return J({ error: "Não autorizado." }, 401);
      await ensureLeadStatus(env);

      if (u.pathname === "/api/admin/leads" && req.method === "GET") return listLeads(env);
      if (u.pathname === "/api/admin/payments" && req.method === "GET") return listPayments(env);
      const pm = u.pathname.match(/^\/api\/admin\/payments\/(\d+)$/);
      if (pm && req.method === "PATCH") return updatePayment(req, env, Number(pm[1]));
      const pf = u.pathname.match(/^\/api\/admin\/payments\/(\d+)\/proof$/);
      if (pf && req.method === "POST") return uploadPaymentProof(req, env, Number(pf[1]));
      if (pf && req.method === "GET") return getPaymentProof(env, Number(pf[1]));
      const m = u.pathname.match(/^\/api\/admin\/leads\/(\d+)$/);
      if (m && req.method === "PATCH") return updateLead(req, env, Number(m[1]));
      if (m && req.method === "DELETE") return deleteLead(env, Number(m[1]));
      return J({ error: "Rota não encontrada." }, 404);
    }

    if (u.pathname.startsWith("/api/")) return J({ error: "Rota não encontrada." }, 404);
    return env.ASSETS.fetch(req);
  }
};

async function createLead(req, env) {
  try {
    const b = await req.json(), g = k => String(b[k] || "").trim();
    const n = g("name"), p = g("phone"), e = g("email"), c = g("condominium"), m = g("message");
    if (!n || !p || !e || !m) return J({ error: "Preencha os campos obrigatórios." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return J({ error: "E-mail inválido." }, 400);
    await ensureLeadStatus(env);
    await env.DB.prepare("INSERT INTO leads(name,phone,email,condominium,message,status,created_at) VALUES(?,?,?,?,?,'new',datetime('now'))").bind(n,p,e,c,m).run();
    return J({ ok: true });
  } catch (e) { console.error(e); return J({ error: "Erro interno." }, 500); }
}

async function adminLogin(req, env) {
  try {
    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) {
      return J({ error: "Acesso administrativo ainda não configurado no Cloudflare." }, 503);
    }
    const b = await req.json();
    const userOk = safeEqual(String(b.username || ""), String(env.ADMIN_USERNAME));
    const passOk = safeEqual(String(b.password || ""), String(env.ADMIN_PASSWORD));
    if (!userOk || !passOk) return J({ error: "Usuário ou senha inválidos." }, 401);
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
    const payload = `${env.ADMIN_USERNAME}|${exp}`;
    const sig = await sign(payload, env.ADMIN_SESSION_SECRET);
    const token = b64url(payload) + "." + sig;
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store", "set-cookie": `adm_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` } });
  } catch (e) { console.error(e); return J({ error: "Não foi possível entrar." }, 500); }
}

function adminLogout() {
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json;charset=UTF-8", "cache-control": "no-store", "set-cookie": "adm_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" } });
}

async function adminSession(req, env) { return J({ authenticated: await isAdmin(req, env) }); }

async function isAdmin(req, env) {
  if (!env.ADMIN_SESSION_SECRET || !env.ADMIN_USERNAME) return false;
  const cookie = req.headers.get("cookie") || "";
  const token = cookie.split(";").map(x => x.trim()).find(x => x.startsWith("adm_session="))?.slice(12);
  if (!token) return false;
  const [data, sig] = token.split("."); if (!data || !sig) return false;
  let payload; try { payload = fromB64url(data); } catch { return false; }
  const expected = await sign(payload, env.ADMIN_SESSION_SECRET);
  if (!safeEqual(sig, expected)) return false;
  const [user, exp] = payload.split("|");
  return user === String(env.ADMIN_USERNAME) && Number(exp) > Math.floor(Date.now() / 1000);
}

async function listLeads(env) {
  const { results } = await env.DB.prepare("SELECT id,name,phone,email,condominium,message,COALESCE(status,'new') status,created_at FROM leads ORDER BY datetime(created_at) DESC,id DESC").all();
  return J({ leads: results || [] });
}

async function updateLead(req, env, id) {
  const b = await req.json();
  const status = String(b.status || "");
  if (!["new", "progress", "done"].includes(status)) return J({ error: "Status inválido." }, 400);
  await env.DB.prepare("UPDATE leads SET status=? WHERE id=?").bind(status, id).run();
  return J({ ok: true });
}

async function deleteLead(env, id) {
  await env.DB.prepare("DELETE FROM leads WHERE id=?").bind(id).run();
  return J({ ok: true });
}

async function ensureLeadStatus(env) {
  const info = await env.DB.prepare("PRAGMA table_info(leads)").all();
  if (!(info.results || []).some(c => c.name === "status")) {
    await env.DB.prepare("ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new'").run();
  }
}

async function ensurePayments(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_payments(
    installment INTEGER PRIMARY KEY,
    amount_cents INTEGER NOT NULL DEFAULT 30000,
    paid INTEGER NOT NULL DEFAULT 0,
    proof_name TEXT,
    proof_type TEXT,
    proof_base64 TEXT,
    proof_uploaded_at TEXT,
    paid_at TEXT,
    updated_at TEXT NOT NULL DEFAULT(datetime('now'))
  )`).run();
  for (const n of [1,2,3]) {
    await env.DB.prepare("INSERT OR IGNORE INTO admin_payments(installment,amount_cents,paid,updated_at) VALUES(?,30000,0,datetime('now'))").bind(n).run();
  }
}

async function listPayments(env) {
  await ensurePayments(env);
  const { results } = await env.DB.prepare("SELECT installment,amount_cents,paid,proof_name,proof_type,proof_uploaded_at,paid_at,updated_at FROM admin_payments ORDER BY installment").all();
  return J({ payments: results || [] });
}

async function updatePayment(req, env, installment) {
  if (![1,2,3].includes(installment)) return J({ error: "Parcela inválida." }, 400);
  await ensurePayments(env);
  const b = await req.json();
  const paid = !!b.paid;
  if (paid) {
    const row = await env.DB.prepare("SELECT proof_name FROM admin_payments WHERE installment=?").bind(installment).first();
    if (!row?.proof_name) return J({ error: "Envie o comprovante antes de marcar a parcela como paga." }, 400);
  }
  await env.DB.prepare("UPDATE admin_payments SET paid=?,paid_at=CASE WHEN ?=1 THEN datetime('now') ELSE NULL END,updated_at=datetime('now') WHERE installment=?").bind(paid?1:0,paid?1:0,installment).run();
  return J({ ok: true });
}

async function uploadPaymentProof(req, env, installment) {
  if (![1,2,3].includes(installment)) return J({ error: "Parcela inválida." }, 400);
  await ensurePayments(env);
  const form = await req.formData();
  const file = form.get("proof");
  if (!(file instanceof File)) return J({ error: "Selecione um comprovante." }, 400);
  const allowed = new Set(["application/pdf","image/png","image/jpeg"]);
  if (!allowed.has(file.type)) return J({ error: "Formato inválido. Use PDF, PNG, JPG ou JPEG." }, 400);
  if (file.size > 1024 * 1024) return J({ error: "O comprovante deve ter no máximo 1 MB." }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const base64 = bytesToBase64(bytes);
  await env.DB.prepare("UPDATE admin_payments SET proof_name=?,proof_type=?,proof_base64=?,proof_uploaded_at=datetime('now'),paid=0,paid_at=NULL,updated_at=datetime('now') WHERE installment=?").bind(file.name,file.type,base64,installment).run();
  return J({ ok: true });
}

async function getPaymentProof(env, installment) {
  if (![1,2,3].includes(installment)) return new Response("Arquivo não encontrado", { status: 404 });
  await ensurePayments(env);
  const row = await env.DB.prepare("SELECT proof_name,proof_type,proof_base64 FROM admin_payments WHERE installment=?").bind(installment).first();
  if (!row?.proof_base64) return new Response("Comprovante não encontrado", { status: 404 });
  const bytes = base64ToBytes(row.proof_base64);
  const safeName = String(row.proof_name || `comprovante-parcela-${installment}`).replace(/[\r\n"]/g, "_");
  return new Response(bytes, { headers: { "content-type": row.proof_type || "application/octet-stream", "content-disposition": `inline; filename="${safeName}"`, "cache-control": "private, no-store" } });
}

function bytesToBase64(bytes) {
  let out = "";
  const chunk = 0x8000;
  for (let i=0;i<bytes.length;i+=chunk) out += String.fromCharCode(...bytes.subarray(i,i+chunk));
  return btoa(out);
}
function base64ToBytes(base64) {
  const bin = atob(base64), out = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function sign(text, secret) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const out = await crypto.subtle.sign("HMAC", key, enc.encode(text));
  return [...new Uint8Array(out)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function b64url(s) { return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
function fromB64url(s) { return atob(s.replace(/-/g,"+").replace(/_/g,"/") + "===".slice((s.length + 3) % 4)); }
function safeEqual(a,b){ if(a.length!==b.length)return false; let x=0; for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i); return x===0; }
function J(x, s=200) { return new Response(JSON.stringify(x), { status:s, headers:{ "content-type":"application/json;charset=UTF-8", "cache-control":"no-store" } }); }
