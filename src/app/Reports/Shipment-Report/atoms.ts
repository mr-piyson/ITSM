import { atom } from "jotai";

//   pk.code as box_code,
//   i.project_category as project,
//   i.qr_code as part_id,
//   i.panel_ref AS description,
//   c.code as container_id,
//   ci.created_at as date,
//   c.shipped_by ,
//   c.code as mes_container_id,
//   u.key1 as job_id,
//   u.shortchar01 as epicor_asm_part_no,
//   u.shortchar01 as epicor_part_no

// Types

export interface ApiReportData {
	box_code: string;
	project: string;
	part_id: string;
	description: string;
	container_id: string;
	date: string;
	shipped_by: string;
	job_id: string;
	epicor_asm_part_no: string;
	epicor_part_no: string;
}

export interface ReportData {
	box_code: string;
	project: string;
	part_id: string;
	description: string;
	container_id: string;
	date: Date;
	shipped_by: string;
	job_id: string;
	epicor_asm_part_no: string;
	epicor_part_no: string;
}

export const initData = atom<ReportData[]>([]);
export const filteredData = atom<ReportData[]>([]);
export const yearStore = atom<string>("");
export const monthStore = atom<string>("");
