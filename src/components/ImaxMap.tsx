"use client";

import { Badge } from "@/components/ui/badge";
import { Map, MapControls, MapPopup, useMap } from "@/components/ui/map";
import { Tilt } from "@/components/unlumen-ui/tilt";
import { formatNumberHuman } from "@/lib/utils";
import { GIANT_MIN_FT, type ScreenCategory } from "@/lib/screens";
import type { Feature, FeatureCollection, Point } from "geojson";
import { CalendarDays, ExternalLink, MapPin, Ruler, Sparkles, X } from "lucide-react";
import type * as maplibre from "maplibre-gl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Properties baked into each feature by scripts/build-geojson.mjs. */
export interface ImaxFeatureProps {
  id: string;
  name: string;
  description: string;
  category: ScreenCategory;
  giant: boolean;
  screenType: string;
  screenSizeFt: string;
  formats: string;
  opened: string;
}

type ImaxFeature = Feature<Point, ImaxFeatureProps>;
type ImaxCollection = FeatureCollection<Point, ImaxFeatureProps>;

const CATEGORIES = ["All", "Film", "Digital", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

const LABELS: Record<Category, string> = {
  All: "All",
  Film: "Film · 70mm",
  Digital: "Digital",
  Other: "Other",
};

const COLORS: Record<ScreenCategory, string> = {
  Film: "#1E90FF", // blue — 15/70mm film
  Digital: "#FF4500", // orange — digital IMAX
  Other: "#FFD700", // gold — non-standard
};

// Giant-screen marker colour (amber ring), independent of projection type.
const GIANT_COLOR = "#FBBF24";

const CAT_DESCRIPTIONS: Record<ScreenCategory, string> = {
  Film: "15/70mm film IMAX (1570) — genuine large-format film projection",
  Digital: "Digital IMAX (D / DL / DL2 …) — laser or xenon digital projection",
  Other: "No recognized IMAX format — legacy, dome, or non-IMAX setups",
};

// Esri raster basemaps — satellite in light mode, dark-gray canvas in dark mode.
// Full StyleSpecification objects handed straight to mapcn's <Map styles=...>.
const LIGHT_STYLE: maplibre.StyleSpecification = {
  version: 8,
  sources: {
    base: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri, Maxar, Earthstar Geographics",
    },
    labels: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "© Esri",
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#000000" } },
    { id: "base", type: "raster", source: "base", paint: { "raster-opacity": 1 } },
    { id: "labels", type: "raster", source: "labels", paint: { "raster-opacity": 0.8 } },
  ],
};

// CARTO "dark matter": a near-black vector basemap with crisp country/admin
// boundaries and subtle place labels — far darker and better-defined than the
// grey Esri canvas. A vector style, so it stays sharp at every zoom on the globe.
const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const COLOR_MATCH: maplibre.ExpressionSpecification = [
  "match",
  ["get", "category"],
  "Film",
  COLORS.Film,
  "Digital",
  COLORS.Digital,
  COLORS.Other, // default
];

/**
 * Renders the theater dots as a single GeoJSON circle layer (fast for thousands
 * of points — one layer, not per-point markers). Uses the raw MapLibre instance
 * via mapcn's `useMap()` escape hatch. Re-adds itself after theme/style reloads.
 */
const SOURCE = "imax-points";
const LAYER = "imax-points-circles";
const GIANT_LAYER = "imax-giant-rings";

function ImaxPointsLayer({
  data,
  onSelect,
}: {
  data: ImaxCollection;
  onSelect: (f: ImaxFeature) => void;
}) {
  const { map, isLoaded } = useMap();
  const dataRef = useRef(data);
  dataRef.current = data;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Add the source + circle layer + interactions once the map/style is ready.
  // Keyed on `isLoaded` so it re-adds itself after a theme switch reloads the
  // style (MapLibre drops custom layers on setStyle).
  useEffect(() => {
    if (!map || !isLoaded) return;
    if (map.getSource(SOURCE)) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    map.addSource(SOURCE, { type: "geojson", data: dataRef.current });

    // Grow markers as you zoom in; slightly smaller base on mobile.
    const dotRadius: maplibre.ExpressionSpecification = [
      "interpolate",
      ["linear"],
      ["zoom"],
      1,
      isMobile ? 3 : 4,
      5,
      isMobile ? 5 : 6,
      10,
      9,
    ];

    // Giant-screen halo: an amber ring drawn under the dots, only for >= 80ft
    // venues — marks flagship large-format halls regardless of film/digital.
    map.addLayer({
      id: GIANT_LAYER,
      type: "circle",
      source: SOURCE,
      filter: ["==", ["get", "giant"], true],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1,
          isMobile ? 6 : 7,
          5,
          isMobile ? 8 : 9,
          10,
          13,
        ],
        "circle-color": "rgba(0,0,0,0)",
        "circle-stroke-width": 2,
        "circle-stroke-color": GIANT_COLOR,
        "circle-stroke-opacity": 0.95,
      },
    });

    map.addLayer({
      id: LAYER,
      type: "circle",
      source: SOURCE,
      paint: {
        "circle-radius": dotRadius,
        "circle-color": COLOR_MATCH,
        "circle-stroke-width": 1.5,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-opacity": 0.85,
        "circle-opacity": 0.9,
      },
    });

    const handleClick = (
      e: maplibre.MapMouseEvent & { features?: maplibre.MapGeoJSONFeature[] }
    ) => {
      const feature = e.features?.[0];
      if (feature) onSelectRef.current?.(feature as unknown as ImaxFeature);
    };
    const enter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const leave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", LAYER, handleClick);
    map.on("mouseenter", LAYER, enter);
    map.on("mouseleave", LAYER, leave);

    return () => {
      map.off("click", LAYER, handleClick);
      map.off("mouseenter", LAYER, enter);
      map.off("mouseleave", LAYER, leave);
      try {
        if (map.getLayer(LAYER)) map.removeLayer(LAYER);
        if (map.getLayer(GIANT_LAYER)) map.removeLayer(GIANT_LAYER);
        if (map.getSource(SOURCE)) map.removeSource(SOURCE);
      } catch {
        // style may be mid-reload
      }
    };
  }, [map, isLoaded]);

  // Push new data into the source when the filter changes.
  useEffect(() => {
    if (!map || !isLoaded) return;
    const source = map.getSource(SOURCE) as maplibre.GeoJSONSource | undefined;
    source?.setData(data);
  }, [map, isLoaded, data]);

  return null;
}

/**
 * Google Maps search link for a venue. Uses name + location text so Maps
 * resolves the real place (with its canonical name, showtimes & ticket links),
 * even when our stored name isn't a perfect match. Opens in a new tab.
 */
function mapsUrl(p: ImaxFeatureProps): string {
  const q = [p.name, p.description].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** A pretty, tilt-animated theater info card shown inside the map popup. */
function InfoCard({
  feature,
  onClose,
}: {
  feature: ImaxFeature;
  onClose: () => void;
}) {
  const p = feature.properties;
  const color = COLORS[p.category];
  return (
    <Tilt rotationFactor={5} className="w-64 [transform-style:preserve-3d]">
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-popover text-popover-foreground text-left shadow-2xl ring-1 ring-black/5">
        {/* category accent bar */}
        <div className="h-1 w-full" style={{ background: color }} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2.5 inline-flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>

        <div className="flex flex-col gap-2 p-3.5">
          <div className="flex flex-col gap-1 pr-6">
            <a
              href={mapsUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in Google Maps for showtimes & tickets"
              className="group inline-flex items-start gap-1 text-sm font-semibold leading-snug hover:underline"
            >
              <span>{p.name}</span>
              <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
            </a>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ background: color }}
              />
              <span className="font-medium" style={{ color }}>
                {LABELS[p.category]}
              </span>
              {p.formats && (
                <span className="text-muted-foreground">· {p.formats}</span>
              )}
              {p.giant && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{
                    color: GIANT_COLOR,
                    background: `${GIANT_COLOR}1f`,
                    boxShadow: `inset 0 0 0 1px ${GIANT_COLOR}66`,
                  }}
                >
                  <Sparkles className="size-2.5" />
                  Giant screen
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            <InfoRow icon={MapPin}>{p.description}</InfoRow>
            {p.screenSizeFt && <InfoRow icon={Ruler}>{p.screenSizeFt}</InfoRow>}
            {p.opened && (
              <InfoRow icon={CalendarDays}>Opened {p.opened}</InfoRow>
            )}
          </div>
        </div>
      </div>
    </Tilt>
  );
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 opacity-70" />
      <span className="leading-snug">{children}</span>
    </div>
  );
}

export default function ImaxMap({ data }: { data: ImaxCollection }) {
  const [activeFilter, setActiveFilter] = useState<Category>("All");
  const [giantOnly, setGiantOnly] = useState(false);
  const [selected, setSelected] = useState<ImaxFeature | null>(null);

  const initialZoom =
    typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 1.75;

  const { counts, giantCount } = useMemo(() => {
    const c: Record<Category, number> = {
      All: data.features.length,
      Film: 0,
      Digital: 0,
      Other: 0,
    };
    let g = 0;
    for (const f of data.features) {
      c[f.properties.category]++;
      if (f.properties.giant) g++;
    }
    return { counts: c, giantCount: g };
  }, [data]);

  const filtered = useMemo<ImaxCollection>(() => {
    let feats = data.features;
    if (activeFilter !== "All") {
      feats = feats.filter((f) => f.properties.category === activeFilter);
    }
    if (giantOnly) feats = feats.filter((f) => f.properties.giant);
    return { type: "FeatureCollection", features: feats };
  }, [data, activeFilter, giantOnly]);

  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center">
      {/* Strip MapLibre's default popup chrome so our own card is the surface */}
      <style>{`
        .maplibregl-popup-content { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-ctrl-logo { display: none !important; }
      `}</style>

      {/* Filter badges: projection type (exclusive) + a giant-screen toggle */}
      <div className="flex flex-row gap-2 flex-wrap justify-center items-center">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat;
          const borderColor =
            cat === "All" ? "#666666" : COLORS[cat as ScreenCategory];
          const allStripe =
            "repeating-linear-gradient(135deg, #444 0, #444 8px, #666 8px, #666 16px)";
          return (
            <Badge
              key={cat}
              variant="outline"
              className="cursor-pointer transition-all duration-200 hover:scale-105"
              style={{
                borderColor: cat === "All" ? "transparent" : borderColor,
                color: isActive || cat === "All" ? "#fff" : borderColor,
                background:
                  cat === "All" ? allStripe : isActive ? borderColor : "transparent",
              }}
              onClick={() => setActiveFilter(cat)}
            >
              {LABELS[cat]} ({formatNumberHuman(counts[cat])})
            </Badge>
          );
        })}

        {/* Giant-screen toggle (orthogonal to type) */}
        <Badge
          variant="outline"
          className="cursor-pointer transition-all duration-200 hover:scale-105 inline-flex items-center gap-1"
          style={{
            borderColor: GIANT_COLOR,
            color: giantOnly ? "#1a1a1a" : GIANT_COLOR,
            background: giantOnly ? GIANT_COLOR : "transparent",
          }}
          onClick={() => setGiantOnly((v) => !v)}
        >
          <Sparkles className="size-3" />
          Giant ≥{GIANT_MIN_FT}ft ({formatNumberHuman(giantCount)})
        </Badge>
      </div>

      {/* Descriptive text */}
      <div className="text-xs text-muted-foreground flex flex-col items-center justify-center">
        <div className="font-medium text-center px-2">
          {activeFilter === "All"
            ? `Displaying ${formatNumberHuman(filtered.features.length)} IMAX theaters${giantOnly ? ` with giant screens (≥${GIANT_MIN_FT}ft)` : " worldwide"}`
            : CAT_DESCRIPTIONS[activeFilter as ScreenCategory]}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="flex items-center gap-1">
            <span
              className="inline-block size-2.5 rounded-full border"
              style={{ borderColor: GIANT_COLOR, borderWidth: 2 }}
            />
            <span>amber ring = giant screen ≥{GIANT_MIN_FT}ft</span>
          </span>
          <span>• Tap any point for details</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full h-[60vh] min-h-[360px] md:h-[650px] rounded-lg overflow-hidden border border-border/20">
        <Map
          className="h-full w-full"
          styles={{ light: LIGHT_STYLE, dark: DARK_STYLE }}
          projection={{ type: "globe" }}
          center={[-98.5795, 39.8283]}
          zoom={initialZoom}
          minZoom={0.5}
          maxZoom={16}
          attributionControl={false}
        >
          <ImaxPointsLayer data={filtered} onSelect={setSelected} />
          <MapControls
            position="bottom-right"
            showZoom
            showCompass
            showFullscreen
          />
          {selected && (
            <MapPopup
              longitude={selected.geometry.coordinates[0]}
              latitude={selected.geometry.coordinates[1]}
              offset={14}
              onClose={() => setSelected(null)}
              className="!max-w-none !border-0 !bg-transparent !p-0 !shadow-none"
            >
              <InfoCard
                feature={selected}
                onClose={() => setSelected(null)}
              />
            </MapPopup>
          )}
        </Map>
      </div>
    </div>
  );
}
