import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Globe, Users, Film, Star } from "lucide-react";

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
              The Global Movie & Screen Knowledge Platform
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col gap-2 items-center">
            <p className="text-muted-foreground text-lg max-w-xl">
              <span className="font-semibold text-primary">Filmy</span> is a
              next-gen, open, and collaborative database for movie screens,
              cinema tech, and the worldwide film community. We blend data,
              design, and community to make cinema knowledge accessible, fun,
              and powerful for everyone.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col items-center gap-2">
              <Globe className="w-8 h-8 text-blue-500" />
              <h2 className="text-lg font-semibold">Global & Open</h2>
              <p className="text-muted-foreground text-sm">
                Explore screens and formats from every corner of the world.
                Filmy is for everyone—no matter your city, language, or favorite
                genre.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-green-500" />
              <h2 className="text-lg font-semibold">Community-Driven</h2>
              <p className="text-muted-foreground text-sm">
                Add, edit, and review screens. Share your knowledge. Connect
                with projectionists, cinephiles, and techies who love the big
                screen as much as you do.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h2 className="text-lg font-semibold">Tech & Transparency</h2>
              <p className="text-muted-foreground text-sm">
                Demystify IMAX, LieMAX, and every format in between. We break
                down specs, tech, and what makes a true cinematic experience—no
                marketing fluff.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="w-8 h-8 text-pink-500" />
              <h2 className="text-lg font-semibold">For the Curious</h2>
              <p className="text-muted-foreground text-sm">
                Whether you’re a student, journalist, or just obsessed with
                movies, Filmy is your launchpad for learning, comparing, and
                discovering the world of cinema.
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-left flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> What Makes Filmy
              Different?
            </h2>
            <ul className="list-disc list-inside text-left text-muted-foreground space-y-1">
              <li>
                Live, interactive map of IMAX, LieMAX, and more—see what’s near
                you or across the globe
              </li>
              <li>
                Compare projection formats, screen sizes, and tech specs
                visually
              </li>
              <li>
                Contribute new screens, corrections, and reviews in seconds
              </li>
              <li>
                Stay up to date with the latest in cinema technology and trends
              </li>
              <li>
                Connect with a global community of film lovers, experts, and
                creators
              </li>
            </ul>
          </div>
          <Separator />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-left flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Our Vision
            </h2>
            <p className="text-muted-foreground text-left">
              Filmy is built for the curious, the passionate, and the
              community-minded. We believe every moviegoer deserves to know
              what’s on the big screen, every cinema can showcase its strengths,
              and the world’s film knowledge should be open to all.
            </p>
            <p className="text-muted-foreground text-left">
              <span className="font-semibold text-primary">Join us</span> in
              making cinema knowledge accessible, accurate, and inspiring—one
              screen at a time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
