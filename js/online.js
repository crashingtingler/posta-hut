// The online Hall of Masters, on Supabase (see supabase/schema.sql and js/online-config.js).
// Each player name on this device signs in anonymously once and keeps its own session, so a name owns one row
// in the online Hall. Records are sent a moment after they change (runs, Armoury purchases); the Hall reads the
// top players. With no config, no signal or an error, the game carries on with the Hall on this device.
(function () {
  const CFG = window.POSTA_ONLINE || {};
  const BASE = (CFG.url || "").replace(/\/+$/, ""), KEY = CFG.anonKey || "";
  const enabled = !!(BASE && KEY);
  const TIMEOUT = 8000, PUSH_DELAY = 2000, RETRY = 20000, TOP = 50;

  // sessions per player name: { [name]: { uid, access, refresh, exp, optOut, status } }
  const load = () => { try { return JSON.parse(localStorage.getItem("so.online")) || {}; } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem("so.online", JSON.stringify(s)); } catch (e) { /* private mode */ } };
  const sessionOf = (name) => load()[name] || null;
  const setSession = (name, patch) => { const all = load(); all[name] = Object.assign({}, all[name], patch); save(all); return all[name]; };

  async function call(path, { method = "GET", body, token, prefer } = {}) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT);
    try {
      // signed in: the player's own token; otherwise only the public key (works with both the newer
      // sb_publishable_ keys and the older "anon" keys)
      const headers = { apikey: KEY }; if (token) headers.Authorization = "Bearer " + token;
      if (body !== undefined) headers["Content-Type"] = "application/json";
      if (prefer) headers.Prefer = prefer;
      const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: ctl.signal });
      const text = await res.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      return { ok: res.ok, status: res.status, data };
    } catch (e) { return { ok: false, status: 0, data: null }; } // offline or timed out
    finally { clearTimeout(t); }
  }

  // a valid access token for this name: sign in anonymously the first time, refresh when it's about to run out
  async function token(name) {
    let s = sessionOf(name);
    const now = Date.now() / 1000;
    if (s && s.access && s.exp - 60 > now) return s;
    if (s && s.refresh) {
      const r = await call("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: s.refresh } });
      if (r.ok && r.data && r.data.access_token) return setSession(name, keep(r.data));
      if (r.status === 0) return null; // offline: try again later with the same refresh token
    }
    const r = await call("/auth/v1/signup", { method: "POST", body: { data: {} } }); // anonymous sign-in
    if (r.ok && r.data && r.data.access_token) return setSession(name, keep(r.data));
    return null;
  }
  const keep = (d) => ({ uid: d.user && d.user.id, access: d.access_token, refresh: d.refresh_token, exp: d.expires_at || Date.now() / 1000 + (d.expires_in || 3600) });

  // ---------- sending a player's record ----------
  const pending = {}; let timer = 0;
  function push(name, rec) {
    if (!enabled || !name || !rec || /demo=/.test(location.hash)) return; // (screenshot demos never go online)
    const s = sessionOf(name); if (s && s.optOut) return;
    pending[name] = rec; clearTimeout(timer); timer = setTimeout(flush, PUSH_DELAY);
  }
  async function flush() {
    for (const name of Object.keys(pending)) {
      const rec = pending[name]; delete pending[name];
      const status = await send(name, rec);
      if (status === "retry") { pending[name] = rec; clearTimeout(timer); timer = setTimeout(flush, RETRY); }
    }
  }
  async function send(name, rec) {
    const s = await token(name); if (!s) { setSession(name, { status: "offline" }); return "retry"; }
    const row = { id: s.uid, name, xp: Math.max(0, Math.round(rec.xp || 0)), streak: Math.max(0, rec.streak || 0), kit: rec.kit || {} };
    const r = await call("/rest/v1/hall?on_conflict=id", { method: "POST", body: row, token: s.access, prefer: "resolution=merge-duplicates,return=minimal" });
    const msg = r.data && (r.data.message || r.data.msg || "");
    const status = r.ok ? "ok" : r.status === 0 ? "offline"
      : /name not allowed/.test(msg) ? "name" : /too fast/.test(msg) ? "retry" : "error";
    setSession(name, { status });
    return status === "offline" ? "retry" : status;
  }

  // ---------- the Hall: top players by XP or by best streak ----------
  async function hall(key) {
    if (!enabled) return null;
    const col = key === "streak" ? "streak" : "xp";
    const r = await call(`/rest/v1/hall?select=id,name,xp,streak,kit&${col}=gt.0&order=${col}.desc,name.asc&limit=${TOP}`);
    if (!r.ok || !Array.isArray(r.data)) {
      try { return JSON.parse(localStorage.getItem("so.hallCache." + col)); } catch (e) { return null; } // the last good copy, offline
    }
    try { localStorage.setItem("so.hallCache." + col, JSON.stringify(r.data)); } catch (e) { /* full */ }
    return r.data;
  }

  // ---------- report a name ----------
  async function report(name, target, targetName) {
    const s = await token(name); if (!s) return false;
    const r = await call("/rest/v1/reports", { method: "POST", body: { target, name: targetName }, token: s.access, prefer: "return=minimal" });
    return r.ok || r.status === 409; // (already reported counts as done)
  }

  // ---------- leave the online Hall: delete this name's online record and stop sending it ----------
  async function leave(name) {
    delete pending[name];
    const s = sessionOf(name);
    if (s && s.refresh) {
      const t = await token(name);
      if (t) { const r = await call("/rest/v1/rpc/delete_me", { method: "POST", body: {}, token: t.access }); if (!r.ok) return false; }
      else return false;
    }
    const all = load(); all[name] = { optOut: true }; save(all); return true;
  }
  function join(name, rec) { setSession(name, { optOut: false }); push(name, rec); }

  window.Online = {
    enabled, push, hall, report, leave, join,
    myId: (name) => (sessionOf(name) || {}).uid || null,
    optedOut: (name) => !!(sessionOf(name) || {}).optOut,
    status: (name) => (sessionOf(name) || {}).status || "",
  };
})();
