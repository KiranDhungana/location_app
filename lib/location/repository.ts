import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { IpNetworkInfo, VisitPayload } from "./types";

export async function saveVisitorVisit(input: {
  payload: VisitPayload;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  acceptLanguage: string | null;
  network: IpNetworkInfo;
}): Promise<{ id: string }> {
  const { payload, network } = input;
  const hints = payload.hints;
  const screen =
    hints.screenWidth && hints.screenHeight
      ? `${hints.screenWidth}x${hints.screenHeight}${
          hints.devicePixelRatio ? `@${hints.devicePixelRatio}` : ""
        }`
      : null;

  return prisma.visitorLocation.create({
    data: {
      latitude: payload.coords?.latitude ?? null,
      longitude: payload.coords?.longitude ?? null,
      accuracy: payload.coords?.accuracy ?? null,
      permission: payload.permission,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      country: network.country,
      countryCode: network.countryCode,
      region: network.region,
      city: network.city,
      timezone: hints.timezone ?? network.timezone,
      isp: network.isp,
      org: network.org,
      asn: network.asn,
      networkType: hints.connectionType,
      networkEffectiveType: hints.connectionEffectiveType,
      languages:
        hints.languages?.join(",") ?? input.acceptLanguage,
      locale: hints.locale,
      platform: hints.platform,
      screen,
      referrer: input.referrer,
    },
    select: { id: true },
  });
}

export async function listVisitorLocations() {
  return prisma.visitorLocation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      latitude: true,
      longitude: true,
      accuracy: true,
      permission: true,
      ipAddress: true,
      country: true,
      countryCode: true,
      region: true,
      city: true,
      timezone: true,
      isp: true,
      networkEffectiveType: true,
      locale: true,
      createdAt: true,
    },
  });
}
