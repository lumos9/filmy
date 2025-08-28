"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
// import { Geist } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/screens", label: "Screens" },
    { href: "/sensor-sizes", label: "Sensor Sizes" },
    { href: "/donate", label: "Donate" },
    { href: "/contact", label: "Contact" },
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
              <SheetContent side="left" className="p-0 w-64">
                {/* Mobile menu header with same height and font as desktop */}
                <div className="flex justify-start items-center px-6 h-16 border-b">
                  <span className="text-3xl font-bold">Filmy</span>
                </div>
                <nav className="flex flex-col gap-2 px-6">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`font-medium rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background
                        ${
                          pathname === link.href
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      `}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-medium rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background
                ${
                  pathname === link.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
