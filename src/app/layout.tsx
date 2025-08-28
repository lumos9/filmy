import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
// Removed duplicate import
import NavBar from "@/components/NavBar";
import React, { Suspense } from "react";
import TopProgressBar from "@/components/TopProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filmy - Screen Database",
  description: "All about movie screens and formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Common NavBar for all pages */}
          <div className="min-h-screen flex flex-col">
            <NavBar />
            {/* Top progress bar below NavBar */}
            <div className="relative z-50">
              <Suspense fallback={null}>
                <TopProgressBar />
              </Suspense>
            </div>
            <main className="flex flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
