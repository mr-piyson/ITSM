import { atom } from "jotai";

export interface ApiReportData {
  panel_serial: string;
  datetime_out: string;
  gate: string;
}

export interface ReportData {
  panel_serial: string;
  [key: string]: string;
}

export const initData = atom<ReportData[]>([]);
export const filteredData = atom<ReportData[]>([]);
export const filterStore = atom<string>("");

const workstation: Record<number, string | undefined> = {
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

type Mode = "min" | "max";

export function getPivotData(
  api: ApiReportData[],
  mode: Mode = "max"
): ReportData[] {
  const panelMap = new Map<string, Record<string, string>>();

  for (let i = 0; i < api.length; i++) {
    const { panel_serial, datetime_out, gate } = api[i] as ApiReportData;
    const workstationName = workstation[Number(gate)];
    if (!workstationName) continue;

    let record = panelMap.get(panel_serial.toUpperCase());
    if (!record) {
      record = {};
      panelMap.set(panel_serial, record);
    }

    const currentValue = record[workstationName];
    if (!currentValue) {
      record[workstationName] = datetime_out;
      continue;
    }

    const currentTime = Date.parse(currentValue);
    const newTime = Date.parse(datetime_out);

    if (
      (mode === "min" && newTime < currentTime) ||
      (mode === "max" && newTime > currentTime)
    ) {
      record[workstationName] = datetime_out;
    }
  }

  return Array.from(panelMap, ([panel_serial, workstationData]) => ({
    panel_serial,
    ...workstationData,
  }));
}
