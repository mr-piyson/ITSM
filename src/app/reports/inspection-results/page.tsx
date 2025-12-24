"use client";
import { useQuery } from "@tanstack/react-query";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import {
  AllCommunityModule,
  CsvExportModule,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useAtom } from "jotai";
import { ChevronDownIcon, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useTableTheme } from "@/hooks/use-tableTheme";
import {
  DateCellRenderer,
  PanelCellRender,
  StatusCellRenderer,
} from "../CellsRender";
import {
  filteredData,
  initData,
  InspectionResult,
  fromStore,
  toStore,
} from "./atoms";
import { APIInspectionResult } from "@/app/api/reports/inspection-results/route";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

const gateOptions = [
  { value: "1", label: "Mold" },
  { value: "2", label: "Gelcoating" },
  { value: "10", label: "Demolding" },
  { value: "3", label: "Trimming" },
  { value: "11", label: "Drilling" },
  { value: "12", label: "Bonding" },
  { value: "5", label: "Painting" },
  { value: "6", label: "Final" },
];

const gateMap: Record<number, string> = {
  1: "Mold",
  2: "Gelcoating",
  3: "Trimming",
  4: "Finishing",
  5: "Painting",
  6: "Final",
  10: "Demolding",
  11: "Drilling",
  12: "Bonding",
  15: "Paint Prep",
  16: "Wrapping",
  17: "Packing",
  18: "Mixing",
  19: "Casting",
  20: "Pullout Test",
  21: "Curing",
  22: "After Trimming",
};

// Helper function to format date for API (YYYY-MM-DD)
function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ReportPage() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRows, setSelectedRows] = useState<InspectionResult[]>([]);
  const [from, setFrom] = useAtom(fromStore);
  const [to, setTo] = useAtom(toStore);
  const [gate, setGate] = useState<string>("1");
  const [, setInitPanels] = useAtom(initData);
  const [panels, setPanels] = useAtom(filteredData);
  const theme = useTableTheme();

  const fetchPanels = useCallback(async (): Promise<InspectionResult[]> => {
    const fromParam = from ? formatDateForAPI(from) : "";
    const toParam = to ? formatDateForAPI(to) : "";

    const response = await fetch(
      `/api/reports/inspection-results?from=${fromParam}&to=${toParam}&gate=${gate}`
    );
    const json = await response.json();
    const data = json.map(
      (panel: APIInspectionResult): InspectionResult => ({
        id: panel.id,
        panel_serial: panel.panel_serial.toUpperCase(),
        project: panel.project,
        date: new Date(panel.date),
        datetime: new Date(panel.datetime),
        datetime_new: new Date(panel.datetime_new),
        factory: panel.factory,
        gate: gateMap[panel.gate],
        inspection_result: panel.inspection_result === "OK" ? true : false,
        inspector: panel.inspector,
        user: panel.user,
        product_ref: panel.product_ref,
      })
    );
    return data;
  }, [from, to, gate]);

  // React Query for data fetching
  const {
    data: tableData = [],
    isFetching: isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["shipment", from, to, gate],
    queryFn: async () => {
      const data = await fetchPanels();
      setInitPanels(data);
      setPanels(data);
      return data;
    },
    refetchOnWindowFocus: false,
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: false,
  });

  // Memoized column definitions
  const columnDefs: ColDef<InspectionResult>[] = useMemo(
    () => [
      {
        headerName: "Panel ID",
        field: "panel_serial",
        editable: true,
        sortable: true,
        filter: true,
        flex: 1,
        cellRenderer: PanelCellRender,
      },
      {
        headerName: "Project",
        field: "project",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Date & Time",
        field: "datetime",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Factory",
        field: "factory",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Inspection Result",
        field: "inspection_result",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: (value: any) => (
          <StatusCellRenderer
            value={value.value}
            whenFalse={"NOK"}
            whenTrue={"OK"}
          />
        ),
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
  }, [gridApi, refetch]);

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

  // Handle search button click
  const handleSearch = useCallback(() => {
    refetch();
  }, [refetch]);

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
    <div className="flex flex-col h-full">
      {/* Full Width Header */}
      <Card className="w-full border-0 rounded-none">
        <CardContent className=" space-y-4">
          {/* Gates Tab Switcher */}
          <div className="w-full overflow-x-auto">
            <Tabs value={gate} onValueChange={setGate} className="w-full">
              <TabsList className="inline-flex w-auto min-w-full">
                {gateOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="whitespace-nowrap"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Date Range Picker and Search */}
          <div className="flex flex-wrap items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {from
                    ? `From: ${from.toLocaleDateString()}`
                    : "Select start date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={from}
                  captionLayout="dropdown"
                  disabled={(day) => day > new Date()}
                  onSelect={(date) => {
                    setFrom(date);
                  }}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-48 justify-between font-normal"
                >
                  {to ? `To: ${to.toLocaleDateString()}` : "Select end date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={to}
                  disabled={(day) =>
                    day > new Date() || (from ? day < from : false)
                  }
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setTo(date);
                  }}
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleSearch} disabled={isLoading || !from || !to}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>

            <Button
              variant="outline"
              onClick={exportRows}
              disabled={isLoading || !gridApi}
            >
              <i className="icon-[vscode-icons--file-type-excel] size-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card className="flex-1 p-0 gap-0">
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
            <span>Total Inspection: {tableData.length}</span>
            {selectedRows.length > 0 && (
              <span className="pl-4 ml-2 border-l-2 border-foreground">
                Selected Panels: {selectedRows.length}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
