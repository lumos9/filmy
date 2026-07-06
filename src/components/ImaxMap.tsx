"use client";

import { Badge } from "@/components/ui/badge";
import { Map, MapControls, MapPopup, useMap } from "@/components/ui/map";
import { Tilt } from "@/components/unlumen-ui/tilt";
import { formatNumberHuman } from "@/lib/utils";
import type { ScreenNickname } from "@/lib/screens";
import type { Feature, FeatureCollection, Point } from "geojson";
import { CalendarDays, MapPin, Ruler, X } from "lucide-react";
import type * as maplibre from "maplibre-gl";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Properties baked into each feature by scripts/build-geojson.mjs. */
export interface ImaxFeatureProps {
  id: string;
  name: string;
  description: string;
  nickname: ScreenNickname;
  screenType: string;
  screenSizeFt: string;
  formats: string;
  opened: string;
}

type ImaxFeature = Feature<Point, ImaxFeatureProps>;
type ImaxCollection = FeatureCollection<Point, ImaxFeatureProps>;

const CATEGORIES = ["All", "True IMAX", "LieMAX", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

const COLORS: Record<ScreenNickname, string> = {
  "True IMAX": "#1E90FF", // blue
  LieMAX: "#FF4500", // orange
  Other: "#FFD700", // gold
};

const CAT_DESCRIPTIONS: Record<ScreenNickname, string> = {
  "True IMAX":
    "Genuine large-format IMAX with 15/70mm film (1570) on a giant screen — including venues that also run digital IMAX",
  LieMAX:
    "Digital-only IMAX (D / DL / DL2 …), no 70mm film — smaller, retrofit-style IMAX screens",
  Other: "No recognized IMAX format, e.g. legacy, dome, or non-IMAX large-format setups",
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
  ["get", "nickname"],
  "True IMAX",
  COLORS["True IMAX"],
  "LieMAX",
  COLORS["LieMAX"],
  COLORS["Other"], // default
];

/**
 * Renders the theater dots as a single GeoJSON circle layer (fast for thousands
 * of points — one layer, not per-point markers). Uses the raw MapLibre instance
 * via mapcn's `useMap()` escape hatch. Re-adds itself after theme/style reloads.
 */
const SOURCE = "imax-points";
const LAYER = "imax-points-circles";

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
    map.addLayer({
      id: LAYER,
      type: "circle",
      source: SOURCE,
      paint: {
        // Grow the dots as you zoom in; slightly smaller base on mobile.
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          1,
          isMobile ? 3 : 4,
          5,
          isMobile ? 5 : 6,
          10,
          9,
        ],
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

/** A pretty, tilt-animated theater info card shown inside the map popup. */
function InfoCard({
  feature,
  onClose,
}: {
  feature: ImaxFeature;
  onClose: () => void;
}) {
  const p = feature.properties;
  const color = COLORS[p.nickname];
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

        <div className="flex flex-col gap-2.5 p-3.5">
          <div className="flex flex-col gap-1.5 pr-6">
            <h3 className="text-sm font-semibold leading-tight">{p.name}</h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: `${color}22`, color, boxShadow: `inset 0 0 0 1px ${color}55` }}
              >
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ background: color }}
                />
                {p.nickname}
              </span>
              {p.formats && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {p.formats}
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
  const [selected, setSelected] = useState<ImaxFeature | null>(null);

  const initialZoom =
    typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 1.75;

  const counts = useMemo(() => {
    const c: Record<Category, number> = {
      All: data.features.length,
      "True IMAX": 0,
      LieMAX: 0,
      Other: 0,
    };
    for (const f of data.features) c[f.properties.nickname]++;
    return c;
  }, [data]);

  const filtered = useMemo<ImaxCollection>(() => {
    if (activeFilter === "All") return data;
    return {
      type: "FeatureCollection",
      features: data.features.filter((f) => f.properties.nickname === activeFilter),
    };
  }, [data, activeFilter]);

  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center">
      {/* Strip MapLibre's default popup chrome so our own card is the surface */}
      <style>{`
        .maplibregl-popup-content { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
        .maplibregl-popup-tip { display: none !important; }
        .maplibregl-ctrl-logo { display: none !important; }
      `}</style>

      {/* Filter badges */}
      <div className="flex flex-row gap-2 flex-wrap justify-center items-center">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat;
          const borderColor =
            cat === "All" ? "#666666" : COLORS[cat as ScreenNickname];
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
              {cat} ({formatNumberHuman(counts[cat])})
            </Badge>
          );
        })}
      </div>

      {/* Descriptive text */}
      <div className="text-xs text-muted-foreground flex flex-col items-center justify-center">
        <div className="font-medium text-center px-2">
          {activeFilter === "All"
            ? `Displaying ${formatNumberHuman(counts.All)} IMAX theaters worldwide`
            : CAT_DESCRIPTIONS[activeFilter as ScreenNickname]}
        </div>
        <div className="flex items-center justify-center gap-1">
          <span>🌍</span>
          <span>Interactive 3D globe • Tap any point for theater details</span>
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
