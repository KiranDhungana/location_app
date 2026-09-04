import "server-only";

import { prisma } from "@/lib/db/prisma";
import { RATE_LIMIT_MAX_PER_WINDOW, RATE_LIMIT_WINDOW_MS } from "./constants";

const burstBuckets = new Map<string, number[]>();
const BURST_MAX = 2;
const BURST_WINDOW_MS = 30_000;

function pruneTimestamps(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((time) => time > cutoff);
}

function allowBurst(key: string): boolean {
  const next = pruneTimestamps(burstBuckets.get(key) ?? [], BURST_WINDOW_MS);
  if (next.length >= BURST_MAX) {
    burstBuckets.set(key, next);
    return false;
  }
  next.push(Date.now());
  burstBuckets.set(key, next);
  return true;
}

export async function assertLocationRateLimit(ipAddress: string | null): Promise<{
  ok: boolean;
  retryAfterSeconds: number;
}> {
  const key = ipAddress ?? "unknown";

  if (!allowBurst(key)) {
    return { ok: false, retryAfterSeconds: 30 };
  }

  if (!ipAddress) {
    return { ok: true, retryAfterSeconds: 0 };
  }

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recentCount = await prisma.visitorLocation.count({
    where: {
      ipAddress,
      createdAt: { gte: windowStart },
    },
  });

  if (recentCount >= RATE_LIMIT_MAX_PER_WINDOW) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
    };
  }

  return { ok: true, retryAfterSeconds: 0 };
}
