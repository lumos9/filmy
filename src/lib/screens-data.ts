"use client";

import type { ImaxFeatureProps } from "@/components/ImaxMap";
import type { FeatureCollection, Point } from "geojson";

export type ImaxCollection = FeatureCollection<Point, ImaxFeatureProps>;

// Module-level promise cache: the derived GeoJSON is fetched at most once per
// page session and shared across every mount (React StrictMode double-mounts,
// route re-entries, filter remounts). Repeated callers await the same promise.
let cachedPromise: Promise<ImaxCollection> | null = null;

async function fetchScreensData(): Promise<ImaxCollection> {
  // "no-cache" = still cached on disk, but revalidated via ETag on each load
  // (conditional GET → 304 when unchanged). Fresh after a deploy, cheap otherwise.
  const res = await fetch("/screens.geojson", { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load map data: ${res.status} ${res.statusText}`);
  }
  const fc = (await res.json()) as ImaxCollection;
  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    throw new Error("Map data file is malformed");
  }
  return fc;
}

/** Returns the shared screens-data promise, creating it on first call. */
export function getScreensData(): Promise<ImaxCollection> {
  if (!cachedPromise) {
    cachedPromise = fetchScreensData().catch((err) => {
      // Reset on failure so a later retry can re-fetch instead of re-throwing
      // the same rejected promise forever.
      cachedPromise = null;
      throw err;
    });
  }
  return cachedPromise;
}
