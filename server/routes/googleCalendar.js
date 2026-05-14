import crypto from "crypto";
import express, { Router } from "express";

import { db } from "../db/db-pgp";
import { verifyToken } from "../src/middleware";

const router = Router();
router.use(express.json());

/** @type {Map<string, { accessToken: string, expiresAtMs: number }>} */
const accessTokenCache = new Map();

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_REVOKE = "https://oauth2.googleapis.com/revoke";

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

/** Google requires redirect_uri to match Console exactly; trailing slashes often cause mismatch. */
const normalizeRedirectUri = (uri) => {
  if (!uri || typeof uri !== "string") return uri;
  return uri.trim().replace(/\/+$/, "");
};

const trimEnv = (name) => {
  const v = process.env[name];
  if (v == null || typeof v !== "string") return v;
  return v.trim();
};

const getOAuthConfig = () => {
  const clientId = trimEnv("VITE_GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = trimEnv("VITE_GOOGLE_OAUTH_CLIENT_SECRET");
  const redirectUri = normalizeRedirectUri(
    process.env.VITE_GOOGLE_OAUTH_REDIRECT_URI
  );
  const stateSecret =
    trimEnv("VITE_GOOGLE_OAUTH_STATE_SECRET") || clientSecret;
  return { clientId, clientSecret, redirectUri, stateSecret };
};

const assertOAuthConfigured = (res) => {
  const { clientId, clientSecret, redirectUri, stateSecret } = getOAuthConfig();
  if (!clientId || !clientSecret || !redirectUri || !stateSecret) {
    res.status(503).json({
      message:
        "Google Calendar OAuth is not configured. Set VITE_GOOGLE_OAUTH_CLIENT_ID, VITE_GOOGLE_OAUTH_CLIENT_SECRET, VITE_GOOGLE_OAUTH_REDIRECT_URI, and VITE_GOOGLE_OAUTH_STATE_SECRET (recommended) on the server.",
    });
    return null;
  }
  return { clientId, clientSecret, redirectUri, stateSecret };
};

/**
 * @param {string} uid
 * @param {string} secret
 */
const signOAuthState = (uid, secret) => {
  const exp = Date.now() + 15 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ uid, exp }), "utf8").toString(
    "base64url"
  );
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
};

/**
 * @param {string} state
 * @param {string} secret
 * @param {string} expectedUid
 */
const verifyOAuthState = (state, secret, expectedUid) => {
  try {
    const dot = state.indexOf(".");
    if (dot <= 0) return false;
    const payloadB64 = state.slice(0, dot);
    const sig = state.slice(dot + 1);
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (payload.uid !== expectedUid) return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {import("express").Response} res
 */
const getUid = (res) => res.locals?.decodedToken?.uid;

router.use(verifyToken);

router.get("/oauth/authorize-url", async (req, res) => {
  const cfg = assertOAuthConfigured(res);
  if (!cfg) return;

  const uid = getUid(res);
  if (!uid) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const state = signOAuthState(uid, cfg.stateSecret);
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: CALENDAR_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  const url = `${GOOGLE_AUTH}?${params.toString()}`;
  return res.status(200).json({ url });
});

router.post("/oauth/exchange", async (req, res) => {
  const cfg = assertOAuthConfigured(res);
  if (!cfg) return;

  const uid = getUid(res);
  if (!uid) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const { code, state } = req.body ?? {};
  if (!code || typeof code !== "string" || !state || typeof state !== "string") {
    return res.status(400).json({ message: "Missing code or state" });
  }

  if (!verifyOAuthState(state, cfg.stateSecret, uid)) {
    return res.status(400).json({ message: "Invalid or expired OAuth state" });
  }

  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: "authorization_code",
  });

  let tokenRes;
  try {
    tokenRes = await fetch(GOOGLE_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch {
    return res.status(502).json({ message: "Token request failed" });
  }

  const raw = await tokenRes.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    return res.status(502).json({ message: "Invalid token response" });
  }

  if (!tokenRes.ok) {
    return res.status(400).json({
      message: data.error_description || data.error || "Token exchange failed",
    });
  }

  const refreshToken = data.refresh_token;
  if (refreshToken) {
    await db.none(
      `UPDATE users SET google_calendar_refresh_token = $1 WHERE firebase_uid = $2`,
      [refreshToken, uid]
    );
  } else {
    const existing = await db.oneOrNone(
      `SELECT google_calendar_refresh_token FROM users WHERE firebase_uid = $1`,
      [uid]
    );
    if (!existing?.google_calendar_refresh_token) {
      return res.status(400).json({
        message:
          "Google did not return a refresh token. Try disconnecting the app in your Google account security settings and connecting again.",
      });
    }
  }

  accessTokenCache.delete(uid);
  return res.status(200).json({ ok: true });
});

const REFRESH_MARGIN_MS = 60_000;

/**
 * @param {string} uid
 * @param {string} refreshTokenValue
 * @param {{ clientId: string, clientSecret: string }} cfg
 */
const refreshAccessToken = async (uid, refreshTokenValue, cfg) => {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshTokenValue,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const raw = await tokenRes.text();
  const data = raw ? JSON.parse(raw) : {};

  if (!tokenRes.ok) {
    const err = new Error(data.error_description || data.error || "Refresh failed");
    err.status = 400;
    throw err;
  }

  const accessToken = data.access_token;
  const expiresIn = Number(data.expires_in) || 3600;
  const expiresAtMs = Date.now() + expiresIn * 1000 - REFRESH_MARGIN_MS;

  if (!accessToken) {
    const err = new Error("No access_token in refresh response");
    err.status = 502;
    throw err;
  }

  accessTokenCache.set(uid, { accessToken, expiresAtMs });
  return { accessToken, expiresAt: expiresAtMs };
};

router.get("/access-token", async (req, res) => {
  const cfg = assertOAuthConfigured(res);
  if (!cfg) return;

  const uid = getUid(res);
  if (!uid) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const cached = accessTokenCache.get(uid);
  if (cached && Date.now() < cached.expiresAtMs - REFRESH_MARGIN_MS / 2) {
    return res.status(200).json({
      accessToken: cached.accessToken,
      expiresAt: cached.expiresAtMs,
    });
  }

  const row = await db.oneOrNone(
    `SELECT google_calendar_refresh_token FROM users WHERE firebase_uid = $1`,
    [uid]
  );
  const refreshTokenValue = row?.google_calendar_refresh_token;
  if (!refreshTokenValue) {
    return res.status(400).json({ message: "Google Calendar is not connected" });
  }

  try {
    const out = await refreshAccessToken(uid, refreshTokenValue, cfg);
    return res.status(200).json({
      accessToken: out.accessToken,
      expiresAt: out.expiresAt,
    });
  } catch (e) {
    return res.status(e.status || 502).json({ message: e.message });
  }
});

router.get("/status", async (req, res) => {
  const uid = getUid(res);
  if (!uid) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const row = await db.oneOrNone(
    `SELECT google_calendar_refresh_token FROM users WHERE firebase_uid = $1`,
    [uid]
  );
  const connected = Boolean(row?.google_calendar_refresh_token);
  return res.status(200).json({ connected });
});

router.delete("/connect", async (req, res) => {
  const cfg = assertOAuthConfigured(res);
  if (!cfg) return;

  const uid = getUid(res);
  if (!uid) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const row = await db.oneOrNone(
    `SELECT google_calendar_refresh_token FROM users WHERE firebase_uid = $1`,
    [uid]
  );
  const refreshTokenValue = row?.google_calendar_refresh_token;

  if (refreshTokenValue) {
    try {
      await fetch(GOOGLE_REVOKE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: refreshTokenValue }).toString(),
      });
    } catch {
      /* still clear locally */
    }
  }

  await db.none(
    `UPDATE users SET google_calendar_refresh_token = NULL WHERE firebase_uid = $1`,
    [uid]
  );
  accessTokenCache.delete(uid);

  return res.status(204).send();
});

export const googleCalendarRouter = router;
