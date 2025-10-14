"use client";

import type { users } from "@prisma/client";
import {
	AllCommunityModule,
	ClientSideRowModelModule,
	type ColDef,
	ModuleRegistry,
} from "ag-grid-community"; // Import the missing module
import { AgGridReact } from "ag-grid-react";
import Image from "next/image";
import { useState } from "react";
import { useTableTheme } from "@/hooks/use-TableTheme";

// Register the required modules
ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

export default function RecordTable({ account }: { account: users }) {
	const tableTheme = useTableTheme();

	const [rowData, setRowData] = useState<users[]>([]);

	// Column Definitions: Defines the columns to be displayed.
	const [colDefs, setColDefs] = useState<ColDef[]>([
		{
			field: "image",

			cellRenderer: (params: { value: string }) => {
				return (
					<div className="flex items-center justify-center">
						<Image
							className="w-[35px] h-[35px] rounded-full"
							src={params.value}
							alt={"User Avatar"}
							width={35}
							height={35}
						/>
					</div>
				);
			},
		},
		{ field: "name", sortable: true, filter: true },
		{ field: "email", sortable: true, filter: true },
		{ field: "rules", sortable: true, filter: true },
		{ field: "password", sortable: true, filter: true },
		{
			field: "createdAt",
			sortable: true,
			filter: true,
			valueFormatter: (params) => {
				return new Date(params.value).toLocaleDateString();
			},
		},
		{
			field: "updatedAt",
			sortable: true,
			filter: true,
			valueFormatter: (params) => {
				return new Date(params.value).toLocaleDateString();
			},
		},
	]);

	return (
		<div className=" flex flex-col w-full h-full bg-popover">
			<AgGridReact
				theme={tableTheme}
				className="h-full w-full"
				rowData={rowData}
				columnDefs={colDefs}
			/>
		</div>
	);
}
