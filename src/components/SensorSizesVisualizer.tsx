"use client";
import React, { useState } from "react";
import { SENSORS } from "@/lib/sensors";
import { CAMERAS } from "@/lib/camera";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Find the largest sensor for scaling
const maxW = Math.max(...SENSORS.map((s) => s.width));
const maxH = Math.max(...SENSORS.map((s) => s.height));
// Responsive scale: larger on desktop, smaller on mobile
function getScale() {
  // if (typeof window !== "undefined") {
  //   if (window.innerWidth < 640) return 8.5; // mobile
  //   if (window.innerWidth < 1024) return 11; // tablet
  //   return 15; // desktop
  // }
  return 3.5;
}

// Import shadcn/ui Select components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Separator } from "@radix-ui/react-dropdown-menu";

// Searchable dropdown component for sensors
function SensorSelectDropdown({
  sensors,
  active,
  setActive,
}: {
  sensors: typeof SENSORS;
  active: number;
  setActive: (idx: number) => void;
}) {
  const [search, setSearch] = React.useState("");
  const filtered = search.trim()
    ? sensors.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : sensors;
  return (
    <>
      {/* <input
        type="text"
        className="mb-2 w-full max-w-xl rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search sensors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search sensors"
      /> */}
      <Select
        value={String(active)}
        onValueChange={(val) => setActive(Number(val))}
      >
        <SelectTrigger className="w-full max-w-xl">
          <SelectValue placeholder="Select a sensor format..." />
        </SelectTrigger>
        <SelectContent className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-muted-foreground text-sm">
              No sensors found
            </div>
          ) : (
            filtered.map((sensor) => (
              <SelectItem
                key={sensor.name}
                value={String(sensors.indexOf(sensor))}
              >
                {sensor.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </>
  );
}

// Message component to show the scale factor
function ScaleMessage({ scale }: { scale: number }) {
  let msg = "";
  if (scale >= 1) {
    msg = `All sensors are shown at 1:${Math.round(
      scale
    )} scale compared to real-world size.`;
  } else {
    msg = `All sensors are enlarged by ${Math.round(
      1 / scale
    )}x compared to real-world size.`;
  }
  return (
    <div className="text-xs text-muted-foreground mt-1 text-center">{msg}</div>
  );
}

export default function SensorSizesVisualizer() {
  const [active, setActive] = useState<number>(0);
  const [scale, setScale] = React.useState(getScale());

  // Update scale on resize
  React.useEffect(() => {
    function handleResize() {
      setScale(getScale());
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="md:container mx-auto p-4 max-w-md flex flex-col items-center gap-2 md:gap-4">
      {/* Heading */}
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-bold">Sensor Sizes</h1>
        <div className="text-center text-muted-foreground text-sm md:text-base">
          Explore a visual guide to camera and projector sensor sizes. Select a
          sensor to highlight its size below.
        </div>
      </div>

      {/* Sensor dropdown using shadcn/ui Select with search */}
      <div className="w-full flex flex-col items-center gap-2">
        <SensorSelectDropdown
          sensors={SENSORS}
          active={active}
          setActive={setActive}
        />
        <ScaleMessage scale={scale} />
      </div>

      {/* Sensor visualization (z-index 0 to stay behind dropdown/popover) */}
      <div
        className="relative touch-none mx-auto z-0"
        style={{
          width: `min(${maxW * scale + 40}px, 100vw)`,
          height: `min(${maxH * scale + 40}px, 60vw, 70vh)`,
          maxWidth: "100vw",
          maxHeight: "70vh",
        }}
      >
        {/* Render sensors from largest to smallest for correct stacking */}
        {[...SENSORS]
          .map((sensor, idx) => ({ sensor, idx }))
          .sort(
            (a, b) =>
              b.sensor.width * b.sensor.height -
              a.sensor.width * a.sensor.height
          )
          .map(({ sensor, idx }) => {
            const left = ((maxW - sensor.width) * scale) / 2 + 20;
            const top = ((maxH - sensor.height) * scale) / 2 + 20;
            const isActive = active === idx;
            return (
              <div
                key={sensor.name}
                className={`absolute transition-all duration-200 border-2 cursor-pointer flex items-center justify-center
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-100/30 dark:bg-blue-900/30 z-30"
                      : "border-muted bg-background/80"
                  }
                `}
                style={{
                  left,
                  top,
                  width: sensor.width * scale,
                  height: sensor.height * scale,
                  borderRadius: sensor.aspect === "1:1" ? 12 : 6,
                  boxShadow: isActive
                    ? "0 0 0 4px #3b82f6aa"
                    : "0 1px 8px #0002",
                  zIndex: isActive ? 100 : 10 + idx,
                  opacity: 1,
                  filter: isActive ? "none" : "grayscale(0.2) blur(0.08px)",
                  transition: "opacity 0.2s, filter 0.2s",
                }}
                onClick={() => setActive(idx)}
                aria-label={sensor.name}
                tabIndex={0}
                role="button"
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") && setActive(idx)
                }
              />
            );
          })}
      </div>

      {/* Sensor details */}
      <div className="rounded-lg border p-4 shadow-md flex flex-col items-center gap-2 text-sm md:text-base">
        <div className="flex flex-col items-center justify-center gap-1 py-2">
          <div className="font-bold text-lg">{SENSORS[active]?.name}</div>
          <div className="text-sm text-muted-foreground">
            {SENSORS[active]?.width}mm × {SENSORS[active]?.height}mm &nbsp; (
            {SENSORS[active]?.aspect})
          </div>
          <div className="text-center">{SENSORS[active]?.desc}</div>
        </div>

        <Separator className="w-full border" />

        <div className="flex flex-col py-2">
          <div className="flex flex-col gap-4 items-center justify-center">
            <div className="font-bold text-muted-foreground">
              Compatible Cameras
            </div>
            {CAMERAS[SENSORS[active].name]?.length ? (
              <div className="flex flex-col items-center justify-center gap-1">
                {CAMERAS[SENSORS[active].name].map((cam) => (
                  <div key={cam}>{cam}</div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No cameras listed for this sensor yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
