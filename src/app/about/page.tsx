import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Globe,
  Camera,
  Monitor,
  DollarSign,
  Mail,
  Film,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-10 px-2 bg-gradient-to-br from-background to-[#0f172a] min-h-[90vh]">
      <Card className="max-w-2xl w-full bg-background/80 border-muted-foreground/10 shadow-2xl animate-fade-in">
        <CardHeader>
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-2 text-primary font-bold text-4xl tracking-tight">
              <Film className="w-8 h-8 text-primary animate-pop" /> Filmy
            </span>
            <Badge
              variant="outline"
              className="text-xs md:text-base px-3 py-1 bg-primary/10 border-primary/20 text-primary font-semibold animate-bounce-in"
            >
              Uncover True IMAX, Visualize Cinema’s Soul
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col gap-2 items-center">
            <p className="text-muted-foreground text-lg max-w-xl">
              <span className="font-semibold text-primary">Filmy</span> is your
              gateway to cinema’s technical heart. From mapping True IMAX
              theaters to visualizing sensor sizes, we empower cinephiles,
              filmmakers, and tech enthusiasts to explore, contribute, and
              celebrate the art of film.
            </p>
          </div>
          <Separator />
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-left flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> What Filmy Offers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-2">
                <Globe className="w-8 h-8 text-blue-500" />
                <h3 className="text-lg font-semibold">Interactive IMAX Map</h3>
                <p className="text-muted-foreground text-sm">
                  Explore a global map of IMAX screens, revealing True IMAX,
                  LieMAX, and more. Click for details like screen size and
                  projection type.
                </p>
                <Link href="/screens">
                  <Button variant={"outline"} className="cursor-pointer">
                    Explore the Map
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold">Camera Database</h3>
                <p className="text-muted-foreground text-sm">
                  Discover cameras used in films, from IMAX 65mm to ARRI ALEXA,
                  with notable movies sorted by release date.
                </p>
                <Link href="/cameras">
                  <Button variant={"outline"} className="cursor-pointer">
                    Browse Cameras
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Monitor className="w-8 h-8 text-yellow-400" />
                <h3 className="text-lg font-semibold">Sensor Visualizer</h3>
                <p className="text-muted-foreground text-sm">
                  Compare sensor sizes (e.g., IMAX vs. Super 8) with our 1:4
                  scaled visualizer and see cameras using each sensor.
                </p>
                <Link href="/sensors">
                  <Button variant={"outline"} className="cursor-pointer">
                    Visualize Now
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-2">
                <DollarSign className="w-8 h-8 text-pink-500" />
                <h3 className="text-lg font-semibold">Support Filmy</h3>
                <p className="text-muted-foreground text-sm">
                  Keep Filmy free with a small PayPal donation. Help us map
                  every screen and camera worldwide.
                </p>
                <Link href="/donate">
                  <Button variant={"outline"} className="cursor-pointer">
                    Donate Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-left flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" /> Join the Community
            </h2>
            <p className="text-muted-foreground text-center">
              Share feedback, propose collabs, or report a screen via our
              contact form. Your input shapes the future of cinema tech.
            </p>
            <Link href="/contact">
              <Button variant={"outline"} className="cursor-pointer">
                Get in Touch
              </Button>
            </Link>
          </div>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-left flex items-center justify-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Our Vision
            </h2>
            <p className="text-muted-foreground text-center">
              Filmy demystifies cinema technology, from True IMAX to sensor
              sizes, making it accessible to all. Join us in building a global,
              open database for film lovers and creators.
            </p>
            <p className="text-muted-foreground text-center">
              <span className="font-semibold text-primary">
                Be part of the revolution
              </span>
              —explore, contribute, and uncover the soul of cinema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
