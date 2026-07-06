import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The derived map data changes on every redeploy, so cache it but always
        // revalidate: the browser sends a conditional GET and gets a cheap 304
        // when unchanged, yet picks up new data immediately after a deploy
        // (no stale classification).
        source: "/screens.geojson",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
