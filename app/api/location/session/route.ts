import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  LOCATION_COOKIE_NAME,
  createLocationSessionToken,
  isSecureRequest,
  locationCookieOptions,
  verifyLocationSessionToken,
} from "@/lib/location/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const existing = cookieStore.get(LOCATION_COOKIE_NAME)?.value;

    if (verifyLocationSessionToken(existing)) {
      return NextResponse.json({ ok: true });
    }

    const token = createLocationSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      LOCATION_COOKIE_NAME,
      token,
      locationCookieOptions(isSecureRequest(request)),
    );
    return response;
  } catch (error) {
    console.error("Failed to issue location session", error);
    return NextResponse.json(
      { ok: false, error: "Unable to start a location session." },
      { status: 500 },
    );
  }
}
