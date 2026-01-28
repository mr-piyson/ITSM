"use client"

import { useQuery } from "@tanstack/react-query"
import {
  AllCommunityModule,
  type ColDef,
  ModuleRegistry,
} from "ag-grid-community"
import { AgGridReact } from "ag-grid-react"
import {
  ExternalLink,
  MapPin,
  Printer,
  PrinterIcon,
  Search,
  User,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useIsMobile } from "@/hooks/use-mobile"

interface Printer {
  id: string | number
  name: string
  img?: string
  location: string
  usedBy: string
}

ModuleRegistry.registerModules([AllCommunityModule])

export default function PrinterManagement() {
  const isMobile = useIsMobile()
  const gridRef = useRef<any>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [searchText, setSearchText] = useState("")
  const [cardHeight, setCardHeight] = useState(0) // Start with 0
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const { data: printers, isLoading } = useQuery({
    queryKey: ["printers"],
    queryFn: async () => {
      const response = await fetch("/api/printers")
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    },
  })

  // Filter printers based on search
  const filteredPrinters = useMemo(() => {
    if (!printers) return []

    return printers.filter((printer: Printer) => {
      const matchesSearch =
        searchText === "" ||
        printer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        printer.location.toLowerCase().includes(searchText.toLowerCase()) ||
        printer.usedBy.toLowerCase().includes(searchText.toLowerCase())

      return matchesSearch
    })
  }, [printers, searchText])

  // Measure card height using ResizeObserver for accuracy
  useEffect(() => {
    if (cardRef.current) {
      // Clean up previous observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }

      // Create new ResizeObserver
      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.target.clientHeight
          if (height > 0) {
            // Add padding to the measured height
            setCardHeight(height + 16)
          }
        }
      })

      // Start observing
      resizeObserverRef.current.observe(cardRef.current)

      // Also measure immediately in case content is already loaded
      const immediateHeight = cardRef.current.clientHeight
      if (immediateHeight > 0) {
        setCardHeight(immediateHeight + 16)
      }
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [filteredPrinters.length])

  // Update grid when height changes
  useEffect(() => {
    if (gridRef.current && cardHeight > 0) {
      gridRef.current.api?.resetRowHeights()
    }
  }, [cardHeight])

  const handleViewDetails = useCallback((id: string) => {
    console.log("View details for printer:", id)
  }, [])

  // Full-width row component
  const FullWidthCellRenderer = useCallback(
    (props: any) => {
      const printer = props.data as Printer
      const isFirstRow = props.rowIndex === 0

      return (
        <div ref={isFirstRow ? cardRef : null}>
          <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Image Section */}
                <div className="w-full md:w-48 h-32 rounded-lg bg-white border border-border/20 overflow-hidden shadow-sm shrink-0">
                  {printer.img && (
                    <img
                      width={300}
                      height={200}
                      src={
                        "http://iss.bfginternational.com/ISS/printersImages/" +
                        printer.img
                      }
                      alt={printer.name}
                      className="w-full h-full object-contain"
                      loading="eager"
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Printer className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-balance leading-tight">
                          {printer.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-pretty">{printer.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{printer.usedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(String(printer.id))}
                      className="group-hover:border-primary/50 group-hover:text-primary w-full sm:w-auto"
                    >
                      View Details
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    [handleViewDetails]
  )

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        field: "name",
        headerName: "Printer",
        sortable: true,
        filter: true,
        flex: 1,
      },
    ],
    []
  )

  // Default column properties
  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
    }),
    []
  )

  // Use dynamic height if available, otherwise fallback
  const rowHeight = useMemo(() => {
    if (cardHeight > 0) {
      return cardHeight
    }
    return isMobile ? 400 : 250
  }, [cardHeight, isMobile])

  if (isLoading) {
    return (
      <Empty>
        <PrinterIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Loading printers...</h3>
        <Spinner />
      </Empty>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search Section */}

      <div className="p-4 sm:p-6">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search printers by name, location, or user..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-10 bg-background"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredPrinters.length} of {printers?.length || 0}{" "}
            printers
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="flex-1 min-h-0">
        {filteredPrinters.length === 0 ? (
          <Empty>
            <PrinterIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No printers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search
            </p>
            {searchText && (
              <Button variant="outline" onClick={() => setSearchText("")}>
                Clear Search
              </Button>
            )}
          </Empty>
        ) : (
          <AgGridReact
            ref={gridRef}
            rowData={filteredPrinters}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="normal"
            fullWidthCellRenderer={FullWidthCellRenderer}
            isFullWidthRow={() => true}
            rowHeight={rowHeight}
            animateRows={true}
            suppressHorizontalScroll={true}
            headerHeight={0}  
          />
        )}
      </div>
    </div>
  )
}
