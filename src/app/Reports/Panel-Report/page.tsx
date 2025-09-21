"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Button } from "@/components/ui/button";
import { CsvExportModule } from "ag-grid-community";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAtom } from "jotai";
import SearchPanels from "./SearchPanels";
import { SearchIcon } from "lucide-react";
import { useTableTheme } from "@/hooks/use-TableTheme";
import { useQuery } from "@tanstack/react-query";
import {
  ApiReportData,
  filterStore,
  initPanelsStore,
  panelsStore,
  ReportData,
} from "./atoms";
import { JobCellRenderer } from "../CellsRender";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

// Custom cell renderers
const StatusCellRenderer = ({ value }: { value: boolean }) => (
  <Badge variant={value ? "default" : "secondary"} className="text-xs">
    {value ? "Yes" : "No"}
  </Badge>
);

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

const ContainerCellRenderer = ({ data }: { data: ReportData }) => (
  <div className="flex justify-between items-center">
    <span className="text-md font-semibold">{data.container}</span>
    {data.container && (
      <Button
        variant="outline"
        size="icon"
        className="p-0"
        onClick={() =>
          window.open(
            `http://intranet.bfginternational.com:88/containers/show?id=${parseInt(
              data.container?.match(/\d+/)?.[0] || "0"
            )}`,
            "_blank"
          )
        }
        title="Inspect Container"
      >
        <i className="icon-[ph--shipping-container] size-6" />
      </Button>
    )}
  </div>
);

const BoxCellRenderer = ({ data }: { data: ReportData }) => (
  <div className="flex justify-between items-center">
    <span className="text-md font-semibold">{data.package}</span>
    {data.package && (
      <Button
        variant="outline"
        size="icon"
        className="p-0"
        onClick={() =>
          window.open(
            `http://intranet.bfginternational.com:88/packages/show?id=${parseInt(
              data.package?.match(/\d+/)?.[0] || "0"
            )}`,
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
  return `${day}/${month}/${year}`;
};

// API function

export default function ReportPage() {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRows, setSelectedRows] = useState<ReportData[]>([]);
  const [filter, setFilter] = useAtom(filterStore);
  const [, setInitPanels] = useAtom(initPanelsStore);
  const [panels, setPanels] = useAtom(panelsStore);
  const theme = useTableTheme();

  const fetchPanels = useCallback(async (): Promise<ReportData[]> => {
    const response = await axios.get(
      `http://172.18.10.40/ITSM/php/panels.php?filter=${filter}`
    );

    return response.data.map(
      (panel: ApiReportData): ReportData => ({
        panelId: panel.panel_id.toUpperCase(),
        container: panel.container,
        created_at: new Date(panel.label_creation_date)
          .toISOString()
          .split("T")[0],
        wrapped: panel.wrapped === 1,
        final: panel.final === 1,
        epicor_asm_part_no: panel.epicor_asm_part_no,
        asm_part_no: panel.epicor_asm_part_no,
        project: panel.project,
        package: panel.package,
        qc_datetime: panel.qc_datetime
          ? new Date(panel.qc_datetime).toISOString().split("T")[0]
          : undefined,
        panel_id: panel.panel_id,
        label_creation_date: panel.label_creation_date,
        description: panel.description,
        job_id: panel.job_id,
      })
    );
  }, [filter]);

  // React Query for data fetching
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

  // Memoized column definitions
  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: "Panel ID",
        field: "panelId",
        editable: true,
        sortable: true,
        filter: true,
        pinned: "left",
        width: 300,
        cellRenderer: PanelCellRender,
      },
      {
        headerName: "Description",
        field: "description",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "ASM Part No",
        field: "epicor_asm_part_no",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Project Name",
        field: "project",
        editable: true,
        sortable: true,
        filter: true,
      },
      {
        headerName: "Job ID",
        field: "job_id",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: JobCellRenderer,
      },
      {
        headerName: "Created At",
        field: "created_at",
        sortable: true,
        width: 115,
        filter: "agDateColumnFilter",
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "QC Passed At",
        field: "qc_datetime",
        sortable: true,
        width: 120,
        filter: "agDateColumnFilter",
        cellRenderer: DateCellRenderer,
      },
      {
        headerName: "Final",
        field: "final",
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "Wrapped",
        field: "wrapped",
        sortable: true,
        filter: true,
        width: 100,
        cellRenderer: StatusCellRenderer,
      },
      {
        headerName: "Box Code",
        field: "package",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: BoxCellRenderer,
      },
      {
        headerName: "Container Code",
        field: "container",
        editable: true,
        sortable: true,
        filter: true,
        cellRenderer: ContainerCellRenderer,
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
  if (error) {
    return (
      <Card className="h-full">
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
          <SearchPanels>
            <Button disabled={isLoading || !gridApi} variant="outline">
              <SearchIcon />
              <span className="max-sm:hidden">Search</span>
            </Button>
          </SearchPanels>
          <Button
            variant="outline"
            onClick={exportRows}
            disabled={isLoading || !gridApi}
          >
            <i className="icon-[vscode-icons--file-type-excel] size-4" />
            <span className="max-sm:hidden">Export to CSV</span>
          </Button>
          <Button
            className="flex items-center gap-2"
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
          >
            <i className="icon-[tdesign--refresh] size-4" />
            <span className="max-sm:hidden">Refresh</span>
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex flex-1 flex-row justify-end">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px] border-border">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
              <SelectItem value="3years">Last 3 Years</SelectItem>
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
