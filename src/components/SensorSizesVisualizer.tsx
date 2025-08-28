"use client";
import React, { useState } from "react";

// Comprehensive sensor data (cinema, digital, legacy, IMAX, etc)
const SENSORS = [
  {
    name: "IMAX 70mm",
    width: 70.41,
    height: 52.63,
    aspect: "4:3",
    desc: "IMAX film, the largest widely used film format.",
  },
  {
    name: "IMAX Digital",
    width: 25.91,
    height: 48.5,
    aspect: "1.9:1",
    desc: "IMAX digital projection sensor size.",
  },
  {
    name: "VistaVision",
    width: 37.72,
    height: 24.92,
    aspect: "3:2",
    desc: "Classic Hollywood widescreen film format.",
  },
  {
    name: "65mm (5-perf)",
    width: 52.48,
    height: 23.01,
    aspect: "2.28:1",
    desc: "Large format film, used for epics and special effects.",
  },
  {
    name: "Super 35",
    width: 24.89,
    height: 18.66,
    aspect: "4:3",
    desc: "Cinema and broadcast standard.",
  },
  {
    name: "Full Frame (35mm)",
    width: 36,
    height: 24,
    aspect: "3:2",
    desc: "Standard for high-end cameras and cinema.",
  },
  {
    name: "APS-H",
    width: 28.7,
    height: 19,
    aspect: "3:2",
    desc: "Canon 1D series, between full frame and APS-C.",
  },
  {
    name: "APS-C",
    width: 23.6,
    height: 15.7,
    aspect: "3:2",
    desc: "Common in DSLRs and mirrorless cameras.",
  },
  {
    name: "Micro Four Thirds",
    width: 17.3,
    height: 13,
    aspect: "4:3",
    desc: "Popular for compact and video cameras.",
  },
  {
    name: "Super 16mm",
    width: 12.52,
    height: 7.41,
    aspect: "1.69:1",
    desc: "Classic film and digital video format.",
  },
  {
    name: "1-inch",
    width: 13.2,
    height: 8.8,
    aspect: "3:2",
    desc: "Used in premium compacts and some video cams.",
  },
  {
    name: "2/3-inch",
    width: 8.8,
    height: 6.6,
    aspect: "4:3",
    desc: "Broadcast and industrial cameras.",
  },
  {
    name: "1/1.7-inch",
    width: 7.6,
    height: 5.7,
    aspect: "4:3",
    desc: "High-end compact cameras.",
  },
  {
    name: "1/2.3-inch",
    width: 6.17,
    height: 4.55,
    aspect: "4:3",
    desc: "Most compact and smartphone cameras.",
  },
  {
    name: "Super 8mm",
    width: 5.79,
    height: 4.01,
    aspect: "1.44:1",
    desc: "Classic home movie film format.",
  },
  {
    name: "Medium Format (44x33)",
    width: 44,
    height: 33,
    aspect: "4:3",
    desc: "Larger than full frame, for ultra-high-res.",
  },
  {
    name: "Medium Format (53.7x40.4)",
    width: 53.7,
    height: 40.4,
    aspect: "4:3",
    desc: "Largest digital medium format sensors.",
  },
];

// Find the largest sensor for scaling
const maxW = Math.max(...SENSORS.map((s) => s.width));
const maxH = Math.max(...SENSORS.map((s) => s.height));
// Responsive scale: larger on desktop, smaller on mobile
function getScale() {
  if (typeof window !== "undefined") {
    if (window.innerWidth < 640) return 8.5; // mobile
    if (window.innerWidth < 1024) return 11; // tablet
    return 15; // desktop
  }
  return 3.5;
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
    <div className="md:container flex flex-col items-center justify-center py-4 gap-4">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Sensor Sizes</h1>
        <p className="w-full text-muted-foreground">
          Explore a visual guide to camera and projector sensor sizes. Select a
          sensor to highlight its size below.
        </p>
      </div>

      {/* Sensor button group */}
      <div className="w-full max-w-3xl">
        <div className="w-full flex justify-center items-center flex-wrap gap-2 px-2 pb-2">
          {SENSORS.map((sensor, idx) => (
            <button
              key={sensor.name}
              className={`px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors
                ${
                  active === idx
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-background border-muted hover:bg-accent hover:text-accent-foreground"
                }
              `}
              onClick={() => setActive(idx)}
            >
              {sensor.name}
            </button>
          ))}
        </div>
      </div>
      {/* Sensor visualization */}
      <div
        className="relative touch-none"
        style={{
          width: maxW * scale + 40,
          height: maxH * scale + 40,
          maxWidth: "100vw",
          maxHeight: "60vw",
        }}
      >
        {SENSORS.map((sensor, idx) => {
          const left = ((maxW - sensor.width) * scale) / 2 + 20;
          const top = ((maxH - sensor.height) * scale) / 2 + 20;
          return (
            <div
              key={sensor.name}
              className={`absolute transition-all duration-200 border-2 cursor-pointer flex items-center justify-center
                ${
                  active === idx
                    ? "border-blue-500 bg-blue-100/30 dark:bg-blue-900/30 z-20"
                    : "border-muted bg-background/80 z-10"
                }
              `}
              style={{
                left,
                top,
                width: sensor.width * scale,
                height: sensor.height * scale,
                borderRadius: sensor.aspect === "1:1" ? 12 : 6,
                boxShadow:
                  active === idx ? "0 0 0 4px #3b82f6aa" : "0 1px 8px #0002",
                zIndex: active === idx ? 30 : 10 + idx,
              }}
              onClick={() => setActive(idx)}
            >
              <span className="text-xs font-semibold select-none pointer-events-none">
                {sensor.name}
              </span>
            </div>
          );
        })}
      </div>
      {/* Sensor details */}
      <div className="max-w-md flex flex-col items-center">
        <div className="rounded-lg border bg-card p-4 shadow-md w-full text-left">
          <div className="font-bold text-lg mb-1">{SENSORS[active]?.name}</div>
          <div className="text-sm text-muted-foreground mb-1">
            {SENSORS[active]?.width}mm × {SENSORS[active]?.height}mm &nbsp; (
            {SENSORS[active]?.aspect})
          </div>
          <div className="text-base">{SENSORS[active]?.desc}</div>
        </div>
      </div>
    </div>
  );
}
