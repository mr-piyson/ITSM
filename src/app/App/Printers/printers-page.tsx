"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { Plus, Grid3X3, List, PrinterIcon } from "lucide-react";
import { SearchFilters } from "./search-filters";
import { PrinterCard } from "./printer-card";
import { PrinterTable } from "./printer-table";
import { type printers as Printer } from "@prisma/iss";

// Mock data - replace with actual API call
// const mockPrinters: Printer[] = [
//   {
//     id: "1",
//     name: "HP LaserJet Pro M404n",
//     location: "Office Floor 2 - Room 201",
//     usedBy: "Marketing Team",
//     status: "active",
//     lastUsed: "2 hours ago",
//     image: "/hp-printer.png",
//   },
//   {
//     id: "2",
//     name: "Canon PIXMA TR8620",
//     location: "Creative Department",
//     usedBy: "Design Team",
//     status: "maintenance",
//     lastUsed: "1 day ago",
//     image: "/canon-printer.png",
//   },
//   {
//     id: "3",
//     name: "Epson EcoTank ET-4760",
//     location: "Reception Area",
//     usedBy: "Front Desk",
//     status: "active",
//     lastUsed: "30 minutes ago",
//     image: "/epson-printer.png",
//   },
//   {
//     id: "4",
//     name: "Brother HL-L2350DW",
//     location: "Accounting Department",
//     usedBy: "Finance Team",
//     status: "inactive",
//     lastUsed: "3 days ago",
//     image: "/brother-printer.png",
//   },
//   {
//     id: "5",
//     name: "Xerox WorkCentre 6515",
//     location: "Conference Room A",
//     usedBy: "Executive Team",
//     status: "active",
//     lastUsed: "1 hour ago",
//     image: "/xerox-printer.jpg",
//   },
//   {
//     id: "6",
//     name: "Samsung Xpress M2020W",
//     location: "IT Department",
//     usedBy: "Tech Support",
//     status: "maintenance",
//     lastUsed: "2 days ago",
//     image: "/samsung-printer.jpg",
//   },
// ];

export default function PrinterManagement({
  printers,
}: {
  printers: {
    id: number;
    name: string;
    location: string;
    img: string;
    department: string | null;
    usedBy: string;
  }[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter printers based on search and status
  const filteredPrinters = useMemo(() => {
    return printers.filter((printer) => {
      const matchesSearch =
        debouncedSearchQuery === "" ||
        printer.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        printer.location
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        printer.usedBy
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [debouncedSearchQuery, statusFilter]);

  const handleViewDetails = (id: string) => {
    // Navigate to printer details page
    console.log("View details for printer:", id);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleAddPrinter = () => {
    // Navigate to add printer page
    console.log("Add new printer");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Search & Filter</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Table
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              resultCount={filteredPrinters.length}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>

        {/* Results */}
        {filteredPrinters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PrinterIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No printers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first printer"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button onClick={handleAddPrinter} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Printer
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-6">
              {filteredPrinters.map((printer) => (
                <PrinterCard
                  key={printer.id}
                  printer={printer}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
