// Generates the DERIVED map file `public/screens.geojson` from the raw source of
// truth `src/data/screens.json`. The map fetches this pre-built FeatureCollection
// so it never has to transform 1,600+ rows on the client.
//
//   node scripts/build-geojson.mjs
//
// Runs automatically before `next build` (see package.json "prebuild").
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { classifyImax, isValidCoord } from "./lib/screens-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "../src/data/screens.json");
const OUT = resolve(__dirname, "../public/screens.geojson");

function main() {
  const screens = JSON.parse(readFileSync(SRC, "utf8"));
  const features = [];
  let skipped = 0;

  for (const s of screens) {
    if (!isValidCoord(s.latitude, s.longitude)) {
      skipped++;
      continue;
    }
    const description = [s.city, s.state, s.country]
      .filter(Boolean)
      .join(", ");
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
      properties: {
        id: s.id,
        name: s.organization || "Unknown",
        description,
        nickname: classifyImax(s.formats),
        screenType: s.screen_type || "",
        screenSizeFt: s.screen_size_ft || "",
        formats: (s.formats || []).join(", "),
        opened: s.opened_date || "",
      },
    });
  }

  const fc = { type: "FeatureCollection", features };
  writeFileSync(OUT, JSON.stringify(fc) + "\n");
  console.log(
    `✅ Wrote ${features.length} features -> ${OUT}${
      skipped ? ` (${skipped} skipped for bad coords)` : ""
    }`
  );
}

main();
