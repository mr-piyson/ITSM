"use client";

import { AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";

import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  NumberFilterModule,
  RowSelectedEvent,
  RowSelectionOptions,
  ValidationModule,
} from "ag-grid-community";
import { useTableTheme } from "@/hooks/use-TableTheme";
import { Badge } from "@/components/ui/badge";
import { Edit, Ticket as IconTicket, Trash } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import useSWR from "swr";
import Image from "next/image";

// Register the required modules
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  NumberFilterModule,
  ValidationModule /* Development Only */,
]);

export default function AccountTable() {
  const tableTheme = useTableTheme();

  const isMobile = useIsMobile();

  type EmployeeRow = {
    id: number;
    emp_code: string;
    name: string;
    department: string;
    designation: string;
    left_date: string | null;
    telephone: string;
    nationality: string;
    emp_location: string;
    emp_source: string;
    access: string;
    is_active: boolean;
    photo: {
      folder: string;
      filename: string;
      ext: string;
    } | null;
  };

  const [rowData, setRowData] = useState<EmployeeRow[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<
    EmployeeRow | undefined
  >(undefined);

  function onRowSelected(event: RowSelectedEvent<any, any>) {
    const selectedRows = event.api.getSelectedRows() as EmployeeRow[];
    if (selectedRows.length > 0) {
      setSelectedEmployee(selectedRows[0]);
    } else {
      setSelectedEmployee(undefined);
    }
  }

  const { data, error, mutate, isLoading } = useSWR("/api/Employees", {
    fetcher: (url: string) => fetch(url).then((res) => res.json()),
  });

  useMemo(() => {
    if (data) {
      setRowData(data);
    }
  }, [data]);

  const colDefs: ColDef[] = [
    {
      field: "photo",
      headerName: "Photo",
      flex: 1,
      cellRenderer: (params: any) => {
        const photo = params.data.photo;
        if (!photo) return null;
        // You may need to adjust the path based on your backend
        const src = `http://intranet.bfginternational.com:88/storage/employee/${photo.folder}/${photo.filename}.${photo.ext}`;
        return (
          <Image
            src={src}
            alt="Employee Photo"
            width={40}
            height={40}
            style={{ borderRadius: "50%" }}
          />
        );
      },
    },
    {
      field: "emp_code",
      headerName: "Code",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      filter: true,
      flex: 3,
    },
    {
      field: "department",
      headerName: "Department",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      field: "designation",
      headerName: "Designation",
      sortable: true,
      filter: true,
      flex: 2,
    },
    {
      field: "telephone",
      headerName: "Mobile",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: "emp_location",
      headerName: "Location",
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: "access",
      headerName: "Status",
      sortable: true,
      filter: true,
      flex: 1,
      cellRenderer: (params: any) => {
        const leftDate = params.data.left_date;
        let status = "Active";
        if (leftDate) {
          status = "Inactive";
        }
        return (
          <Badge variant={status === "Active" ? "success" : "destructive"}>
            {status}
          </Badge>
        );
      },
      valueGetter: (params: any) => {
        const leftDate = params.data.left_date;
        return leftDate ? "Inactive" : "Active";
      },
    },
  ];

  return (
    <div className=" flex flex-col w-full h-full">
      {/* Table Header */}
      <Card className="flex flex-row p-0 m-0 rounded-none">
        <CardContent className="w-full p-3 space-x-3">
          {/* Add Button */}
          <Button
            variant="default"
            className="border-2"
            aria-label="Add New Account"
          >
            <IconTicket />
            <span className="max-sm:hidden me-2">New Ticket</span>
          </Button>
          {/* Edit Button */}
          {selectedEmployee && (
            <Button
              variant={"ghost"}
              className=" bg-transparent hover:bg-background  border-2 "
            >
              <Edit />
              <span className="max-sm:hidden me-2 ">Edit</span>
            </Button>
          )}
          {/* Delete Button */}
          {selectedEmployee && (
            <Button
              variant={"destructive"}
              className=" bg-transparent hover:bg-background  border-2 "
            >
              <Trash />
              <span className="max-sm:hidden me-2 ">Delete</span>
            </Button>
          )}
        </CardContent>
      </Card>
      <AgGridReact
        theme={tableTheme}
        className=" h-full w-full "
        rowData={rowData}
        columnDefs={colDefs}
        // this will make the grid responsive
        rowHeight={60}
        // This will prevent the column from removed when dragged out
        suppressDragLeaveHidesColumns
        // this will allow us to select multiple rows
        onRowSelected={onRowSelected}
        pagination={true}
      />
    </div>
  );
}
