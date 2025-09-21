import { atom } from "jotai";

export interface ApiReportData {
  panel_serial: string;
  project: string;
  datetime_out: string;
  gate: string;
}

export interface ReportData {
  panel_serial: string;
  project: string;
  datetime_out: string;
  gate: string;
}

export const initData = atom<ReportData[]>([]);
export const filteredData = atom<ReportData[]>([]);
export const filterStore = atom<string>("");

const gateNames: Record<number, string> = {
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

type PivotedPanel = {
  panel_serial: string;
  project: string;
  [key: string]: string | undefined;
};

function pivotPanels(
  rows: ReportData[],
  mode: "min" | "max" = "max" // default = latest date
): PivotedPanel[] {
  const result: Record<string, PivotedPanel> = {};

  rows.forEach((row) => {
    const gateName = gateNames[row.gate as unknown as number];
    if (!gateName) return; // skip unknown gates

    if (!result[row.panel_serial]) {
      result[row.panel_serial] = {
        panel_serial: row.panel_serial,
        project: row.project,
      };
    }

    const currentValue = result[row.panel_serial][gateName];
    const newValue = row.datetime_out;

    if (!currentValue) {
      result[row.panel_serial][gateName] = newValue;
    } else {
      if (mode === "max") {
        if (new Date(newValue) > new Date(currentValue)) {
          result[row.panel_serial][gateName] = newValue;
        }
      } else {
        if (new Date(newValue) < new Date(currentValue)) {
          result[row.panel_serial][gateName] = newValue;
        }
      }
    }
  });

  return Object.values(result);
}
