import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
  const mapRef = useRef<mapboxgl.Map | null>(null); // Create a ref for the map instance

  useEffect(() => {
    if (!mapContainer.current || !mapRef.current) return; // Ensure container is available

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_DEFAULT_PUBLIC_TOKEN || "";

    // Initialize the map only if it hasn't been initialized yet
    if (!mapRef.current) {
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

    console.log("mounting");

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_DEFAULT_PUBLIC_TOKEN || "";

    // Initialize the map only if it hasn't been initialized yet
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v10",
        center: gpsPoints[0]?.coordinates || [0, 0], // Default center
        zoom: 3,
      });

      // Add source and layer when the style has loaded
      (mapRef.current as mapboxgl.Map)?.once("style.load", () => {
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
      });
    }
    return () => {
      // Clean up the map instance on unmount
      if (mapRef.current) {
        mapRef.current.remove(); // Remove the map instance
        mapRef.current = null; // Clear the map reference
      }
      console.log("unmounting");
    };
  }, []); // <-- Empty dependency array to run only on mount

  return (
    <div
      className="w-full h-[400px] md:h-[700px] rounded-lg"
      ref={mapContainer}
    />
  );
};

Map.displayName = "Map";

export default Map;
