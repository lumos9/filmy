"use client";

import React, { useState } from "react";
import { CAMERAS } from "@/lib/camera";
import { useEffect } from "react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Separator } from "@radix-ui/react-dropdown-menu";

// Searchable dropdown component for cameras
function CamerasSelectDropdown({
  cameras,
  active,
  setActive,
}: {
  cameras: typeof CAMERAS;
  active: number;
  setActive: (idx: number) => void;
}) {
  const [search, setSearch] = React.useState("");
  const filtered = search.trim()
    ? cameras.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : cameras;
  return (
    <>
      <Select
        value={String(active)}
        onValueChange={(val) => setActive(Number(val))}
      >
        <SelectTrigger className="w-full max-w-xl">
          <SelectValue placeholder="Select a camera..." />
        </SelectTrigger>
        <SelectContent className="max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-muted-foreground text-sm">
              No cameras found
            </div>
          ) : (
            filtered.map((camera) => (
              <SelectItem
                key={camera.name}
                value={String(cameras.indexOf(camera))}
              >
                {camera.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </>
  );
}

function MovieCard({
  title,
  releaseDate,
  poster,
}: {
  title: string;
  releaseDate: string;
  poster: string;
}) {
  const year = releaseDate ? releaseDate.split("-")[0] : "Unknown";

  return (
    <div className="flex flex-col p-2 gap-2 cursor-pointer items-center justify-center hover:bg-secondary">
      <div className="w-40 h-60 overflow-hidden rounded-md shadow-md bg-muted flex items-center justify-center">
        {poster ? (
          <img src={poster} alt={title} className="w-full h-60 object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-12 h-12 mb-2 opacity-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="w-full h-full"
              >
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <div className="text-xs text-center px-2">No poster</div>
          </div>
        )}
      </div>
      <div className="w-40 flex flex-col gap-1 items-center justify-center h-12">
        <div className="text-sm font-bold text-center leading-tight w-full">
          {title}
        </div>
        <div className="text-sm text-muted-foreground">{year}</div>
      </div>
    </div>
  );
}

function MoviesForCamera({ cameraName }: { cameraName: string }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/movies/${encodeURIComponent(cameraName)}`)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
      })
      .finally(() => setLoading(false));
  }, [cameraName]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!movies.length)
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-muted-foreground">No data</div>
      </div>
    );

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 py-2">
      <h2 className="text-xl font-semibold text-center text-muted-foreground">
        Notable films
      </h2>
      <div className="text-muted-foreground text-xs md:text-sm">
        Notable films shot with the {cameraName}
      </div>
      <div className="flex flex-row flex-wrap items-center justify-center">
        {movies.map((m) => (
          <MovieCard
            key={m.id}
            title={m.title}
            releaseDate={m.releaseDate}
            poster={m.poster}
          />
        ))}
      </div>
    </div>
  );
}

export default function Cameras() {
  const [active, setActive] = useState<number>(0);

  return (
    <div className="sm:container sm:mx-auto md:p-4 w-full flex flex-col items-center gap-2 md:gap-4">
      {/* Camera dropdown using shadcn/ui Select with search */}
      <CamerasSelectDropdown
        cameras={CAMERAS}
        active={active}
        setActive={setActive}
      />

      {/* Camera details */}
      <div className="w-full rounded-lg border py-4 md:px-4 shadow-md flex flex-col items-center gap-2 text-sm md:text-base">
        <div className="flex flex-row items-center justify-center gap-1">
          <div className="flex flex-col border rounded-md items-center justify-center p-4 gap-2">
            <div className="text-muted-foreground">Camera</div>
            <div className="text-sm font-medium text-center">
              {CAMERAS[active]?.name}
            </div>
          </div>
          <div className="flex flex-col border rounded-md items-center justify-center p-4 gap-2">
            <div className="text-muted-foreground">Sensor</div>
            <div className="text-sm font-medium text-center">
              {CAMERAS[active]?.sensor}
            </div>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-center text-muted-foreground">
          {CAMERAS[active]?.desc}
        </div>

        <Separator className="w-full border" />

        <MoviesForCamera cameraName={CAMERAS[active]?.name} />
      </div>
    </div>
  );
}
