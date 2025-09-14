"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import VisitorTracker from "@/components/VisitorTracker";
import { Film, Globe, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function VisitorCount() {
  const [uniqueCount, setUniqueCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const res = await fetch("/api/visitors/getCount", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch visitor count");

        const data = await res.json();
        //console.log("Fetched unique visitor count:", data);
        setUniqueCount(data.uniqueVisitors);
      } catch (error) {
        console.error("Error fetching visitor count:", error);
        setUniqueCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorCount();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" variant="spinner" />
        <span className="text-sm text-muted-foreground">
          Loading visitor count...
        </span>
      </div>
    );
  }

  return (
    // <Badge variant="secondary" className="w-full text-sm md:w-auto">
    //   <div className="break-words">
    //     {uniqueCount.toLocaleString()} unique{" "}
    //     {uniqueCount === 1 ? "explorer" : "explorers"} uncovered cinema's soul
    //     in last 7 days <Globe className="w-4 h-4 ml-1 inline" />
    //   </div>
    // </Badge>
    <div className="rounded-lg text-sm w-full p-2 text-white">
      <Globe className="w-4 h-4 mr-1 inline" />
      {uniqueCount.toLocaleString()} unique{" "}
      {uniqueCount === 1 ? "explorer" : "explorers"} uncovered cinema's soul in
      last 7 days
    </div>
  );
}

export default function Home() {
  const [trackingSuccessful, setTrackingSuccessful] = useState<boolean | null>(
    null
  );

  const handleTrackingComplete = (success: boolean) => {
    setTrackingSuccessful(success);
  };

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Fullscreen background image with overlay */}
      <Image
        src="/assets/images/bg.jpeg"
        alt="Cinema background"
        fill
        className="object-cover object-center md:opacity-60 scale-105 select-none pointer-events-none"
        priority
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-[#0f172a]/90 z-10" />

      {/* Hero content */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center px-4 py-24 gap-8 w-full">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-2 text-white font-bold text-4xl md:text-6xl tracking-tight drop-shadow-lg animate-pop">
            <Film className="w-8 h-8 md:w-12 md:h-12 text-white animate-pop" />
            Filmy
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white max-w-3xl animate-fade-in">
            Uncover True IMAX, Visualize Cinema’s Soul
          </h1>
          <span className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl animate-fade-in">
            Map theaters, compare sensors, join the film tech revolution.
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center animate-fade-in">
          <Link href="/screens">
            <Button
              size="lg"
              className="text-lg font-semibold px-8 py-5 shadow-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer"
            >
              <Globe className="w-5 h-5 mr-1" /> Explore Screens
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              size="lg"
              className="text-lg font-semibold px-8 py-5 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-primary mr-1" /> Learn More
            </Button>
          </Link>
        </div>
        <VisitorTracker onTrackingComplete={handleTrackingComplete} />
        {trackingSuccessful === true && <VisitorCount />}
      </main>
    </div>
  );
}
