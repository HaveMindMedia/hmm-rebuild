import type { Context } from "https://edge.netlify.com";

// ═══════════════════════════════════════════════════════════════════════
// MAINTENANCE MODE — Site offline, reconstructing page only
// ═══════════════════════════════════════════════════════════════════════
// When GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and SESSION_SECRET are
// set in Netlify env vars, this switches to full Google OAuth gate mode.
// Until then: everything redirects to /reconstructing.html
// ═══════════════════════════════════════════════════════════════════════

const COOKIE_NAME = "__hmm_session";
const COOKIE_MAX_AGE = 86400; // 24 hours
const OAUTH_SCOPES = "openid email profile";
const REDIRECT_PATH = "/auth/callback";
const LOGOUT_PATH = "/auth/logout";
const MAINTENANCE_PAGE = "/reconstructing.html";

// Paths that bypass auth entirely
const AUTH_BYPASS_PATHS = [
  "/auth/",
  "/loop.html",
  "/robots.txt",
  "/favicon.ico",
  MAINTENANCE_PAGE,
  "/docs/staging/",      // canary — let bots reach the honey
  "/thehive",            // THE HIVE proxy — bypasses auth
];

// ─── TRUSTED EMAILS — never flag ─────────────────────────────────────
const TRUSTED_EMAILS = new Set([
  "tsbstudios@gmail.com",
  "drumhed@gmail.com",
]);

// ─── DUPLICATE ACCOUNT DETECTION ────────────────────────────────────
// Tracks IP → email mappings. If same IP signs in with a different
// Google account, flag them as suspicious (account rotation).
const ipEmailMap = new Map<string, Set<string>>();
const NAUGHTY_IPS = new Set<string>();

function trackLogin(ip: string, email: string): boolean {
  if (!ipEmailMap.has(ip)) {
    ipEmailMap.set(ip, new Set());
  }
  const emails = ipEmailMap.get(ip)!;
  emails.add(email);
  // If this IP has used 2+ different Google accounts → naughty list
  if (emails.size >= 2) {
    NAUGHTY_IPS.add(ip);
    return true; // flagged
  }
  return false;
}

async function logSuspiciousLogin(ip: string, email: string, emails: Set<string>, context: Context) {
  const geo = context.geo || {};
  const entry = {
    type: "DUPLICATE_ACCOUNT_DETECTED",
    timestamp: new Date().toISOString(),
    ip,
    newEmail: email,
    allEmails: Array.from(emails),
    accountCount: emails.size,
    country: (geo as any)?.country?.name || "",
    city: (geo as any)?.city || "",
    verdict: "NAUGHTY_LIST",
  };
  console.log(JSON.stringify(entry));

  // Persist to canary log
  try {
    const token = Deno.env.get("NETLIFY_API_TOKEN");
    const siteId = Deno.env.get("SITE_ID") || "6cf2937e-31e3-4aef-bc71-6e1399c05656";
    if (!token) return;
    const key = `dupacct_${entry.timestamp}_${ip.replace(/\./g, "-")}_${Math.random().toString(36).slice(2, 8)}`;
    await fetch(
      `https://api.netlify.com/api/v1/blobs/${siteId}/store/canary-log/${encodeURIComponent(key)}`,
      { method: "PUT", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(entry) }
    );
  } catch { /* fail silently */ }
}

// ─── CRYPTO HELPERS ──────────────────────────────────────────────────

async function hmacSign(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

// ─── COOKIE HELPERS ──────────────────────────────────────────────────

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  header.split(";").forEach((pair) => {
    const [key, ...vals] = pair.trim().split("=");
    if (key) cookies[key.trim()] = vals.join("=").trim();
  });
  return cookies;
}

async function createSessionCookie(
  email: string,
  name: string,
  secret: string
): Promise<string> {
  const payload = JSON.stringify({
    email,
    name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE,
  });
  const encoded = btoa(payload);
  const sig = await hmacSign(encoded, secret);
  return `${encoded}.${sig}`;
}

async function verifySessionCookie(
  cookie: string,
  secret: string
): Promise<{ email: string; name: string } | null> {
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;

  const valid = await hmacVerify(encoded, sig, secret);
  if (!valid) return null;

  try {
    const payload = JSON.parse(atob(encoded));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

// ─── OAUTH HELPERS ───────────────────────────────────────────────────

function getGoogleAuthURL(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPES,
    access_type: "online",
    prompt: "select_account",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string } | null> {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!resp.ok) return null;
  return resp.json();
}

async function getGoogleUserInfo(
  accessToken: string
): Promise<{ email: string; name: string } | null> {
  const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) return null;
  return resp.json();
}

// ─── MAIN HANDLER ────────────────────────────────────────────────────

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID") || "";
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
  const sessionSecret = Deno.env.get("SESSION_SECRET") || "";

  // ── MAINTENANCE MODE: OAuth not configured → show reconstructing page ──
  if (!clientId || !clientSecret || !sessionSecret) {
    // Let honeypot paths through even in maintenance mode
    if (pathname === MAINTENANCE_PAGE || AUTH_BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
      return context.next();
    }
    return Response.redirect(new URL(MAINTENANCE_PAGE, url.origin).toString(), 302);
  }

  // ── OAUTH MODE: Full Google auth gate ──

  const redirectUri = `${url.origin}${REDIRECT_PATH}`;

  // Bypass paths
  if (AUTH_BYPASS_PATHS.some((p) => pathname.startsWith(p))) {
    if (pathname !== REDIRECT_PATH && pathname !== LOGOUT_PATH) {
      return context.next();
    }
  }

  // Handle /auth/callback
  if (pathname === REDIRECT_PATH) {
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error || !code) {
      return new Response(
        `<html><body style="font-family:sans-serif;text-align:center;padding:4em">
          <h1>Authentication Failed</h1>
          <p>${error || "No authorization code received."}</p>
          <a href="/">Try Again</a>
        </body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    const tokenData = await exchangeCodeForToken(code, clientId, clientSecret, redirectUri);
    if (!tokenData) {
      return new Response(
        `<html><body style="font-family:sans-serif;text-align:center;padding:4em">
          <h1>Authentication Failed</h1>
          <p>Could not exchange authorization code.</p>
          <a href="/">Try Again</a>
        </body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    const userInfo = await getGoogleUserInfo(tokenData.access_token);
    if (!userInfo || !userInfo.email) {
      return new Response(
        `<html><body style="font-family:sans-serif;text-align:center;padding:4em">
          <h1>Authentication Failed</h1>
          <p>Could not retrieve user information.</p>
          <a href="/">Try Again</a>
        </body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }

    const cookie = await createSessionCookie(userInfo.email, userInfo.name || "", sessionSecret);
    const ip = context.ip || request.headers.get("x-nf-client-connection-ip") || "unknown";

    // ── DUPLICATE ACCOUNT DETECTION (skip trusted emails) ──
    const isTrusted = TRUSTED_EMAILS.has(userInfo.email.toLowerCase());
    const isDuplicate = isTrusted ? false : trackLogin(ip, userInfo.email);
    if (isDuplicate) {
      const emails = ipEmailMap.get(ip)!;
      await logSuspiciousLogin(ip, userInfo.email, emails, context);
    }

    console.log(JSON.stringify({
      type: "GOOGLE_AUTH_LOGIN",
      email: userInfo.email,
      name: userInfo.name || "",
      ip,
      country: ((context.geo as any)?.country?.name) || "",
      timestamp: new Date().toISOString(),
      duplicateAccount: isDuplicate,
      accountsFromThisIP: ipEmailMap.get(ip)?.size || 1,
    }));

    const state = url.searchParams.get("state") || "/";
    const destination = state.startsWith("/") ? state : "/";

    return new Response(null, {
      status: 302,
      headers: {
        Location: destination,
        "Set-Cookie": `${COOKIE_NAME}=${cookie}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
      },
    });
  }

  // Handle /auth/logout
  if (pathname === LOGOUT_PATH) {
    const ip = context.ip || request.headers.get("x-nf-client-connection-ip") || "unknown";
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const sessionCookie = cookies[COOKIE_NAME];
    let email = "unknown";

    if (sessionCookie) {
      const session = await verifySessionCookie(sessionCookie, sessionSecret);
      if (session) email = session.email;
    }

    console.log(JSON.stringify({
      type: "GOOGLE_AUTH_LOGOUT",
      email,
      ip,
      timestamp: new Date().toISOString(),
    }));

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      },
    });
  }

  // Check session cookie
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies[COOKIE_NAME];

  if (sessionCookie) {
    const session = await verifySessionCookie(sessionCookie, sessionSecret);
    if (session) {
      return context.next();
    }
  }

  // No valid session → redirect to Google OAuth
  const state = pathname === "/" ? "/" : pathname + url.search;
  const authUrl = getGoogleAuthURL(clientId, redirectUri, state);

  return new Response(null, {
    status: 302,
    headers: { Location: authUrl },
  });
}

export const config = { path: "/*" };
