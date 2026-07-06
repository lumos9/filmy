// One-time (repeatable) importer: parses the `public.screens` COPY block out of a
// PostgreSQL plain-text dump and writes it to src/data/screens.json (the raw source
// of truth). Re-run whenever a fresh dump is exported.
//
//   node scripts/import-backup.mjs [path-to-dump.backup]
//
// Then run `node scripts/build-geojson.mjs` to regenerate the derived map file.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/screens.json");

const DEFAULT_DUMP =
  "/Users/jsparrow/Downloads/db_cluster-24-09-2025@07-20-02.backup";
const dumpPath = process.argv[2] || DEFAULT_DUMP;

// Column order as it appears in the COPY statement.
const COLUMNS = [
  "id",
  "country",
  "state",
  "city",
  "organization",
  "screen_type",
  "seats",
  "screen_size_ft",
  "screen_size_m",
  "opened_date",
  "formats",
  "dimensions",
  "projections",
  "created_at",
  "updated_at",
  "latitude",
  "longitude",
];

const ARRAY_COLS = new Set(["formats", "dimensions", "projections"]);
const NUM_COLS = new Set(["seats", "latitude", "longitude"]);

/** Parse a Postgres text-format array literal e.g. "{1570,D}" -> ["1570","D"]. */
function parsePgArray(raw) {
  if (raw === "\\N" || raw === "" || raw === "{}") return [];
  const inner = raw.replace(/^\{/, "").replace(/\}$/, "");
  if (inner === "") return [];
  // Handle quoted elements that may contain commas.
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function parseField(col, raw) {
  if (raw === "\\N") return ARRAY_COLS.has(col) ? [] : null;
  if (ARRAY_COLS.has(col)) return parsePgArray(raw);
  if (NUM_COLS.has(col)) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  // Un-escape the handful of COPY escapes we might see.
  return raw
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\\\/g, "\\");
}

function main() {
  const text = readFileSync(dumpPath, "utf8");
  const lines = text.split("\n");

  const startIdx = lines.findIndex((l) =>
    l.startsWith("COPY public.screens (")
  );
  if (startIdx === -1) {
    throw new Error("Could not find `COPY public.screens` block in dump");
  }

  const rows = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === "\\.") break; // end of COPY block
    if (line === "") continue;
    const fields = line.split("\t");
    if (fields.length !== COLUMNS.length) {
      console.warn(
        `⚠️  line ${i + 1}: expected ${COLUMNS.length} fields, got ${
          fields.length
        } — skipping`
      );
      continue;
    }
    const row = {};
    COLUMNS.forEach((col, idx) => {
      row[col] = parseField(col, fields[idx]);
    });
    rows.push(row);
  }

  // Drop the audit timestamps — the local file doesn't need them.
  const cleaned = rows.map(({ created_at, updated_at, ...rest }) => rest);

  writeFileSync(OUT, JSON.stringify(cleaned, null, 2) + "\n");
  const withCoords = cleaned.filter(
    (r) => typeof r.latitude === "number" && typeof r.longitude === "number"
  ).length;
  console.log(`✅ Imported ${cleaned.length} screens -> ${OUT}`);
  console.log(`   ${withCoords} have valid coordinates`);
}

main();
