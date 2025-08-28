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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

type Screen = Database["public"]["Tables"]["screens"]["Row"];

interface ScreensTableProps {
  screens: Screen[];
  className?: string;
}

export default function ScreensTable({
  screens,
  className = "",
}: ScreensTableProps) {
  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  // Filtering state
  const [filters, setFilters] = useState<Record<string, string>>({});
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

  // Helper: get unique values for a column
  const getUniqueValues = (key: keyof Screen): string[] => {
    // Always return string[] for select options
    const values = screens.map((s) => s[key]).flat();
    if (Array.isArray(values)) {
      return Array.from(
        new Set(values.filter((v): v is string => typeof v === "string" && !!v))
      );
    }
    return Array.from(
      new Set(
        screens
          .map((s) => {
            const v = s[key];
            return typeof v === "string" ? v : null;
          })
          .filter((v): v is string => !!v)
      )
    );
  };

  // Filtering logic
  const filteredScreens = useMemo(() => {
    return screens.filter((screen) => {
      // Location filter (organization)
      if (filters.organization && screen.organization !== filters.organization)
        return false;
      // Projection filter (array)
      if (
        filters.projections &&
        !(Array.isArray(screen.projections)
          ? screen.projections.includes(filters.projections)
          : screen.projections === filters.projections)
      )
        return false;
      // Format filter (array)
      if (filters.formats && !screen.formats?.includes(filters.formats))
        return false;
      // Dimension filter (array)
      if (
        filters.dimensions &&
        !screen.dimensions?.includes(filters.dimensions)
      )
        return false;
      // Type filter
      if (filters.screen_type && screen.screen_type !== filters.screen_type)
        return false;
      // Seats filter (exact match)
      if (filters.seats && String(screen.seats) !== filters.seats) return false;
      // Screen size filter
      if (
        filters.screen_size_ft &&
        screen.screen_size_ft !== filters.screen_size_ft
      )
        return false;
      // Opened date filter
      if (filters.opened_date && screen.opened_date !== filters.opened_date)
        return false;
      return true;
    });
  }, [screens, filters]);

  // Sorting logic
  const sortedScreens = useMemo(() => {
    if (!sortBy) return filteredScreens;
    const sorted = [...filteredScreens].sort((a, b) => {
      let aVal = a[sortBy as keyof Screen];
      let bVal = b[sortBy as keyof Screen];
      // For arrays, sort by joined string
      if (Array.isArray(aVal)) aVal = aVal.join(", ");
      if (Array.isArray(bVal)) bVal = bVal.join(", ");
      // For nulls
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return sorted;
  }, [filteredScreens, sortBy, sortDir]);

  // Header click handler
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  // Filter change handler
  const handleFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Remove filter
  const clearFilter = (key: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
      {/* Active filters display */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {Object.entries(filters).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center bg-muted px-2 py-1 rounded text-xs"
            >
              <span className="mr-1 font-medium">{key}:</span> {value}
              <button
                className="ml-1 text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter(key)}
                aria-label={`Clear filter for ${key}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="text-center">
            {/* Location (organization) */}
            <TableHead
              className="w-[120px] text-left cursor-pointer select-none"
              onClick={() => handleSort("organization")}
            >
              Location
              {sortBy === "organization" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
              <div className="mt-1">
                <select
                  className="text-xs border rounded px-1 py-0.5"
                  value={filters.organization || ""}
                  onChange={(e) => handleFilter("organization", e.target.value)}
                >
                  <option value="">All</option>
                  {getUniqueValues("organization").map((v) =>
                    typeof v === "string" ? (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </TableHead>
            {/* Projection */}
            <TableHead
              className="w-[120px] text-left cursor-pointer select-none"
              onClick={() => handleSort("projections")}
            >
              Projection
              {sortBy === "projections" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
              <div className="mt-1">
                <select
                  className="text-xs border rounded px-1 py-0.5"
                  value={filters.projections || ""}
                  onChange={(e) => handleFilter("projections", e.target.value)}
                >
                  <option value="">All</option>
                  {getUniqueValues("projections").map((v) =>
                    typeof v === "string" ? (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </TableHead>
            {/* Format (array) */}
            <TableHead
              className="w-[80px] text-left cursor-pointer select-none"
              onClick={() => handleSort("formats")}
            >
              Format
              {sortBy === "formats" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
              <div className="mt-1">
                <select
                  className="text-xs border rounded px-1 py-0.5"
                  value={filters.formats || ""}
                  onChange={(e) => handleFilter("formats", e.target.value)}
                >
                  <option value="">All</option>
                  {getUniqueValues("formats").map((v) =>
                    typeof v === "string" ? (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </TableHead>
            {/* Dimension (array) */}
            <TableHead
              className="w-[80px] text-left cursor-pointer select-none"
              onClick={() => handleSort("dimensions")}
            >
              Dimension
              {sortBy === "dimensions" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
              <div className="mt-1">
                <select
                  className="text-xs border rounded px-1 py-0.5"
                  value={filters.dimensions || ""}
                  onChange={(e) => handleFilter("dimensions", e.target.value)}
                >
                  <option value="">All</option>
                  {getUniqueValues("dimensions").map((v) =>
                    typeof v === "string" ? (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </TableHead>
            {/* Type */}
            <TableHead
              className="w-[100px] text-left cursor-pointer select-none"
              onClick={() => handleSort("screen_type")}
            >
              Type
              {sortBy === "screen_type" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
              <div className="mt-1">
                <select
                  className="text-xs border rounded px-1 py-0.5"
                  value={filters.screen_type || ""}
                  onChange={(e) => handleFilter("screen_type", e.target.value)}
                >
                  <option value="">All</option>
                  {getUniqueValues("screen_type").map((v) =>
                    typeof v === "string" ? (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </TableHead>
            {/* Seats */}
            <TableHead
              className="w-[80px] text-left cursor-pointer select-none"
              onClick={() => handleSort("seats")}
            >
              Seats
              {sortBy === "seats" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
            </TableHead>
            {/* Screen Size */}
            <TableHead
              className="w-[120px] text-left cursor-pointer select-none"
              onClick={() => handleSort("screen_size_ft")}
            >
              Screen Size
              {sortBy === "screen_size_ft" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
            </TableHead>
            {/* Opened */}
            <TableHead
              className="w-[100px] text-left cursor-pointer select-none"
              onClick={() => handleSort("opened_date")}
            >
              Opened
              {sortBy === "opened_date" &&
                (sortDir === "asc" ? (
                  <ChevronUp className="inline ml-1 w-3 h-3" />
                ) : (
                  <ChevronDown className="inline ml-1 w-3 h-3" />
                ))}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScreens.map((screen) => (
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
