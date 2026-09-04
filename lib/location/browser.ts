import {
  GEO_MAXIMUM_AGE_MS,
  GEO_TIMEOUT_MS,
} from "./constants";
import type { ClientHints, GeoResult } from "./types";

type NetworkConnection = {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
};

export function collectClientHints(): ClientHints {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {};
  }

  const nav = navigator as Navigator & {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
    userAgentData?: { platform?: string };
  };
  const connection =
    nav.connection || nav.mozConnection || nav.webkitConnection;

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: Array.from(navigator.languages ?? []).slice(0, 8),
    locale: navigator.language,
    platform: nav.userAgentData?.platform || navigator.platform,
    connectionType: connection?.type,
    connectionEffectiveType: connection?.effectiveType,
    downlinkMbps: connection?.downlink,
    rttMs: connection?.rtt,
    saveData: connection?.saveData,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    devicePixelRatio: window.devicePixelRatio,
  };
}

export async function queryGeolocationPermission(): Promise<
  PermissionState | "unknown"
> {
  try {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      return "unknown";
    }

    const status = await navigator.permissions.query({
      name: "geolocation",
    });
    return status.state;
  } catch {
    return "unknown";
  }
}

export function getCurrentPosition(): Promise<GeoResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }

  if (typeof window !== "undefined" && !window.isSecureContext) {
    return Promise.resolve({ ok: false, reason: "insecure" });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          },
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            resolve({ ok: false, reason: "permission_denied" });
            break;
          case error.POSITION_UNAVAILABLE:
            resolve({ ok: false, reason: "unavailable" });
            break;
          case error.TIMEOUT:
            resolve({ ok: false, reason: "timeout" });
            break;
          default:
            resolve({ ok: false, reason: "unknown" });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: GEO_MAXIMUM_AGE_MS,
      },
    );
  });
}
