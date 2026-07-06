// Single source of truth for IMAX screen data.
//
// The app used to read this from Supabase; that DB is retired. Data now lives in
// a committed local file (`src/data/screens.json`, the *raw* source of truth) which
// is loaded and validated here. A derived GeoJSON file (`src/data/screens.geojson`)
// is generated from the raw file by `scripts/build-geojson.mjs` for fast map loads.
//
// To update the data: edit screens.json (or use `validateAndAppend`), then run
// `node scripts/build-geojson.mjs` to regenerate the derived map file.
import type { Database } from "@/lib/database.types";
import rawScreens from "@/data/screens.json";

export type Screen = Database["public"]["Tables"]["screens"]["Row"];

export type ScreenCategory = "Film" | "Digital" | "Other";

/** Screens described independently by projection type and a giant-screen flag. */
export const GIANT_MIN_FT = 75;

/** Result of validating an arbitrary list of candidate rows. */
export interface ValidationResult {
  valid: Screen[];
  invalid: { row: unknown; reason: string }[];
}

const STRING_FIELDS = [
  "id",
  "country",
  "state",
  "city",
  "organization",
  "screen_type",
  "screen_size_ft",
  "screen_size_m",
  "opened_date",
] as const;

const ARRAY_FIELDS = ["formats", "dimensions", "projections"] as const;

/**
 * Validate one candidate object into a `Screen`, or return a reason it failed.
 * Coordinates are required and range-checked so bad rows can never reach the map.
 */
export function validateScreen(
  row: unknown
): { ok: true; value: Screen } | { ok: false; reason: string } {
  if (typeof row !== "object" || row === null) {
    return { ok: false, reason: "not an object" };
  }
  const r = row as Record<string, unknown>;

  if (typeof r.id !== "string" || r.id.trim() === "") {
    return { ok: false, reason: "missing id" };
  }

  const lat = r.latitude;
  const lng = r.longitude;
  if (typeof lat !== "number" || !Number.isFinite(lat) || Math.abs(lat) > 90) {
    return { ok: false, reason: `invalid latitude: ${String(lat)}` };
  }
  if (typeof lng !== "number" || !Number.isFinite(lng) || Math.abs(lng) > 180) {
    return { ok: false, reason: `invalid longitude: ${String(lng)}` };
  }

  const value: Screen = {
    id: r.id,
    country: null,
    state: null,
    city: null,
    organization: null,
    screen_type: null,
    seats: null,
    screen_size_ft: null,
    screen_size_m: null,
    opened_date: null,
    formats: [],
    dimensions: [],
    projections: [],
    latitude: lat,
    longitude: lng,
  };

  for (const key of STRING_FIELDS) {
    if (key === "id") continue;
    const v = r[key];
    if (v == null) continue;
    if (typeof v !== "string") {
      return { ok: false, reason: `${key} must be a string` };
    }
    (value as Record<string, unknown>)[key] = v;
  }

  if (r.seats != null) {
    if (typeof r.seats !== "number" || !Number.isFinite(r.seats)) {
      return { ok: false, reason: "seats must be a number" };
    }
    value.seats = r.seats;
  }

  for (const key of ARRAY_FIELDS) {
    const v = r[key];
    if (v == null) continue;
    if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) {
      return { ok: false, reason: `${key} must be a string[]` };
    }
    (value as Record<string, unknown>)[key] = v as string[];
  }

  return { ok: true, value };
}

/** Validate a batch, partitioning into valid screens and rejected rows. */
export function validateScreens(rows: unknown[]): ValidationResult {
  const valid: Screen[] = [];
  const invalid: { row: unknown; reason: string }[] = [];
  for (const row of rows) {
    const res = validateScreen(row);
    if (res.ok) valid.push(res.value);
    else invalid.push({ row, reason: res.reason });
  }
  return { valid, invalid };
}

let cache: Screen[] | null = null;

/**
 * Load the validated screen dataset. This is the default data source for the app.
 * Invalid rows are dropped and logged rather than throwing, so one bad edit to
 * the data file can never take the whole page down.
 */
export function loadScreens(): Screen[] {
  if (cache) return cache;
  const { valid, invalid } = validateScreens(rawScreens as unknown[]);
  if (invalid.length > 0) {
    console.warn(
      `⚠️  screens.json: dropped ${invalid.length} invalid row(s):`,
      invalid.slice(0, 5).map((i) => i.reason)
    );
  }
  cache = valid;
  return valid;
}

/** Classify a screen by projection type from its formats. */
export function classifyType(
  formats: string[] | null | undefined
): ScreenCategory {
  if (!formats || formats.length === 0) return "Other";
  if (formats.includes("1570")) return "Film"; // 15/70mm film
  if (formats.some((f) => f.startsWith("D"))) return "Digital"; // D / DL / DL2 …
  return "Other";
}

/** Largest numeric dimension (ft) parsed from a screen-size string, else 0. */
export function maxScreenFt(screenSizeFt: string | null | undefined): number {
  if (!screenSizeFt) return 0;
  const nums = (screenSizeFt.match(/\d+(?:\.\d+)?/g) || [])
    .map(Number)
    .filter(Number.isFinite);
  return nums.length ? Math.max(...nums) : 0;
}

export function isGiant(screenSizeFt: string | null | undefined): boolean {
  return maxScreenFt(screenSizeFt) >= GIANT_MIN_FT;
}
