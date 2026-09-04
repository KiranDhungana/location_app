"use client";

import { useState } from "react";
import Image from "next/image";
import {
  collectClientHints,
  getCurrentPosition,
} from "@/lib/location/browser";
import { buildWhatsAppMessage, openWhatsApp } from "@/lib/location/whatsapp";
import type {
  LocationPayload,
  VisitPermission,
} from "@/lib/location/types";

type NetworkSummary = {
  country: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
};

async function ensureLocationSession(): Promise<boolean> {
  const response = await fetch("/api/location/session", {
    method: "GET",
    credentials: "same-origin",
  });
  return response.ok;
}

async function submitVisit(body: unknown): Promise<NetworkSummary | null> {
  const response = await fetch("/api/location", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as { network?: NetworkSummary };
  return data.network ?? null;
}

export function WhatsAppShareButton() {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    setBusy(true);
    try {
      await ensureLocationSession();

      const geo = await getCurrentPosition();
      const hints = collectClientHints();

      let coords: LocationPayload | undefined;
      let permission: VisitPermission = "denied";
      if (geo.ok) {
        coords = geo.coords;
        permission = "granted";
      } else if (geo.reason !== "permission_denied" && geo.reason !== "unknown") {
        permission = geo.reason;
      } else if (geo.reason === "unknown") {
        permission = "unknown";
      }

      const network = await submitVisit({ permission, coords, hints });

      openWhatsApp(
        buildWhatsAppMessage({
          permission,
          coords,
          hints,
          country: network?.country,
          city: network?.city,
          region: network?.region,
          isp: network?.isp,
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      disabled={busy}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 text-base font-semibold text-white shadow-sm transition hover:bg-[#1ebe5d] disabled:opacity-80"
    >
      <Image
        src="/logo.webp"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 rounded-sm"
        priority
      />
      {busy ? "Opening…" : "Send on WhatsApp"}
    </button>
  );
}
