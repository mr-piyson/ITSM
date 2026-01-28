"use client"

import { ArrowLeft, Edit, Printer, QrCode, Save, Trash2, X } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import QRCode from "react-qr-code"
import { mutate } from "swr"

import { Badge } from "@/components/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export default function AssetDetailsPage({ asset }: { asset: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<any>>(asset)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const params = useSearchParams()

  const handleSubmit = async () => {
    if (!asset) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/Assets/${asset.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        // Refresh the data
        mutate(`/api/Assets/${params.get("id")}`)
        setIsEditing(false)
      } else {
        console.error("Failed to update asset")
      }
    } catch (error) {
      console.error("Error updating asset:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditData(asset || {})
    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Use":
        return <Badge variant="default">{status}</Badge>
      case "Available":
        return <Badge variant="success">{status}</Badge>
      case "Defective":
        return <Badge variant="warning">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getWarrantyBadge = (status: string | null | undefined) => {
    const s = status ?? "Unknown"
    switch (s) {
      case "Valid":
        return <Badge variant="success">{s}</Badge>
      case "Expired":
        return <Badge variant="destructive">{s}</Badge>
      case "NA":
        return <Badge variant="warning">{s}</Badge>
      default:
        return <Badge variant="outline">{s}</Badge>
    }
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
    )
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 py-4 px-6 bg-background  flex justify-between items-center flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="max-sm:hidden">Back</span>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Asset Details
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                <span className="max-sm:hidden">Edit Asset</span>
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                <span className="max-sm:hidden">Delete</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 px-6  lg:grid-cols-3 gap-6">
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
                {isEditing ? (
                  <Input
                    readOnly={isEditing}
                    value={editData.code || ""}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    className="w-32 font-medium text-right "
                  />
                ) : (
                  <span className="text-foreground">{asset.code}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Type</span>
                {isEditing ? (
                  <Input
                    value={editData.type || ""}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.type}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Status</span>
                <div className="flex flex-col gap-1 items-end">
                  {isEditing && asset.deviceStatus ? (
                    <Select
                      value={editData.deviceStatus || asset.deviceStatus}
                      onValueChange={(value) =>
                        handleInputChange("deviceStatus", value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Use">In Use</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Defective">Defective</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge(asset.deviceStatus || "Available")
                  )}
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
                {isEditing ? (
                  <Input
                    value={editData.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.location}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Department</span>
                {isEditing ? (
                  <Input
                    value={editData.department || ""}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.department}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-start">
                <span className="font-medium text-foreground">Owner</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`http://iss.bfginternational.com/ISS/itemsImages/${asset.empImg}`}
                      alt={asset.owner?.charAt(0) || "U"}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {asset.owner?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{asset.owner}</span>
                </div>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Purchase Date
                </span>
                <Input
                  type="date"
                  readOnly={!isEditing}
                  value={
                    editData.purchaseDate instanceof Date
                      ? editData.purchaseDate.toISOString().split("T")[0]
                      : editData.purchaseDate || ""
                  }
                  onChange={(e) =>
                    handleInputChange("purchaseDate", e.target.value)
                  }
                  className="w-40 text-right"
                />
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Purchase Price
                </span>
                {isEditing ? (
                  <Input
                    value={editData.purchasePrice || ""}
                    onChange={(e) =>
                      handleInputChange("purchasePrice", e.target.value)
                    }
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.purchasePrice}</span>
                )}
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
                    "/placeholder.svg" ||
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
                {isEditing ? (
                  <Input
                    value={editData.deviceName || ""}
                    onChange={(e) =>
                      handleInputChange("deviceName", e.target.value)
                    }
                    className="w-40 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.deviceName}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Serial Number
                </span>
                {isEditing ? (
                  <Input
                    value={editData.serialNumber || ""}
                    onChange={(e) =>
                      handleInputChange("serialNumber", e.target.value)
                    }
                    className="w-40 text-right font-mono text-sm"
                  />
                ) : (
                  <span className="text-foreground font-mono text-sm">
                    {asset.serialNumber}
                  </span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Manufacturer
                </span>
                {isEditing ? (
                  <Input
                    value={editData.manufacturer || ""}
                    onChange={(e) =>
                      handleInputChange("manufacturer", e.target.value)
                    }
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.manufacturer}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Model</span>
                {isEditing ? (
                  <Input
                    value={editData.model || ""}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.model}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">MAC Address</span>
                {isEditing ? (
                  <Input
                    value={editData.macAddress || ""}
                    onChange={(e) =>
                      handleInputChange("macAddress", e.target.value)
                    }
                    className="w-40 text-right font-mono text-sm"
                  />
                ) : (
                  <span className="text-foreground font-mono text-sm">
                    {asset.macAddress}
                  </span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">IP Address</span>
                {isEditing ? (
                  <Input
                    value={editData.ip || ""}
                    onChange={(e) => handleInputChange("ip", e.target.value)}
                    className="w-32 text-right font-mono text-sm"
                  />
                ) : (
                  <span className="text-foreground font-mono text-sm">
                    {asset.ip}
                  </span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Firmware Version
                </span>
                {isEditing ? (
                  <Input
                    value={editData.firmwareVer || ""}
                    onChange={(e) =>
                      handleInputChange("firmwareVer", e.target.value)
                    }
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.firmwareVer}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Warranty Date
                </span>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.warrantyDate?.toDateString() || ""}
                    onChange={(e) =>
                      handleInputChange("warrantyDate", e.target.value)
                    }
                    className="w-40 text-right"
                  />
                ) : (
                  <span className="text-foreground">
                    {asset.warrantyDate?.toDateString()}
                  </span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Warranty Status
                </span>
                {isEditing ? (
                  <Select
                    value={
                      editData.warrantyStatus ??
                      asset.warrantyStatus ??
                      undefined
                    }
                    onValueChange={(value) =>
                      handleInputChange("warrantyStatus", value)
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Valid">Valid</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                      <SelectItem value="NA">NA</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  getWarrantyBadge(asset.warrantyStatus)
                )}
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
                {isEditing ? (
                  <Input
                    value={editData.processor || ""}
                    onChange={(e) =>
                      handleInputChange("processor", e.target.value)
                    }
                    className="w-40 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.processor}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">
                  Operating System
                </span>
                {isEditing ? (
                  <Input
                    value={editData.os || ""}
                    onChange={(e) => handleInputChange("os", e.target.value)}
                    className="w-32 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.os}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Memory</span>
                {isEditing ? (
                  <Input
                    value={editData.memory || ""}
                    onChange={(e) =>
                      handleInputChange("memory", e.target.value)
                    }
                    className="w-24 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.memory}</span>
                )}
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">Hard Disk</span>
                {isEditing ? (
                  <Input
                    value={editData.hdd || ""}
                    onChange={(e) => handleInputChange("hdd", e.target.value)}
                    className="w-24 text-right"
                  />
                ) : (
                  <span className="text-foreground">{asset.hdd}</span>
                )}
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
                value={`${window.location.origin}/App/Assets/${asset.id}`}
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
                  {isEditing ? (
                    <Textarea
                      value={editData.specification || ""}
                      onChange={(e) =>
                        handleInputChange("specification", e.target.value)
                      }
                      className="w-48 text-right text-sm"
                      rows={3}
                    />
                  ) : (
                    <span className="text-foreground text-right max-w-xs">
                      {asset.specification}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Owner Change Logs */}
          {asset.ownerChangeLogs && asset.ownerChangeLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary">
                  Owner Change Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {asset.ownerChangeLogs.map((log: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm max-sm:flex max-sm:flex-col"
                    >
                      <span className="text-foreground">
                        {new Date(log.date).toDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {log.old}
                        </Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="secondary" className="text-xs">
                          {log.new}
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
    </div>
  )
}
