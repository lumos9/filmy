// Framework-free core logic shared by the node scripts and their tests. The app
// runtime (src/lib/screens.ts, screens.append.ts) keeps a TypeScript copy of this
// same logic; scripts/screens.test.mjs asserts the two stay behaviourally in sync.

export function classifyImax(formats) {
  if (!formats || formats.length === 0) return "Other";
  const has1570 = formats.includes("1570");
  const hasDigital = formats.some((f) => f.startsWith("D"));
  if (has1570 && hasDigital) return "Hybrid";
  if (has1570) return "True IMAX";
  if (hasDigital) return "LieMAX";
  return "Other";
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
