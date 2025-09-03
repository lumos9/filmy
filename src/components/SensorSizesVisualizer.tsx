"use client";
import React, { useState } from "react";

// Comprehensive sensor data (cinema, digital, legacy, IMAX, etc)
// const SENSORS = [
//   {
//     name: "IMAX 70mm",
//     width: 70.41,
//     height: 52.63,
//     aspect: "4:3",
//     desc: "IMAX film, the largest widely used film format",
//   },
//   {
//     name: "IMAX Digital",
//     width: 25.91,
//     height: 48.5,
//     aspect: "1.9:1",
//     desc: "IMAX digital projection sensor size",
//   },
//   {
//     name: "VistaVision",
//     width: 37.72,
//     height: 24.92,
//     aspect: "3:2",
//     desc: "Classic Hollywood widescreen film format",
//   },
//   {
//     name: "65mm (5-perf)",
//     width: 52.48,
//     height: 23.01,
//     aspect: "2.28:1",
//     desc: "Large format film, used for epics and special effects",
//   },
//   {
//     name: "Super 35",
//     width: 24.89,
//     height: 18.66,
//     aspect: "4:3",
//     desc: "Cinema and broadcast standard",
//   },
//   {
//     name: "Full Frame (35mm)",
//     width: 36,
//     height: 24,
//     aspect: "3:2",
//     desc: "Standard for high-end cameras and cinema",
//   },
//   {
//     name: "APS-H",
//     width: 28.7,
//     height: 19,
//     aspect: "3:2",
//     desc: "Canon 1D series, between full frame and APS-C",
//   },
//   {
//     name: "APS-C",
//     width: 23.6,
//     height: 15.7,
//     aspect: "3:2",
//     desc: "Common in DSLRs and mirrorless cameras",
//   },
//   {
//     name: "Micro Four Thirds",
//     width: 17.3,
//     height: 13,
//     aspect: "4:3",
//     desc: "Popular for compact and video cameras",
//   },
//   {
//     name: "Super 16mm",
//     width: 12.52,
//     height: 7.41,
//     aspect: "1.69:1",
//     desc: "Classic film and digital video format",
//   },
//   {
//     name: "1-inch",
//     width: 13.2,
//     height: 8.8,
//     aspect: "3:2",
//     desc: "Used in premium compacts and some video cams",
//   },
//   {
//     name: "2/3-inch",
//     width: 8.8,
//     height: 6.6,
//     aspect: "4:3",
//     desc: "Broadcast and industrial cameras",
//   },
//   {
//     name: "1/1.7-inch",
//     width: 7.6,
//     height: 5.7,
//     aspect: "4:3",
//     desc: "High-end compact cameras",
//   },
//   {
//     name: "1/2.3-inch",
//     width: 6.17,
//     height: 4.55,
//     aspect: "4:3",
//     desc: "Most compact and smartphone cameras",
//   },
//   {
//     name: "Super 8mm",
//     width: 5.79,
//     height: 4.01,
//     aspect: "1.44:1",
//     desc: "Classic home movie film format",
//   },
//   {
//     name: "Medium Format (44x33)",
//     width: 44,
//     height: 33,
//     aspect: "4:3",
//     desc: "Larger than full frame, for ultra-high-res",
//   },
//   {
//     name: "Medium Format (53.7x40.4)",
//     width: 53.7,
//     height: 40.4,
//     aspect: "4:3",
//     desc: "Largest digital medium format sensors",
//   },
// ];

const SENSORS = [
  {
    name: "IMAX 65mm (15-perf)",
    width: 70.41,
    height: 56.62,
    aspect: "1.24:1",
    desc: "IMAX 15-perf horizontal 65mm capture area (camera negative)",
  },
  {
    name: "65mm (5-perf)",
    width: 52.15,
    height: 23.07,
    aspect: "2.26:1",
    desc: "Traditional 65mm 5-perf capture area (camera negative)",
  },
  {
    name: "VistaVision (35mm 8-perf)",
    width: 37.72,
    height: 24.92,
    aspect: "1.51:1",
    desc: "35mm film run horizontally; classic Vistavision capture",
  },
  {
    name: "35mm 4-perf (Academy)",
    width: 24.9,
    height: 18.7,
    aspect: "1.33:1",
    desc: "Standard 35mm 4-perf camera capture area",
  },
  {
    name: "35mm 3-perf",
    width: 24.9,
    height: 13.9,
    aspect: "1.79:1",
    desc: "3-perf variant for native widescreen efficiency",
  },
  {
    name: "35mm 2-perf (Techniscope)",
    width: 24.9,
    height: 9.35,
    aspect: "2.66:1",
    desc: "2-perf widescreen capture; very economical on stock",
  },
  {
    name: "Super 16",
    width: 12.42,
    height: 7.44,
    aspect: "1.67:1",
    desc: "Wider image area than regular 16mm",
  },
  {
    name: "Super 8 (regular gate)",
    width: 5.79,
    height: 4.01,
    aspect: "1.44:1",
    desc: "Classic home-movie format",
  },
  {
    name: "Super 8 (extended gate)",
    width: 6.3,
    height: 4.2,
    aspect: "1.50:1",
    desc: "Extended gate Super 8 capture",
  },

  // ARRI
  {
    name: "ARRI ALEXA 65 (Open Gate)",
    width: 54.12,
    height: 25.58,
    aspect: "2.12:1",
    desc: "Large-format ALEV III 65mm digital sensor (Open Gate)",
  },
  {
    name: "ARRI ALEXA LF / Mini LF (Open Gate)",
    width: 36.7,
    height: 25.54,
    aspect: "1.44:1",
    desc: "ARRI LF large-format sensor active area (Open Gate)",
  },
  {
    name: "ARRI ALEXA 35 (Open Gate 3:2)",
    width: 28.0,
    height: 19.2,
    aspect: "1.46:1",
    desc: "Super 35 ALEV 4 sensor active area in 3:2 Open Gate",
  },

  // RED
  {
    name: "RED V-RAPTOR 8K VV",
    width: 40.96,
    height: 21.6,
    aspect: "1.90:1",
    desc: "RED 8K full-frame/VV sensor active area",
  },
  {
    name: "RED MONSTRO 8K VV",
    width: 40.96,
    height: 21.6,
    aspect: "1.90:1",
    desc: "MONSTRO full-frame/VV sensor active area",
  },
  {
    name: "RED KOMODO 6K (S35)",
    width: 27.03,
    height: 14.26,
    aspect: "1.90:1",
    desc: "KOMODO Super 35 global-shutter sensor",
  },

  // Sony
  {
    name: "Sony VENICE 2 (8.6K FF, Open Gate)",
    width: 36.0,
    height: 24.0,
    aspect: "3:2",
    desc: "CineAlta full-frame sensor (Open Gate, representative FF dims)",
  },

  // Canon
  {
    name: "Canon EOS C500 Mark II (FF DCI area)",
    width: 38.1,
    height: 20.1,
    aspect: "1.90:1",
    desc: "Cinema EOS full-frame DCI active image area",
  },
  {
    name: "Canon EOS C300 (Super 35)",
    width: 24.6,
    height: 13.8,
    aspect: "1.78:1",
    desc: "Canon Super 35 active image area",
  },

  // Blackmagic Design
  {
    name: "Blackmagic URSA Mini Pro 12K (S35)",
    width: 27.03,
    height: 14.25,
    aspect: "1.90:1",
    desc: "Blackmagic 12K Super 35 sensor active area",
  },
  {
    name: "Blackmagic Pocket Cinema Camera 6K (S35)",
    width: 23.1,
    height: 12.99,
    aspect: "1.78:1",
    desc: "Pocket 6K Super 35 sensor active area",
  },

  // Panasonic
  {
    name: "Panasonic VariCam 35 (S35)",
    width: 35.9,
    height: 18.7,
    aspect: "1.92:1",
    desc: "Panasonic S35 cinema sensor",
  },

  // Common still/video formats
  {
    name: "Full Frame (35mm still)",
    width: 36.0,
    height: 24.0,
    aspect: "3:2",
    desc: "35mm stills equivalent; widely used in cinema FF cameras",
  },
  {
    name: "APS-C (typical)",
    width: 23.6,
    height: 15.7,
    aspect: "3:2",
    desc: "Typical APS-C active area (varies slightly by maker)",
  },
  {
    name: "Micro Four Thirds",
    width: 17.3,
    height: 13.0,
    aspect: "4:3",
    desc: "MFT active imaging area",
  },
  {
    name: 'Type 1" (1-inch)',
    width: 13.2,
    height: 8.8,
    aspect: "3:2",
    desc: "Common compact/video sensor size (naming is legacy)",
  },
];

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
    <div className="w-full flex flex-col items-center justify-center p-4 gap-2 md:gap-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-bold">Sensor Sizes</h1>
        <div className="text-center text-muted-foreground text-sm md:text-base">
          Explore a visual guide to camera and projector sensor sizes. Select a
          sensor to highlight its size below.
        </div>
      </div>

      {/* Sensor dropdown using shadcn/ui Select with search */}
      <div className="w-full max-w-3xl flex flex-col items-center px-2 pb-2 gap-2">
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
      {/* Sensor details below visualizer */}
      <div className="max-w-md flex flex-col items-center justify-center text-center gap-2">
        <div className="font-bold text-lg mb-1 text-blue-700 dark:text-blue-200">
          {SENSORS[active]?.name}
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-md w-full flex flex-col items-center gap-1">
          <div className="text-sm text-muted-foreground">
            {SENSORS[active]?.width}mm × {SENSORS[active]?.height}mm &nbsp; (
            {SENSORS[active]?.aspect})
          </div>
          <div className="text-base">{SENSORS[active]?.desc}</div>
        </div>
      </div>
    </div>
  );
}
