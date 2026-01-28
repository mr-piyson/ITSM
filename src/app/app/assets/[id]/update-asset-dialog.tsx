"use client"

import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

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

interface UpdateAssetDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (asset: Asset) => void
}

export function UpdateAssetDialog({
  asset,
  open,
  onOpenChange,
  onUpdate,
}: UpdateAssetDialogProps) {
  const [formData, setFormData] = useState(asset)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      onUpdate(formData)
      setLoading(false)
    }, 1000)
  }

  const locations = [
    "Head Office",
    "Factory 1",
    "Factory 2",
    "Factory 3",
    "Factory 4",
    "Factory 5 - Nass",
    "IT Stores",
  ]

  const departments = [
    "After Sales",
    "Engineering",
    "Finance",
    "H2O",
    "HR",
    "Health & Safety",
    "I4",
    "IT",
    "Infrastructure",
    "Logistics",
    "Management",
    "Marketing",
    "Planning",
    "Process",
    "Projects",
    "SCM",
    "Sales",
    "Secretary",
    "Wind Energy",
    "Bids",
    "Business Development",
    "Tooling",
    "Quality",
    "Production",
    "Maintenance",
    "Final Quality",
    "Packing",
    "Resin Stores",
    "Paint Stores",
    "Gelcoating",
    "Store",
    "ABB",
    "Metal",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Asset Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, serialNumber: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    setFormData({ ...formData, manufacturer: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="firmwareVer">Firmware Version</Label>
                <Input
                  id="firmwareVer"
                  value={formData.firmwareVer}
                  onChange={(e) =>
                    setFormData({ ...formData, firmwareVer: e.target.value })
                  }
                  maxLength={50}
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="deviceName">Device Name</Label>
                <Input
                  id="deviceName"
                  value={formData.deviceName}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceName: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="processor">Processor</Label>
                <Input
                  id="processor"
                  value={formData.processor}
                  onChange={(e) =>
                    setFormData({ ...formData, processor: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="os">Operating System</Label>
                <Input
                  id="os"
                  value={formData.os}
                  onChange={(e) =>
                    setFormData({ ...formData, os: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="memory">Memory</Label>
                <Input
                  id="memory"
                  value={formData.memory}
                  onChange={(e) =>
                    setFormData({ ...formData, memory: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="hdd">Hard Disk</Label>
                <Input
                  id="hdd"
                  value={formData.hdd}
                  onChange={(e) =>
                    setFormData({ ...formData, hdd: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="specification">Other Specifications</Label>
                <Textarea
                  id="specification"
                  value={formData.specification}
                  onChange={(e) =>
                    setFormData({ ...formData, specification: e.target.value })
                  }
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="ip">IP Address</Label>
                <Input
                  id="ip"
                  value={formData.ip}
                  onChange={(e) =>
                    setFormData({ ...formData, ip: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="macAddress">MAC Address</Label>
                <Input
                  id="macAddress"
                  value={formData.macAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, macAddress: e.target.value })
                  }
                  maxLength={100}
                />
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="deviceStatus">Device Status</Label>
                <Select
                  value={formData.deviceStatus}
                  onValueChange={(
                    value: "In Use" | "Available" | "Defective"
                  ) => setFormData({ ...formData, deviceStatus: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Use">In Use</SelectItem>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Defective">Defective</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData({ ...formData, purchaseDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, purchasePrice: e.target.value })
                  }
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="warrantyDate">Warranty Date</Label>
                <Input
                  id="warrantyDate"
                  type="date"
                  value={formData.warrantyDate}
                  onChange={(e) =>
                    setFormData({ ...formData, warrantyDate: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="warrantyStatus">Warranty Status</Label>
                <Select
                  value={formData.warrantyStatus}
                  onValueChange={(value: "Valid" | "Expired" | "NA") =>
                    setFormData({ ...formData, warrantyStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Valid">Valid</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="NA">NA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, verified: checked as boolean })
                  }
                />
                <Label htmlFor="verified">Verified</Label>
              </div>

              <div className="pt-6">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Updating..." : "Update Asset"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
