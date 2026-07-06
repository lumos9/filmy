// Framework-free core logic shared by the node scripts and their tests. The app
// runtime (src/lib/screens.ts, screens.append.ts) keeps a TypeScript copy of this
// same logic; scripts/screens.test.mjs asserts the two stay behaviourally in sync.

// Screens are described along two independent axes:
//   1. projection TYPE — Film (15/70mm) vs Digital vs Other
//   2. a GIANT-screen flag for premier large-format halls (>= 80 ft)
// so a digital-but-huge flagship (e.g. TCL Chinese, 94 ft) reads as "Digital"
// AND "giant" rather than being forced into a subjective true/lie bucket.

export const GIANT_MIN_FT = 75;

export function classifyType(formats) {
  if (!formats || formats.length === 0) return "Other";
  if (formats.includes("1570")) return "Film"; // 15/70mm film
  if (formats.some((f) => f.startsWith("D"))) return "Digital"; // D / DL / DL2 …
  return "Other";
}

/** Largest numeric dimension (ft) parsed from a screen-size string, else 0. */
export function maxScreenFt(screenSizeFt) {
  if (!screenSizeFt) return 0;
  const nums = (screenSizeFt.match(/\d+(?:\.\d+)?/g) || [])
    .map(Number)
    .filter(Number.isFinite);
  return nums.length ? Math.max(...nums) : 0;
}

export function isGiant(screenSizeFt) {
  return maxScreenFt(screenSizeFt) >= GIANT_MIN_FT;
}

export function isValidCoord(lat, lng) {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    Math.abs(lat) <= 90 &&
    typeof lng === "number" &&
    Number.isFinite(lng) &&
    Math.abs(lng) <= 180
  );
}

export function normalizeName(name) {
  return (name ?? "")
    .toLowerCase()
    .replace(/&\s*imax/g, "")
    .replace(/\bimax\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function dedupeKey(name, lat, lng) {
  return `${normalizeName(name)}|${lat.toFixed(3)}|${lng.toFixed(3)}`;
}

/** Validate + dedupe candidates against existing rows. Pure, no I/O. */
export function appendCandidates(existing, candidates) {
  const keys = new Set(
    existing.map((s) => dedupeKey(s.organization, s.latitude, s.longitude))
  );
  const added = [];
  const duplicates = [];
  const invalid = [];
  for (const c of candidates) {
    if (!c || typeof c !== "object" || typeof c.id !== "string") {
      invalid.push({ candidate: c, reason: "missing id" });
      continue;
    }
    if (!isValidCoord(c.latitude, c.longitude)) {
      invalid.push({ candidate: c, reason: "invalid coords" });
      continue;
    }
    const key = dedupeKey(c.organization, c.latitude, c.longitude);
    if (keys.has(key)) {
      duplicates.push(c);
      continue;
    }
    keys.add(key);
    added.push(c);
  }
  return { added, duplicates, invalid, merged: existing.concat(added) };
}
