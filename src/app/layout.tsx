import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import NavBar from "@/components/NavBar";
import React, { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Filmy - Uncover True IMAX & Movie Sensors",
  description:
    "Uncover True IMAX theaters, visualize movie sensor sizes, and explore cinema technology with Filmy's global screen database.",
  keywords: [
    "IMAX",
    "True IMAX",
    "LieMAX",
    "cinema sensors",
    "movie cameras",
    "film formats",
    "screen database",
  ],
  openGraph: {
    title: "Filmy - Uncover True IMAX, Visualize Cinema’s Soul",
    description:
      "Map True IMAX theaters, compare sensor sizes, and join the film tech revolution with Filmy.",
    url: "https://your-site-url.com", // Replace with your actual site URL
    siteName: "Filmy",
    images: [
      {
        url: "/assets/images/og-image.jpg", // Replace with a high-quality image (e.g., Mapbox map or sensor visualizer screenshot)
        width: 1200,
        height: 630,
        alt: "Filmy IMAX theater map and sensor visualizer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filmy - Uncover True IMAX, Visualize Cinema’s Soul",
    description:
      "Map True IMAX theaters and visualize movie sensor sizes with Filmy.",
    images: ["/assets/images/og-image.jpg"], // Same image as Open Graph
  },
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
          <div className="flex flex-col min-h-screen">
            <NavBar />
            {/* Top progress bar below NavBar */}
            <div className="relative z-50">
              <Suspense fallback={null}>
                <TopProgressBar />
              </Suspense>
            </div>
            <main className="flex flex-1">
              {children}
              <Analytics />
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
