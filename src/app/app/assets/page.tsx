"use client";
import { useQuery } from "@tanstack/react-query";
import type { GridApi } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTableTheme } from "@/hooks/use-tableTheme";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/app/api/assets/route";
import {
  Building2,
  Edit,
  Eye,
  MapPin,
  Monitor,
  Package,
  Trash2,
  User,
  Search,
  X,
  Filter,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ReportPage() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const theme = useTableTheme();

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("all");

  // React Query for data fetching
  const {
    data: assets = [],
    isFetching: isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const data = await axios.get("/api/assets");
      return data.data;
    },
  });

  // Extract unique values for filters
  const uniqueTypes = useMemo(() => {
    const types = new Set(
      assets.map((asset: Asset) => asset.type).filter(Boolean),
    );
    return Array.from(types).sort();
  }, [assets]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(
      assets.map((asset: Asset) => asset.location).filter(Boolean),
    );
    return Array.from(locations).sort();
  }, [assets]);

  const uniqueDepartments = useMemo(() => {
    const departments = new Set(
      assets.map((asset: Asset) => asset.department).filter(Boolean),
    );
    return Array.from(departments).sort();
  }, [assets]);

  const uniqueManufacturers = useMemo(() => {
    const manufacturers = new Set(
      assets.map((asset: Asset) => asset.manufacturer).filter(Boolean),
    );
    return Array.from(manufacturers).sort();
  }, [assets]);

  // Filtered data based on search and filters
  const filteredAssets = useMemo(() => {
    return assets.filter((asset: Asset) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        asset.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.ip?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = typeFilter === "all" || asset.type === typeFilter;

      // Location filter
      const matchesLocation =
        locationFilter === "all" || asset.location === locationFilter;

      // Department filter
      const matchesDepartment =
        departmentFilter === "all" || asset.department === departmentFilter;

      // Manufacturer filter
      const matchesManufacturer =
        manufacturerFilter === "all" ||
        asset.manufacturer === manufacturerFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesLocation &&
        matchesDepartment &&
        matchesManufacturer
      );
    });
  }, [
    assets,
    searchTerm,
    typeFilter,
    locationFilter,
    departmentFilter,
    manufacturerFilter,
  ]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== "all") count++;
    if (locationFilter !== "all") count++;
    if (departmentFilter !== "all") count++;
    if (manufacturerFilter !== "all") count++;
    return count;
  }, [typeFilter, locationFilter, departmentFilter, manufacturerFilter]);

  const columnDefs = useMemo(
    () => [
      {
        field: "deviceName",
        hide: true,
      },
    ],
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 100,
    }),
    [],
  );

  const gridOptions = useMemo(
    () => ({
      fullWidthCellRenderer: AssetCardRenderer,
      isFullWidthRow: () => true,
      rowHeight: 260,
      suppressHorizontalScroll: true,
      headerHeight: 0,
    }),
    [],
  );

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("all");
    setLocationFilter("all");
    setDepartmentFilter("all");
    setManufacturerFilter("all");
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            <h2 className="text-lg font-semibold mb-2">Error Loading Data</h2>
            <p className="mb-4">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-none border-none h-full p-0 gap-0">
      {/* Header with Search and Filters */}
      <CardContent className="w-full p-3 space-y-3">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, code, serial number, manufacturer, model, owner, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 relative">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Filters</h4>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 text-xs"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Type Filter */}
                <div className="space-y-2">
                  <Label htmlFor="type-filter" className="text-sm font-medium">
                    Type
                  </Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full" id="type-filter">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {uniqueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="location-filter"
                    className="text-sm font-medium"
                  >
                    Location
                  </Label>
                  <Select
                    value={locationFilter}
                    onValueChange={setLocationFilter}
                  >
                    <SelectTrigger className="w-full" id="location-filter">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="department-filter"
                    className="text-sm font-medium"
                  >
                    Department
                  </Label>
                  <Select
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-full" id="department-filter">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All departments</SelectItem>
                      {uniqueDepartments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manufacturer Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="manufacturer-filter"
                    className="text-sm font-medium"
                  >
                    Manufacturer
                  </Label>
                  <Select
                    value={manufacturerFilter}
                    onValueChange={setManufacturerFilter}
                  >
                    <SelectTrigger className="w-full" id="manufacturer-filter">
                      <SelectValue placeholder="All manufacturers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All manufacturers</SelectItem>
                      {uniqueManufacturers.map((manufacturer) => (
                        <SelectItem key={manufacturer} value={manufacturer}>
                          {manufacturer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Results Count and Active Filters */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {filteredAssets.length} of {assets.length} assets
          </span>
          {activeFiltersCount > 0 && (
            <>
              <span>•</span>
              <div className="flex flex-wrap items-center gap-2">
                {typeFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setTypeFilter("all")}
                  >
                    Type: {typeFilter}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {locationFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setLocationFilter("all")}
                  >
                    Location: {locationFilter}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {departmentFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setDepartmentFilter("all")}
                  >
                    Dept: {departmentFilter}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
                {manufacturerFilter !== "all" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => setManufacturerFilter("all")}
                  >
                    Mfr: {manufacturerFilter}
                    <X className="w-3 h-3" />
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>

      {/* Grid Content */}
      <CardContent className="p-0 h-full">
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact
            rowData={filteredAssets}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
            animateRows={true}
            suppressMenuHide={true}
            theme={theme}
            loading={isLoading}
            isFullWidthRow={() => true}
            fullWidthCellRenderer={AssetCardRenderer}
            rowHeight={260}
            onGridReady={(params) => setGridApi(params.api)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

const AssetCardRenderer = ({ data }: { data: Asset }) => {
  if (!data) return null;

  const handleView = () => {
    console.log("View asset:", data.id);
    // Add your view logic here
  };

  const handleEdit = () => {
    console.log("Edit asset:", data.id);
    // Add your edit logic here
  };

  const handleDelete = () => {
    console.log("Delete asset:", data.id);
    // Add your delete logic here
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex flex-row gap-4">
          {/* Asset Image */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {data.image ? (
                <img
                  src={
                    "http://iss.bfginternational.com/ISS/itemsImages/" +
                    data.image
                  }
                  alt={data.deviceName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Asset Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground truncate">
                  {data.deviceName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {data.code} • SN: {data.serialNumber}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {data.type}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {/* Manufacturer & Model */}
              <div className="flex items-center gap-2 text-sm min-w-0">
                <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground shrink-0">Model:</span>
                <span className="font-medium truncate">
                  {data.manufacturer} {data.model}
                </span>
              </div>

              {/* Location */}
              {data.location && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">
                    Location:
                  </span>
                  <span className="font-medium truncate">{data.location}</span>
                </div>
              )}

              {/* Department */}
              {data.department && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">
                    Department:
                  </span>
                  <span className="font-medium truncate">
                    {data.department}
                  </span>
                </div>
              )}

              {/* IP Address */}
              {data.ip && (
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">IP:</span>
                  <span className="font-medium font-mono truncate">
                    {data.ip}
                  </span>
                </div>
              )}

              {/* Owner */}
              {data.owner && (
                <div className="flex items-center gap-2 text-sm col-span-1 sm:col-span-2 min-w-0">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground shrink-0">Owner:</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="w-6 h-6 shrink-0">
                      <AvatarImage
                        src={
                          "http://iss.bfginternational.com/ISS/itemsImages/" +
                          data.empImg
                        }
                        alt={data.owner}
                      />
                      <AvatarFallback>
                        {data.owner
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">{data.owner}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden lg:inline">View</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden lg:inline">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
