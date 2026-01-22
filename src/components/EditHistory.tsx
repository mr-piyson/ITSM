"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, ArrowRight } from "lucide-react";

interface EditEntry {
  old_value: string | null;
  new_value: string;
  edited_by_name: string;
  edited_at: string;
}

interface EditHistoryProps {
  edits: Record<string, EditEntry>;
}

export default function EditHistory({ edits }: EditHistoryProps) {
  if (Object.keys(edits).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📝</span> Edit History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-start p-3 bg-blue-50 border border-blue-200 rounded-md">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            When you print a new label with these edited values, they will be
            saved and the QR code will be regenerated.
          </p>
        </div>

        <div className="space-y-3">
          {Object.entries(edits).map(([field, edit]) => (
            <div
              key={field}
              className="border border-gray-200 rounded-lg p-4 space-y-2"
            >
              <div className="font-semibold text-gray-900">
                {field.replace(/_/g, " ").toUpperCase()}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="bg-red-50 text-red-700 px-2 py-1 rounded font-mono text-xs flex-1">
                  {edit.old_value || "(empty)"}
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-mono text-xs flex-1">
                  {edit.new_value}
                </span>
              </div>

              <div className="text-xs text-gray-500 flex justify-between">
                <span>By {edit.edited_by_name}</span>
                <span>{new Date(edit.edited_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
