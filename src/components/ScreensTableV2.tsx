"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Screen = Database["public"]["Tables"]["screens"]["Row"];

export const columns: ColumnDef<Screen>[] = [
  {
    id: "country",
    accessorFn: (row) => row.country,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Country
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: () => null, // Do not render in table
    enableSorting: true,
    enableHiding: true,
  },
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   cell: ({ row }) => (
  //     <span className="font-mono text-xs">{row.getValue("id")}</span>
  //   ),
  //   enableSorting: true,
  //   enableHiding: false,
  // },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "location",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Location
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => row.organization, // keep for filtering/sorting
    cell: ({ row }) => {
      const org = String(row.original.organization || "N/A");
      const city = String(row.original.city || "");
      const state = String(row.original.state || "");
      const country = String(row.original.country || "");
      const locationLine = [city, state, country].filter(Boolean).join(", ");
      return (
        <div>
          <div className="font-medium">{org}</div>
          <div className="text-xs text-muted-foreground">
            {locationLine || "N/A"}
          </div>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "projections",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Projections
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("projections");
      return Array.isArray(val) && val.length > 0 ? (
        val.join(", ")
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "screen_type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Screen Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.getValue("screen_type") || (
        <span className="text-muted-foreground">N/A</span>
      ),
    enableSorting: true,
  },
  {
    accessorKey: "screen_size",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Screen Size
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const ft = row.original.screen_size_ft;
      const m = row.original.screen_size_m;
      return ft || m ? (
        <div className="flex flex-col gap-1">
          <div>{ft || "N/A"}</div>
          <div className="text-xs text-muted-foreground">{m || "N/A"}</div>
        </div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      // Helper to parse a value to meters
      function parseToMeters(
        ft: string | number | null | undefined,
        m: string | number | null | undefined
      ): number | null {
        // Prefer meters if available
        if (typeof m === "number" && !isNaN(m)) return m;
        if (typeof m === "string" && m.trim() !== "" && !isNaN(Number(m)))
          return Number(m);
        if (typeof ft === "number" && !isNaN(ft)) return ft * 0.3048;
        if (typeof ft === "string" && ft.trim() !== "" && !isNaN(Number(ft)))
          return Number(ft) * 0.3048;
        return null;
      }
      const a = rowA.original;
      const b = rowB.original;
      const aMeters = parseToMeters(a.screen_size_ft, a.screen_size_m);
      const bMeters = parseToMeters(b.screen_size_ft, b.screen_size_m);
      if (aMeters == null && bMeters == null) return 0;
      if (aMeters == null) return 1;
      if (bMeters == null) return -1;
      console.log("Comparing sizes:", aMeters, bMeters);
      return aMeters - bMeters;
    },
  },
  // {
  //   accessorKey: "screen_size_ft",
  //   header: "Screen Size (ft)",
  //   cell: ({ row }) =>
  //     row.getValue("screen_size_ft") || (
  //       <span className="text-muted-foreground">N/A</span>
  //     ),
  // },
  // {
  //   accessorKey: "screen_size_m",
  //   header: "Screen Size (m)",
  //   cell: ({ row }) =>
  //     row.getValue("screen_size_m") || (
  //       <span className="text-muted-foreground">N/A</span>
  //     ),
  // },
  {
    accessorKey: "formats",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Formats
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("formats");
      return Array.isArray(val) && val.length > 0 ? (
        val.join(", ")
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "dimensions",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Dimensions
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("dimensions");
      return Array.isArray(val) && val.length > 0 ? (
        val.join(", ")
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "seats",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Seats
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      row.getValue("seats") ?? (
        <span className="text-muted-foreground">N/A</span>
      ),
    enableSorting: true,
  },
  {
    accessorKey: "opened_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Opened
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("opened_date");
      return val ? (
        new Date(val as string).toLocaleDateString()
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    },
    enableSorting: true,
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const payment = row.original;

  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={() => navigator.clipboard.writeText(payment.id)}
  //           >
  //             Copy payment ID
  //           </DropdownMenuItem>
  //           <DropdownMenuSeparator />
  //           <DropdownMenuItem>View customer</DropdownMenuItem>
  //           <DropdownMenuItem>View payment details</DropdownMenuItem>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];

export function ScreensTableV2({ screenData }: { screenData?: Screen[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ country: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: screenData ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter countries..."
          value={(table.getColumn("country")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("country")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
