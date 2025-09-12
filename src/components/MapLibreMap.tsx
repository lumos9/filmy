import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumberHuman } from "@/lib/utils";
import type { Feature, FeatureCollection, Point } from "geojson";
import * as maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

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

const MapLibreMap: React.FC<{ gpsPoints: GpsPoint[] }> = ({ gpsPoints }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibre.Map | null>(null);
  const popupRef = useRef<maplibre.Popup | null>(null);
  const gpsPointsRef = useRef<GpsPoint[]>(gpsPoints);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [pointsLoaded, setPointsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoadingProgress(10); // Initial progress
  }, []);

  // Fallback loading timeout
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      console.warn(
        "MapLibre: Fallback timeout reached, forcing loading states to false"
      );
      setIsMapLoading(false);
      setPointsLoaded(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(fallbackTimeout);
  }, []);

  // Get map style optimized for globe projection
  const getMapStyle = (currentTheme: string | undefined) => {
    const isDark =
      currentTheme === "dark" ||
      (currentTheme === "system" && resolvedTheme === "dark");

    // Use Natural Earth data style for better globe appearance
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
          },
          layers: [
            {
              id: "background",
              type: "background" as const,
              paint: {
                "background-color": "#0f172a", // Deep space-like background
              },
            },
            {
              id: "natural-earth",
              type: "raster" as const,
              source: "natural-earth",
              paint: {
                "raster-opacity": 1,
              },
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
          },
          layers: [
            {
              id: "background",
              type: "background" as const,
              paint: {
                "background-color": "#1e3a8a", // Deep blue space background
              },
            },
            {
              id: "natural-earth",
              type: "raster" as const,
              source: "natural-earth",
              paint: {
                "raster-opacity": 1,
              },
            },
          ],
        };
  };

  // Function to add points to the map
  const addPointsToMap = () => {
    if (!mapRef.current || gpsPoints.length === 0) return;

    const source = mapRef.current.getSource("points") as maplibre.GeoJSONSource;
    if (source) {
      // Update existing source
      const data: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: getFeatures(gpsPoints),
      };
      source.setData(data);
      console.log(
        `MapLibre: Updated points on map (${gpsPoints.length} points)`
      );
    } else {
      // Add new source and layer
      console.log(
        `MapLibre: Adding points source to map (${gpsPoints.length} points)`
      );
      mapRef.current.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: getFeatures(gpsPoints),
        } as FeatureCollection<Point>,
      });

      const isMobile = window.innerWidth < 768;
      mapRef.current.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": isMobile ? 5 : 6, // Increased size for globe visibility
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
        layout: {
          visibility: "visible",
        },
      });

      // Add event handlers
      mapRef.current.on("click", "points", (e) => {
        console.log("[MapLibreMap] Click event fired", e.features);
        const feature = e.features?.[0];
        if (!feature) {
          console.warn("[MapLibreMap] No feature found on click event");
          return;
        }
        if (feature && feature.properties) {
          console.log("[MapLibreMap] Feature properties:", feature.properties);
          const id = feature.properties.id as string;
          const found = gpsPointsRef.current.find((p) => p.id === id);
          if (!found) {
            console.warn("[MapLibreMap] No gpsPoint found for id", id);
            return;
          }
          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }
          const popupNode = document.createElement("div");
          const handleClose = () => {
            popupRef.current?.remove();
            popupRef.current = null;
          };
          createRoot(popupNode).render(
            // <MapPopupCard point={found} onClose={handleClose} />
            <div>Popup content placeholder</div>
          );
          popupRef.current = new maplibre.Popup({
            closeOnClick: true,
            offset: 12,
            closeButton: false,
          })
            .setLngLat(found.coordinates)
            .setDOMContent(popupNode)
            .addTo(mapRef.current!);
        }
      });

      mapRef.current.on("mouseenter", "points", () => {
        mapRef.current?.getCanvas().style.setProperty("cursor", "pointer");
      });

      mapRef.current.on("mouseleave", "points", () => {
        mapRef.current?.getCanvas().style.setProperty("cursor", "");
      });
    }
  };
  useEffect(() => {
    gpsPointsRef.current = gpsPoints;
    // Log when gpsPoints actually gets populated
    if (gpsPoints.length > 0) {
      console.log(
        `📍 GPS POINTS RECEIVED: ${gpsPoints.length} IMAX locations received from parent component!`
      );
      setLoadingProgress(95);
      setPointsLoaded(true);

      // Add points to map if map is already loaded
      if (mapRef.current && mapRef.current.isStyleLoaded()) {
        console.log("MapLibre: Map is ready, checking for points source...");
        const source = mapRef.current.getSource(
          "points"
        ) as maplibre.GeoJSONSource;
        if (source) {
          // Source exists, just update data
          console.log(
            `MapLibre: Updating existing source with ${gpsPoints.length} points`
          );
          const data: FeatureCollection<Point> = {
            type: "FeatureCollection",
            features: getFeatures(gpsPoints),
          };
          source.setData(data);
          console.log("MapLibre: Points source updated successfully");
        } else {
          // Source doesn't exist, create it
          console.log("MapLibre: Points source not found, creating it...");
          mapRef.current.addSource("points", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: getFeatures(gpsPoints),
            } as FeatureCollection<Point>,
          });

          const isMobile = window.innerWidth < 768;
          mapRef.current.addLayer({
            id: "points",
            type: "circle",
            source: "points",
            paint: {
              "circle-radius": isMobile ? 5 : 6, // Increased size for globe visibility
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
            layout: {
              visibility: "visible",
            },
          });

          console.log("MapLibre: Points source and layer created successfully");
          setLoadingProgress(100);

          // Add event handlers for new layer
          mapRef.current.on("click", "points", (e) => {
            console.log("[MapLibreMap] Click event fired", e.features);
            const feature = e.features?.[0];
            if (!feature || !feature.properties) return;

            const id = feature.properties.id as string;
            const found = gpsPointsRef.current.find((p) => p.id === id);
            if (!found) return;

            if (popupRef.current) {
              popupRef.current.remove();
              popupRef.current = null;
            }

            const popupNode = document.createElement("div");
            const handleClose = () => {
              popupRef.current?.remove();
              popupRef.current = null;
            };

            // Create a simple popup without the MapPopupCard component for now
            popupNode.innerHTML = `
              <div class="relative max-w-xs rounded-lg border bg-card p-4 shadow-md text-left pr-10">
                <button onclick="this.parentElement.parentElement.remove()" class="cursor-pointer absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-xl">×</button>
                <div class="flex flex-col items-start gap-1">
                  <div class="text-sm font-medium">${found.metadata.name}</div>
                  <div class="text-muted-foreground text-xs">${
                    found.metadata.description
                  }</div>
                  ${
                    found.metadata.screenSizeFt
                      ? `<div class="text-muted-foreground text-xs">${found.metadata.screenSizeFt}</div>`
                      : ""
                  }
                </div>
              </div>
            `;

            popupRef.current = new maplibre.Popup({
              closeOnClick: true,
              offset: 12,
              closeButton: false,
            })
              .setLngLat(found.coordinates)
              .setDOMContent(popupNode)
              .addTo(mapRef.current!);
          });

          mapRef.current.on("mouseenter", "points", () => {
            mapRef.current?.getCanvas().style.setProperty("cursor", "pointer");
          });

          mapRef.current.on("mouseleave", "points", () => {
            mapRef.current?.getCanvas().style.setProperty("cursor", "");
          });
        }
      } else {
        console.log(
          "MapLibre: Map not ready yet, points will be added when style loads"
        );
      }
    } else {
      // If no points after a delay, still allow loading to complete
      const timeoutId = setTimeout(() => {
        console.log(
          "MapLibre: No GPS points received, proceeding without points"
        );
        setPointsLoaded(true);
      }, 2000); // 2 second delay to wait for data

      return () => clearTimeout(timeoutId);
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

  // 🔹 Initialize map
  useEffect(() => {
    console.log("MapLibre: Map initialization effect running", {
      mounted,
      hasContainer: !!mapContainer.current,
      hasMap: !!mapRef.current,
    });
    if (!mapContainer.current || mapRef.current || !mounted) {
      console.log("MapLibre: Skipping map initialization", {
        mounted,
        hasContainer: !!mapContainer.current,
        hasMap: !!mapRef.current,
      });
      return;
    }

    console.log("MapLibre: Initializing map...");
    setIsMapLoading(true);

    const isMobile = window.innerWidth < 768; // typical breakpoint
    const initialZoom = isMobile ? 1.5 : 2.5; // Adjusted for globe view

    mapRef.current = new maplibre.Map({
      container: mapContainer.current,
      style: getMapStyle(theme),
      center: [-98.5795, 39.8283],
      zoom: initialZoom,
      attributionControl: false,
    });

    // Add comprehensive error handling
    mapRef.current.on("error", (e) => {
      console.error("MapLibre: Map error", e);
      setIsMapLoading(false);
      // Don't show error to user, just fallback gracefully
    });

    mapRef.current.on("sourcedataloading", () => {
      console.log("MapLibre: Source data loading...");
    });

    mapRef.current.on("styledata", () => {
      console.log("MapLibre: Style data loaded");
    });

    // Fallback timeout in case style.load never fires
    const timeoutId = setTimeout(() => {
      console.warn(
        "MapLibre: Style load timeout, forcing loading state to false"
      );
      setIsMapLoading(false);
    }, 15000); // Increased timeout for slower connections

    mapRef.current.once("style.load", () => {
      console.log("MapLibre: Style loaded successfully");
      clearTimeout(timeoutId);
      setLoadingProgress(80);
      setIsMapLoading(false);

      // Try to enable globe projection with proper configuration
      try {
        console.log("MapLibre: Attempting to enable globe projection...");
        mapRef.current?.setProjection({
          type: "globe",
        } as any);

        console.log("MapLibre: Globe projection enabled successfully!");
      } catch (error) {
        console.warn("MapLibre: Globe projection not supported:", error);
      }

      // Use current GPS points from ref (most up-to-date)
      const currentPoints = gpsPointsRef.current;
      console.log(
        `MapLibre: Adding ${currentPoints.length} points to map after style load`
      ); // Add GeoJSON source
      mapRef.current?.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: getFeatures(currentPoints),
        } as FeatureCollection<Point>,
      });

      // Add layer with categorical colors optimized for globe view
      mapRef.current?.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": isMobile ? 5 : 6, // Increased size for globe visibility
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
        layout: {
          visibility: "visible",
        },
      });
      // Bring layer to top
      if (mapRef.current && mapRef.current.getStyle().layers) {
        const layers = mapRef.current.getStyle().layers;
        const lastLayerId = layers[layers.length - 1].id;
        if (lastLayerId !== "points") {
          mapRef.current.moveLayer("points");
        }
      }

      // --- Popup React rendering ---
      function MapPopupCard({
        point,
        onClose,
      }: {
        point: GpsPoint;
        onClose: () => void;
      }) {
        const isDark =
          mounted &&
          (theme === "dark" ||
            (theme === "system" && resolvedTheme === "dark"));
        return (
          <div
            className={`relative max-w-xs rounded-lg border shadow-md text-left pr-10 ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white"
                : "bg-card border-border text-card-foreground"
            } p-4`}
          >
            <button
              onClick={onClose}
              className="cursor-pointer absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-xl"
              aria-label="Close popup"
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="flex flex-col items-start gap-1">
              <div
                className={`text-sm font-medium ${isDark ? "text-white" : ""}`}
              >
                {point.metadata.name}
              </div>
              <div
                className={`text-muted-foreground text-xs ${
                  isDark ? "text-gray-300" : ""
                }`}
              >
                {point.metadata.description}
              </div>
              <div className="flex items-center space-x-2">
                {point.nickname && (
                  <div
                    className={`text-muted-foreground text-xs ${
                      isDark ? "text-gray-300" : ""
                    }`}
                  >
                    {point.nickname}
                  </div>
                )}
                {point.metadata.opened && (
                  <>
                    <span
                      className={`text-muted-foreground ${
                        isDark ? "text-gray-400" : ""
                      }`}
                    >
                      •
                    </span>
                    <div
                      className={`text-muted-foreground text-xs ${
                        isDark ? "text-gray-300" : ""
                      }`}
                    >
                      Opened {point.metadata.opened.toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>

              {point.metadata.screenSizeFt && (
                <div
                  className={`text-muted-foreground text-xs ${
                    isDark ? "text-gray-300" : ""
                  }`}
                >
                  {point.metadata.screenSizeFt}
                </div>
              )}
              <div className="flex items-center space-x-2">
                {(point.metadata.projections?.length || 0) > 0 && (
                  <div
                    className={`text-muted-foreground ${
                      isDark ? "text-gray-300" : ""
                    }`}
                  >
                    {point.metadata.projections?.join(", ")}
                  </div>
                )}
                {point.metadata.screenType && (
                  <>
                    <span
                      className={`text-muted-foreground ${
                        isDark ? "text-gray-400" : ""
                      }`}
                    >
                      •
                    </span>
                    <div
                      className={`text-muted-foreground ${
                        isDark ? "text-gray-300" : ""
                      }`}
                    >
                      {point.metadata.screenType}
                    </div>
                  </>
                )}
                {(point.metadata.formats?.length || 0) > 0 && (
                  <>
                    <span
                      className={`text-muted-foreground ${
                        isDark ? "text-gray-400" : ""
                      }`}
                    >
                      •
                    </span>
                    <div
                      className={`text-muted-foreground ${
                        isDark ? "text-gray-300" : ""
                      }`}
                    >
                      {point.metadata.formats?.join(", ")}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Attach event handlers after layer is added
      if (mapRef.current) {
        mapRef.current.on("click", "points", (e) => {
          console.log("[MapLibreMap] Click event fired", e.features);
          const feature = e.features?.[0];
          if (!feature) {
            console.warn("[MapLibreMap] No feature found on click event");
            return;
          }
          if (feature && feature.properties) {
            console.log(
              "[MapLibreMap] Feature properties:",
              feature.properties
            );
            const id = feature.properties.id as string;
            const found = gpsPointsRef.current.find((p) => p.id === id);
            if (!found) {
              console.warn("[MapLibreMap] No gpsPoint found for id", id);
              return;
            }
            if (popupRef.current) {
              popupRef.current.remove();
              popupRef.current = null;
            }
            const popupNode = document.createElement("div");
            const handleClose = () => {
              popupRef.current?.remove();
              popupRef.current = null;
            };
            createRoot(popupNode).render(
              <MapPopupCard point={found} onClose={handleClose} />
            );
            popupRef.current = new maplibre.Popup({
              closeOnClick: true,
              offset: 12,
              closeButton: false,
            })
              .setLngLat(found.coordinates)
              .setDOMContent(popupNode)
              .addTo(mapRef.current!);
          }
        });
        mapRef.current.on("mouseenter", "points", () => {
          mapRef.current?.getCanvas().style.setProperty("cursor", "pointer");
        });
        mapRef.current.on("mouseleave", "points", () => {
          mapRef.current?.getCanvas().style.setProperty("cursor", "");
        });
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mounted]);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || !theme || !mounted) return;

    const newStyle = getMapStyle(theme);
    console.log("MapLibre: Updating map style for theme:", theme);
    mapRef.current.setStyle(newStyle);
  }, [theme, resolvedTheme, mounted]);

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
    .loader {
      border-top-color: #1e90ff;
      border-right-color: #1e90ff30;
      border-bottom-color: #1e90ff30;
      border-left-color: #1e90ff30;
      animation: spin 1s linear infinite;
      filter: drop-shadow(0 0 8px rgba(30, 144, 255, 0.3));
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>

      {/* Loading state with elegant messaging */}
      {isMapLoading || !pointsLoaded ? (
        <div className="flex flex-col items-center justify-center w-full space-y-4 py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="loader border-4 border-t-blue-500 border-gray-200 rounded-full w-12 h-12"></div>
            <div className="text-center space-y-1">
              <div className="text-sm font-medium text-foreground">
                {!mapRef.current
                  ? "Initializing globe projection..."
                  : "Loading IMAX theaters..."}
              </div>
              <div className="text-xs text-muted-foreground">
                {!mapRef.current
                  ? "Setting up interactive 3D world map"
                  : `Fetching ${
                      gpsPoints.length || "theater"
                    } locations worldwide`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Filter badges - keeping exact same pattern */}
          <div className="flex flex-row gap-2 flex-wrap justify-center items-center">
            {(["All", "True IMAX", "LieMAX", "Hybrid", "Other"] as const).map(
              (cat) => {
                const borderColor =
                  cat === "All"
                    ? "#666666"
                    : COLORS[cat as keyof typeof COLORS];
                const isActive = activeFilter === cat;
                const allStripe =
                  "repeating-linear-gradient(135deg, #444 0, #444 8px, #666 8px, #666 16px)";
                // Correct count for each badge
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
                    {cat} {"("}
                    {formatNumberHuman(count)}
                    {")"}
                  </Badge>
                );
              }
            )}
          </div>

          {/* Descriptive text with better spacing */}
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground font-medium">
              {activeFilter === "All"
                ? `Displaying ${formatNumberHuman(
                    gpsPoints.length
                  )} IMAX theaters worldwide`
                : `${CAT_DESCRIPTIONS[activeFilter as GpsPoint["nickname"]]}`}
            </div>
            <div className="text-xs text-muted-foreground opacity-75 flex items-center justify-center gap-1">
              <span>🌍</span>
              <span>
                Interactive 3D globe • Click any point for theater details
              </span>
            </div>
          </div>
        </>
      )}

      {/* 3D Globe Map Container */}
      <div className="relative w-full h-[400px] md:h-[650px] rounded-lg overflow-hidden border border-border/20">
        {(isMapLoading || !pointsLoaded) && (
          <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm ${
              mounted &&
              (theme === "dark" ||
                (theme === "system" && resolvedTheme === "dark"))
                ? "bg-black/70"
                : "bg-white/70"
            }`}
          >
            <div className="flex flex-col items-center space-y-4 w-full max-w-sm">
              <Progress value={loadingProgress} className="w-full h-3" />
              <div className="text-center space-y-2">
                <div className="text-base font-medium text-foreground">
                  {!mapRef.current
                    ? "Preparing Globe View"
                    : "Loading Theater Data"}
                </div>
                <div className="text-sm text-muted-foreground max-w-xs">
                  {!mapRef.current
                    ? "Initializing 3D projection and map tiles..."
                    : "Plotting IMAX locations on the interactive globe..."}
                </div>
                <div className="text-xs text-muted-foreground opacity-75">
                  {loadingProgress}% complete
                </div>
                {gpsPoints.length > 0 && (
                  <div className="text-xs text-muted-foreground opacity-75">
                    {formatNumberHuman(gpsPoints.length)} theaters ready to
                    display
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
};

MapLibreMap.displayName = "MapLibreMap";
export default MapLibreMap;
