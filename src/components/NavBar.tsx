"use client";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Aperture,
  Film,
  Home,
  Info,
  Mail,
  Menu,
  Tv,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/cameras", label: "Cameras", icon: Video },
    { href: "/screens", label: "Screens", icon: Tv },
    { href: "/sensors", label: "Sensors", icon: Aperture },
    // { href: "/donate", label: "Donate", icon: HeartHandshake },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="bg-background sticky top-0 z-30 border-b h-16">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {/* Burger menu for mobile */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-8 w-8" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 px-6">
                {/* Visually hidden DialogTitle for accessibility */}
                <SheetTitle asChild>
                  <span
                    style={{
                      position: "absolute",
                      width: 1,
                      height: 1,
                      padding: 0,
                      margin: -1,
                      overflow: "hidden",
                      clip: "rect(0,0,0,0)",
                      whiteSpace: "nowrap",
                      border: 0,
                    }}
                  >
                    Navigation Menu
                  </span>
                </SheetTitle>
                {/* Mobile menu header with same height and font as desktop */}
                <Link
                  href="/"
                  className="flex justify-start items-center h-16 border-b gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md transition-colors"
                  tabIndex={0}
                >
                  <Film className="w-5 h-5 text-primary animate-pop group-hover:scale-110 transition-transform" />
                  <span className="text-3xl font-bold group-hover:text-primary transition-colors">
                    Filmy
                  </span>
                </Link>
                <nav className="flex flex-col gap-2">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-2 font-medium rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background
                          ${
                            pathname === link.href
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          }
                        `}
                        onClick={() => setOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link
            href="/"
            className="flex flex-row gap-2 items-center justify-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded-md transition-colors"
          >
            <Film className="w-7 h-7 text-primary animate-pop group-hover:scale-110 transition-transform" />
            <h1 className="text-3xl font-bold group-hover:text-primary transition-colors">
              Filmy
            </h1>
          </Link>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-4 items-center">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 font-medium rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background
                  ${
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
