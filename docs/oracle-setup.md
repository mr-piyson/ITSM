# Oracle Database Setup Guide

## Prerequisites

- Node.js 18+
- npm
- Oracle Database 11g+ server accessible from your network

## Quick Start (Automatic)

Run the setup script to configure everything automatically:

```bash
npm run setup:oracle
```

Or manually:

```bash
node scripts/setup-oracle.mjs
```

## Manual Setup

### 1. Install Dependencies

```bash
npm install oracledb
```

### 2. Install Oracle Instant Client

Oracle Instant Client is required for Thick mode (needed for Oracle 11g and earlier).

#### macOS (ARM64 - M1/M2/M3/M4)

```bash
# Download Instant Client
curl -L -o /tmp/instantclient-basic.dmg \
  "https://download.oracle.com/otn_software/mac/instantclient/instantclient-basic-macos-arm64.dmg"

# Mount and install
hdiutil attach /tmp/instantclient-basic.dmg -nobrowse
sh /Volumes/instantclient-basic-macos*/install_ic.sh
hdiutil detach /Volumes/instantclient-basic-macos*/

# Set environment variables (add to ~/.zshrc or ~/.bash_profile)
cat >> ~/.zshrc << 'EOF'
export ORACLE_HOME="$HOME/Downloads/instantclient_23"
export DYLD_LIBRARY_PATH="$ORACLE_HOME:$DYLD_LIBRARY_PATH"
export TNS_ADMIN="$ORACLE_HOME/network/admin"
export PATH="$ORACLE_HOME:$PATH"
EOF

source ~/.zshrc
```

#### macOS (Intel x86_64)

```bash
curl -L -o /tmp/instantclient-basic.dmg \
  "https://download.oracle.com/otn_software/mac/instantclient/instantclient-basic-macos.x64-23.3.0.23.09.dmg"

hdiutil attach /tmp/instantclient-basic.dmg -nobrowse
sh /Volumes/instantclient-basic-macos*/install_ic.sh
hdiutil detach /Volumes/instantclient-basic-macos*/
```

#### Linux (x86_64)

```bash
# Install dependencies
sudo yum install -y libaio unzip
# or on Ubuntu/Debian:
sudo apt-get install -y libaio1 unzip

# Download and extract
curl -L -o /tmp/instantclient-basic-linux.zip \
  "https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-23.4.0.24.05.zip"

sudo mkdir -p /opt/oracle
cd /opt/oracle
sudo unzip /tmp/instantclient-basic-linux.zip
export ORACLE_HOME=/opt/oracle/instantclient_23
export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH
export TNS_ADMIN=$ORACLE_HOME/network/admin

# Add to ~/.bashrc or ~/.bash_profile
cat >> ~/.bashrc << 'EOF'
export ORACLE_HOME=/opt/oracle/instantclient_23
export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH
export TNS_ADMIN=$ORACLE_HOME/network/admin
EOF
```

#### Linux (ARM64)

```bash
curl -L -o /tmp/instantclient-basic-linux-arm64.zip \
  "https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.arm64-23.4.0.24.05.zip"

sudo mkdir -p /opt/oracle
cd /opt/oracle
sudo unzip /tmp/instantclient-basic-linux-arm64.zip
export ORACLE_HOME=/opt/oracle/instantclient_23
export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH
```

#### Windows

1. Download from: https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html
2. Extract to `C:\oracle\instantclient`
3. Add to System PATH:
   ```
   C:\oracle\instantclient
   ```
4. Set environment variables:
   ```
   set ORACLE_HOME=C:\oracle\instantclient
   set TNS_ADMIN=C:\oracle\instantclient\network\admin
   ```

### 3. Configure TNS

Create `network/admin/tnsnames.ora` in the Instant Client directory:

```bash
mkdir -p $ORACLE_HOME/network/admin
```

**`$ORACLE_HOME/network/admin/tnsnames.ora`**:
```
BFG =
  (DESCRIPTION =
    (ADDRESS =
      (PROTOCOL = TCP)
      (HOST = 172.18.1.11)
      (PORT = 1521)
    )
    (CONNECT_DATA =
      (SID = BFGPROD)
    )
  )
```

### 4. Configure Environment Variables

Add to `.env`:

```env
# Oracle Database
ORACLE_HOST="172.18.1.11"
ORACLE_PORT="1521"
ORACLE_SERVICE_NAME="BFGPROD"
ORACLE_USER="bfgi"
ORACLE_PASSWORD="oracle123"
ORACLE_CLIENT_DIR="/path/to/instantclient"
TNS_ADMIN="/path/to/instantclient/network/admin"
```

### 5. Verify Setup

```bash
# Test Oracle Instant Client
$ORACLE_HOME/sqlplus bfgi/oracle123@//172.18.1.11:1521/BFGPROD

# Test from Node.js
node -e "
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });
console.log('Thick mode enabled');
"
```

## Troubleshooting

### NJS-138: connections to this database server version are not supported

**Cause**: Oracle DB is too old for Thin mode (requires 12.1+).

**Solution**: Install Oracle Instant Client and use Thick mode. See [Install Oracle Instant Client](#2-install-oracle-instant-client).

### NJS-045: cannot load a node-oracledb Thick mode binary

**Cause**: Oracle Instant Client not installed or path incorrect.

**Solution**:
1. Verify Instant Client is installed: `ls $ORACLE_HOME/libclntsh.dylib`
2. Verify `ORACLE_CLIENT_DIR` in `.env` points to Instant Client directory
3. Restart dev server after changes

### ORA-12547: TNS:lost contact

**Cause**: Network connectivity issue or firewall blocking.

**Solution**:
```bash
# Test connectivity
ping 172.18.1.11
tnsping BFG
telnet 172.18.1.11 1521
```

### ORA-12154: TNS:could not resolve the connect identifier

**Cause**: TNS configuration not found.

**Solution**:
1. Verify `TNS_ADMIN` is set: `echo $TNS_ADMIN`
2. Verify `tnsnames.ora` exists in `$TNS_ADMIN`
3. Verify TNS alias `BFG` is correct

### macOS: dyld[xxx]: Library not loaded

**Cause**: `DYLD_LIBRARY_PATH` not set.

**Solution**:
```bash
export DYLD_LIBRARY_PATH=$ORACLE_HOME:$DYLD_LIBRARY_PATH
# Add to ~/.zshrc for persistence
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Application                       │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │              src/lib/database.ts             │    │
│  │                                             │    │
│  │  getOdbPool()                               │    │
│  │    ├── ensureOracleClient()                 │    │
│  │    │   └── oracledb.initOracleClient()      │    │
│  │    └── oracledb.createPool(config)          │    │
│  │         └── connectString: "BFG" (TNS)      │    │
│  └─────────────────────────────────────────────┘    │
│                        │                            │
│                        ▼                            │
│  ┌─────────────────────────────────────────────┐    │
│  │           node-oracledb (Thick mode)        │    │
│  │           ├── libclntsh.dylib               │    │
│  │           └── tnsnames.ora                  │    │
│  └─────────────────────────────────────────────┘    │
│                        │                            │
│                        ▼                            │
│  ┌─────────────────────────────────────────────┐    │
│  │        Oracle Instant Client (23.x)          │    │
│  │        ORACLE_HOME/                          │    │
│  │          ├── libclntsh.dylib                 │    │
│  │          ├── libocci.dylib                   │    │
│  │          └── network/admin/tnsnames.ora      │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Oracle Database (11g)                   │
│              172.18.1.11:1521/BFGPROD                │
└─────────────────────────────────────────────────────┘
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `ORACLE_HOST` | Database server hostname/IP | `172.18.1.11` |
| `ORACLE_PORT` | Database listener port | `1521` |
| `ORACLE_SERVICE_NAME` | Database service name/SID | `BFGPROD` |
| `ORACLE_USER` | Database username | `bfgi` |
| `ORACLE_PASSWORD` | Database password | `oracle123` |
| `ORACLE_CLIENT_DIR` | Path to Oracle Instant Client | `/opt/oracle/instantclient_23` |
| `TNS_ADMIN` | Path to tnsnames.ora directory | `/opt/oracle/instantclient_23/network/admin` |
| `ORACLE_HOME` | Oracle installation directory | Same as `ORACLE_CLIENT_DIR` |
| `DYLD_LIBRARY_PATH` | (macOS) Library search path | `$ORACLE_HOME` |
| `LD_LIBRARY_PATH` | (Linux) Library search path | `$ORACLE_HOME` |

## API Usage

```typescript
import db from "@/lib/database";

// Get Oracle connection pool
const pool = await db.odb;

// Get a connection
const conn = await pool.getConnection();

try {
  // Execute query
  const result = await conn.execute(
    "SELECT * FROM employees WHERE department_id = :dept",
    { dept: 10 }
  );
  console.log(result.rows);
} finally {
  // Always release connection
  conn.release();
}
```

## Health Check

Visit `/health` to verify all database connections including Oracle.
