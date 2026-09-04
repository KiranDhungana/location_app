import "server-only";

import type { IpNetworkInfo, LocationPayload } from "./types";

const lookupCache = new Map<string, { expiresAt: number; data: IpNetworkInfo }>();
const CACHE_TTL_MS = 60 * 60 * 1000;
const LOOKUP_TIMEOUT_MS = 5_000;

export function isPrivateIp(ip: string): boolean {
  const value = ip.toLowerCase().replace(/^::ffff:/, "");
  if (value === "::1" || value === "127.0.0.1" || value === "0.0.0.0") {
    return true;
  }
  if (value.startsWith("10.") || value.startsWith("192.168.") || value.startsWith("127.")) {
    return true;
  }
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) {
    return true;
  }
  if (value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80")) {
    return true;
  }
  return false;
}

function emptyInfo(): IpNetworkInfo {
  return {
    country: null,
    countryCode: null,
    region: null,
    city: null,
    timezone: null,
    isp: null,
    org: null,
    asn: null,
    publicIp: null,
  };
}

function mergeInfo(base: IpNetworkInfo, extra: Partial<IpNetworkInfo>): IpNetworkInfo {
  return {
    country: extra.country || base.country,
    countryCode: extra.countryCode || base.countryCode,
    region: extra.region || base.region,
    city: extra.city || base.city,
    timezone: extra.timezone || base.timezone,
    isp: extra.isp || base.isp,
    org: extra.org || base.org,
    asn: extra.asn || base.asn,
    publicIp: extra.publicIp || base.publicIp,
  };
}

function fromHeaders(request: Request): IpNetworkInfo {
  const countryCode =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry");
  const city =
    request.headers.get("x-vercel-ip-city") ||
    request.headers.get("cf-ipcity");
  const region =
    request.headers.get("x-vercel-ip-country-region") ||
    request.headers.get("cf-region");
  const timezone =
    request.headers.get("x-vercel-ip-timezone") ||
    request.headers.get("cf-timezone");

  return {
    country: null,
    countryCode: countryCode && countryCode !== "XX" ? countryCode.slice(0, 8) : null,
    region: region?.slice(0, 96) ?? null,
    city: city ? decodeURIComponent(city).slice(0, 96) : null,
    timezone: timezone?.slice(0, 64) ?? null,
    isp: null,
    org: null,
    asn: null,
    publicIp: null,
  };
}

async function lookupIpWho(ip?: string | null): Promise<IpNetworkInfo | null> {
  const path = ip ? `/${encodeURIComponent(ip)}` : "/";
  const response = await fetch(`https://ipwho.is${path}`, {
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    success?: boolean;
    ip?: string;
    country?: string;
    country_code?: string;
    region?: string;
    city?: string;
    timezone?: { id?: string };
    connection?: { isp?: string; org?: string; asn?: number };
  };

  if (data.success === false) {
    return null;
  }

  return {
    country: data.country?.slice(0, 64) ?? null,
    countryCode: data.country_code?.slice(0, 8) ?? null,
    region: data.region?.slice(0, 96) ?? null,
    city: data.city?.slice(0, 96) ?? null,
    timezone: data.timezone?.id?.slice(0, 64) ?? null,
    isp: data.connection?.isp?.slice(0, 128) ?? null,
    org: data.connection?.org?.slice(0, 128) ?? null,
    asn: data.connection?.asn != null ? `AS${data.connection.asn}` : null,
    publicIp: data.ip && !isPrivateIp(data.ip) ? data.ip.slice(0, 45) : null,
  };
}

async function reverseGeocode(coords: LocationPayload): Promise<Partial<IpNetworkInfo> | null> {
  const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
  url.searchParams.set("latitude", String(coords.latitude));
  url.searchParams.set("longitude", String(coords.longitude));
  url.searchParams.set("localityLanguage", "en");

  const response = await fetch(url, {
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    countryName?: string;
    countryCode?: string;
    principalSubdivision?: string;
    city?: string;
    locality?: string;
  };

  const city = data.city || data.locality;
  return {
    country: data.countryName?.slice(0, 64) ?? null,
    countryCode: data.countryCode?.slice(0, 8) ?? null,
    region: data.principalSubdivision?.slice(0, 96) ?? null,
    city: city?.slice(0, 96) ?? null,
  };
}

async function lookupIpNetworkFromIp(
  ip: string | null,
  request: Request,
): Promise<IpNetworkInfo> {
  const headerInfo = fromHeaders(request);
  const cacheKey = ip && !isPrivateIp(ip) ? ip : "self";
  const cached = lookupCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return mergeInfo(headerInfo, cached.data);
  }

  try {
    const lookedUp =
      ip && !isPrivateIp(ip) ? await lookupIpWho(ip) : await lookupIpWho(null);
    const merged = mergeInfo(headerInfo, lookedUp ?? emptyInfo());
    lookupCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data: merged,
    });
    return merged;
  } catch {
    return headerInfo;
  }
}

export async function lookupVisitNetwork(input: {
  ip: string | null;
  request: Request;
  coords?: LocationPayload;
}): Promise<IpNetworkInfo> {
  const [ipInfo, placeInfo] = await Promise.all([
    lookupIpNetworkFromIp(input.ip, input.request),
    input.coords ? reverseGeocode(input.coords).catch(() => null) : Promise.resolve(null),
  ]);

  return mergeInfo(ipInfo, placeInfo ?? {});
}
