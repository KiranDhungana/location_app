import type { ClientHints, LocationPayload, VisitPermission } from "./types";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildWhatsAppMessage(input: {
  permission: VisitPermission;
  coords?: LocationPayload;
  hints: ClientHints;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  isp?: string | null;
}): string {
  const lines = [
    "Click me to connect me on WhatsApp",
    "",
  ];

  if (input.coords) {
    const { latitude, longitude, accuracy } = input.coords;
    lines.push(
      `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${Math.round(accuracy)}m)`,
    );
    lines.push(`Map: https://maps.google.com/?q=${latitude},${longitude}`);
  } else {
    lines.push("GPS: not shared");
  }

  const place = [input.city, input.region, input.country].filter(Boolean);
  if (place.length > 0) {
    lines.push(`Place: ${place.join(", ")}`);
  }
  if (input.isp) {
    lines.push(`Network: ${input.isp}`);
  }
  if (input.hints.connectionEffectiveType || input.hints.connectionType) {
    lines.push(
      `Connection: ${input.hints.connectionEffectiveType || input.hints.connectionType}`,
    );
  }
  if (input.hints.timezone) {
    lines.push(`Timezone: ${input.hints.timezone}`);
  }
  if (input.hints.locale) {
    lines.push(`Language: ${input.hints.locale}`);
  }
  lines.push(`Location permission: ${input.permission}`);
  lines.push(`Time: ${new Date().toISOString()}`);

  return lines.join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  const number = digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "");
  const text = encodeURIComponent(message);
  if (number) {
    return `https://wa.me/${number}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export function openWhatsApp(message: string): void {
  const url = buildWhatsAppUrl(message);
  window.location.assign(url);
}
