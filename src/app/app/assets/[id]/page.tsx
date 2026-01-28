import { RowDataPacket } from "mysql2"

import db from "@/lib/database"

import AssetDetailsPage from "./AssetDetails"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page(props: PageProps) {
  const id = Number((await props.params).id)

  // Run queries in parallel: each returns [rows, fields]
  const [assetQuery, logsQuery] = await Promise.all([
    db.iss.execute<RowDataPacket[] & any>(`
      SELECT a.*, e.name as owner, e.image as empImg
      FROM assets a
      LEFT JOIN employees e ON e.empID = a.empID
      WHERE a.id = ${id}
      LIMIT 1
    `),

    db.iss.execute<RowDataPacket[] & any>(`
      SELECT 
        e1.name as old, 
        e2.name as new, 
        a.date, 
        e2.image
      FROM assestOwnerUpdateLogs a
      LEFT JOIN employees e1 ON e1.empID = a.oldOwnerEmpID
      LEFT JOIN employees e2 ON e2.empID = a.newOwnerID
      WHERE a.assetID = ${id}
      ORDER BY a.date ASC
    `),
  ])

  // Extract rows from mysql2 results
  const [assetRows] = assetQuery
  const [logRows] = logsQuery

  const asset = assetRows[0] || null

  if (!asset) {
    return <div>Asset not found</div>
  }

  // Transform logs safely
  const logs = logRows.map((row: any) => ({
    old: row.old || "",
    new: row.new || "",
    date: row.date.toISOString(),
    image: row.image || "",
  }))

  const latestLog = logs[logs.length - 1]

  const assetDetails: any = {
    ...asset,
    owner: latestLog?.new || asset.owner,
    empImg: latestLog?.image || asset.empImg,
    ownerChangeLogs: logs,
  }

  return <AssetDetailsPage asset={assetDetails} />
}
