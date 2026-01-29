"use client"

import { useQuery } from "@tanstack/react-query"
import { Printer, Users } from "lucide-react"
import { useCallback } from "react"

import { UniversalListView } from "@/components/UniversalListView"
import { Card } from "@/components/ui/card"

interface Printer {
  id: string | number
  name: string
  img?: string
  location: string
  usedBy: string
}

// Printer Card Component
const PrinterCard = ({ data }: { data: Printer }) => {
  const handleViewDetails = useCallback((id: string | number) => {
    console.log("View details for printer:", id)
  }, [])

  return (
    <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10">
      <h1>Hello world</h1>
    </Card>
  )
}

export default function PrinterManagement() {
  const { data: printers = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    },
  })

  return (
    <UniversalListView<Printer>
      data={printers}
      isLoading={isLoading}
      searchPlaceholder="Search employees..."
      searchFields={["name"]}
      cardRenderer={PrinterCard}
      emptyIcon={
        <Users className="size-12 mx-auto text-muted-foreground mb-4" />
      }
      emptyTitle="No Employees found"
      emptyDescription="Try adjusting your search or filters"
      rowHeight={80}
      useTheme={false}
      itemName="employees"
    />
  )
}
