"use client"

import { useMutation } from "@tanstack/react-query"
import { AlertCircle, Calendar, Clock, Loader2, User } from "lucide-react"
import React, { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

// ─── Types & Helpers ──────────────────────────────────────────────────────────
interface LogGeneratorForm {
  date: string
  personId: string
  startTime: string
  endTime: string
  totalHours: number
}

interface LogGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (payload: LogGeneratorForm) => Promise<void>
  defaultPersonId?: string
}

const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

const fromMinutes = (mins: number): string => {
  const clamped = Math.max(0, Math.min(mins, 23 * 60 + 59))
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

const calcHours = (start: string, end: string): number => {
  if (!start || !end) return 0
  const diff = toMinutes(end) - toMinutes(start)
  return diff > 0 ? parseFloat((diff / 60).toFixed(2)) : 0
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LogGeneratorDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultPersonId = "",
}: LogGeneratorDialogProps) {
  const today = new Date().toISOString().slice(0, 10)

  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<LogGeneratorForm>({
    date: today,
    personId: defaultPersonId,
    startTime: "08:00",
    endTime: "17:00",
    totalHours: 9,
  })

  const [lastChanged, setLastChanged] = useState<"hours" | "end" | null>(null)

  // ── Mutation Logic (React Query) ───────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (payload: LogGeneratorForm) => {
      // If a custom onSubmit is provided, use it, otherwise use the API
      if (onSubmit) {
        return await onSubmit(payload)
      }
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Request failed")
      return data.summary
    },
  })

  // ── Sync Logic ──────────────────────────────────────────────────────────────
  const handleStartChange = (v: string) => {
    setForm((prev) => {
      const newEnd =
        lastChanged === "hours" || lastChanged === null
          ? fromMinutes(toMinutes(v) + prev.totalHours * 60)
          : prev.endTime
      const newHours =
        lastChanged === "end" ? calcHours(v, prev.endTime) : prev.totalHours
      return { ...prev, startTime: v, endTime: newEnd, totalHours: newHours }
    })
  }

  const handleEndChange = (v: string) => {
    setLastChanged("end")
    setForm((prev) => ({
      ...prev,
      endTime: v,
      totalHours: calcHours(prev.startTime, v),
    }))
  }

  const handleHoursChange = (v: number) => {
    setLastChanged("hours")
    const clamped = Math.max(0, Math.min(v, 24))
    setForm((prev) => ({
      ...prev,
      totalHours: clamped,
      endTime: fromMinutes(toMinutes(prev.startTime) + clamped * 60),
    }))
  }

  const handleClose = () => {
    mutation.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-120 border-slate-800 bg-[#0d0f12] text-slate-200">
        <DialogHeader className="space-y-1">
          <Badge
            variant="outline"
            className="w-fit border-blue-500/30 text-blue-400 font-mono text-[10px] bg-blue-500/5"
          >
            Attendance
          </Badge>
          <DialogTitle className="text-xl font-medium tracking-tight">
            Generate Log Entry
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Date & Person ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-mono text-slate-500 tracking-wider">
                Date
              </Label>
              <Input
                type="date"
                value={form.date}
                max={today}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-[#13161b] border-slate-800 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-mono text-slate-500 tracking-wider">
                Person ID
              </Label>
              <Input
                placeholder="e.g. 10042"
                value={form.personId}
                onChange={(e) => setForm({ ...form, personId: e.target.value })}
                className="bg-[#13161b] border-slate-800 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-mono text-slate-500 tracking-wider">
                Clock In
              </Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                className="bg-[#13161b] border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-mono text-slate-500 tracking-wider">
                Clock Out
              </Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => handleEndChange(e.target.value)}
                className="bg-[#13161b] border-slate-800"
              />
            </div>
          </div>

          {/* Hours Control */}
          <div className="space-y-4">
            <Label className="text-[11px] uppercase font-mono text-slate-500 tracking-wider">
              Total Hours
            </Label>
            <div className="flex items-center gap-6">
              <Input
                type="number"
                value={form.totalHours}
                onChange={(e) =>
                  handleHoursChange(parseFloat(e.target.value) || 0)
                }
                className="w-24 text-center font-mono text-lg font-bold text-blue-400 bg-[#13161b] border-slate-800"
              />
              <Slider
                value={[Math.min(form.totalHours, 12)]}
                max={12}
                step={0.5}
                onValueChange={([val]) => handleHoursChange(val)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Live Summary Bar */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-mono text-slate-400">
                Current Shift
              </p>
              <p className="text-xs font-mono text-slate-300">
                {form.startTime} <span className="text-slate-600 mx-1">→</span>{" "}
                {form.endTime}
              </p>
            </div>
            <div className="text-lg font-mono font-bold text-blue-400">
              {form.totalHours.toFixed(2)} hrs
            </div>
          </div>

          {/* Result Section */}
          {mutation.isSuccess && mutation.data && (
            <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <SummaryItem label="ID" value={mutation.data.personId} />
              <SummaryItem label="Duration" value={mutation.data.duration} />
              <SummaryItem label="In" value={mutation.data.in?.slice(11)} />
              <SummaryItem label="Out" value={mutation.data.out?.slice(11)} />
            </div>
          )}

          {/* Error Section */}
          {mutation.isError && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
              <AlertCircle className="h-4 w-4" />
              {(mutation.error as Error).message}
            </div>
          )}
        </div>

        <DialogFooter className="bg-[#13161b]/50 -mx-6 -mb-6 p-6 mt-2 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.personId || !form.date}
            className="bg-blue-600 hover:bg-blue-500 text-white min-w-35"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {mutation.isPending ? "Generating..." : "Generate Log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[9px] uppercase font-mono text-emerald-500/60 tracking-wider">
        {label}
      </p>
      <p className="text-sm font-mono text-slate-200">{value}</p>
    </div>
  )
}
