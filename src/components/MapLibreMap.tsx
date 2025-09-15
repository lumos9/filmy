import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumberHuman } from "@/lib/utils";
import type { Feature, FeatureCollection, Point } from "geojson";
import * as maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";

export interface GpsPoint {
  id: string;
  coordinates: [number, number];
  metadata: {
    name: string;
    description: string;
    projections?: string[];
    screenType?: string;
    screenSizeFt?: string;
    formats?: string[];
    opened: Date | null;
  };
  nickname: "True IMAX" | "LieMAX" | "Hybrid" | "Other";
}

const COLORS: Record<GpsPoint["nickname"], string> = {
  "True IMAX": "#1E90FF", // blue
  LieMAX: "#FF4500", // orange
  Hybrid: "#32CD32", // green
  Other: "#FFD700", // gold/yellow - bright and distinct
};

const CAT_DESCRIPTIONS: Record<GpsPoint["nickname"], string> = {
  "True IMAX":
    "Full IMAX experience, typically 15/70mm film (1570) or IMAX Digital (DL/DL2), large screen & proprietary tech",
  LieMAX:
    "IMAX branding but smaller or non-IMAX-standard screens, often DL or DL2 formats",
  Hybrid:
    "Combination of IMAX and other projection formats; may include 1570, DL, DL2 on select screens",
  Other: "Other or unspecified formats, e.g., non-IMAX or custom cinema setups",
};

// 🔹 Utility: convert GpsPoint[] into typed GeoJSON Features
const getFeatures = (points: GpsPoint[]): Feature<Point>[] =>
  points.map(
    (point): Feature<Point> => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: point.coordinates,
      },
      properties: {
        id: point.id,
        name: point.metadata.name,
        description: point.metadata.description,
        nickname: point.nickname,
      },
    })
  );

// Loading states enum for cleaner state management
enum LoadingState {
  INITIALIZING = "initializing",
  MAP_LOADING = "map_loading",
  STYLE_LOADING = "style_loading",
  POINTS_LOADING = "points_loading",
  COMPLETE = "complete",
  ERROR = "error",
}

const LOADING_MESSAGES = {
  [LoadingState.INITIALIZING]: {
    title: "Preparing Globe View",
    subtitle: "Initializing 3D projection and map tiles...",
    progress: 10,
  },
  [LoadingState.MAP_LOADING]: {
    title: "Loading Map Engine",
    subtitle: "Setting up interactive globe projection...",
    progress: 30,
  },
  [LoadingState.STYLE_LOADING]: {
    title: "Applying Map Theme",
    subtitle: "Loading visual styles and textures...",
    progress: 60,
  },
  [LoadingState.POINTS_LOADING]: {
    title: "Loading Theater Data",
    subtitle: "Plotting IMAX locations on the interactive globe...",
    progress: 85,
  },
  [LoadingState.COMPLETE]: {
    title: "Ready",
    subtitle: "Interactive globe loaded successfully",
    progress: 100,
  },
  [LoadingState.ERROR]: {
    title: "Loading Error",
    subtitle: "Failed to load map. Please try refreshing.",
    progress: 0,
  },
};

const MapLibreMap: React.FC<{ gpsPoints: GpsPoint[] }> = ({ gpsPoints }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibre.Map | null>(null);
  const popupRef = useRef<maplibre.Popup | null>(null);
  const gpsPointsRef = useRef<GpsPoint[]>(gpsPoints);
  const [loadingState, setLoadingState] = useState<LoadingState>(
    LoadingState.INITIALIZING
  );
  const loadingStateRef = useRef<LoadingState>(LoadingState.INITIALIZING);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Keep loading state ref in sync
  useEffect(() => {
    loadingStateRef.current = loadingState;
  }, [loadingState]);

  useEffect(() => {
    setMounted(true);
    //console.log("MapLibre: Component mounted, theme:", theme);

    // Safety fallback - if we're stuck in INITIALIZING for too long, force progress
    const safetyTimeout = setTimeout(() => {
      if (loadingStateRef.current === LoadingState.INITIALIZING) {
        console.warn(
          "MapLibre: Stuck in INITIALIZING state, forcing MAP_LOADING"
        );
        setLoadingState(LoadingState.MAP_LOADING);
      }
    }, 2000);

    return () => clearTimeout(safetyTimeout);
  }, [theme]);

  // Helper functions for cleaner code organization
  const createMapStyle = (currentTheme: string | undefined) => {
    const isDark =
      currentTheme === "dark" ||
      (currentTheme === "system" && resolvedTheme === "dark");

    return isDark
      ? {
          version: 8 as const,
          sources: {
            "natural-earth": {
              type: "raster" as const,
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              attribution:
                "© Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors",
            },
            labels: {
              type: "raster" as const,
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              attribution: "© Esri",
            },
          },
          layers: [
            {
              id: "background",
              type: "background" as const,
              paint: { "background-color": "#0f172a" },
            },
            {
              id: "natural-earth",
              type: "raster" as const,
              source: "natural-earth",
              paint: { "raster-opacity": 1 },
            },
            {
              id: "labels",
              type: "raster" as const,
              source: "labels",
              paint: { "raster-opacity": 1.0 },
            },
          ],
        }
      : {
          version: 8 as const,
          sources: {
            "natural-earth": {
              type: "raster" as const,
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              attribution:
                "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
            },
            labels: {
              type: "raster" as const,
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
              ],
              tileSize: 256,
              attribution: "© Esri",
            },
          },
          layers: [
            {
              id: "background",
              type: "background" as const,
              paint: { "background-color": "#000000" },
            },
            {
              id: "natural-earth",
              type: "raster" as const,
              source: "natural-earth",
              paint: { "raster-opacity": 1 },
            },
            {
              id: "labels",
              type: "raster" as const,
              source: "labels",
              paint: { "raster-opacity": 0.8 },
            },
          ],
        };
  };

  const addPointsLayer = (map: maplibre.Map, points: GpsPoint[]) => {
    const isMobile = window.innerWidth < 768;

    // Add source
    map.addSource("points", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: getFeatures(points),
      } as FeatureCollection<Point>,
    });

    // Add layer
    map.addLayer({
      id: "points",
      type: "circle",
      source: "points",
      paint: {
        "circle-radius": isMobile ? 5 : 6,
        "circle-color": [
          "match",
          ["get", "nickname"],
          "True IMAX",
          COLORS["True IMAX"],
          "LieMAX",
          COLORS["LieMAX"],
          "Hybrid",
          COLORS["Hybrid"],
          COLORS["Other"], // default
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-opacity": 0.8,
        "circle-opacity": 0.9,
      },
    });
  };

  const setupMapEventHandlers = (map: maplibre.Map) => {
    map.on("click", "points", handlePointClick);
    map.on("mouseenter", "points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "points", () => {
      map.getCanvas().style.cursor = "";
    });
  };

  const handlePointClick = (
    e: maplibre.MapMouseEvent & { features?: maplibre.MapGeoJSONFeature[] }
  ) => {
    const feature = e.features?.[0];
    if (!feature?.properties) return;

    const id = feature.properties.id as string;
    const point = gpsPointsRef.current.find((p) => p.id === id);
    if (!point) return;

    // Close existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Create new popup
    const popupNode = document.createElement("div");
    popupNode.innerHTML = createPopupContent(point);

    popupRef.current = new maplibre.Popup({
      closeOnClick: true,
      offset: 12,
      closeButton: false,
    })
      .setLngLat(point.coordinates)
      .setDOMContent(popupNode)
      .addTo(mapRef.current!);
  };

  const createPopupContent = (point: GpsPoint) => {
    return `
      <div class="relative max-w-xs rounded-lg border bg-card p-4 shadow-md text-left pr-10">
        <button onclick="this.parentElement.parentElement.remove()" class="cursor-pointer absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-xl">×</button>
        <div class="flex flex-col items-start gap-1">
          <div class="text-sm font-medium">${point.metadata.name}</div>
          <div class="text-muted-foreground text-xs">${
            point.metadata.description
          }</div>
          ${
            point.metadata.screenSizeFt
              ? `<div class="text-muted-foreground text-xs">${point.metadata.screenSizeFt}</div>`
              : ""
          }
        </div>
      </div>
    `;
  };

  // Update GPS points and manage loading state
  useEffect(() => {
    gpsPointsRef.current = gpsPoints;

    if (gpsPoints.length > 0) {
      console.log(
        `📍 GPS POINTS RECEIVED: ${gpsPoints.length} IMAX locations received!`
      );

      // Add points to map if map is ready
      if (mapRef.current?.isStyleLoaded()) {
        const source = mapRef.current.getSource(
          "points"
        ) as maplibre.GeoJSONSource;
        if (source) {
          // Update existing source
          const data: FeatureCollection<Point> = {
            type: "FeatureCollection",
            features: getFeatures(gpsPoints),
          };
          source.setData(data);
          //console.log("MapLibre: Updated existing points source");
          setLoadingState(LoadingState.COMPLETE);
        } else {
          // Create new source and layer
          //console.log("MapLibre: Creating points layer with GPS data");
          addPointsLayer(mapRef.current, gpsPoints);
          setupMapEventHandlers(mapRef.current);
          setLoadingState(LoadingState.COMPLETE);
        }
      } else {
        // Map not ready yet, just wait for style.load to handle it
        console.log("MapLibre: GPS points received, but map not ready yet");
        // Don't change loading state here - let map initialization handle it
      }
    }
  }, [gpsPoints]);

  // 🔹 Filtering state
  const [activeFilter, setActiveFilter] = useState<
    GpsPoint["nickname"] | "All"
  >("All");

  const filteredPoints =
    activeFilter === "All"
      ? gpsPoints
      : gpsPoints.filter((p) => p.nickname === activeFilter);

  // 🔹 Update data when filter/gpsPoints changes
  useEffect(() => {
    if (!mapRef.current) return;
    const source = mapRef.current.getSource("points") as maplibre.GeoJSONSource;
    if (source) {
      const data: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: getFeatures(filteredPoints),
      };
      source.setData(data);
    }
  }, [filteredPoints]);

  // Initialize map with clean state management
  useEffect(() => {
    console.log("MapLibre: Map init effect running", {
      hasContainer: !!mapContainer.current,
      hasMap: !!mapRef.current,
      mounted,
      theme,
      loadingState,
    });

    if (!mapContainer.current) {
      console.log("MapLibre: Skipping - no container");
      return;
    }
    if (mapRef.current) {
      console.log("MapLibre: Skipping - map already exists");
      return;
    }
    if (!mounted) {
      console.log("MapLibre: Skipping - not mounted");
      return;
    }

    console.log("MapLibre: Initializing map...");
    setLoadingState(LoadingState.MAP_LOADING);

    const isMobile = window.innerWidth < 768;
    const initialZoom = isMobile ? 1 : 1.75;

    mapRef.current = new maplibre.Map({
      container: mapContainer.current,
      style: createMapStyle(theme),
      center: [-98.5795, 39.8283],
      zoom: initialZoom,
      attributionControl: false,
    });

    console.log("MapLibre: Map instance created");

    // Error handling
    mapRef.current.on("error", (e) => {
      console.error("MapLibre: Map error", e);
      setLoadingState(LoadingState.ERROR);
    });

    // Loading timeout fallback
    const timeoutId = setTimeout(() => {
      console.warn("MapLibre: Style load timeout");
      setLoadingState(LoadingState.ERROR);
    }, 15000);

    mapRef.current.once("style.load", () => {
      console.log("MapLibre: Style loaded successfully");
      clearTimeout(timeoutId);
      setLoadingState(LoadingState.STYLE_LOADING);

      try {
        // Enable globe projection
        mapRef.current?.setProjection({ type: "globe" } as any);
        console.log("MapLibre: Globe projection enabled!");
      } catch (error) {
        console.warn("MapLibre: Globe projection not supported:", error);
      }

      // Add points if available
      const currentPoints = gpsPointsRef.current;
      console.log(
        `MapLibre: Checking for points after style load: ${currentPoints.length} points available`
      );

      if (currentPoints.length > 0) {
        console.log("MapLibre: Adding points immediately after style load");
        addPointsLayer(mapRef.current!, currentPoints);
        setupMapEventHandlers(mapRef.current!);
        setLoadingState(LoadingState.COMPLETE);
      } else {
        console.log(
          "MapLibre: No points yet, waiting for GPS data before completing"
        );
        setLoadingState(LoadingState.POINTS_LOADING);

        // Don't set a timeout to complete without points - wait for them
      }
    });

    return () => {
      console.log("MapLibre: Cleaning up map");
      clearTimeout(timeoutId);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mounted, theme]);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !theme || !mounted) return;

    const newStyle = createMapStyle(theme);
    console.log("MapLibre: Updating map style for theme:", theme);
    mapRef.current.setStyle(newStyle);
  }, [theme, resolvedTheme, mounted]);

  // Compute loading message and progress
  const loadingMessage = LOADING_MESSAGES[loadingState];
  const hasPoints = gpsPoints.length > 0;
  const isFullyReady = loadingState === LoadingState.COMPLETE && hasPoints;
  const isLoading = !isFullyReady && loadingState !== LoadingState.ERROR;

  return (
    <div className="w-full flex flex-col gap-2 items-center justify-center">
      <style>{`
        .maplibregl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
        }
        .maplibregl-popup-tip {
          display: none !important;
        }
        .maplibregl-ctrl-logo {
          display: none !important;
        }
      `}</style>

      {/* Filter badges - always show at top */}
      {hasPoints && (
        <div className="flex flex-row gap-2 flex-wrap justify-center items-center">
          {(["All", "True IMAX", "LieMAX", "Hybrid", "Other"] as const).map(
            (cat) => {
              const borderColor =
                cat === "All" ? "#666666" : COLORS[cat as keyof typeof COLORS];
              const isActive = activeFilter === cat;
              const allStripe =
                "repeating-linear-gradient(135deg, #444 0, #444 8px, #666 8px, #666 16px)";
              const count =
                cat === "All"
                  ? gpsPoints.length
                  : gpsPoints.filter((p) => p.nickname === cat).length;

              return (
                <Badge
                  key={cat}
                  variant="outline"
                  className="cursor-pointer transition-all duration-200 hover:scale-105"
                  style={{
                    borderColor: cat === "All" ? "transparent" : borderColor,
                    color: isActive || cat === "All" ? "#fff" : borderColor,
                    background:
                      cat === "All"
                        ? allStripe
                        : isActive
                        ? borderColor
                        : "transparent",
                  }}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat} ({formatNumberHuman(count)})
                </Badge>
              );
            }
          )}
        </div>
      )}

      {/* Descriptive text - always show at top when points available */}
      {hasPoints && (
        <div className="text-xs text-muted-foreground flex flex-col items-center justify-center">
          <div className="font-medium">
            {activeFilter === "All"
              ? `Displaying ${formatNumberHuman(
                  gpsPoints.length
                )} IMAX theaters worldwide`
              : `${CAT_DESCRIPTIONS[activeFilter as GpsPoint["nickname"]]}`}
          </div>
          <div className="flex items-center justify-center gap-1">
            <span>🌍</span>
            <span>
              Interactive 3D globe • Click any point for theater details
            </span>
          </div>
        </div>
      )}

      {/* Always render map container but hide it during loading */}
      <div className="relative w-full h-[400px] md:h-[650px] rounded-lg overflow-hidden border border-border/20">
        <div
          ref={mapContainer}
          className="w-full h-full rounded-lg bg-black"
          style={{ visibility: isFullyReady ? "visible" : "hidden" }}
        />

        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
              <Progress
                value={
                  hasPoints
                    ? loadingMessage.progress
                    : Math.min(loadingMessage.progress, 80)
                }
                className="w-full h-3"
              />
              <div className="text-center space-y-2">
                <div className="text-base font-medium text-foreground">
                  {hasPoints ? loadingMessage.title : "Loading Theater Data"}
                </div>
                <div className="text-sm text-muted-foreground max-w-xs">
                  {hasPoints
                    ? loadingMessage.subtitle
                    : "Fetching IMAX locations worldwide..."}
                </div>
                <div className="text-xs text-muted-foreground opacity-75">
                  {hasPoints
                    ? loadingMessage.progress
                    : Math.min(loadingMessage.progress, 80)}
                  % complete
                </div>
                {hasPoints && (
                  <div className="text-xs text-muted-foreground opacity-75">
                    {formatNumberHuman(gpsPoints.length)} theaters ready to
                    display
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loadingState === LoadingState.ERROR && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="text-base font-medium text-destructive">
                {loadingMessage.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {loadingMessage.subtitle}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MapLibreMap.displayName = "MapLibreMap";
export default MapLibreMap;
