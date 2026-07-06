// Build-time scraper: pulls the latest films-per-camera from ShotOnWhat and writes
// src/data/camera-movies.scraped.json. The API route MERGES this over the curated
// CAMERA_MOVIES list (union), so:
//   • new films (e.g. 2024/2025) get picked up automatically on each deploy,
//   • if a scrape fails or a camera has no match, the curated list still stands.
//
//   node scripts/scrape-cameras.mjs
//
// Runs at build time only (prebuild) — never at request time. Polite: identifies
// itself, throttles, and tolerates failures per-page.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CURATED_TS = resolve(__dirname, "../src/lib/camerasAndMovies.ts");
const OUT = resolve(__dirname, "../src/data/camera-movies.scraped.json");

const BASE = "https://shotonwhat.com";
const INDEX = `${BASE}/browse-index/cameras`;
const UA = "filmy-camera-updater/1.0 (+https://github.com/lumos9/filmy)";
const DELAY_MS = 800;
const REQ_TIMEOUT_MS = 20000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

/** Our camera names, read straight from the curated source of truth. */
function readOurCameras() {
  const ts = readFileSync(CURATED_TS, "utf8");
  const names = [];
  const re = /^\s{2}"([^"]+)":\s*\[/gm; // top-level keys are 2-space indented
  let m;
  while ((m = re.exec(ts))) names.push(m[1]);
  return names;
}

/** Normalize a camera name to comparable tokens (drop resolution/format noise). */
function tokens(name) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // drop parentheticals like "(2-perf)"
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter(
      (t) =>
        !["camera", "cameras", "the", "vv", "series", "modified"].includes(t) &&
        !/^\d+k$/.test(t) // resolution tokens: 6k, 8k, 12k
    );
}

/** Score how well a ShotOnWhat name covers our camera's key tokens (0..1). */
function matchScore(ours, sow) {
  const a = tokens(ours);
  const b = new Set(tokens(sow));
  if (!a.length) return 0;
  const covered = a.filter((t) => b.has(t)).length;
  return covered / a.length;
}

function parseIndex(html) {
  const $ = cheerio.load(html);
  const cams = [];
  $('a[href*="/cameras/"]').each((i, e) => {
    const href = $(e).attr("href") || "";
    const name = $(e).text().trim();
    if (!name || /browse-index/.test(href)) return;
    const url = href.startsWith("http") ? href : `${BASE}${href}`;
    cams.push({ name, url });
  });
  // dedupe by url
  const seen = new Set();
  return cams.filter((c) => (seen.has(c.url) ? false : (seen.add(c.url), true)));
}

function parseFilms(html) {
  const $ = cheerio.load(html);
  const re = /^(.+?)\s*\((?:19|20)\d{2}\)$/;
  const films = new Set();
  $("h2").each((i, e) => {
    const t = $(e).text().trim().replace(/\s+/g, " ");
    const m = t.match(re);
    if (m) {
      const title = m[1].trim();
      if (title.length > 1 && !/^\d+\s+titles?$/i.test(title)) films.add(title);
    }
  });
  return [...films];
}

async function main() {
  const ours = readOurCameras();
  console.log(`📋 ${ours.length} curated cameras to enrich`);

  console.log("🌐 Fetching ShotOnWhat camera index…");
  let index;
  try {
    index = parseIndex(await get(INDEX));
  } catch (err) {
    // Preserve the last committed scrape rather than wiping it on a transient
    // build-time failure. The route still merges curated as a fallback.
    console.error(`❌ Index fetch failed (${err.message}). Keeping existing scraped file.`);
    return;
  }
  console.log(`   index has ${index.length} ShotOnWhat cameras`);

  const scraped = {};
  let matched = 0;
  let totalFilms = 0;

  for (const cam of ours) {
    // Best ShotOnWhat page(s): top match if it covers all our key tokens.
    const ranked = index
      .map((c) => ({ ...c, score: matchScore(cam, c.name) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score < 1) {
      continue; // no confident match → curated stands
    }
    // include ties (same top score) so "LF / Mini LF"-style splits are covered
    const picks = ranked.filter((c) => c.score === best.score).slice(0, 3);

    const films = new Set();
    for (const p of picks) {
      try {
        await sleep(DELAY_MS);
        for (const f of parseFilms(await get(p.url))) films.add(f);
      } catch (err) {
        console.warn(`   ⚠️  ${cam} ← ${p.url}: ${err.message}`);
      }
    }
    if (films.size) {
      scraped[cam] = [...films];
      matched++;
      totalFilms += films.size;
      console.log(`   ✓ ${cam} ← ${picks.map((p) => p.name).join(" + ")} (${films.size} films)`);
    }
  }

  writeFileSync(
    OUT,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), cameras: scraped },
      null,
      2
    ) + "\n"
  );
  console.log(
    `\n✅ Scraped ${matched}/${ours.length} cameras, ${totalFilms} film entries -> ${OUT}`
  );
}

main().catch((err) => {
  // Never fail the build and never wipe the last-good scrape — the route merges
  // curated titles as a deterministic fallback regardless.
  console.error("❌ Scrape failed:", err.message, "— keeping existing scraped file.");
  process.exit(0);
});
