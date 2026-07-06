import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The derived map data is content-stable between rebuilds; cache it hard
        // so the browser/CDN never re-fetches it within the window.
        source: "/screens.geojson",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
