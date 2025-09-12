"use client";

import { useEffect } from "react";

interface VisitorTrackerProps {
  onTrackingComplete?: (success: boolean) => void;
}

export default function VisitorTracker({
  onTrackingComplete,
}: VisitorTrackerProps) {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Generate or retrieve visitor ID with error handling
        let visitorId: string;
        try {
          visitorId = localStorage.getItem("visitorId") || crypto.randomUUID();
          localStorage.setItem("visitorId", visitorId);
        } catch (storageError) {
          // Fallback if localStorage is not available (private browsing, etc.)
          console.warn(
            "localStorage not available, using session-based ID:",
            storageError
          );
          visitorId = crypto.randomUUID();
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
