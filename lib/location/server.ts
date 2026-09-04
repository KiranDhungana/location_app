import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import {
  LOCATION_COOKIE_NAME,
  LOCATION_SESSION_TTL_MS,
  REFERRER_MAX_LENGTH,
  USER_AGENT_MAX_LENGTH,
} from "./constants";

function getCsrfSecret(): string {
  const secret = process.env.LOCATION_CSRF_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("LOCATION_CSRF_SECRET is missing or too short.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getCsrfSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createLocationSessionToken(): string {
  const expiresAt = Date.now() + LOCATION_SESSION_TTL_MS;
  const nonce = randomBytes(16).toString("hex");
  const payload = `${expiresAt}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyLocationSessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [expiresAtRaw, nonce, signature] = parts;
  if (!expiresAtRaw || !nonce || !signature) {
    return false;
  }

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  if (!/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) {
    return false;
  }

  const expected = sign(`${expiresAtRaw}.${nonce}`);
  return safeEqual(signature, expected);
}

export function locationCookieOptions(isSecure: boolean) {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: Math.floor(LOCATION_SESSION_TTL_MS / 1000),
    secure: isSecure,
  };
}

export { LOCATION_COOKIE_NAME };

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  const allowed = new Set<string>([new URL(request.url).origin]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) {
    allowed.add(appUrl);
  }

  return allowed.has(origin);
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-vercel-forwarded-for")?.trim() ||
    null;

  if (
    !candidate ||
    candidate.length > 45 ||
    /[^0-9a-fA-F.:]/.test(candidate)
  ) {
    return null;
  }

  return candidate;
}

export function getUserAgent(request: Request): string | null {
  const userAgent = request.headers.get("user-agent")?.trim();
  if (!userAgent) {
    return null;
  }
  return userAgent.slice(0, USER_AGENT_MAX_LENGTH);
}

export function getReferrer(request: Request): string | null {
  const referrer = request.headers.get("referer")?.trim();
  if (!referrer) {
    return null;
  }
  return referrer.slice(0, REFERRER_MAX_LENGTH);
}

export function getAcceptLanguage(request: Request): string | null {
  const language = request.headers.get("accept-language")?.trim();
  if (!language) {
    return null;
  }
  return language.slice(0, 128);
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return false;
  }
  return !url.includes("USER:PASSWORD@");
}

export function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}
