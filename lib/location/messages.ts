import type { LocationBannerStatus } from "./types";

export const LOCATION_STATUS_MESSAGES: Record<
  Exclude<LocationBannerStatus, "idle">,
  string
> = {
  requesting: "Checking location permission. Your browser may ask you to allow access.",
  saved: "Thanks. Your precise location was saved for this visit.",
  permission_denied:
    "Precise location is off. Country, network, and browser details were saved instead.",
  unavailable:
    "GPS was unavailable. Approximate country and network details were saved.",
  timeout:
    "GPS timed out. Approximate country and network details were saved.",
  unsupported:
    "This browser cannot share GPS. Approximate country and network details were saved.",
  insecure:
    "Precise GPS needs HTTPS or localhost. Approximate country and network details were saved.",
  save_failed:
    "We could not save visit details right now. The site still works normally.",
  rate_limited:
    "A visit was already recorded recently. The site still works normally.",
};
