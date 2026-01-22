"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Material {
  mtl_part: string;
  category: string;
  name: string;
  uom: string;
  qty: number;
}

interface MaterialsListProps {
  partNo: string;
}

export default function MaterialsList({ partNo }: MaterialsListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/materials?partNo=${encodeURIComponent(partNo)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch materials");
        }

        const result = await response.json();
        setMaterials(result.materials || []);
      } catch (err) {
        console.error("Error fetching materials:", err);
        setError("Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    if (partNo) {
      fetchMaterials();
    }
  }, [partNo]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materials (BOM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">Loading materials...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materials (BOM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Materials (BOM)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No materials available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Materials (BOM)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material No</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm text-blue-600">
                    {material.mtl_part}
                  </TableCell>
                  <TableCell>
                    <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                      {material.category}
                    </span>
                  </TableCell>
                  <TableCell>{material.name}</TableCell>
                  <TableCell className="text-gray-600">
                    {material.uom}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {parseFloat(material.qty.toString()).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
