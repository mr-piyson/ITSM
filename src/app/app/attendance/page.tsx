"use client"

import {
  AlertCircle,
  CalendarDays,
  Clock,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function AttendancePage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [error, setError] = useState("")

  const [year, setYear] = useState("2026")
  const [month, setMonth] = useState("01")
  const [workerId, setWorkerId] = useState("")

  const [firstSeen, setFirstSeen] = useState("")
  const [lastSeen, setLastSeen] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setData([])
    setSummary(null)

    try {
      const res = await fetch(
        `/api/attendance?year=${year}&month=${month}&workerId=${workerId}`
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to fetch")
      setData(json.data)
      setSummary(json.summary)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Inside your AttendancePage component
  const isWeekend = (dateString: string) => {
    const day = new Date(dateString).getDay()
    return day === 5 || day === 6 // 5 = Friday, 6 = Saturday
  }

  // get day of week from date string
  const getDayOfWeek = (dateString: string) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]
    const dayIndex = new Date(dateString).getDay()
    return days[dayIndex]
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-1 bg-teal-600 rounded-full"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight ">
            BFG International
          </h1>
          <p className="text-slate-500">Worker Attendance Portal</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Records</CardTitle>
          <CardDescription>
            Select period and enter Employee ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="grid gap-2 w-full md:w-37.5">
              <label className="text-sm font-medium">Year</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 w-full md:w-37.5">
              <label className="text-sm font-medium">Month</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                      {new Date(0, m - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 w-full">
              <label className="text-sm font-medium">Worker ID</label>
              <Input
                placeholder="e.g. 10450"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {summary && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader className="">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Employee Name
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.employeeName}</div>
              </CardContent>
            </Card>
          </div>

          {/* Clean Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day of week</TableHead>
                    <TableHead className="w-45">Date</TableHead>
                    <TableHead>First In</TableHead>
                    <TableHead>Last Out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((day) => (
                    <TableRow
                      key={day.date}
                      className={
                        isWeekend(day.date)
                          ? "bg-background/50"
                          : day.status === "Absent"
                            ? "bg-background/60"
                            : ""
                      }
                    >
                      {/* Day of week Column */}
                      <TableCell className="font-bold capitalize">
                        {getDayOfWeek(day.date)}
                      </TableCell>
                      {/* Date Column */}
                      <TableCell className="font-medium flex items-center text-muted-foreground">
                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                        {day.date}
                      </TableCell>

                      {/* First In Column */}
                      <TableCell>
                        {day.startTime !== "-" ? (
                          <a
                            href={day.imageStart}
                            target="_blank"
                            className="inline-flex items-center text-primary hover:underline font-medium"
                          >
                            {day.startTime}{" "}
                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>

                      {/* Last Out Column */}
                      <TableCell>
                        {day.endTime !== "-" ? (
                          <a
                            href={day.imageEnd}
                            target="_blank"
                            className="inline-flex items-center text-primary hover:underline font-medium"
                          >
                            {day.endTime}{" "}
                            <ExternalLink className="h-3 w-3 ml-1 opacity-50" />
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {isWeekend(day.date) ? (
                          <Badge
                            variant="outline"
                            className="bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          >
                            Weekend
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              day.status === "Present"
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                                : day.status === "Incomplete"
                                  ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:border-orange-700"
                                  : "bg-red-50 text-red-600 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                            }
                          >
                            {day.status}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold text-muted-foreground">
                        {day.hours !== "00:00" ? (
                          day.hours
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
