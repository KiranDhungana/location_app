export const LOCATION_COOKIE_NAME = "location_session";
export const LOCATION_SESSION_TTL_SECONDS = 30 * 60;
export const LOCATION_SESSION_TTL_MS = LOCATION_SESSION_TTL_SECONDS * 1000;

export const MAX_JSON_BODY_BYTES = 4_096;
export const USER_AGENT_MAX_LENGTH = 512;
export const SHORT_TEXT_MAX = 128;
export const REFERRER_MAX_LENGTH = 512;

export const RATE_LIMIT_MAX_PER_WINDOW = 8;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export const GEO_TIMEOUT_MS = 15_000;
export const GEO_MAXIMUM_AGE_MS = 60_000;

export const STORAGE_STATUS_KEY = "location-app:geo-status";
export const STORAGE_PROMPTED_KEY = "location-app:geo-prompted";

export const VISIT_PERMISSIONS = [
  "granted",
  "denied",
  "prompt",
  "unsupported",
  "insecure",
  "unavailable",
  "timeout",
  "unknown",
] as const;
