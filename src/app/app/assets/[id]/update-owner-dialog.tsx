"use client"

import { Search } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

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

interface Employee {
  empId: string
  name: string
  image?: string
  department: string
}

interface UpdateOwnerDialogProps {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (asset: Asset) => void
}

export function UpdateOwnerDialog({
  asset,
  open,
  onOpenChange,
  onUpdate,
}: UpdateOwnerDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Mock employees data
  const employees: Employee[] = [
    {
      empId: "EMP001",
      name: "John Smith",
      image: "/professional-headshot.png",
      department: "IT",
    },
    {
      empId: "EMP002",
      name: "Jane Doe",
      image: "/professional-headshot.png",
      department: "HR",
    },
    {
      empId: "EMP003",
      name: "Mike Johnson",
      image: "/professional-headshot.png",
      department: "Finance",
    },
    {
      empId: "EMP004",
      name: "Sarah Wilson",
      image: "/professional-headshot.png",
      department: "Marketing",
    },
    {
      empId: "EMP005",
      name: "David Brown",
      image: "/professional-headshot.png",
      department: "Engineering",
    },
  ]

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectEmployee = async (employee: Employee) => {
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedAsset = {
        ...asset,
        owner: {
          name: employee.name,
          image: employee.image,
          empId: employee.empId,
        },
        ownerChangeLogs: [
          {
            date: new Date().toISOString(),
            oldOwner: asset.owner.name,
            newOwner: employee.name,
          },
          ...asset.ownerChangeLogs,
        ],
      }

      onUpdate(updatedAsset)
      setLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Asset Owner</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.empId}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleSelectEmployee(employee)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={employee.image || "/placeholder.svg"}
                    alt={employee.name}
                  />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {employee.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {employee.empId} • {employee.department}
                  </p>
                </div>
              </div>
            ))}

            {filteredEmployees.length === 0 && searchTerm && (
              <div className="text-center py-8 text-gray-500">
                No employees found matching "{searchTerm}"
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-600">Updating owner...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
