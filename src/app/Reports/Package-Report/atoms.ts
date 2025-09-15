import { atom } from "jotai";

// Types
export interface ReportData {
  id: string;
  code: string;
  project_name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  created_at: Date;
  has_photo: boolean;
}

export interface ApiReportData {
  id: string;
  code: string;
  project_name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  created_at: string;
  has_photo: string;
}

export const initData = atom<ReportData[]>([]);
export const filteredData = atom<ReportData[]>([]);
export const filterStore = atom<string>("");
