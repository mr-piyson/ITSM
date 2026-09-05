<div align="center">

  <img src="./src/assets/images/logo.png" alt="ITSM logo" align="center" width="56" height="56" />
  <h1 style="display:inline; vertical-align:middle;">&nbsp;IT Service Management</h1>

  <p>
    <strong>Enterprise IT Service Management platform</strong> — track assets, bookings, procurement,
    infrastructure, HR &amp; employee services, and manufacturing operations in one unified workspace.
  </p>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-Browse-grey?style=flat-square" alt="Features" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/tRPC-11-purple?style=flat-square&logo=trpc" alt="tRPC" /></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" /></a>
    <img src="https://img.shields.io/badge/Powered_by-BFG_International-00B7B0?style=flat-square" alt="Powered by BFG International" />
    <br />
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/version-2.0.0-orange?style=flat-square" alt="Version" />
  </p>

</div>

---

## ✨ Features

### 🛠️ Asset & Infrastructure Management

| Module | Highlights |
| --- | --- |
| **Assets** | Full CRUD, asset grid/table, details dialog, ownership history, bookings |
| **Bookings** | Assign assets with due/return dates, automatic overdue detection (cron) |
| **Printers** | Inventory with firmware, toners, and an auditable action log |
| **Servers** | Server inventory with scheduled maintenance tracking (cron) |
| **Backup Tapes** | Tape library with expiration monitoring (cron) |
| **Stock** | Inventory items organized by category |

### 📦 Procurement

- **Purchases & Services** — purchase orders, vendors, VAT and currency tracking, attachments
- **Vendors** — directory with contacts
- **Contracts** — vendor contracts with automated reminder emails (cron)

### 👥 Employee & HR Services

- **Employees** directory with Microsoft 365 details (OneDrive, mailbox, two-factor…)
- **Attendance** with a configurable rules engine
- **Photo Sync** tooling
- **IT Requests** with replies, priorities, and image support

### 🏭 MES / Manufacturing Reporting

- Panels, time-outs, shipments, packages, and jobs
- Inspection results and panel inspection routes with charts

### 🧰 Additional Tools

- **Reports** — export assets, printers, and stock to **CSV / PDF**
- **IT Request Form** — multi-step form with PDF export
- **Keyboard & Mouse Testers** — browser + downloadable diagnostic tools
- **Settings & Health** — SMTP config, security, user management, and live database health checks

## 🔐 Authentication

- Password login with **bcrypt** hashing and attempt logging
- Single Sign-On via **Microsoft Entra / Azure OAuth 2.0** (PKCE)

## 🧱 Built On

- **Next.js 16** (App Router) · **React 19** · **TypeScript 5**
- **tRPC 11** + **TanStack Query** for end-to-end typed APIs
- **Tailwind CSS 4** + **shadcn / Base UI**
- **Prisma 7** and raw connection pools for a multi-database architecture

## 🗄️ Multi-Database Architecture

The application connects to **four** enterprise data sources simultaneously:

| Data Source | Technology | Purpose |
| --- | --- | --- |
| `MES`  | MySQL | Manufacturing Execution System reporting |
| `ISS`  | MySQL | IT service management records |
| `ERP`  | Microsoft SQL Server | Procurement & ERP data |
| `MIS`  | Oracle | Management information system data |

## 📸 Screenshots

> Screenshots will be added here soon.

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (Bun or npm)
- **Oracle Instant Client** & the required database credentials (see `docs/oracle-setup.md`)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/itsm.git
cd itsm

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root and configure the following:

| Variable | Required | Description |
| --- | --- | --- |
| `MES_DATABASE` | ✅ | MySQL connection URL for the MES database |
| `ISS_DATABASE` | ✅ | MySQL connection URL for the ISS database |
| `ERP_USER` | ✅ | MSSQL ERP username |
| `ERP_PASSWORD` | ✅ | MSSQL ERP password |
| `ERP_SERVER` | ✅ | MSSQL ERP server address |
| `ERP_DATABASE` | ✅ | MSSQL ERP database name |
| `ORACLE_HOST` | ✅ | Oracle host |
| `ORACLE_PORT` | ✅ | Oracle port |
| `ORACLE_SERVICE_NAME` | ✅ | Oracle service name |
| `ORACLE_USER` | ✅ | Oracle username |
| `ORACLE_PASSWORD` | ✅ | Oracle password |
| `ORACLE_CLIENT_DIR` | ✅ | Oracle Instant Client directory |
| `TNS_ADMIN` | ✅ | Oracle TNS admin directory |
| `AZURE_CLIENT_ID` | ✅ | Microsoft Entra application client ID |
| `AZURE_CLIENT_SECRET` | ✅ | Microsoft Entra application client secret |
| `AZURE_TENANT_ID` | ✅ | Microsoft Entra tenant ID |
| `COOKIE_SECURE` | ✅ | `true` / `false` — use secure cookies over HTTPS |
| `CRON_SECRET` | ❌ | Secret used to guard cron endpoints |
| `APP_URL` | ❌ | Public application URL |

### Run Locally

```bash
# Start the development server
npm run dev

# or use the setup script (installs Oracle Instant Client & configures env)
npm run setup
```

The app will be available at **http://localhost:4000**.

### Production Build & Deploy

```bash
# Build
npm run build

# Start the production server
npm run start

# Deploy
npm run deploy
```

## 📁 Project Structure

```
src/
├── app/            # Next.js routes (app, reports, auth, documents, APIs)
├── layout/         # Feature page components (ITSM & MES modules)
├── components/ui/  # shadcn-style UI component library
├── server/routers/ # tRPC routers (ITSM + MES)
├── lib/            # Utilities (database, auth, cron, mail, exports…)
└── assets/         # Images, icons & branding
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).