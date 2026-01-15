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
import { SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTableTheme } from "@/hooks/use-tableTheme";
import { JobCellRenderer, StatusCellRenderer } from "../CellsRender";
import {
  type ApiReportData,
  filterStore,
  initPanelsStore,
  panelsStore,
  projectsStore,
  type ReportData,
} from "./atoms";
import SearchPanels from "./SearchPanels";

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

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
  const [projects, setProjects] = useAtom(projectsStore);
  const theme = useTableTheme();

  const fetchPanels = useCallback(async (): Promise<ReportData[]> => {
    const response = await axios.get(`/api/reports/panels?filter=${filter}`);

    const filteredData: ReportData[] = [];

    (response.data as ApiReportData[]).forEach((panel) => {
      filteredData.push({
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
      });
      projects.add(panel.project);
    });
    setProjects(projects);
    return filteredData;
  }, [filter]);

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

  function handleProjectFilter(value: string): void {
    if (value === "No filter") {
      setPanels(tableData);
    } else {
      const filteredPanels = tableData.filter(
        (panel) => panel.project === value
      );
      setPanels(filteredPanels);
    }
  }

  return (
    <Card className="h-full p-0 gap-0">
      <CardContent className="w-full flex flex-row items-center justify-between p-3 space-x-3">
        {/* Left Controls */}
        <div className="flex flex-1 flex-row gap-4">
          <SearchPanels>
            <Button
              disabled={isLoading || !gridApi || panels.length === 0}
              variant="outline"
            >
              <SearchIcon />
              <span className="max-sm:hidden">Search</span>
            </Button>
          </SearchPanels>
          <Button
            variant="outline"
            onClick={exportRows}
            disabled={isLoading || !gridApi || panels.length === 0}
          >
            <i className="icon-[vscode-icons--file-type-excel] size-4" />
            <span className="max-sm:hidden">Export</span>
          </Button>
          <Button
            className="flex items-center gap-2"
            variant="outline"
            onClick={refreshData}
            disabled={isLoading || panels.length === 0}
          >
            <i className="icon-[tdesign--refresh] size-4" />
            <span className="max-sm:hidden">Refresh</span>
          </Button>
          <Select onValueChange={handleProjectFilter}>
            <SelectTrigger
              disabled={Array.from(projects).length === 0 || isLoading}
              className="w-45 border-border"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem defaultValue={"No Filter"} value={"No filter"}>
                No Filter
              </SelectItem>
              <Separator className="my-2" />
              {Array.from(projects).map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Controls */}
        <div className="flex flex-1 flex-row justify-end">
          <Select value={filter} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-40 border-border">
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
              <SelectItem value="5years">Last 5 Years</SelectItem>
              <SelectItem value="all">All Times</SelectItem>
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
