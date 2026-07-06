// Append workflow: safely merge newly-discovered IMAX locations (e.g. pulled from
// a public source like OSM Overpass) into the existing dataset. Every candidate is
// validated and de-duplicated against what we already have, so a bad or repeated
// row can never corrupt the source of truth.
//
// The canonical logic lives here (used by the app + tests). The fetcher script
// `scripts/fetch-imax.mjs` mirrors this dedupe in plain JS so it can run under node.
import { validateScreen, type Screen } from "@/lib/screens";

export interface AppendReport {
  merged: Screen[];
  added: Screen[];
  duplicates: { candidate: unknown; matchedId: string }[];
  invalid: { candidate: unknown; reason: string }[];
}

/** Normalize an org name for fuzzy matching (drops "& IMAX", punctuation, case). */
export function normalizeName(name: string | null | undefined): string {
  return (name ?? "")
    .toLowerCase()
    .replace(/&\s*imax/g, "")
    .replace(/\bimax\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Stable dedupe key: normalized name + coords rounded to ~100m (3 decimals). */
export function dedupeKey(
  name: string | null | undefined,
  lat: number,
  lng: number
): string {
  return `${normalizeName(name)}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
}

/** ~metres between two coordinates (equirectangular approximation). */
function distanceMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x = toRad(bLng - aLng) * Math.cos(toRad((aLat + bLat) / 2));
  const y = toRad(bLat - aLat);
  return Math.sqrt(x * x + y * y) * R;
}

/**
 * Validate and merge candidate rows into `existing`. A candidate is a duplicate if
 * it shares a dedupe key with an existing screen, OR sits within `radiusMeters` of
 * an existing screen with a matching normalized name.
 */
export function validateAndAppend(
  existing: Screen[],
  candidates: unknown[],
  opts: { radiusMeters?: number } = {}
): AppendReport {
  const radiusMeters = opts.radiusMeters ?? 150;

  const report: AppendReport = {
    merged: [...existing],
    added: [],
    duplicates: [],
    invalid: [],
  };

  const keys = new Set(
    existing.map((s) =>
      dedupeKey(s.organization, s.latitude as number, s.longitude as number)
    )
  );

  for (const candidate of candidates) {
    const res = validateScreen(candidate);
    if (!res.ok) {
      report.invalid.push({ candidate, reason: res.reason });
      continue;
    }
    const screen = res.value;
    const lat = screen.latitude as number;
    const lng = screen.longitude as number;
    const key = dedupeKey(screen.organization, lat, lng);

    if (keys.has(key)) {
      report.duplicates.push({ candidate, matchedId: "exact-key" });
      continue;
    }

    const nearMatch = report.merged.find(
      (s) =>
        normalizeName(s.organization) === normalizeName(screen.organization) &&
        distanceMeters(
          lat,
          lng,
          s.latitude as number,
          s.longitude as number
        ) <= radiusMeters
    );
    if (nearMatch) {
      report.duplicates.push({ candidate, matchedId: nearMatch.id });
      continue;
    }

    keys.add(key);
    report.merged.push(screen);
    report.added.push(screen);
  }

  return report;
}
