"use client";
import { useQuery } from "@tanstack/react-query";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import {
  AllCommunityModule,
  CsvExportModule,
  ModuleRegistry,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import axios from "axios";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

// API function

export default function ReportPage() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRows, setSelectedRows] = useState<InspectionResult[]>([]);
  const [from, setYear] = useAtom(fromStore);
  const [to, setMonth] = useAtom(toStore);
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
    queryKey: ["shipment", from, to],
    queryFn: async () => {
      const data = await fetchPanels();
      setInitPanels(data);
      setPanels(data);
      console.log(data);
      return data;
    },
    refetchOnWindowFocus: false,
    gcTime: Infinity,
    staleTime: Infinity,
    enabled: false,
  });

  const gateMap = {
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

  const fetchPanels = useCallback(async (): Promise<InspectionResult[]> => {
    const response = await axios.get(
      `/api/reports/shipments?from=${from}&to=${to}&gate=6`
    );
    const data = response.data.map(
      (panel: APIInspectionResult): InspectionResult => ({
        id: panel.id,
        panel_serial: panel.box_code.toUpperCase(),
        project: panel.project,
        date: new Date(panel.date),
        datetime: new Date(panel.date),
        datetime_new: new Date(panel.date),
        factory: panel.factory,
        gate: gateMap[panel.gate],
        inspection_result: panel.inspection_result === "OK" ? true : false,
        inspector: panel.inspector,
        user: panel.user,
        product_ref: panel.product_ref,
      })
    );
    return data;
  }, [from, to]);

  // Memoized column definitions
  const columnDefs: ColDef<InspectionResult>[] = useMemo(
    () => [
      {
        headerName: "Panel Serial",
        field: "panel_serial",
        editable: true,
        sortable: true,
        filter: true,
        pinned: "left",
        width: 280,
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
        cellRenderer: StatusCellRenderer,
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
  }, [gridApi, from, to]);

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

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Card className="h-full p-0 gap-0">
      <CardContent className="w-full flex flex-row items-center justify-between p-3 space-x-3">
        {/* Left Controls */}
        <div className="flex flex-1 flex-row gap-4">
          <Button
            variant="outline"
            onClick={exportRows}
            disabled={isLoading || !gridApi}
          >
            <i className="icon-[vscode-icons--file-type-excel] size-4" />
            <span className="max-sm:hidden">Export</span>
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex flex-1 flex-row justify-end gap-2">
          <Select value={from} onValueChange={setYear}>
            <SelectTrigger className=" border-border">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, index) => (
                <SelectItem
                  key={index}
                  value={String(new Date().getFullYear() - index)}
                >
                  {new Date().getFullYear() - index}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={to} onValueChange={setMonth}>
            <SelectTrigger className="border-border">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, index) => (
                <SelectItem key={index} value={String(index + 1)}>
                  {monthNames[index]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              refetch();
            }}
          >
            <Search />
            Search
          </Button>
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
