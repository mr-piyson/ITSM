"use client"

import { ExternalLink, MapPin, Printer, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PrinterCardProps {
  printer: any
  onViewDetails: (id: string) => void
}

export function PrinterCard({ printer, onViewDetails }: PrinterCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 p-0">
      <CardContent className="p-6">
        <div className="w-full h-32 rounded-lg bg-white border border-border/20 overflow-hidden shadow-sm mb-4">
          {printer.img && (
            <img
              width={300}
              height={200}
              src={
                "http://iss.bfginternational.com/ISS/printersImages/" +
                  printer.img || ""
              }
              alt={printer.name}
              className="w-full h-full min-h-24 min-w-full object-contain"
            />
          )}
        </div>

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

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-pretty">{printer.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{printer.usedBy}</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(String(printer.id))}
          className="w-full group-hover:border-primary/50 group-hover:text-primary"
        >
          View Details
          <ExternalLink className="h-3 w-3 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
