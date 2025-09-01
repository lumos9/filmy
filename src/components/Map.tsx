import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface GpsPoint {
  id: string;
  coordinates: [number, number];
  metadata: {
    name: string;
    description: string;
  };
}

const Map: React.FC<{ gpsPoints: GpsPoint[] }> = ({ gpsPoints }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !mapRef.current) return;
    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_DEFAULT_PUBLIC_TOKEN || "";
    if (!mapRef.current) {
      // do nothing, handled in mount effect
    } else {
      // Update the source data when gpsPoints changes
      if (mapRef.current.getSource("points")) {
        (mapRef.current.getSource("points") as mapboxgl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: gpsPoints.map((point) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: point.coordinates,
            },
            properties: {
              id: point.id,
              name: point.metadata.name,
              description: point.metadata.description,
            },
          })),
        });
      }
    }
  }, [gpsPoints]);

  useEffect(() => {
    if (!mapContainer.current) return;
    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_DEFAULT_PUBLIC_TOKEN || "";
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: gpsPoints[0]?.coordinates || [0, 0],
        attributionControl: false,
        zoom: 3,
      });
      mapRef.current.once("style.load", () => {
        mapRef.current?.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: gpsPoints.map((point) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: point.coordinates,
              },
              properties: {
                id: point.id,
                name: point.metadata.name,
                description: point.metadata.description,
              },
            })),
          },
        });
        mapRef.current?.addLayer({
          id: "points",
          type: "circle",
          source: "points",
          paint: {
            "circle-radius": 5,
            "circle-color": "red",
          },
        });
        // Add click handler for points
        // --- React popup rendering ---
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
              <div className="font-bold flex flex-wrap">
                {point.metadata.name}
              </div>
              <div className="text-xs">{point.metadata.description}</div>
            </div>
          );
        }
        mapRef.current?.on("click", "points", (e) => {
          const feature = e.features && e.features[0];
          if (feature && feature.properties) {
            const id = feature.properties.id;
            const found = gpsPoints.find((p) => p.id === id);
            if (found) {
              if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
              }
              const popupNode = document.createElement("div");
              // Custom close handler
              const handleClose = () => {
                if (popupRef.current) {
                  popupRef.current.remove();
                  popupRef.current = null;
                }
              };
              createRoot(popupNode).render(
                <MapPopupCard point={found} onClose={handleClose} />
              );
              popupRef.current = new mapboxgl.Popup({
                closeOnClick: true,
                offset: 12,
                closeButton: false, // Hide Mapbox default close button
              })
                .setLngLat(found.coordinates)
                .setDOMContent(popupNode)
                .addTo(mapRef.current!);
            }
          }
        });
        // Change cursor on hover
        mapRef.current?.on("mouseenter", "points", () => {
          mapRef.current?.getCanvas().style.setProperty("cursor", "pointer");
        });
        mapRef.current?.on("mouseleave", "points", () => {
          mapRef.current?.getCanvas().style.setProperty("cursor", "");
        });
      });
    }
    // Cleanup on unmount
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [gpsPoints]);

  return (
    <>
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
        .mapboxgl-popup-close-button {
          display: none !important;
        }
        .mapboxgl-ctrl-logo {
          display: none !important; /* 🚫 hides Mapbox logo */
        }
      `}</style>
      <div
        className="w-full h-[400px] md:h-[700px] rounded-lg"
        ref={mapContainer}
      />
    </>
  );
};

Map.displayName = "Map";

export default Map;
