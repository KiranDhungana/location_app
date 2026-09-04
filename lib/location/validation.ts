import { VISIT_PERMISSIONS } from "./constants";
import type { ClientHints, LocationPayload, VisitPayload } from "./types";

const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;
const ACCURACY_MIN = 0;
const ACCURACY_MAX = 500_000;
const TIMESTAMP_MAX_FUTURE_MS = 5 * 60 * 1000;
const TIMESTAMP_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const ALLOWED_KEYS = new Set(["permission", "coords", "hints"]);
const COORD_KEYS = new Set(["latitude", "longitude", "accuracy", "timestamp"]);

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOptionalString(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) {
    return undefined;
  }
  return trimmed;
}

function parseCoords(
  value: unknown,
): { ok: true; data: LocationPayload } | { ok: false; error: string } {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Invalid coordinates." };
  }

  for (const key of Object.keys(value)) {
    if (!COORD_KEYS.has(key)) {
      return { ok: false, error: "Request contains unsupported fields." };
    }
  }

  const { latitude, longitude, accuracy, timestamp } = value;

  if (!isFiniteNumber(latitude) || latitude < LATITUDE_MIN || latitude > LATITUDE_MAX) {
    return { ok: false, error: "Invalid latitude." };
  }

  if (
    !isFiniteNumber(longitude) ||
    longitude < LONGITUDE_MIN ||
    longitude > LONGITUDE_MAX
  ) {
    return { ok: false, error: "Invalid longitude." };
  }

  if (
    !isFiniteNumber(accuracy) ||
    accuracy < ACCURACY_MIN ||
    accuracy > ACCURACY_MAX
  ) {
    return { ok: false, error: "Invalid accuracy." };
  }

  if (!isFiniteNumber(timestamp)) {
    return { ok: false, error: "Invalid timestamp." };
  }

  const now = Date.now();
  if (timestamp > now + TIMESTAMP_MAX_FUTURE_MS) {
    return { ok: false, error: "Timestamp is in the future." };
  }
  if (timestamp < now - TIMESTAMP_MAX_AGE_MS) {
    return { ok: false, error: "Timestamp is too old." };
  }

  return {
    ok: true,
    data: { latitude, longitude, accuracy, timestamp },
  };
}

function parseHints(value: unknown): ClientHints {
  if (!isPlainObject(value)) {
    return {};
  }

  const hints: ClientHints = {};

  hints.timezone = parseOptionalString(value.timezone, 64);
  hints.locale = parseOptionalString(value.locale, 32);
  hints.platform = parseOptionalString(value.platform, 64);
  hints.connectionType = parseOptionalString(value.connectionType, 32);
  hints.connectionEffectiveType = parseOptionalString(
    value.connectionEffectiveType,
    16,
  );

  if (Array.isArray(value.languages)) {
    const languages = value.languages
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length <= 16)
      .slice(0, 8);
    if (languages.length > 0) {
      hints.languages = languages;
    }
  }

  if (isFiniteNumber(value.downlinkMbps) && value.downlinkMbps >= 0 && value.downlinkMbps <= 10_000) {
    hints.downlinkMbps = value.downlinkMbps;
  }
  if (isFiniteNumber(value.rttMs) && value.rttMs >= 0 && value.rttMs <= 10_000) {
    hints.rttMs = value.rttMs;
  }
  if (typeof value.saveData === "boolean") {
    hints.saveData = value.saveData;
  }
  if (isFiniteNumber(value.screenWidth) && value.screenWidth > 0 && value.screenWidth <= 16_000) {
    hints.screenWidth = Math.round(value.screenWidth);
  }
  if (isFiniteNumber(value.screenHeight) && value.screenHeight > 0 && value.screenHeight <= 16_000) {
    hints.screenHeight = Math.round(value.screenHeight);
  }
  if (
    isFiniteNumber(value.devicePixelRatio) &&
    value.devicePixelRatio > 0 &&
    value.devicePixelRatio <= 8
  ) {
    hints.devicePixelRatio = value.devicePixelRatio;
  }

  return hints;
}

export function parseVisitPayload(
  value: unknown,
): { ok: true; data: VisitPayload } | { ok: false; error: string } {
  if (!isPlainObject(value)) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  for (const key of Object.keys(value)) {
    if (!ALLOWED_KEYS.has(key)) {
      return { ok: false, error: "Request contains unsupported fields." };
    }
  }

  if (
    typeof value.permission !== "string" ||
    !(VISIT_PERMISSIONS as readonly string[]).includes(value.permission)
  ) {
    return { ok: false, error: "Invalid permission state." };
  }

  let coords: LocationPayload | undefined;
  if (value.coords !== undefined) {
    if (value.permission !== "granted") {
      return { ok: false, error: "Precise coordinates require granted permission." };
    }
    const parsedCoords = parseCoords(value.coords);
    if (!parsedCoords.ok) {
      return parsedCoords;
    }
    coords = parsedCoords.data;
  }

  return {
    ok: true,
    data: {
      permission: value.permission as VisitPayload["permission"],
      coords,
      hints: parseHints(value.hints),
    },
  };
}
