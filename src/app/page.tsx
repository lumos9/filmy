"use client";

import { Button } from "@/components/ui/button";
import { Film, Globe, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Fullscreen background image with overlay */}
      <img
        src="/assets/images/bg.jpeg"
        alt="Cinema background"
        className="fixed inset-0 w-full h-full object-cover object-center md:opacity-60 scale-105 z-0 select-none pointer-events-none transition-all duration-700"
        draggable={false}
        aria-hidden="true"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-[#0f172a]/90 z-10" />

      {/* Hero content */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center px-4 py-24 gap-8 w-full">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 text-primary font-bold text-4xl md:text-6xl tracking-tight drop-shadow-lg animate-pop">
            <Film className="w-8 h-8 md:w-12 md:h-12 text-primary animate-pop" />
            Filmy
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white max-w-3xl animate-fade-in">
            Uncover True IMAX, Visualize Cinema’s Soul
          </h1>
          <span className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl animate-fade-in">
            Map theaters, compare sensors, join the film tech revolution.
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mt-4 animate-fade-in">
          <Link href="/screens">
            <Button
              size="lg"
              className="text-lg font-semibold px-8 py-5 shadow-xl hover:bg-primary/90 transition-all duration-300"
            >
              <Globe className="w-5 h-5 mr-2" /> Explore Screens
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              size="lg"
              className="text-lg font-semibold px-8 py-5 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 text-primary mr-2" /> Learn More
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
