import { ScreensService } from "@/lib/screens.service";
import ScreensTable from "./ScreensTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ScreensDisplay() {
  try {
    const { screens, totalCount } = await ScreensService.getAllScreens(1, 100);

    if (screens.length === 0) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">📽️</div>
            <CardTitle className="text-2xl">Screen Database</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground text-lg">
              Your screen database is empty. Add some screens to get started!
            </p>
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">No Screens Found</h3>
              <p className="text-muted-foreground">
                Please add some screens to your database to see them displayed
                here.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Screen Database</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span>
              Showing {screens.length} of {totalCount} screens
            </span>
            <Badge variant="secondary">{totalCount} total</Badge>
          </div>
        </div>

        <ScreensTable screens={screens} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching screens:", error);
    throw new Error("Failed to load screen data");
  }
}
