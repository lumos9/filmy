// Run with: npm test  (node --test)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  classifyType,
  maxScreenFt,
  isGiant,
  isValidCoord,
  normalizeName,
  dedupeKey,
  appendCandidates,
} from "./lib/screens-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const screens = JSON.parse(
  readFileSync(resolve(__dirname, "../src/data/screens.json"), "utf8")
);
const geojson = JSON.parse(
  readFileSync(resolve(__dirname, "../public/screens.geojson"), "utf8")
);

const CATEGORIES = new Set(["Film", "Digital", "Other"]);

test("classifyType maps formats to projection type", () => {
  assert.equal(classifyType(["1570"]), "Film");
  // 15/70mm film + a digital projector is still Film.
  assert.equal(classifyType(["1570", "D"]), "Film");
  assert.equal(classifyType(["DL2"]), "Digital");
  assert.equal(classifyType(["D"]), "Digital");
  assert.equal(classifyType(["870"]), "Other");
  assert.equal(classifyType([]), "Other");
  assert.equal(classifyType(null), "Other");
});

test("maxScreenFt / isGiant parse screen sizes", () => {
  assert.equal(maxScreenFt("46.0 x 94.0 ft."), 94);
  assert.equal(maxScreenFt("78.8 ft."), 78.8);
  assert.equal(maxScreenFt(""), 0);
  assert.equal(maxScreenFt(null), 0);
  assert.equal(isGiant("46.0 x 94.0 ft."), true); // TCL Chinese
  assert.equal(isGiant("27.0 x 50.0 ft."), false); // small multiplex
  assert.equal(isGiant("58.2 x 79.0 ft."), true); // Universal CityWalk (79ft)
  assert.equal(isGiant("75.0 ft."), true); // boundary (>= 75)
  assert.equal(isGiant("60.0 x 74.0 ft."), false); // just under
});

test("isValidCoord range-checks lat/lng", () => {
  assert.ok(isValidCoord(40.7, -74));
  assert.ok(!isValidCoord(91, 0));
  assert.ok(!isValidCoord(0, 181));
  assert.ok(!isValidCoord("40", 0));
  assert.ok(!isValidCoord(NaN, 0));
});

test("normalizeName strips IMAX branding + punctuation", () => {
  assert.equal(
    normalizeName("Scotiabank Toronto & IMAX"),
    normalizeName("Scotiabank Toronto")
  );
  assert.equal(normalizeName("CineplexX  Graz!"), "cineplexx graz");
});

test("raw dataset invariants", () => {
  assert.ok(screens.length >= 1600, "expected the full dataset");
  const ids = new Set();
  for (const s of screens) {
    assert.equal(typeof s.id, "string");
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    assert.ok(
      isValidCoord(s.latitude, s.longitude),
      `bad coords for ${s.organization}`
    );
    assert.ok(Array.isArray(s.formats));
  }
});

test("derived geojson matches raw + is well-formed", () => {
  assert.equal(geojson.type, "FeatureCollection");
  assert.equal(geojson.features.length, screens.length);
  for (const f of geojson.features) {
    assert.equal(f.geometry.type, "Point");
    const [lng, lat] = f.geometry.coordinates;
    assert.ok(isValidCoord(lat, lng));
    assert.ok(CATEGORIES.has(f.properties.category));
    assert.equal(typeof f.properties.giant, "boolean");
    assert.equal(typeof f.properties.id, "string");
    assert.equal(typeof f.properties.name, "string");
  }
});

test("appendCandidates dedupes exact + rejects invalid", () => {
  const existing = [
    { id: "a", organization: "Scotiabank Toronto & IMAX", latitude: 43.6487, longitude: -79.3912 },
  ];
  const candidates = [
    // duplicate: same place, name without "& IMAX", coords within rounding
    { id: "dup", organization: "Scotiabank Toronto", latitude: 43.6487, longitude: -79.3912 },
    // genuinely new
    { id: "new", organization: "Melbourne Museum IMAX", latitude: -37.8032, longitude: 144.9717 },
    // invalid coords
    { id: "bad", organization: "Nowhere", latitude: 999, longitude: 0 },
    // missing id
    { organization: "No Id", latitude: 1, longitude: 1 },
  ];
  const res = appendCandidates(existing, candidates);
  assert.equal(res.added.length, 1);
  assert.equal(res.added[0].id, "new");
  assert.equal(res.duplicates.length, 1);
  assert.equal(res.invalid.length, 2);
  assert.equal(res.merged.length, 2);
});

test("dedupeKey is stable to branding/precision differences", () => {
  assert.equal(
    dedupeKey("Foo & IMAX", 12.34567, 76.54321),
    dedupeKey("Foo", 12.3456, 76.5432)
  );
});
