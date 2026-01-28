import mysql from "mysql2/promise"
import type { Pool } from "mysql2/promise"

class DatabaseManager {
  private static mesPool: Pool | null = null
  private static issPool: Pool | null = null

  static getMesPool(): Pool {
    if (!this.mesPool) {
      this.mesPool = mysql.createPool({
        uri: process.env.MES_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      })
    }
    return this.mesPool
  }

  static getIssPool(): Pool {
    if (!this.issPool) {
      this.issPool = mysql.createPool({
        uri: process.env.ISS_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      })
    }
    return this.issPool
  }
}

export const mes = DatabaseManager.getMesPool()
export const iss = DatabaseManager.getIssPool()

const db = { mes, iss }
export default db
