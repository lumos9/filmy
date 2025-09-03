import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Feature, FeatureCollection, Point } from "geojson";
import { set } from "nprogress";
import { formatNumberHuman } from "@/lib/utils";

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
  Other: "#AAAAAA", // gray
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

const Map: React.FC<{ gpsPoints: GpsPoint[] }> = ({ gpsPoints }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const gpsPointsRef = useRef<GpsPoint[]>(gpsPoints);
  const [isMapLoading, setIsMapLoading] = useState(true);
  // Keep gpsPointsRef up to date
  useEffect(() => {
    gpsPointsRef.current = gpsPoints;
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
    const source = mapRef.current.getSource("points") as mapboxgl.GeoJSONSource;
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
    if (!mapContainer.current || mapRef.current) return;

    setIsMapLoading(true);

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_DEFAULT_PUBLIC_TOKEN || "";

    const isMobile = window.innerWidth < 768; // typical breakpoint
    const initialZoom = isMobile ? 1 : 3.5;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: [-98.5795, 39.8283],
      zoom: initialZoom,
      attributionControl: false,
      projection: { name: "globe" }, // Enable globe projection
    });

    mapRef.current.once("style.load", () => {
      // Enable globe atmosphere for extra effect
      if (
        mapRef.current &&
        mapRef.current.getProjection &&
        mapRef.current.getProjection().name === "globe"
      ) {
        mapRef.current.setFog({
          color: "#24292f",
          "high-color": "#1e293b",
          "space-color": "#000000",
          "horizon-blend": 0.1,
        });
      }
      setIsMapLoading(false);
      // Add GeoJSON source
      mapRef.current?.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: getFeatures(gpsPoints),
        } as FeatureCollection<Point>,
      });

      // Add layer with categorical colors
      mapRef.current?.addLayer({
        id: "points",
        type: "circle",
        source: "points",
        paint: {
          "circle-radius": isMobile ? 3.3 : 4,
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
        return (
          <div className="relative max-w-xs rounded-lg border bg-card p-4 shadow-md text-left pr-10">
            <button
              onClick={onClose}
              className="cursor-pointer absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-xl"
              aria-label="Close popup"
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="flex flex-col items-start gap-1">
              <div className="text-sm font-medium">{point.metadata.name}</div>
              <div className="text-muted-foreground text-xs">
                {point.metadata.description}
              </div>
              {point.metadata.opened && (
                <div className="text-muted-foreground text-xs">
                  Opened {point.metadata.opened.toLocaleDateString()}
                </div>
              )}
              {point.metadata.screenSizeFt && (
                <div className="text-muted-foreground text-xs">
                  {point.metadata.screenSizeFt}
                </div>
              )}
              <div className="flex items-center space-x-2">
                {(point.metadata.projections?.length || 0) > 0 && (
                  <div className="text-muted-foreground">
                    {point.metadata.projections?.join(", ")}
                  </div>
                )}
                {point.metadata.screenType && (
                  <>
                    <Separator orientation="vertical" />
                    <div className="text-muted-foreground">
                      {point.metadata.screenType}
                    </div>
                  </>
                )}
                {(point.metadata.formats?.length || 0) > 0 && (
                  <>
                    <Separator orientation="vertical" />
                    <div className="text-muted-foreground">
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
          console.log("[Map] Click event fired", e.features);
          const feature = e.features?.[0];
          if (!feature) {
            console.warn("[Map] No feature found on click event");
            return;
          }
          if (feature && feature.properties) {
            console.log("[Map] Feature properties:", feature.properties);
            const id = feature.properties.id as string;
            const found = gpsPointsRef.current.find((p) => p.id === id);
            if (!found) {
              console.warn("[Map] No gpsPoint found for id", id);
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
            popupRef.current = new mapboxgl.Popup({
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
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 items-center justify-center">
      <style>{`
    .mapboxgl-popup-content {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
    }
    .mapboxgl-popup-tip {
      display: none !important;
    }
    .mapboxgl-ctrl-logo {
      display: none !important;
    }
    .loader {
      border-top-color: #1e90ff;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg);}
      100% { transform: rotate(360deg);}
    }
  `}</style>

      {/* Loader or filter badges/description */}
      {isMapLoading ? (
        <div className="flex flex-col items-center justify-center w-full">
          {/* <div className="loader border-4 border-t-blue-500 border-gray-200 rounded-full w-12 h-12 animate-spin mb-4" /> */}
          <div className="text-sm text-muted-foreground">Loading map…</div>
        </div>
      ) : (
        <>
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
                    className="cursor-pointer"
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
          <div className="text-sm text-muted-foreground">
            {activeFilter == "All"
              ? "Showing all IMAX formats around the world"
              : CAT_DESCRIPTIONS[activeFilter as GpsPoint["nickname"]]}
          </div>
        </>
      )}

      {/* 🔹 Map with loader */}
      <div className="relative w-full h-[400px] md:h-[700px] rounded-lg">
        {isMapLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
            <div className="loader border-4 border-t-blue-500 border-gray-200 rounded-full w-12 h-12"></div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
};

Map.displayName = "Map";
export default Map;
