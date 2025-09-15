import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  Film,
  Globe,
  Heart,
  Mail,
  Monitor,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

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

          <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 max-w-2xl mx-auto">
            <AlertDescription className="text-left">
              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  🚀 Pilot Concept - Built with Free Tiers
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Filmy is a passion project built by a film enthusiast to share
                  knowledge about cinema technology. Currently running on free
                  tiers of Vercel, Supabase, and other services.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {/* Your support helps cover development costs and keeps Filmy
                  accessible to the community. All donations go toward server
                  costs, database maintenance, and future feature development. */}
                </p>
                <div className="flex justify-center pt-2">
                  {/* <Link href="/donate">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Support Filmy
                    </Button>
                  </Link> */}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Separator />
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-left flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> What Filmy Offers
            </h2>
            <div className="flex flex-row flex-wrap gap-6 justify-center items-center">
              <div className="w-64 flex flex-col items-center gap-2">
                <Globe className="w-8 h-8 text-blue-500" />
                <h3 className="text-lg font-semibold">Interactive IMAX Map</h3>
                <p className="text-muted-foreground text-sm mb-2">
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
              <div className="w-64 flex flex-col items-center gap-2">
                <Camera className="w-8 h-8 text-green-500" />
                <h3 className="text-lg font-semibold">Camera Database</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Discover cameras used in films, from IMAX 65mm to ARRI ALEXA,
                  with notable movies sorted by release date.
                </p>
                <Link href="/cameras">
                  <Button variant={"outline"} className="cursor-pointer">
                    Browse Cameras
                  </Button>
                </Link>
              </div>
              <div className="w-64 flex flex-col items-center gap-2">
                <Monitor className="w-8 h-8 text-yellow-400" />
                <h3 className="text-lg font-semibold">Sensor Visualizer</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  Compare sensor sizes (e.g., IMAX vs. Super 8) with our 1:4
                  scaled visualizer and see cameras using each sensor.
                </p>
                <Link href="/sensors">
                  <Button variant={"outline"} className="cursor-pointer">
                    Visualize Now
                  </Button>
                </Link>
              </div>
              {/* <div className="flex flex-col items-center gap-2">
                <DollarSign className="w-8 h-8 text-pink-500" />
                <h3 className="text-lg font-semibold">Support Filmy</h3>
                <p className="text-muted-foreground text-sm">
                  Help keep Filmy free and growing. Donations support server
                  costs, database maintenance, and new features for the film
                  community.
                </p>
                <Link href="/donate">
                  <Button variant={"outline"} className="cursor-pointer">
                    Donate Now
                  </Button>
                </Link>
              </div> */}
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-left flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" /> Transparency & Support
            </h2>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Non-Commercial Project:</strong> Filmy is a
                passion-driven initiative, not a commercial venture. All
                development is done voluntarily to benefit the film community.
              </p>
              {/* <p className="text-sm text-muted-foreground">
                <strong>How Donations Help:</strong> Contributions go directly
                toward operational costs (hosting, databases, APIs) and future
                development. No personal profit is made from this project.
              </p> */}
              <p className="text-sm text-muted-foreground">
                <strong>Community Focus:</strong> Every feature and improvement
                serves film enthusiasts, filmmakers, and cinema technology
                researchers worldwide.
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-left flex items-center justify-center gap-2">
              <Monitor className="w-5 h-5 text-green-500" /> Privacy & Data
            </h2>
            <div className="text-muted-foreground text-center space-y-2">
              <p className="text-sm">
                <strong>We don't collect personal information.</strong> Filmy
                operates with minimal data collection—no tracking, no accounts,
                no stored personal data.
              </p>
              <p className="text-xs">
                The only data collection comes from Vercel's standard hosting
                analytics (page views, performance metrics). No personal
                information is stored or processed by our application.
              </p>
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
