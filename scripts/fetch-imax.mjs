// Sample fetcher: pulls IMAX-branded cinemas from OpenStreetMap (Overpass API),
// maps them to our screen shape, and runs them through the SAME validate + dedupe
// logic as src/lib/screens.append.ts before (optionally) appending to the raw
// source of truth. This is a demonstration of the "append from a promising source"
// workflow — point it at a better source later by swapping `fetchCandidates()`.
//
//   node scripts/fetch-imax.mjs            # dry run: report what WOULD be added
//   node scripts/fetch-imax.mjs --write    # validate, dedupe, append, rebuild geojson
//
// Notes:
//   • OSM rarely knows the IMAX format/screen size, so imported rows carry empty
//     `formats` (they classify as "Other" on the map) — enrich by hand later.
//   • Nothing is written unless --write is passed and there is at least one new,
//     valid, non-duplicate location.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dedupeKey, isValidCoord } from "./lib/screens-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, "../src/data/screens.json");
const WRITE = process.argv.includes("--write");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
// Cinemas branded/operated as IMAX, worldwide. We filter on the indexed `brand`
// and `operator` tags (fast, global) rather than a regex over `name` (which makes
// Overpass time out). Note: OSM's IMAX coverage is sparse compared to our backup,
// so this usually returns only a handful — which is exactly why the dedupe matters.
const OVERPASS_QUERY = `
[out:json][timeout:90];
(
  nwr["amenity"="cinema"]["brand"~"IMAX",i];
  nwr["amenity"="cinema"]["operator"~"IMAX",i];
);
out center tags;
`;

async function fetchCandidates() {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Overpass returns 406 without a proper UA / Accept.
      "User-Agent": "filmy-imax-map/1.0 (github.com/lumos9/filmy)",
      Accept: "application/json",
    },
    body: "data=" + encodeURIComponent(OVERPASS_QUERY),
  });
  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  const elements = Array.isArray(json.elements) ? json.elements : [];

  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      const tags = el.tags ?? {};
      if (!isValidCoord(lat, lng)) return null;
      return {
        id: randomUUID(),
        country: (tags["addr:country"] || "").toUpperCase() || null,
        state: tags["addr:state"] || tags["addr:province"] || null,
        city: tags["addr:city"] || tags["addr:town"] || null,
        organization: tags.name || tags.brand || "IMAX",
        screen_type: null,
        seats: null,
        screen_size_ft: null,
        screen_size_m: null,
        opened_date: null,
        formats: [],
        dimensions: [],
        projections: ["IMAX"],
        latitude: lat,
        longitude: lng,
      };
    })
    .filter(Boolean);
}

async function main() {
  const existing = JSON.parse(readFileSync(DATA, "utf8"));
  console.log(`📂 Existing screens: ${existing.length}`);

  console.log("🌐 Querying OSM Overpass for IMAX cinemas…");
  let candidates;
  try {
    candidates = await fetchCandidates();
  } catch (err) {
    console.error(`❌ ${err.message}`);
    console.error("   (Overpass is rate-limited/occasionally down — retry later.)");
    process.exit(1);
  }
  console.log(`🔎 Overpass returned ${candidates.length} candidate cinemas`);

  const keys = new Set(
    existing.map((s) => dedupeKey(s.organization, s.latitude, s.longitude))
  );
  const added = [];
  let duplicates = 0;
  for (const c of candidates) {
    const key = dedupeKey(c.organization, c.latitude, c.longitude);
    if (keys.has(key)) {
      duplicates++;
      continue;
    }
    keys.add(key);
    added.push(c);
  }

  console.log(
    `\n📊 Result: ${added.length} new, ${duplicates} duplicates (already known)`
  );
  if (added.length) {
    console.log("   New locations (first 10):");
    for (const a of added.slice(0, 10)) {
      console.log(
        `   • ${a.organization}  [${a.latitude.toFixed(3)}, ${a.longitude.toFixed(
          3
        )}]`
      );
    }
  }

  if (!WRITE) {
    console.log("\n💡 Dry run. Re-run with --write to append these to screens.json.");
    return;
  }
  if (!added.length) {
    console.log("\n✅ Nothing new to append.");
    return;
  }

  const merged = existing.concat(added);
  writeFileSync(DATA, JSON.stringify(merged, null, 2) + "\n");
  console.log(`\n✅ Appended ${added.length} → screens.json (now ${merged.length})`);

  console.log("🔧 Rebuilding derived geojson…");
  execFileSync("node", [resolve(__dirname, "build-geojson.mjs")], {
    stdio: "inherit",
  });
}

main();
