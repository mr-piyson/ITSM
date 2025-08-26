"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  UserCheck,
  QrCode,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { UpdateAssetDialog } from "./update-asset-dialog";
import { UpdateOwnerDialog } from "./update-owner-dialog";
import { DeleteAssetDialog } from "./delete-asset-dialog";
import { QRCodeDisplay } from "./qr-code-display";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import Image from "next/image";
import QRCode from "react-qr-code";

interface Asset {
  id: string;
  code: string;
  type: string;
  deviceName: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  location: string;
  department: string;
  deviceStatus: "In Use" | "Available" | "Defective";
  warrantyStatus: "Valid" | "Expired" | "NA";
  verified: boolean;
  verifiedDate?: string;
  owner: {
    name: string;
    image?: string;
    empId: string;
  };
  purchaseDate: string;
  purchasePrice: string;
  warrantyDate: string;
  processor: string;
  os: string;
  memory: string;
  hdd: string;
  ip: string;
  macAddress: string;
  firmwareVer: string;
  specification: string;
  image?: string;
  ownerChangeLogs: Array<{
    date: string;
    oldOwner: string;
    newOwner: string;
  }>;
}

interface AssetDetailsPageProps {
  assetCode: string;
}

export default function AssetDetailsPage(props: any) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const params = useSearchParams();

  const {
    data: asset,
    error,
    isLoading,
  } = useSWR<Asset>(`/api/Assets/asset?id=${params.get("id")}`, fetcher);

  // Mock data - replace with actual API call

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Use":
        return <Badge variant="default">{status}</Badge>;
      case "Available":
        return <Badge variant="success">{status}</Badge>;
      case "Defective":
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWarrantyBadge = (status: string) => {
    switch (status) {
      case "Valid":
        return <Badge variant="success">{status}</Badge>;
      case "Expired":
        return <Badge variant="destructive">{status}</Badge>;
      case "NA":
        return <Badge variant="warning">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-card rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-card rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-foreground">
            Asset not found
          </h2>
          <p className="text-gray-600 mt-2">
            The requested asset could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Asset Details
            </h1>
            <p className="text-gray-600">Code: {asset.code}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOwnerDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Update Owner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUpdateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Update
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">
              General Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Code</span>
                <span className="text-foreground">{asset.code}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Type</span>
                <span className="text-foreground">{asset.type}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-start">
                <span className="font-medium text-foreground">Status</span>
                <div className="flex flex-col gap-1 items-end">
                  {getStatusBadge(asset.deviceStatus)}
                  {asset.verified && (
                    <Badge
                      variant="default"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Location</span>
                <span className="text-foreground">{asset.location}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Department</span>
                <span className="text-foreground">{asset.department}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-start">
                <span className="font-medium text-foreground">Owner</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={asset.owner?.image || "/placeholder.svg"}
                      alt={asset.owner?.name}
                    />
                    <AvatarFallback>
                      {asset.owner?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{asset.owner?.name}</span>
                </div>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Purchase Date
                </span>
                <span className="text-foreground">{asset.purchaseDate}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Purchase Price
                </span>
                <span className="text-foreground">{asset.purchasePrice}</span>
              </div>
            </div>

            {asset.image && (
              <div className="mt-6">
                <Image
                  width={300}
                  height={200}
                  src={
                    "http://iss.bfginternational.com/ISS/itemsImages/" +
                      asset.image ||
                    "/placeholder.svg?height=200&width=300&query=IT asset device" ||
                    "/placeholder.svg"
                  }
                  alt={asset.deviceName ?? "Asset Image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary">
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Device Name</span>
                <span className="text-foreground">{asset.deviceName}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Serial Number
                </span>
                <span className="text-foreground font-mono text-sm">
                  {asset.serialNumber}
                </span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Manufacturer
                </span>
                <span className="text-foreground">{asset.manufacturer}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Model</span>
                <span className="text-foreground">{asset.model}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">MAC Address</span>
                <span className="text-foreground font-mono text-sm">
                  {asset.macAddress}
                </span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">IP Address</span>
                <span className="text-foreground font-mono text-sm">
                  {asset.ip}
                </span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Firmware Version
                </span>
                <span className="text-foreground">{asset.firmwareVer}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Warranty Date
                </span>
                <span className="text-foreground">{asset.warrantyDate}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Warranty Status
                </span>
                {getWarrantyBadge(asset.warrantyStatus)}
              </div>
            </div>
          </CardContent>

          {/* Computer Information */}
          <CardHeader className="pt-6">
            <CardTitle className="text-lg font-semibold text-primary">
              Computer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Processor</span>
                <span className="text-foreground">{asset.processor}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Operating System
                </span>
                <span className="text-foreground">{asset.os}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Memory</span>
                <span className="text-foreground">{asset.memory}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Hard Disk</span>
                <span className="text-foreground">{asset.hdd}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code and Other Information */}
        <div className="space-y-6">
          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <QRCode
                className="flex justify-center mx-auto "
                bgColor="var(--card)"
                fgColor="#000"
                value={`http://172.16.1.84:3000/App/Assets/asset?id=${asset.id}`}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 mx-auto bg-transparent"
              >
                <Printer className="h-4 w-4" />
                Print QR Code
              </Button>
            </CardContent>
          </Card>

          {/* Other Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary">
                Other Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-foreground">
                    Other Specifications
                  </span>
                  <span className="text-foreground text-right max-w-xs">
                    {asset.specification}
                  </span>
                </div>

                {asset.verified && asset.verifiedDate && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">
                        Verified Date
                      </span>
                      <span className="text-foreground">
                        {asset.verifiedDate}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Change Logs */}
          {asset.ownerChangeLogs?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Owner Change Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {asset.ownerChangeLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-foreground">{log.date}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {log.oldOwner}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="secondary" className="text-xs">
                          {log.newOwner}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <UpdateAssetDialog
        asset={asset}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
        onUpdate={(updatedAsset) => {
          setUpdateDialogOpen(false);
        }}
      />

      <UpdateOwnerDialog
        asset={asset}
        open={ownerDialogOpen}
        onOpenChange={setOwnerDialogOpen}
        onUpdate={(updatedAsset) => {
          setOwnerDialogOpen(false);
        }}
      />

      <DeleteAssetDialog
        asset={asset}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={() => {
          // Handle navigation after deletion
          window.location.href = "/assets";
        }}
      />
    </div>
  );
}
