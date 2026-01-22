"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface TrackingLog {
  id: string;
  print_for: string;
  info: string;
  created_at: string;
}

interface TrackingTimelineProps {
  logs: TrackingLog[];
}

export default function TrackingTimeline({ logs }: TrackingTimelineProps) {
  const parsedLogs = useMemo(() => {
    return logs
      .map((log) => {
        try {
          const info =
            typeof log.info === "string" ? JSON.parse(log.info) : log.info;
          return { ...log, info };
        } catch {
          return { ...log, info: {} };
        }
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [logs]);

  const getActionLabel = (printFor: string) => {
    const map: Record<string, string> = {
      qc: "Quality Check",
      dp: "Data Point",
      print: "Printed",
      packing: "Packed",
      container: "Containerized",
      confirm_shipped: "Shipped",
      assembly: "Assembled",
    };
    return map[printFor] || printFor;
  };

  const getStatusIcon = (info: any) => {
    if (!info) return <Clock className="h-5 w-5 text-gray-400" />;
    const result = info.inspection_result;
    if (!result) return <Clock className="h-5 w-5 text-gray-400" />;
    if (result.toUpperCase().includes("OK"))
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (result.toUpperCase().includes("NOK"))
      return <XCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  };

  const getStatusBadge = (info: any) => {
    const result = info.inspection_result;
    if (!result) return "bg-gray-100 text-gray-700";
    if (result.toUpperCase().includes("OK"))
      return "bg-green-100 text-green-700";
    if (result.toUpperCase().includes("NOK")) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  if (parsedLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tracking Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No tracking logs available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tracking Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parsedLogs.map((log) => (
            <div
              key={log.id}
              className="flex gap-4 pb-4 border-b last:border-b-0"
            >
              <div className="flex-shrink-0 pt-1">
                {getStatusIcon(log.info)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">
                    {getActionLabel(log.print_for)}
                  </h4>
                  {log.info.inspection_result && (
                    <Badge className={getStatusBadge(log.info)}>
                      {log.info.inspection_result}
                    </Badge>
                  )}
                </div>
                {log.info.gate_name && (
                  <p className="text-sm text-gray-600">
                    Gate:{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                      {log.info.gate_name}
                    </code>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
