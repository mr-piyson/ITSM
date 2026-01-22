"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { AlertCircle, QrCode } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/LoadingSpinner";
import EditableField from "@/components/EditableField";
import EditHistory from "@/components/EditHistory";
import TrackingTimeline from "@/components/TrackingTimeline";
import MaterialsList from "@/components/MaterialsList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PanelData {
  id: string;
  panel_ref: string;
  project_code: string;
  planning_project: string;
  project_category: string;
  epicor_part_no: string;
  epicor_asm_part_no: string;
  qrcode_base64: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TrackingLog {
  id: string;
  print_for: string;
  info: string;
  created_at: string;
}

interface EditEntry {
  old_value: string | null;
  new_value: string;
  edited_by_name: string;
  edited_at: string;
}

export default function PanelTrackerPage() {
  const [panelId, setPanelId] = useState("");
  const [panelData, setPanelData] = useState<PanelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [editHistory, setEditHistory] = useState<Record<string, EditEntry>>({});

  // useEffect(() => {
  //   const fetchPanelData = async () => {
  //     try {
  //       const response = await fetch(`/api/panel_tracker/${panelId}`);
  //       if (!response.ok) throw new Error("Failed to fetch panel");

  //       const data = await response.json();
  //       setPanelData(data.panel);
  //       setTrackingLogs(data.trackingLogs);
  //       setEditHistory(data.editHistory);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : "Unknown error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (panelId) {
  //     fetchPanelData();
  //   }
  // }, [panelId]);

  const {
    data,
    isLoading,
    refetch,
    error: queryError,
  } = useQuery({
    queryKey: ["panelData", panelId],
    queryFn: async () => {
      const response = await fetch(`/api/panel_tracker?id=${panelId}`);
      if (!response.ok) throw new Error("Failed to fetch panel");
      const result = await response.json();
      const responseData = result.data;
      console.log("Data:", responseData);

      // Handle panel data
      setPanelData(responseData.panel);

      // Flatten trackingLogs if nested (handle both array and nested array)
      let logs: TrackingLog[] = [];
      if (Array.isArray(responseData.trackingLogs)) {
        if (
          responseData.trackingLogs.length > 0 &&
          Array.isArray(responseData.trackingLogs[0])
        ) {
          // If nested array, flatten it
          logs = responseData.trackingLogs.flat();
        } else {
          logs = responseData.trackingLogs;
        }
      }
      setTrackingLogs(logs);

      // Handle edit history
      setEditHistory(responseData.editHistory || {});

      return responseData;
    },
    enabled: false,
  });

  const handleFieldEdit = useCallback(
    async (field: string, newValue: string) => {
      if (!panelData) return;

      try {
        const oldValue = panelData[field as keyof PanelData] || null;
        const response = await axios.post(`/api/panel_tracker`, {
          id: panelId,
          field,
          oldValue,
          newValue,
        });

        if (response.data.success) {
          // Update local state
          setPanelData({
            ...panelData,
            [field]: newValue,
          });
          setEditingField(null);
          // Optionally refetch to get latest data
          refetch();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      }
    },
    [panelData, panelId, refetch],
  );

  if (isLoading) return <LoadingSpinner />;

  if (queryError || error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!panelData) {
    return (
      <div className="container mx-auto p-4">
        {/* Input to request panel data */}
        <div className="flex flex-col items-center justify-center gap-4">
          <Input
            type="text"
            value={panelId}
            onChange={(e) => setPanelId(e.target.value)}
            placeholder="Panel ID"
            className="border border-border rounded px-4 py-2 w-64"
          />
          <Button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Fetch Panel
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = true; // Replace with actual admin check logic

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Panel Tracker
        </h1>
        <p className="text-muted-foreground">
          Manage and track panel information
        </p>
      </div>

      {/* Panel Header with QR Code */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            {panelData.panel_ref}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <p className="text-lg font-semibold capitalize">
              {panelData.status}
            </p>
          </div>
          {panelData.qrcode_base64 && (
            <div className="flex flex-col items-center gap-2">
              <img
                src={panelData.qrcode_base64}
                alt="QR Code"
                className="w-40 h-40 border border-border rounded-lg p-2"
              />
              <p className="text-xs text-muted-foreground">QR Code</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panel Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <EditableField
          label="Panel Reference"
          field="panel_ref"
          value={panelData.panel_ref}
          isEditing={editingField === "panel_ref"}
          isAdmin={isAdmin || false}
          onEdit={() => setEditingField("panel_ref")}
          onSave={(value) => handleFieldEdit("panel_ref", value)}
          onCancel={() => setEditingField(null)}
        />

        <EditableField
          label="Project Code"
          field="project_code"
          value={panelData.project_code}
          isEditing={editingField === "project_code"}
          isAdmin={isAdmin || false}
          onEdit={() => setEditingField("project_code")}
          onSave={(value) => handleFieldEdit("project_code", value)}
          onCancel={() => setEditingField(null)}
        />

        <EditableField
          label="Planning Project"
          field="planning_project"
          value={panelData.planning_project}
          isEditing={editingField === "planning_project"}
          isAdmin={isAdmin || false}
          onEdit={() => setEditingField("planning_project")}
          onSave={(value) => handleFieldEdit("planning_project", value)}
          onCancel={() => setEditingField(null)}
        />

        <EditableField
          label="Project Category"
          field="project_category"
          value={panelData.project_category}
          isEditing={editingField === "project_category"}
          isAdmin={isAdmin || false}
          onEdit={() => setEditingField("project_category")}
          onSave={(value) => handleFieldEdit("project_category", value)}
          onCancel={() => setEditingField(null)}
        />

        <EditableField
          label="ERP Part No"
          field="epicor_part_no"
          value={panelData.epicor_part_no}
          isEditing={editingField === "epicor_part_no"}
          isAdmin={isAdmin || false}
          onEdit={() => setEditingField("epicor_part_no")}
          onSave={(value) => handleFieldEdit("epicor_part_no", value)}
          onCancel={() => setEditingField(null)}
        />

        <EditableField
          label="ERP Assembly Part No"
          field="epicor_asm_part_no"
          value={panelData.epicor_asm_part_no}
          isEditing={editingField === "epicor_asm_part_no"}
          isAdmin={isAdmin || false}
          onEdit={() => setEditingField("epicor_asm_part_no")}
          onSave={(value) => handleFieldEdit("epicor_asm_part_no", value)}
          onCancel={() => setEditingField(null)}
        />
      </div>

      {/* Edit History - Admin Only */}
      {isAdmin && Object.keys(editHistory).length > 0 && (
        <div className="mb-6">
          <EditHistory edits={editHistory} />
        </div>
      )}

      {/* Tracking Timeline */}
      {/* <div className="mb-6">
        <TrackingTimeline logs={trackingLogs} />
      </div> */}

      {/* Materials List */}
      <MaterialsList partNo={panelData.epicor_part_no} />
    </div>
  );
}
