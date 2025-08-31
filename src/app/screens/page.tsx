import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScreensDisplay from "@/components/ScreensDisplay";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScreensPage() {
  return (
    <div className="w-full flex flex-col items-center text-center p-4">
      <ScreensDisplay />
    </div>
  );
}
