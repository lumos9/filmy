import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Feature, FeatureCollection, Point } from "geojson";
import { set } from "nprogress";

export interface GpsPoint {
  id: string;
  coordinates: [number, number];
  metadata: {
    name: string;
    description: string;
  };
  nickname: "True IMAX" | "LieMAX" | "Hybrid" | "Other";
}

const COLORS: Record<GpsPoint["nickname"], string> = {
  "True IMAX": "#1E90FF", // blue
  LieMAX: "#FF4500", // orange
  Hybrid: "#32CD32", // green
  Other: "#AAAAAA", // gray
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
  const [isMapLoading, setIsMapLoading] = useState(true);

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

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v10",
      center: gpsPoints[0]?.coordinates || [0, 0],
      zoom: 2,
      attributionControl: false,
    });

    mapRef.current.once("style.load", () => {
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
          "circle-radius": 4,
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
      });

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
            <div className="font-bold">{point.metadata.name}</div>
            <div className="text-xs">{point.metadata.description}</div>
            <div className="text-xs mt-1 italic text-muted-foreground">
              {point.nickname}
            </div>
          </div>
        );
      }

      // Click popup
      mapRef.current?.on("click", "points", (e) => {
        const feature = e.features?.[0];
        if (feature && feature.properties) {
          const id = feature.properties.id as string;
          const found = gpsPoints.find((p) => p.id === id);
          if (found) {
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
        }
      });

      // Cursor style
      mapRef.current?.on("mouseenter", "points", () => {
        mapRef.current?.getCanvas().style.setProperty("cursor", "pointer");
      });
      mapRef.current?.on("mouseleave", "points", () => {
        mapRef.current?.getCanvas().style.setProperty("cursor", "");
      });
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

      {/* 🔹 Filter badges */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "True IMAX", "LieMAX", "Hybrid", "Other"] as const).map(
          (cat) => {
            const borderColor =
              cat === "All" ? "#666666" : COLORS[cat as keyof typeof COLORS];
            const isActive = activeFilter === cat;
            const allStripe =
              "repeating-linear-gradient(135deg, #444 0, #444 8px, #666 8px, #666 16px)";

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
                {cat}
              </Badge>
            );
          }
        )}
      </div>

      {/* 🔹 Counts and explanations for active filter only */}
      {(() => {
        const CAT_DESCRIPTIONS: Record<GpsPoint["nickname"], string> = {
          "True IMAX": "Full IMAX experience, large screen & proprietary tech",
          LieMAX: "IMAX branding but smaller/different tech",
          Hybrid: "Mix of IMAX and other projection features",
          Other: "Other/unspecified formats",
        };
        const count = gpsPoints.filter(
          (p) => p.nickname === activeFilter
        ).length;
        const desc = CAT_DESCRIPTIONS[activeFilter as GpsPoint["nickname"]];

        return (
          <div className="text-sm text-muted-foreground">
            {activeFilter == "All" ? "Showing all IMAX formats" : desc}
          </div>
          // <Card className="mb-2 w-full max-w-lg mx-auto bg-muted/60 border-muted-foreground/10">
          //   <CardContent className="py-3 flex items-center gap-2 text-sm text-muted-foreground">
          //     <span
          //       className="inline-block w-3 h-3 rounded-full"
          //       style={{
          //         backgroundColor: COLORS[activeFilter as keyof typeof COLORS],
          //       }}
          //     ></span>
          //     <span className="font-medium text-primary">{activeFilter}</span>
          //     <span className="mx-1">•</span>
          //     <span>{count} locations</span>
          //     <span className="mx-1">—</span>
          //     <span>{desc}</span>
          //   </CardContent>
          // </Card>
        );
      })()}

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
