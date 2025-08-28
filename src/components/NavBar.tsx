"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
// import { Geist } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Home,
  Info,
  Film,
  Ruler,
  HeartHandshake,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/screens", label: "Screens", icon: Film },
    { href: "/sensor-sizes", label: "Sensor Sizes", icon: Ruler },
    { href: "/donate", label: "Donate", icon: HeartHandshake },
    { href: "/contact", label: "Contact", icon: Mail },
  ];

  return (
    <header className="bg-background sticky top-0 z-30 border-b">
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
                {/* Mobile menu header with same height and font as desktop */}
                <div className="flex justify-start items-center h-16 border-b">
                  <span className="text-3xl font-bold">Filmy</span>
                </div>
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
          <div>
            <h1 className="text-3xl font-bold">Filmy</h1>
          </div>
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
