import { atom } from "jotai";

export const panelsStore = atom<ReportData[]>([]);
export const initPanelsStore = atom<ReportData[]>([]);
export const filterStore = atom<string>("");
export const projectsStore = atom(new Set<string>());

export interface ReportData {
  panelId: string;
  container?: string;
  created_at: string;
  wrapped: boolean;
  final: boolean;
  epicor_asm_part_no: string;
  asm_part_no: string;
  project: string;
  package?: string;
  qc_datetime?: string;
  panel_id: string;
  label_creation_date: string;
  description: string;
  job_id: string;
}

export interface ApiReportData {
  panel_id: string;
  container?: string;
  label_creation_date: string;
  wrapped: number;
  final: number;
  epicor_asm_part_no: string;
  project: string;
  package?: string;
  qc_datetime?: string;
  description: string;
  job_id: string;
}
