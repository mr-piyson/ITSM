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
import { Search, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTableTheme } from "@/hooks/use-TableTheme";
import {
  ApiReportData,
  filteredData,
  filterStore,
  initData,
  ReportData,
} from "./atoms";
import { SearchDialog } from "./SearchPanels";

const searchOptions: { value: keyof ReportData; label: string }[] = [
  { value: "code", label: "Panel Code" },
  { value: "project_name", label: "Project Name" },
];

interface ImportDialogProps {
  children?: React.ReactNode;
}

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

const BoxCellRenderer = ({ data }: { data: ReportData }) => (
  <div className="flex justify-between items-center">
    <span className="text-md font-semibold">{data.code}</span>
    {data.code && (
      <Button
        variant="outline"
        size="icon"
        className="p-0"
        onClick={() =>
          window.open(
            `http://intranet.bfginternational.com:88/packages/show?id=${data.id}`,
            "_blank"
          )
        }
        title="Inspect Box"
      >
        <i className="icon-[solar--box-outline] size-6" />
      </Button>
    )}
  </div>
);

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
      `http://${window.location.hostname}:80/ITSM/php/packages.php?filter=${filter}`
    );

    return response.data.map(
      (panel: ApiReportData): ReportData => ({
        id: panel.id,
        code: panel.code.toLocaleUpperCase(),
        project_name: panel.project_name,
        length_cm: panel.length_cm,
        width_cm: panel.width_cm,
        height_cm: panel.height_cm,
        weight_kg: panel.weight_kg,
        created_at: new Date(panel.created_at),
        has_photo: Boolean(Number(panel.has_photo)),
      })
    );
  }, [filter]);

  // Memoized column definitions
  const columnDefs: ColDef<ReportData>[] = useMemo(
    () => [
      {
        headerName: "Box Code",
        field: "code",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: BoxCellRenderer,
      },
      {
        headerName: "Project Name",
        field: "project_name",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Created At",
        field: "created_at",
        sortable: true,
        filter: "agDateColumnFilter",
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Photo",
        field: "has_photo",
        cellStyle: { textAlign: "center" },
        cellRenderer: (params: any) =>
          params.value ? (
            <i className="icon-[mdi--check-circle] text-green-600 size-5" />
          ) : (
            <i className="icon-[mdi--close-circle] text-red-600 size-5" />
          ),
        filter: true,
        sortable: true,
      },
      {
        headerName: "Length (cm)",
        field: "length_cm",
        type: "numericColumn",
        editable: true,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Width (cm)",
        field: "width_cm",
        type: "numericColumn",
        editable: true,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Height (cm)",
        field: "height_cm",
        type: "numericColumn",
        editable: true,
        sortable: true,
        filter: "agNumberColumnFilter",
      },
      {
        headerName: "Weight (kg)",
        field: "weight_kg",
        type: "numericColumn",
        editable: true,
        sortable: true,
        filter: "agNumberColumnFilter",
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
