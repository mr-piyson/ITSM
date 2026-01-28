"use client"

import { AlertTriangle } from "lucide-react"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Asset {
  id: string
  code: string
  type: string
  deviceName: string
  serialNumber: string
  manufacturer: string
  model: string
  location: string
  department: string
  deviceStatus: "In Use" | "Available" | "Defective"
  warrantyStatus: "Valid" | "Expired" | "NA"
  verified: boolean
  verifiedDate?: string
  owner: {
    name: string
    image?: string
    empId: string
  }
  purchaseDate: string
  purchasePrice: string
  warrantyDate: string
  processor: string
  os: string
  memory: string
  hdd: string
  ip: string
  macAddress: string
  firmwareVer: string
  specification: string
  image?: string
  ownerChangeLogs: Array<{
    date: string
    oldOwner: string
    newOwner: string
  }>
}

interface DeleteAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
}

export function DeleteAssetDialog({
  asset,
  open,
  onOpenChange,
  onDelete,
}: DeleteAssetDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      onDelete()
      setLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Asset
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the asset
            and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Asset Details:</strong>
              <br />
              Code: {asset.code}
              <br />
              Type: {asset.type}
              <br />
              Device: {asset.deviceName}
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Asset"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
