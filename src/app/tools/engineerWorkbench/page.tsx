// app/page.tsx
import { format, subWeeks } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { erp } from "@/lib/database"

// Type definitions for our data
interface TaskRow {
  GroupID: string
  Description: string
  TaskID: string
  Name: string
  CompleteDate: Date | null
  taskStartDate: Date | null
}

interface GroupedEco {
  GroupID: string
  tasks: Record<string, TaskRow>
}

export default async function EngineerWorkbench({
  searchParams,
}: {
  searchParams: Promise<{ fromDate?: string; groupName?: string }>
}) {
  // In Next.js 15/16, searchParams is a Promise
  const params = await searchParams

  const defaultFromDate = format(subWeeks(new Date(), 1), "yyyy-MM-dd")
  const fromDate = params.fromDate || defaultFromDate
  const groupName = params.groupName || ""

  let results: TaskRow[] = []
  let hasSearched = Object.keys(params).length > 0

  // Fetch data if form was submitted
  if (hasSearched) {
    try {
      const request = (await erp).request()

      const baseQuery = `
        SELECT e.GroupID, e.Description, e.GroupClosed, e.CreatedDate, e.CreatedBy,
               t.TaskID, t.TaskSeqNum, t.TaskDescription, sr.Name, t.Complete,
               t.CompleteDate, t.StartDate as 'taskStartDate'
        FROM erp.ECOGroup e
        LEFT JOIN erp.Task t ON e.GroupID = t.Key1
        LEFT JOIN erp.SalesRep sr ON sr.SalesRepCode = t.SalesRepCode
      `

      if (groupName) {
        request.input("groupName", `%${groupName}%`)
        const query = `
          ${baseQuery}
          WHERE e.GroupID LIKE @groupName
          AND e.TaskSetID = 'ENG01'
          ORDER BY e.CreatedDate DESC, e.GroupID
        `
        const res = await request.query(query)
        results = res.recordset
      } else if (fromDate) {
        request.input("fromDate", fromDate)
        const query = `
          ${baseQuery}
          WHERE e.CreatedDate > @fromDate
          AND e.TaskSetID = 'ENG01'
          ORDER BY e.CreatedDate DESC, e.GroupID
        `
        const res = await request.query(query)
        results = res.recordset
      }
    } catch (error) {
      console.error("Database Query Failed:", error)
      // In a real app, you might want to show an error state here
    }
  }

  // Group the data by GroupID (Translates the inner loop logic from PHP)
  const groupedData: GroupedEco[] = []
  const groupMap = new Map<string, GroupedEco>()

  results.forEach((row) => {
    // Ported from PHP: if($ecoGroups[$n] != "GE Hub Hatch")
    if (row.GroupID === "GE Hub Hatch") return

    if (!groupMap.has(row.GroupID)) {
      const newGroup = { GroupID: row.GroupID, tasks: {} }
      groupMap.set(row.GroupID, newGroup)
      groupedData.push(newGroup)
    }

    if (["TS39", "TS40", "TS41", "TS42"].includes(row.TaskID)) {
      groupMap.get(row.GroupID)!.tasks[row.TaskID] = row
    }
  })

  // Helper function to render table cells cleanly
  const renderTaskCell = (task?: TaskRow) => {
    if (!task)
      return (
        <TableCell className="border-x text-center text-muted-foreground">
          -
        </TableCell>
      )

    const isComplete = !!task.CompleteDate

    return (
      <TableCell
        className={`border-x text-xs ${!isComplete ? "bg-red-300/30" : "bg-green-300/30"}`}
      >
        <div className="flex flex-col gap-1">
          <span>
            <span className="font-semibold">Assigned to:</span>{" "}
            {task.Name || "Unassigned"}
          </span>
          <span>
            <span className="font-semibold">Assigned date:</span>{" "}
            {task.taskStartDate
              ? format(new Date(task.taskStartDate), "yyyy-MM-dd")
              : "N/A"}
          </span>
          <span>
            <span className="font-semibold">Complete date:</span>{" "}
            {isComplete
              ? format(new Date(task.CompleteDate!), "yyyy-MM-dd")
              : "Pending"}
          </span>
        </div>
      </TableCell>
    )
  }

  return (
    <div className="">
      <Card className="bg-bfg text-white border-none border-t-0! shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">
            BFG INTERNATIONAL
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="space-y-6 p-8">
        <h3 className="text-xl font-semibold ">
          Search for All Engineer Workbench Groups by Date/Group ID
        </h3>

        {/* Note: Using method="GET" integrates perfectly with Next.js SSR searchParams */}
        <form method="GET" className="flex flex-wrap items-end gap-6 pb-6">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="fromDate">Date From</Label>
            <Input
              type="date"
              id="fromDate"
              name="fromDate"
              defaultValue={fromDate}
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="groupName">Search by Group ID</Label>
            <Input
              type="text"
              id="groupName"
              name="groupName"
              placeholder="Enter Group ID..."
              defaultValue={groupName}
            />
          </div>

          <Button type="submit" size="lg">
            SEARCH
          </Button>
        </form>

        {hasSearched && (
          <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm">
            {groupedData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-100">
                    <TableHead className="w-37.5 font-bold text-slate-900 border-x">
                      Group ID
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-900 border-x">
                      Engineering Corrections
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-900 border-x">
                      Review & Validate-Eng. Team
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-900 border-x">
                      Review & Validate-Kitting Team
                    </TableHead>
                    <TableHead className="text-center font-bold text-slate-900 border-x">
                      Review & Validate-Planning
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedData.map((group) => (
                    <TableRow key={group.GroupID}>
                      <TableCell className="font-medium bg-background  border-x">
                        {group.GroupID}
                      </TableCell>
                      {renderTaskCell(group.tasks["TS39"])}
                      {renderTaskCell(group.tasks["TS40"])}
                      {renderTaskCell(group.tasks["TS41"])}
                      {renderTaskCell(group.tasks["TS42"])}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-red-500 font-medium text-lg">
                No Result!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
