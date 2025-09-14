"use client";

import { useEffect } from "react";

interface VisitorTrackerProps {
  onTrackingComplete?: (success: boolean) => void;
}

export default function VisitorTracker({
  onTrackingComplete,
}: VisitorTrackerProps) {
  // Generate a UUID-like string with fallbacks for older browsers
  const generateVisitorId = (): string => {
    // Try crypto.randomUUID() first (modern browsers)
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch (error) {
        console.warn("crypto.randomUUID() failed:", error);
      }
    }

    // Fallback to crypto.getRandomValues() (widely supported)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      try {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);

        // Convert to UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        const hex = Array.from(array, (byte) =>
          byte.toString(16).padStart(2, "0")
        ).join("");
        return [
          hex.slice(0, 8),
          hex.slice(8, 12),
          "4" + hex.slice(13, 16), // Version 4 UUID
          ((parseInt(hex.slice(16, 17), 16) & 0x3) | 0x8).toString(16) +
            hex.slice(17, 20),
          hex.slice(20, 32),
        ].join("-");
      } catch (error) {
        console.warn("crypto.getRandomValues() failed:", error);
      }
    }

    // Final fallback using Math.random() (works everywhere)
    console.warn("Using Math.random() fallback for visitor ID generation");
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Generate or retrieve visitor ID with error handling
        let visitorId: string;
        try {
          visitorId = localStorage.getItem("visitorId") || generateVisitorId();
          localStorage.setItem("visitorId", visitorId);
        } catch (storageError) {
          // Fallback if localStorage is not available (private browsing, etc.)
          console.warn(
            "localStorage not available, using session-based ID:",
            storageError
          );
          visitorId = generateVisitorId();
        }

        // Track visitor with comprehensive error handling
        try {
          const response = await fetch("/api/visitors/incrementCount", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              visitorId,
              page: window.location.pathname,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              referrer: document.referrer || null,
            }),
          });

          if (!response.ok) {
            // Handle HTTP error responses
            const errorData = await response.text();
            console.error(
              `Visitor tracking failed: ${response.status} ${response.statusText}`,
              errorData
            );
            return;
          }

          const result = await response.json();

          if (result.success) {
            console.log(
              `Visitor counted successfully for visitorId: ${visitorId}`
            );
            onTrackingComplete?.(true);
          } else {
            console.error("Visitor counting failed:", result);
            onTrackingComplete?.(false);
          }
        } catch (fetchError) {
          // Handle network errors, CORS issues, etc.
          console.error("Network error during visitor tracking:", fetchError);
          onTrackingComplete?.(false);

          // Could implement retry logic here if needed
          // For now, we'll just log and continue
        }
      } catch (error) {
        // Handle any other unexpected errors
        console.error("Unexpected error in visitor tracking:", error);
        onTrackingComplete?.(false);

        // Ensure the app continues to function even if tracking fails
        // This is important for user experience
      }
    };

    // Only track if we're in a browser environment
    if (typeof window !== "undefined") {
      trackVisitor();
    }
  }, []);

  return null;
}
