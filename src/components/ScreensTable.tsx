import { Database } from "@/lib/database.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Screen = Database["public"]["Tables"]["screens"]["Row"];

interface ScreensTableProps {
  screens: Screen[];
  className?: string;
}

export default function ScreensTable({
  screens,
  className = "",
}: ScreensTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  const formatSeats = (seats: number | null) => {
    if (!seats) return "N/A";
    return seats.toLocaleString();
  };

  const getDimensionBadge = (dimension: string | null) => {
    if (!dimension) return <Badge variant="secondary">N/A</Badge>;
    return (
      <Badge variant={dimension === "3D" ? "default" : "outline"}>
        {dimension}
      </Badge>
    );
  };

  const getScreenTypeBadge = (screenType: string | null) => {
    if (!screenType) return <Badge variant="outline">N/A</Badge>;
    return (
      <Badge variant={screenType === "dome" ? "default" : "outline"}>
        {screenType.charAt(0).toUpperCase() + screenType.slice(1)}
      </Badge>
    );
  };

  if (screens.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-muted-foreground text-lg mb-2">📽️</div>
            <p className="text-muted-foreground">No screens found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="text-center">
            <TableHead className="w-[120px] text-left">Location</TableHead>
            {/* <TableHead className="w-[150px]">Organization</TableHead> */}
            <TableHead className="w-[120px] text-left">Projection</TableHead>
            <TableHead className="w-[80px] text-left">Format</TableHead>
            <TableHead className="w-[80px] text-left">Dimension</TableHead>
            <TableHead className="w-[100px] text-left">Type</TableHead>
            <TableHead className="w-[80px] text-left">Seats</TableHead>
            <TableHead className="w-[120px] text-left">Screen Size</TableHead>
            <TableHead className="w-[100px] text-left">Opened</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {screens.map((screen) => (
            <TableRow key={screen.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-1 line-clamp-2 break-words max-w-xs">
                  <div className="font-medium">
                    {screen.organization || "N/A"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {screen.city}, {screen.state || "N/A"},{" "}
                    {screen.country || "N/A"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{screen.projections || "N/A"}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {screen.formats?.map((f) => (
                    <Badge variant="outline" key={f}>
                      {f}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  {screen.dimensions?.join(", ")}
                </div>
              </TableCell>
              <TableCell>{screen.screen_type}</TableCell>
              <TableCell className="font-medium">
                {formatSeats(screen.seats)}
              </TableCell>
              <TableCell className="flex flex-col space-y-1">
                <div className="text-sm">{screen.screen_size_ft || "N/A"}</div>
                <div className="text-sm text-muted-foreground">
                  {screen.screen_size_m || "N/A"}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(screen.opened_date)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
