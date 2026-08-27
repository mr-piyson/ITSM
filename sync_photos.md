# Next.js Employee Photo Sync — Oracle & MES Database

## Overview

Build a Next.js 16 app that:
1. Connects to **Oracle** (`T633_EMPL_MASTER`) and **MySQL/MES** (`employees`, `resources`)
2. Displays a paginated employee table with photo sync status
3. Provides per-employee and bulk sync of photo URLs to Oracle `EMP_PIC_PATH`

---

## 1. Database Connections

### MySQL (MES)

Use `mysql2` with connection pooling:

```bash
npm install mysql2
```

```ts
// lib/mysql.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
```

**Required tables:**
- `employees` — columns: `id`, `emp_id`, `emp_code`, `name`, `department`, `deleted_at`
- `resources` — columns: `id`, `uid`, `model`, `attr`, `filename`, `ext`

### Oracle

Use `oracledb` (Oracle's official Node.js driver):

```bash
npm install oracledb
```

```ts
// lib/oracle.ts
import oracledb from 'oracledb';

// Requires Oracle Instant Client in PATH or ORACLE_HOME
// Windows: set ORACLE_HOME=C:\instantclient_19_31
// Linux:   export LD_LIBRARY_PATH=/opt/oracle/instantclient

let pool: oracledb.Pool | null = null;

export async function getOraclePool() {
  if (!pool) {
    pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASS,
      connectionString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DB}`,
      poolMin: 1,
      poolMax: 5,
      poolIncrement: 1,
      connectTimeout: 5000,
    });
  }
  return pool;
}
```

**Required table:**
- `T633_EMPL_MASTER` — columns: `EMPL_CODE`, `EMP_PIC_PATH`

### Environment Variables

```env
# MySQL (MES)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASS=bfgA$$essDb
MYSQL_DB=mes

# Oracle
ORACLE_HOST=172.18.1.11
ORACLE_PORT=1521
ORACLE_DB=BFGPROD
ORACLE_USER=bfgi
ORACLE_PASS=oracle123

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 2. Data Model

### Employee with photo + Oracle status

```ts
// types.ts
export interface Employee {
  id: number;
  emp_id: number;
  emp_code: string;      // padded: sprintf('%04d', emp_id)
  name: string;
  department: string;
  photo_filename: string | null;
  oracle_pic_path: string | null;  // from T633_EMPL_MASTER.EMP_PIC_PATH
  sync_status: 'synced' | 'different' | 'not_in_oracle' | 'no_photo';
  image_url: string;      // computed: APP_URL/storage/employee/{md5(id)}/{filename}.jpg
}
```

---

## 3. API Routes

### `GET /api/employees`

Paginated employee list with search and Oracle status.

```ts
// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { getOraclePool } from '@/lib/oracle';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1'));
  const perPage = 30;
  const search = req.nextUrl.searchParams.get('q') || '';
  const offset = (page - 1) * perPage;

  // 1. Count total
  let countQuery = 'SELECT COUNT(*) as total FROM employees WHERE emp_id IS NOT NULL AND deleted_at IS NULL';
  const countParams: string[] = [];

  if (search) {
    countQuery += ' AND (emp_id LIKE ? OR emp_code LIKE ? OR name LIKE ?)';
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const [countRows] = await pool.execute(countQuery, countParams);
  const total = (countRows as any)[0].total;

  // 2. Fetch paginated employees with photo subquery
  let query = `
    SELECT e.id, e.emp_id, e.name, e.department,
      (SELECT r.filename FROM resources r
       WHERE r.uid = e.id AND r.model = 'employee' AND r.attr = 'photo'
       ORDER BY r.id DESC LIMIT 1) as photo_filename
    FROM employees e
    WHERE e.emp_id IS NOT NULL AND e.deleted_at IS NULL
  `;
  const params: any[] = [];

  if (search) {
    query += ' AND (e.emp_id LIKE ? OR e.emp_code LIKE ? OR e.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY e.emp_id ASC LIMIT ? OFFSET ?';
  params.push(perPage, offset);

  const [rows] = await pool.execute(query, params);
  const employees = rows as any[];

  // 3. Fetch Oracle EMP_PIC_PATH for these employees
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const oracleMap: Record<string, string | null> = {};

  if (employees.length > 0) {
    try {
      const oraclePool = await getOraclePool();
      const empCodes = employees.map(e => String(e.emp_id).padStart(4, '0'));
      const placeholders = empCodes.map(() => '?').join(',');

      const oracleResult = await oraclePool.execute(
        `SELECT EMPL_CODE, EMP_PIC_PATH FROM T633_EMPL_MASTER WHERE EMPL_CODE IN (${placeholders})`,
        empCodes
      );

      for (const row of oracleResult.rows as any[]) {
        oracleMap[row[0]] = row[1] || null;
      }
    } catch (e) {
      console.error('Oracle read error:', e);
    }
  }

  // 4. Build response
  const result = employees.map(emp => {
    const empCode = String(emp.emp_id).padStart(4, '0');
    const hasPhoto = !!emp.photo_filename;
    const imageUrl = hasPhoto
      ? `${appUrl}/storage/employee/${crypto.createHash('md5').update(String(emp.id)).digest('hex')}/${emp.photo_filename}.jpg`
      : '';
    const oraclePath = oracleMap[empCode] || null;

    let syncStatus: Employee['sync_status'] = 'no_photo';
    if (hasPhoto && oraclePath === imageUrl) syncStatus = 'synced';
    else if (hasPhoto && oraclePath) syncStatus = 'different';
    else if (hasPhoto) syncStatus = 'not_in_oracle';

    return {
      id: emp.id,
      emp_id: emp.emp_id,
      emp_code: empCode,
      name: emp.name,
      department: emp.department,
      photo_filename: emp.photo_filename,
      oracle_pic_path: oraclePath,
      sync_status: syncStatus,
      image_url: imageUrl,
    };
  });

  return NextResponse.json({
    employees: result,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}
```

### `POST /api/sync`

Sync a single employee's photo to Oracle.

```ts
// app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { getOraclePool } from '@/lib/oracle';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { emp_id } = await req.json();

  if (!emp_id) {
    return NextResponse.json({ success: false, message: 'emp_id required' }, { status: 400 });
  }

  // 1. Get employee from MySQL
  const [rows] = await pool.execute(
    `SELECT id, emp_id FROM employees WHERE id = ?`,
    [emp_id]
  );
  const emp = (rows as any)[0];

  if (!emp) {
    return NextResponse.json({ success: false, message: 'Employee not found' });
  }

  // 2. Get photo filename from resources
  const [imgRows] = await pool.execute(
    `SELECT filename FROM resources WHERE uid = ? AND model = 'employee' AND attr = 'photo' ORDER BY id DESC LIMIT 1`,
    [emp.id]
  );
  const img = (imgRows as any)[0];

  if (!img) {
    return NextResponse.json({ success: false, message: 'No photo found' });
  }

  // 3. Build URL and update Oracle
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const empCode = String(emp.emp_id).padStart(4, '0');
  const imageUrl = `${appUrl}/storage/employee/${crypto.createHash('md5').update(String(emp.id)).digest('hex')}/${img.filename}.jpg`;

  try {
    const oraclePool = await getOraclePool();
    const result = await oraclePool.execute(
      `UPDATE T633_EMPL_MASTER SET EMP_PIC_PATH = :pic_path WHERE EMPL_CODE = :empl_code`,
      { pic_path: imageUrl, empl_code: empCode }
    );

    return NextResponse.json({
      success: true,
      message: `Photo synced for ${empCode}`,
      emp_code: empCode,
      image_url: imageUrl,
      rows_affected: result.rowsAffected,
    });
  } catch (e: any) {
    console.error('Oracle update error:', e);
    return NextResponse.json({ success: false, message: e.message });
  }
}
```

### `POST /api/sync/all`

Bulk sync all employees with photos.

```ts
// app/api/sync/all/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';
import { getOraclePool } from '@/lib/oracle';
import crypto from 'crypto';

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  // 1. Get all employees with photos
  const [rows] = await pool.execute(
    `SELECT e.id, e.emp_id, r.filename
     FROM employees e
     INNER JOIN resources r ON r.uid = e.id AND r.model = 'employee' AND r.attr = 'photo'
     WHERE e.emp_id IS NOT NULL
     ORDER BY e.emp_id ASC`
  );
  const employees = rows as any[];

  // 2. Update Oracle for each
  const oraclePool = await getOraclePool();
  let successCount = 0;
  let failCount = 0;

  for (const emp of employees) {
    const empCode = String(emp.emp_id).padStart(4, '0');
    const imageUrl = `${appUrl}/storage/employee/${crypto.createHash('md5').update(String(emp.id)).digest('hex')}/${emp.filename}.jpg`;

    try {
      await oraclePool.execute(
        `UPDATE T633_EMPL_MASTER SET EMP_PIC_PATH = :pic_path WHERE EMPL_CODE = :empl_code`,
        { pic_path: imageUrl, empl_code: empCode }
      );
      successCount++;
    } catch {
      failCount++;
    }
  }

  return NextResponse.json({
    success: true,
    total: employees.length,
    success_count: successCount,
    fail_count: failCount,
  });
}
```

---

## 4. Frontend — Page Component

```tsx
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  emp_id: number;
  emp_code: string;
  name: string;
  department: string;
  photo_filename: string | null;
  oracle_pic_path: string | null;
  sync_status: string;
  image_url: string;
}

interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchEmployees = async (page = 1, q = '') => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set('q', q);

    const res = await fetch(`/api/employees?${params}`);
    const data = await res.json();
    setEmployees(data.employees);
    setPagination(data.pagination);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees(1, search);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue);
  };

  const syncOne = async (emp: Employee) => {
    setSyncingId(emp.id);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emp_id: emp.id }),
      });
      const data = await res.json();

      if (data.success) {
        setEmployees(prev =>
          prev.map(e =>
            e.id === emp.id
              ? { ...e, sync_status: 'synced', oracle_pic_path: data.image_url }
              : e
          )
        );
        alert(data.message);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch {
      alert('Request failed');
    }
    setSyncingId(null);
  };

  const syncAll = async () => {
    if (!confirm('Sync all employee photos to Oracle?')) return;
    setSyncingAll(true);
    setStatusMsg('Syncing...');

    try {
      const res = await fetch('/api/sync/all', { method: 'POST' });
      const data = await res.json();
      setStatusMsg(
        `Complete! Total: ${data.total} | Success: ${data.success_count} | Failed: ${data.fail_count}`
      );
      fetchEmployees(pagination?.page || 1, search);
    } catch {
      setStatusMsg('Request failed');
    }
    setSyncingAll(false);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      synced: 'background:#22c55e;color:#fff',
      different: 'background:#eab308;color:#000',
      not_in_oracle: 'background:#3b82f6;color:#fff',
      no_photo: 'background:#9ca3af;color:#fff',
    };
    const labels: Record<string, string> = {
      synced: 'Synced',
      different: 'Different',
      not_in_oracle: 'Not in Oracle',
      no_photo: 'No Photo',
    };
    return (
      <span style={{ ...styles[status], padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '20px' }}>
      <h1>Employee Photo Sync — Oracle</h1>

      {/* Search + Sync All */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Search by Emp Code or Name..."
            style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, width: 300 }}
          />
          <button type="submit" style={{ padding: '6px 16px' }}>Search</button>
          {search && (
            <button type="button" onClick={() => { setInputValue(''); setSearch(''); }}>
              Clear
            </button>
          )}
        </form>
        <button onClick={syncAll} disabled={syncingAll} style={{ marginLeft: 'auto' }}>
          {syncingAll ? 'Syncing...' : 'Sync All to Oracle'}
        </button>
      </div>

      {statusMsg && (
        <div style={{ padding: 12, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, marginBottom: 16 }}>
          {statusMsg}
        </div>
      )}

      {pagination && (
        <div style={{ marginBottom: 8, color: '#666' }}>
          Page {pagination.page} of {pagination.totalPages} · Total: {pagination.total}
        </div>
      )}

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>#</th>
            <th>Emp Code</th>
            <th>Name</th>
            <th>Department</th>
            <th>Photo</th>
            <th>MES URL</th>
            <th>Oracle Path</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={9} style={{ padding: 20, textAlign: 'center' }}>Loading...</td></tr>
          ) : employees.length === 0 ? (
            <tr><td colSpan={9} style={{ padding: 20, textAlign: 'center' }}>No employees found.</td></tr>
          ) : (
            employees.map((emp, i) => (
              <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{(pagination!.page - 1) * 30 + i + 1}</td>
                <td><strong>{emp.emp_code}</strong></td>
                <td>{emp.name}</td>
                <td>{emp.department}</td>
                <td style={{ textAlign: 'center' }}>
                  {emp.photo_filename ? (
                    <img
                      src={emp.image_url}
                      alt=""
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: '#999' }}>No Photo</span>
                  )}
                </td>
                <td style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {emp.image_url || '-'}
                </td>
                <td style={{ fontSize: 12, wordBreak: 'break-all' }}>
                  {emp.oracle_pic_path || <span style={{ color: '#999' }}>Not set</span>}
                </td>
                <td style={{ textAlign: 'center' }}>{statusBadge(emp.sync_status)}</td>
                <td style={{ textAlign: 'center' }}>
                  {emp.photo_filename && (
                    <button
                      onClick={() => syncOne(emp)}
                      disabled={syncingId === emp.id}
                      style={{ padding: '4px 8px', cursor: 'pointer' }}
                    >
                      {syncingId === emp.id ? '⏳' : '🔄'}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 16, justifyContent: 'center' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(p => {
              const curr = pagination.page;
              return p === 1 || p === pagination.totalPages || Math.abs(p - curr) <= 2;
            })
            .reduce<(number | string)[]>((acc, p, i, arr) => {
              if (i > 0 && typeof arr[i - 1] === 'number' && p - (arr[i - 1] as number) > 1) {
                acc.push('...');
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              typeof p === 'string' ? (
                <span key={`e${i}`} style={{ padding: '6px 10px' }}>...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => fetchEmployees(p, search)}
                  style={{
                    padding: '6px 12px',
                    background: p === pagination.page ? '#3b82f6' : '#fff',
                    color: p === pagination.page ? '#fff' : '#333',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              )
            )}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Setup

```bash
npx create-next-app@latest oracle-photo-sync --typescript --app
cd oracle-photo-sync
npm install mysql2 oracledb
```

Create `.env.local` with the variables from section 1.

Copy the files:
- `lib/mysql.ts`
- `lib/oracle.ts`
- `types.ts`
- `app/api/employees/route.ts`
- `app/api/sync/route.ts`
- `app/api/sync/all/route.ts`
- `app/page.tsx`

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## 6. Key Differences from PHP Version

| Aspect | PHP (Current) | Next.js |
|--------|---------------|---------|
| Oracle driver | `pdo_oci` via XAMPP | `oracledb` npm package |
| Pagination | Server-side `Pagination` class | Server-side with `LIMIT`/`OFFSET` |
| AJAX | jQuery `$.ajax` | `fetch` API + React state |
| URL building | `$config['app_url']` | `process.env.NEXT_PUBLIC_APP_URL` |
| md5 hashing | PHP `md5()` | Node `crypto.createHash('md5')` |
| Error handling | `toastr` notifications | React state + `alert()` |

---

## 7. Notes

- **Oracle Instant Client** is NOT required for `oracledb` in Thin mode (default). Only needed for Thick mode.
- The `oracledb` driver supports both Oracle Database 12c+ and works on Windows/Linux/macOS.
- The sync function is non-blocking — a failed Oracle update doesn't affect the MySQL data.
- The `EMP_PIC_PATH` column stores the full URL (e.g., `http://intranet.bfginternational.com:88/storage/employee/...`).