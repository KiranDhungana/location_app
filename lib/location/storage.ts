import { STORAGE_PROMPTED_KEY, STORAGE_STATUS_KEY } from "./constants";
import type { LocationBannerStatus } from "./types";

const STORED_STATUSES = new Set<LocationBannerStatus>([
  "saved",
  "permission_denied",
  "unavailable",
  "timeout",
  "unsupported",
  "insecure",
  "save_failed",
  "rate_limited",
]);

function canUseSessionStorage(): boolean {
  try {
    return typeof window !== "undefined" && Boolean(window.sessionStorage);
  } catch {
    return false;
  }
}

export function readStoredStatus(): LocationBannerStatus | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const value = sessionStorage.getItem(STORAGE_STATUS_KEY);
  if (value && STORED_STATUSES.has(value as LocationBannerStatus)) {
    return value as LocationBannerStatus;
  }
  return null;
}

export function storeStatus(status: LocationBannerStatus): void {
  if (!canUseSessionStorage()) {
    return;
  }
  sessionStorage.setItem(STORAGE_STATUS_KEY, status);
}

export function hasPromptedThisSession(): boolean {
  if (!canUseSessionStorage()) {
    return false;
  }
  return sessionStorage.getItem(STORAGE_PROMPTED_KEY) === "1";
}

export function markPromptedThisSession(): void {
  if (!canUseSessionStorage()) {
    return;
  }
  sessionStorage.setItem(STORAGE_PROMPTED_KEY, "1");
}

export function clearSessionLocationState(): void {
  if (!canUseSessionStorage()) {
    return;
  }
  sessionStorage.removeItem(STORAGE_STATUS_KEY);
  sessionStorage.removeItem(STORAGE_PROMPTED_KEY);
}
