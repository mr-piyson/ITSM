"use client";
import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import axios from "axios";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { CsvExportModule } from "ag-grid-community";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { CircleDot, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchDialog } from "./SearchPanels";
import { useTableTheme } from "@/hooks/use-TableTheme";
import { Badge } from "@/components/ui/badge";

// Types
import { ReportData, initData, filteredData, filterStore } from "./atoms";

interface ApiReportData {
  panel_serial: string;
  project: string;
  latest_out: string;
  inspection_result: string;
  gate_name: string;
  route: string;
}

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

const DateCellRenderer = ({ value }: { value: string }) => {
  if (!value) return null;
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
};

const PanelCellRender = ({ value }: { value: string }) => {
  const trackerUrl = `http://intranet.bfginternational.com:88/utilities/panel_tracker?part_id=${value}`;

  return (
    <div className="flex justify-between items-center">
      <span className="text-md font-semibold">{value}</span>
      <Button
        variant="outline"
        size="icon"
        className="p-0"
        onClick={() => window.open(trackerUrl, "_blank")}
        title="Inspect Panel"
      >
        <i className="icon-[mingcute--inspect-line] size-5" />
      </Button>
    </div>
  );
};

// API function

export default function ReportPage() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRows, setSelectedRows] = useState<ReportData[]>([]);
  const [filter, setFilter] = useAtom(filterStore);
  const [, setInitPanels] = useAtom(initData);
  const [panels, setPanels] = useAtom(filteredData);
  const theme = useTableTheme();

  // React Query for data fetching
  const {
    data: tableData = [],
    isFetching: isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["panels", filter],
    queryFn: async () => {
      const data = await fetchPanels();
      setInitPanels(data);
      setPanels(data);
      return data;
    },
    refetchOnWindowFocus: false,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const fetchPanels = useCallback(async (): Promise<ReportData[]> => {
    const response = await axios.get(
      `http://172.18.10.40/ITSM/php/Inspections.php?filter=${filter}`
    );

    return response.data.map((item: ApiReportData) => ({
      panel_serial: item.panel_serial,
      project: item.project,
      latest_out: new Date(item.latest_out),
      route: item.route ? item.route.split(",") : [],
    }));
  }, [filter]);

  // Memoized column definitions
  const columnDefs: ColDef<ReportData>[] = useMemo(
    () => [
      {
        headerName: "Panel Serial",
        field: "panel_serial",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: PanelCellRender,
      },
      {
        headerName: "Project Name",
        field: "project",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Date Out",
        field: "latest_out",
        sortable: true,
        filter: "agDateColumnFilter",
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Route",
        field: "route",
        flex: 1,
        cellRenderer: ({ value }: { value: string[] }) => {
          return (
            <div className="flex-row gap-1">
              {value && value.length > 0 ? (
                value.map((step, index) => (
                  <div key={index} className="inline-flex items-center">
                    <Badge
                      key={index}
                      className="m-1 text-foreground border-1 border-success-foreground/50"
                      variant="success"
                      title={`Step ${index + 1}`}
                    >
                      <CircleDot className="mr-1 size-3 text-success-foreground" />
                      {step}
                    </Badge>
                    <div>
                      {index < value.length - 1 && (
                        <i className="icon-[mdi--arrow-right-bold] size-4" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No Route</span>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Memoized default column properties
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
    }),
    []
  );

  // Callbacks
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const onRowSelectionChanged = useCallback(() => {
    if (gridApi) {
      setSelectedRows(gridApi.getSelectedRows());
    }
  }, [gridApi]);

  const refreshData = useCallback(() => {
    if (gridApi) {
      gridApi.setFilterModel(null);
      gridApi.resetColumnState();
    }
    refetch();
  }, [gridApi, filter]);

  const exportRows = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        onlySelected: false,
        onlySelectedAllPages: false,
        allColumns: false,
        fileName: `filtered-report-${
          new Date().toISOString().split("T")[0]
        }.csv`,
      });
    }
  }, [gridApi]);

  // Error state
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
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
    <Card className="h-full p-0 gap-0">
      <CardContent className="w-full flex flex-row items-center justify-between p-3 space-x-3">
        {/* Left Controls */}
        <div className="flex flex-1 flex-row gap-4">
          <SearchDialog>
            <Button disabled={isLoading || !gridApi} variant="outline">
              <SearchIcon />
              Search
            </Button>
          </SearchDialog>
          <Button
            variant="outline"
            onClick={exportRows}
            disabled={isLoading || !gridApi}
          >
            <i className="icon-[vscode-icons--file-type-excel] size-4" />
            Export to CSV
          </Button>
          <Button
            className="flex items-center gap-2"
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
          >
            <i className="icon-[tdesign--refresh] size-4" />
            Refresh
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex flex-1 flex-row justify-end">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] border-border">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
              <SelectItem value="3years">Last 3 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>

      <CardContent className="p-0 h-full">
        <div className="ag-theme-alpine h-full w-full">
          <AgGridReact
            rowData={panels}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            animateRows={true}
            suppressMenuHide={true}
            theme={theme}
            loading={isLoading}
            onSelectionChanged={onRowSelectionChanged}
          />
        </div>
      </CardContent>

      <CardFooter>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Total Panels: {tableData.length}</span>
          {selectedRows.length > 0 && (
            <span className="pl-4 ml-2 border-l-2 border-foreground">
              Selected Panels: {selectedRows.length}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
