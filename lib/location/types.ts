import { VISIT_PERMISSIONS } from "./constants";

export type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
};

export type VisitPermission = (typeof VISIT_PERMISSIONS)[number];

export type ClientHints = {
  timezone?: string;
  languages?: string[];
  locale?: string;
  platform?: string;
  connectionType?: string;
  connectionEffectiveType?: string;
  downlinkMbps?: number;
  rttMs?: number;
  saveData?: boolean;
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
};

export type VisitPayload = {
  permission: VisitPermission;
  coords?: LocationPayload;
  hints: ClientHints;
};

export type GeoFailureReason =
  | "unsupported"
  | "insecure"
  | "permission_denied"
  | "unavailable"
  | "timeout"
  | "unknown";

export type LocationBannerStatus =
  | "idle"
  | "requesting"
  | "saved"
  | "permission_denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "insecure"
  | "save_failed"
  | "rate_limited";

export type GeoSuccess = {
  ok: true;
  coords: LocationPayload;
};

export type GeoFailure = {
  ok: false;
  reason: GeoFailureReason;
};

export type GeoResult = GeoSuccess | GeoFailure;

export type IpNetworkInfo = {
  country: string | null;
  countryCode: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  isp: string | null;
  org: string | null;
  asn: string | null;
  publicIp?: string | null;
};
