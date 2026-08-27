# MSSQL Database Setup Guide

## Prerequisites

- Node.js 18+
- npm
- Microsoft SQL Server 2005+ accessible from your network

## Quick Start

```bash
npm install mssql
```

Add to `.env`:

```env
ERP_USER="MES"
ERP_PASSWORD="M3\$Ep!2X"
ERP_SERVER="172.18.1.31"
ERP_DATABASE="ERP10Live"
```

Restart your dev server.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ERP_USER` | SQL Server username | `MES` |
| `ERP_PASSWORD` | SQL Server password | `M3\$Ep!2X` |
| `ERP_SERVER` | SQL Server hostname/IP | `172.18.1.31` |
| `ERP_DATABASE` | Database name | `ERP10Live` |

## Important: Password Special Characters

### The `$` Problem

In `.env` files, `$` is treated as variable expansion by `dotenv-expand`. A password like `M3$Ep!2X` gets broken down:

```env
# WRONG - $Ep is expanded as empty variable
ERP_PASSWORD="M3$Ep!2X"    # Results in: M3!2X

# CORRECT - escape $ with backslash
ERP_PASSWORD="M3\$Ep!2X"   # Results in: M3$Ep!2X
```

### Rules for Special Characters

| Character | Action | Example |
|-----------|--------|---------|
| `$` | Escape with `\$` | `M3\$Ep!2X` |
| `"` | Escape with `\"` | `pass\"word` |
| `\` | Escape with `\\` | `pass\\word` |
| `!` | No escape needed | `M3$Ep!2X` |
| `@` | No escape needed | `user@pass` |
| `#` | No escape needed | `pass#word` |
| `%` | URL-encode as `%25` | `pass%word` → `pass%25word` |

### Testing Your Password

Verify the password is read correctly:

```bash
# Check what Node.js sees
node -e "require('dotenv').config(); console.log(process.env.ERP_PASSWORD)"
```

Expected output: `M3$Ep!2X`

If output is `M3!2X`, the `$` is not escaped. Fix it:

```env
# Before (wrong)
ERP_PASSWORD="M3$Ep!2X"

# After (correct)
ERP_PASSWORD="M3\$Ep!2X"
```

## Troubleshooting

### Login failed for user

**Cause**: Wrong credentials or password special characters not escaped.

**Solution**:
1. Verify password in `.env` has `\$` for `$` characters
2. Test connection directly:
   ```bash
   sqlcmd -S 172.18.1.31 -U MES -P 'M3$Ep!2X' -Q "SELECT 1"
   ```
3. Check Node.js reads the correct password:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.ERP_PASSWORD)"
   ```

### Cannot connect to server

**Cause**: Network issue or SQL Server not configured for remote connections.

**Solution**:
```bash
# Test connectivity
ping 172.18.1.31
telnet 172.18.1.31 1433

# Check SQL Server is listening on TCP
# On SQL Server machine, run:
netstat -an | findstr 1433
```

### Connection timeout

**Cause**: Firewall blocking or SQL Server max connections reached.

**Solution**:
1. Check firewall allows port 1433
2. Increase timeout in connection config:
   ```typescript
   const config: mssql.config = {
     // ...
     options: {
       encrypt: false,
       trustServerCertificate: true,
       connectTimeout: 30000, // 30 seconds
     },
   };
   ```

### Transaction count after EXECUTE indicates a mismatch

**Cause**: Server-side cursor or stored procedure issue.

**Solution**: Use `mssql` v9+ which handles this better:
```bash
npm install mssql@latest
```

## Connection Configuration

### Default Config in database.ts

```typescript
const config: mssql.config = {
  user: process.env.ERP_USER,
  password: process.env.ERP_PASSWORD,
  database: process.env.ERP_DATABASE,
  server: process.env.ERP_SERVER,
  port: 1433,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `encrypt` | Enable TLS encryption | `false` |
| `trustServerCertificate` | Trust self-signed certs | `true` |
| `connectTimeout` | Connection timeout (ms) | `15000` |
| `requestTimeout` | Request timeout (ms) | `15000` |
| `pool.max` | Max connections in pool | `10` |
| `pool.min` | Min connections in pool | `0` |
| `pool.idleTimeoutMillis` | Idle connection timeout | `30000` |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │              src/lib/database.ts             │    │
│  │                                             │    │
│  │  getERPPool()                               │    │
│  │    └── mssql.ConnectionPool(config)         │    │
│  │         ├── user: process.env.ERP_USER      │    │
│  │         ├── password: process.env.ERP_PWD   │    │
│  │         ├── server: process.env.ERP_SERVER  │    │
│  │         └── database: process.env.ERP_DB    │    │
│  └─────────────────────────────────────────────┘    │
│                        │                            │
│                        ▼                            │
│  ┌─────────────────────────────────────────────┐    │
│  │              mssql (node-mssql)              │    │
│  │              ├── tedious.js                  │    │
│  │              └── tarn.js (pooling)           │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│          Microsoft SQL Server (2005+)               │
│          172.18.1.31:1433/ERP10Live                 │
└─────────────────────────────────────────────────────┘
```

## API Usage

```typescript
import db from "@/lib/database";

// Get MSSQL connection pool
const pool = await db.erp;

// Simple query
const result = await pool.request().query("SELECT * FROM orders");
console.log(result.recordset);

// Parameterized query
const result = await pool.request()
  .input("orderId", mssql.Int, 123)
  .query("SELECT * FROM orders WHERE id = @orderId");

// Stored procedure
const result = await pool.request()
  .input("employeeId", mssql.Int, 456)
  .execute("GetEmployeeDetails");
```

## Health Check

Visit `/health` to verify all database connections including MSSQL.
