import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MAX_JSON_BODY_BYTES } from "@/lib/location/constants";
import { isPrivateIp, lookupVisitNetwork } from "@/lib/location/ip-lookup";
import { assertLocationRateLimit } from "@/lib/location/rate-limit";
import { saveVisitorVisit } from "@/lib/location/repository";
import {
  LOCATION_COOKIE_NAME,
  getAcceptLanguage,
  getClientIp,
  getReferrer,
  getUserAgent,
  isAllowedOrigin,
  isDatabaseConfigured,
  verifyLocationSessionToken,
} from "@/lib/location/server";
import { parseVisitPayload } from "@/lib/location/validation";

export const runtime = "nodejs";

function errorResponse(status: number, error: string, retryAfterSeconds?: number) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (retryAfterSeconds) {
    headers.set("Retry-After", String(retryAfterSeconds));
  }
  return new NextResponse(JSON.stringify({ ok: false, error }), {
    status,
    headers,
  });
}

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return errorResponse(403, "Forbidden.");
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return errorResponse(415, "Unsupported media type.");
    }

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(LOCATION_COOKIE_NAME)?.value;
    if (!verifyLocationSessionToken(sessionToken)) {
      return errorResponse(403, "Missing or invalid location session.");
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_JSON_BODY_BYTES) {
      return errorResponse(413, "Request body is too large.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return errorResponse(400, "Invalid JSON.");
    }

    const payload = parseVisitPayload(parsedJson);
    if (!payload.ok) {
      return errorResponse(400, payload.error);
    }

    if (!isDatabaseConfigured()) {
      return errorResponse(503, "Location storage is not configured.");
    }

    const ipAddress = getClientIp(request);
    const rateLimit = await assertLocationRateLimit(ipAddress);
    if (!rateLimit.ok) {
      return errorResponse(
        429,
        "Too many location submissions.",
        rateLimit.retryAfterSeconds,
      );
    }

    const network = await lookupVisitNetwork({
      ip: ipAddress,
      request,
      coords: payload.data.coords,
    });

    const storedIp =
      !ipAddress || isPrivateIp(ipAddress)
        ? network.publicIp ?? ipAddress
        : ipAddress;

    await saveVisitorVisit({
      payload: payload.data,
      ipAddress: storedIp,
      userAgent: getUserAgent(request),
      referrer: getReferrer(request),
      acceptLanguage: getAcceptLanguage(request),
      network,
    });

    return NextResponse.json(
      {
        ok: true,
        network: {
          country: network.country,
          city: network.city,
          region: network.region,
          countryCode: network.countryCode,
          isp: network.isp,
          org: network.org,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to store visitor location", error);
    return errorResponse(500, "Unable to save location.");
  }
}
