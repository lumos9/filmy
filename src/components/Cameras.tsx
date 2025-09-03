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
  return (
    <div className="flex flex-col p-2 gap-2 cursor-pointer items-center justify-center hover:bg-secondary">
      <div className="w-40 h-60 overflow-hidden rounded-md shadow-md ">
        <img src={poster} alt={title} className="w-full h-60 object-cover" />
      </div>
      <div className="flex flex-col items-center justify-center">
        <div className="text-sm font-bold break-words">{title}</div>
        <div className="text-sm text-muted-foreground">{releaseDate}</div>
      </div>
    </div>
  );
}

function MoviesForCamera({ cameraName }: { cameraName: string }) {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    console.log("Fetching movies for camera:", cameraName);
    fetch(`/api/movies/${encodeURIComponent(cameraName)}`)
      .then((res) => res.json())
      .then((data) => setMovies(data))
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
        <div className="text-muted-foreground">
          No movies found for this camera / sensor
        </div>
      </div>
    );

  return (
    <div className="w-full max-w-4xl mt-4">
      <h2 className="font-semibold mb-2 text-center text-muted-foreground">
        Notable films
      </h2>
      <div className="flex flex-row items-center justify-center gap-2 flex-wrap overflow-x-auto">
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
    <div className="md:container mx-auto p-4 max-w-md flex flex-col items-center gap-2 md:gap-4">
      {/* Camera dropdown using shadcn/ui Select with search */}
      <CamerasSelectDropdown
        cameras={CAMERAS}
        active={active}
        setActive={setActive}
      />

      {/* Camera details */}
      <div className="rounded-lg border p-4 shadow-md flex flex-col items-center gap-2 text-sm md:text-base">
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
