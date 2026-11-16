# Graph Report - ITSM  (2026-10-18)

## Corpus Check
- 435 files · ~221,871 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 11 file(s) not represented in the graph (top: (none) 4, .ico 2, .lock 1)

## Summary
- 2612 nodes · 9194 edges · 111 communities (99 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.85)
- Token cost: 112,747 input · 44,682 output

## Community Hubs (Navigation)
- Base UI Form Primitives
- Employee Components
- Dialog & Form Controls
- Admin Pages & Dialogs
- AG Grid Reports
- Employee Directory & Azure
- Stock & Vendor Grids
- Charts & Inspections
- tRPC Server Core
- App Logo & Sheet UI
- Project Dependencies
- Radix Migration Mapping Docs
- Employee Detail Pages
- Base vs Radix Patterns
- Dashboard & Alerts
- Booking Tables
- Dropdown & Collapsible
- Dialog Composites
- Biome Lint Config
- Reports & Table Theme
- Chat Bubble UI
- Package Manifest
- ITSM Platform Overview
- Go Asset Collector Encoding
- Cron Route Handlers
- Mail & Settings Pages
- Microsoft OAuth Routes
- App Layout & Splash
- IT Request & Reports
- Assets Grid Views
- Backup Tapes Views
- Database Connection Pools
- Auth & Health Routers
- Nuqs List Pages
- Assets Page Filters
- Go Collector Tests
- Contract Reminder Mailer
- Health & Settings Layout
- Access Control Groups
- Go Hardware Collection
- Request Details Dialog
- DCC Connectivity Checks
- Access Control Page UI
- Image Upload Routes
- Nodemailer Mail Library
- shadcn Config
- Middleware & Image Proxy
- Login Auth Page
- Landing & Documents Layout
- Printer Form Dialogs
- TypeScript Config
- Contracts Cards & Tables
- DCC Connectivity Charts
- shadcn Registry & MCP
- Combobox Components
- Mail Settings Router
- Go CLI Errors & Flags
- MSSQL Setup Docs
- Access Control Constants
- Access Control CSV Utils
- Access Control Schemas
- Tapes Router Schemas
- Go CLI Console UI
- Servers & Reports Layout
- DCC Connectivity Report
- Root Layout Providers
- DCC Realtime Dashboard
- Context Menu Components
- Drawer Components
- Attendance Router & Rules
- Printers Router
- Carousel Components
- Azure Proxy Redirect Fix
- Go Payload Encoding
- Servers Grid & Table
- Go WMI Collection
- Attachment Components
- Toast Components
- AC Devices Router
- Provide Router Schemas
- Dev Dependencies
- Tape Form Dialog
- AC Photo Lookup
- Navigation Menu Components
- AC Query Helper
- Requests Router
- Reports Router
- Vendors Page Skeletons
- NPM Scripts
- AC Authorization Server
- Stock Page Filters
- Deploy Script
- Alert Components
- Resizable Panels
- Remote Deploy Script
- shadcn Brand Icon
- Maintenance Page
- Setup Script
- App Home Redirect
- Base UI Transitions
- Prisma Config
- DCC SQL Schema
- Build Script
- PostCSS Config
- Base UI Imports
- Unverified Image Asset
- shadcn CLI Docs
- Sync Button TODO
- Go Asset Collector

## God Nodes (most connected - your core abstractions)
1. `cn()` - 463 edges
2. `Button()` - 229 edges
3. `lucide-react` - 146 edges
4. `react` - 137 edges
5. `Input()` - 98 edges
6. `trpc` - 82 edges
7. `DialogContent()` - 70 edges
8. `DialogHeader()` - 67 edges
9. `DialogTitle()` - 67 edges
10. `Dialog()` - 66 edges

## Surprising Connections (you probably didn't know these)
- `Cross-platform build script (APP_URL baked in)` --references--> `APP_URL public base URL environment variable`  [INFERRED]
  tools/go-win-asset-collector/README.md → docs/azure-auth-proxy-redirect-fix.md
- `handler()` --indirect_call--> `createContext()`  [INFERRED]
  src/app/api/trpc/[trpc]/route.ts → src/server/context.ts
- `Page()` --calls--> `AssetsPage()`  [EXTRACTED]
  src/app/app/assets/page.tsx → src/layout/ITSM/assets/assets-page.tsx
- `AlertTitle()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert.tsx → src/lib/utils.ts
- `AlertDescription()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MSSQL Connection Architecture** — docs_mssql_setup_database_ts_get_erp_pool, docs_mssql_setup_mssql_npm_package, docs_mssql_setup_tedious_driver, docs_mssql_setup_tarn_pooling, docs_mssql_setup_microsoft_sql_server [EXTRACTED 0.90]
- **Oracle Database Connection Architecture** — docs_oracle_setup_database_ts_get_odb_pool, docs_oracle_setup_ensure_oracle_client, docs_oracle_setup_oracledb_npm, docs_oracle_setup_oracle_instant_client, docs_oracle_setup_tns_configuration [EXTRACTED 0.95]
- **Radix-to-Base UI migration knowledge base** — _agents_skills_migrate_radix_to_base_skill_doc, _agents_skills_migrate_radix_to_base_universal_patterns_doc, _agents_skills_migrate_radix_to_base_class_mapping_doc, _agents_skills_migrate_radix_to_base_consumer_props_doc, _agents_skills_migrate_radix_to_base_disclosure_doc, _agents_skills_migrate_radix_to_base_display_misc_doc, _agents_skills_migrate_radix_to_base_form_controls_doc, _agents_skills_migrate_radix_to_base_menus_doc, _agents_skills_migrate_radix_to_base_overlays_doc, _agents_skills_migrate_radix_to_base_wrapper_shapes_doc [EXTRACTED 1.00]
- **Menu family shares one canonical part mapping** — _agents_skills_migrate_radix_to_base_menus_canonical_menu_mapping, _agents_skills_migrate_radix_to_base_menus_dropdown_menu_to_menu, _agents_skills_migrate_radix_to_base_menus_navigation_menu_positioner_model, _agents_skills_migrate_radix_to_base_menus_close_on_click_default_flip, _agents_skills_migrate_radix_to_base_universal_patterns_portal_positioner_popup [EXTRACTED 1.00]
- **Layer-2 class and attribute rewrite layer** — _agents_skills_migrate_radix_to_base_class_mapping_doc, _agents_skills_migrate_radix_to_base_universal_patterns_presence_attributes, _agents_skills_migrate_radix_to_base_class_mapping_starting_ending_style_animations, _agents_skills_migrate_radix_to_base_class_mapping_dead_pseudo_class_variants, _agents_skills_migrate_radix_to_base_universal_patterns_css_var_rewrites [INFERRED 0.85]
- **shadcn MCP registry tool set** — _agents_skills_shadcn_mcp_get_project_registries, _agents_skills_shadcn_mcp_list_items_in_registries, _agents_skills_shadcn_mcp_search_items_in_registries, _agents_skills_shadcn_mcp_view_items_in_registries, _agents_skills_shadcn_mcp_get_item_examples_from_registries, _agents_skills_shadcn_mcp_get_add_command_for_items, _agents_skills_shadcn_mcp_get_audit_checklist [EXTRACTED 1.00]
- **Chat UI composition parts** — _agents_skills_shadcn_rules_chat_message_scroller, _agents_skills_shadcn_rules_chat_message_component, _agents_skills_shadcn_rules_chat_bubble_component, _agents_skills_shadcn_rules_chat_attachment_component, _agents_skills_shadcn_rules_chat_marker_component [EXTRACTED 1.00]
- **DCC pre-rollout remediation plan** — docs_reports_dcc_connectivity_report_2026_09_10_reader_direct_power_data_cable, docs_reports_dcc_connectivity_report_2026_09_10_pi_direct_ethernet, docs_reports_dcc_connectivity_report_2026_09_10_external_usb_wifi_antenna, docs_reports_dcc_connectivity_report_2026_09_10_live_kiosk_software_update [EXTRACTED 1.00]
- **shadcn/ui Icon Composition** — _agents_skills_shadcn_assets_shadcn_shadcn_icon, _agents_skills_shadcn_assets_shadcn_double_slash_mark, _agents_skills_shadcn_assets_shadcn_rounded_square_field [EXTRACTED 1.00]
- **App icon visual composition (laptop + verified badge)** — tools_go_win_asset_collector_assets_icon, tools_go_win_asset_collector_assets_icon_laptop_motif, tools_go_win_asset_collector_assets_icon_verified_badge [EXTRACTED 1.00]
- **Four Enterprise Data Sources** — readme_multi_database_architecture, readme_mes_database, readme_iss_database, readme_erp_database, readme_mis_database [EXTRACTED 1.00]
- **Web Frontend Technology Stack** — readme_nextjs, readme_react, readme_typescript, readme_tailwind, readme_shadcn_base_ui [EXTRACTED 1.00]
- **Cron-Driven Scheduled Features** — readme_cron_jobs, readme_bookings_module, readme_servers_module, readme_backup_tapes_module, readme_vendor_contracts [EXTRACTED 1.00]

## Communities (111 total, 12 thin omitted)

### Community 0 - "Base UI Form Primitives"
Cohesion: 0.04
Nodes (85): input-otp, react-day-picker, @shadcn/react, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), AspectRatio() (+77 more)

### Community 1 - "Employee Components"
Cohesion: 0.06
Nodes (77): EmployeeAvatar(), getEmployeeInitials(), EmployeeCombobox(), EmployeeComboboxProps, EmployeeOption, EmployeeRow(), EmployeeRowData, Avatar() (+69 more)

### Community 2 - "Dialog & Form Controls"
Cohesion: 0.06
Nodes (59): @tanstack/react-form, DialogOverlay(), DialogPortal(), Label(), Textarea(), AssetFormContent(), AssetFormDialogProps, assetFormSchema (+51 more)

### Community 3 - "Admin Pages & Dialogs"
Cohesion: 0.14
Nodes (52): sonner, Page(), Page(), Page(), AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent() (+44 more)

### Community 4 - "AG Grid Reports"
Cohesion: 0.14
Nodes (49): ag-grid-community, ag-grid-react, Page(), BoxCellRenderer(), ContainerCellRenderer(), DateCellRenderer(), JobCellRenderer(), PanelCellRender() (+41 more)

### Community 5 - "Employee Directory & Azure"
Cohesion: 0.06
Nodes (52): Page(), AzureSummariesContext, AzureSummariesProvider(), AzureSummariesValue, mergeMaps(), useAzureSummariesContext(), EmployeeCard(), EmployeesGrid() (+44 more)

### Community 6 - "Stock & Vendor Grids"
Cohesion: 0.06
Nodes (48): StockGrid(), StockGridProps, VendorsCardListProps, VendorCard(), VendorsGrid(), VendorsGridProps, employeeImageUrl(), imageUrl() (+40 more)

### Community 7 - "Charts & Inspections"
Cohesion: 0.10
Nodes (44): recharts, ALL_PROJECTS, EmptyState(), GATE_OPTIONS, ProjectItem, ViewMode, viewParam, ChartConfig (+36 more)

### Community 8 - "tRPC Server Core"
Cohesion: 0.09
Nodes (36): @trpc/server, zod, handler(), Context, createContext(), AppRouter, ISSRouter, ALL_GATES (+28 more)

### Community 9 - "App Logo & Sheet UI"
Cohesion: 0.08
Nodes (41): AppLogo(), AppLogoProps, Project Logo Image (src/assets/images/logo.png), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+33 more)

### Community 10 - "Project Dependencies"
Cohesion: 0.04
Nodes (50): dependencies, ag-grid-community, ag-grid-react, @base-ui/react, bcrypt, class-variance-authority, clsx, cmdk (+42 more)

### Community 11 - "Radix Migration Mapping Docs"
Cohesion: 0.06
Nodes (43): Class-string rewrites reference (layer 2), Consumer call-site prop sweep, Consumer-side prop changes reference, Disclosure + toggle family props mapping, Display/misc props mapping (progress, scroll-area, separator, avatar, toast, form), Radix Form split into Form + Field + Fieldset, No-counterpart replacements (Label, AspectRatio, VisuallyHidden, AccessibleIcon, Direction), Base UI manager-driven toast model (+35 more)

### Community 12 - "Employee Detail Pages"
Cohesion: 0.16
Nodes (37): Page(), Badge(), badgeVariants, Table(), useAzureStatus(), EmployeeDetailPage(), EmployeeDetailPageProps, Row() (+29 more)

### Community 13 - "Base vs Radix Patterns"
Cohesion: 0.08
Nodes (46): Accordion type/defaultValue semantics, asChild composition (radix), Base UI (base), Base vs Radix, nativeButton={false} for non-button renders, Radix UI (radix), render composition (base), Select items prop and placeholder (base vs radix) (+38 more)

### Community 14 - "Dashboard & Alerts"
Cohesion: 0.07
Nodes (39): date-fns, Page(), AlertsPanel(), KIND_ICON, SEVERITY_CLASS, DashboardContent(), DashboardPage(), DashboardSkeleton() (+31 more)

### Community 15 - "Booking Tables"
Cohesion: 0.12
Nodes (38): @tanstack/react-table, TableBody(), TableCell(), TableHead(), TableHeader(), TableRow(), BookingTable(), BookingTableProps (+30 more)

### Community 16 - "Dropdown & Collapsible"
Cohesion: 0.11
Nodes (39): Collapsible(), CollapsibleContent(), CollapsibleTrigger(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem() (+31 more)

### Community 17 - "Dialog Composites"
Cohesion: 0.18
Nodes (39): CommandDialog(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle(), AssetFormDialog() (+31 more)

### Community 18 - "Biome Lint Config"
Cohesion: 0.05
Nodes (37): source, assist, actions, enabled, useExhaustiveDependencies, useUniqueElementIds, css, parser (+29 more)

### Community 19 - "Reports & Table Theme"
Cohesion: 0.10
Nodes (28): Page(), Page(), Page(), baseCompactParams, useTableTheme(), AttendanceTable(), AttendanceTableProps, formatMinutes() (+20 more)

### Community 20 - "Chat Bubble UI"
Cohesion: 0.07
Nodes (25): @base-ui/react, class-variance-authority, Bubble(), BubbleContent(), BubbleGroup(), BubbleReactions(), bubbleReactionsVariants, bubbleVariants (+17 more)

### Community 21 - "Package Manifest"
Cohesion: 0.06
Nodes (33): name, private, version, @biomejs/biome, clsx, cmdk, @hookform/resolvers, jotai (+25 more)

### Community 22 - "ITSM Platform Overview"
Cohesion: 0.08
Nodes (34): Asset & Infrastructure Management, Assets Module, Authentication, Microsoft Entra / Azure OAuth 2.0 (PKCE) SSO, Backup Tapes Module, bcrypt Password Hashing, Bookings Module, Cron Jobs (Scheduled Tasks) (+26 more)

### Community 23 - "Go Asset Collector Encoding"
Cohesion: 0.12
Nodes (23): shape, Windows App Icon — laptop with green verified badge on slate gradient, Laptop Motif in App Icon, Green Verified Badge in App Icon, circle(), distToSegment(), downsample(), drawThickLine() (+15 more)

### Community 24 - "Cron Route Handlers"
Cohesion: 0.14
Nodes (27): mysql2, bookingRow(), dynamic, escapeHtml(), GET(), Row, dynamic, GET() (+19 more)

### Community 25 - "Mail & Settings Pages"
Cohesion: 0.14
Nodes (24): Page(), Page(), Page(), Page(), CardDescription(), CardHeader(), CardTitle(), StatCard() (+16 more)

### Community 26 - "Microsoft OAuth Routes"
Cohesion: 0.13
Nodes (24): GET(), getSecureFlag(), getSessionOptions(), logLoginAttempt(), UserRow, GET(), getSecureFlag(), getSessionOptions() (+16 more)

### Community 27 - "App Layout & Splash"
Cohesion: 0.11
Nodes (25): framer-motion, Layout(), SplashScreen(), SplashScreenProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink() (+17 more)

### Community 28 - "IT Request & Reports"
Cohesion: 0.16
Nodes (21): Page(), ReportCategory, ReportItem, ScalableReportsDashboard(), MESLogo(), Epicor Logo, Visual Studio Logo, Card() (+13 more)

### Community 29 - "Assets Grid Views"
Cohesion: 0.14
Nodes (23): @tanstack/react-virtual, AssetCard(), AssetsGrid(), AssetsGridProps, AssetsTable(), AssetsTableProps, cellStyle(), DccPingBadge() (+15 more)

### Community 30 - "Backup Tapes Views"
Cohesion: 0.16
Nodes (23): Page(), TapeCard(), TapesGrid(), TapesGridProps, TapesPage(), VIEW_VALUES, cellStyle(), StatusCell() (+15 more)

### Community 31 - "Database Connection Pools"
Cohesion: 0.10
Nodes (24): encodeDbUri(), ensureDatabaseName(), ensureOracleClient(), getIssPool(), getMesPool(), getOdbPool(), OracleConnection, oracledb (+16 more)

### Community 32 - "Auth & Health Routers"
Cohesion: 0.11
Nodes (22): bcrypt, handleSignOut(), authRouter, checkMssql(), checkMysql(), checkOracle(), DbCheckResult, healthRouter (+14 more)

### Community 33 - "Nuqs List Pages"
Cohesion: 0.17
Nodes (18): nuqs, Page(), Page(), Page(), Page(), Page(), Empty(), EmptyContent() (+10 more)

### Community 34 - "Assets Page Filters"
Cohesion: 0.09
Nodes (21): Page(), SEARCH_FIELD_VALUES, SEARCH_FIELDS, SearchField, TYPE_VALUES, VIEW_VALUES, AssetPrefill, assetPrefillSchema (+13 more)

### Community 35 - "Go Collector Tests"
Cohesion: 0.16
Nodes (18): TestDryRunShape(), TestReadSysfsIgnoresPlaceholders(), TestParseMacSize(), DryRun(), DetectType(), firstIP(), formatBytes(), formatDisks() (+10 more)

### Community 36 - "Contract Reminder Mailer"
Cohesion: 0.13
Nodes (22): dynamic, GET(), buildReminderHtml(), ContractReminderSettings, ensureReminderSettingsTable(), escapeHtml(), getContractReminderSettings(), loadDueContracts() (+14 more)

### Community 37 - "Health & Settings Layout"
Cohesion: 0.13
Nodes (16): lucide-react, Page(), SettingsLayout(), LinuxIcon, MacIcon, WindowsIcon, Spinner(), DBS (+8 more)

### Community 38 - "Access Control Groups"
Cohesion: 0.14
Nodes (25): parseCsvInts(), toPublicDevice(), countUsersInGroup(), deviceIdsForGroup(), deviceIdsForGroups(), getAcGroup(), getAcGroupsByIds(), listAcGroups() (+17 more)

### Community 39 - "Go Hardware Collection"
Cohesion: 0.14
Nodes (19): spHardwareData, spStorageData, Collect(), firstIPv4(), Disk, Raw, hostname(), readSysfs() (+11 more)

### Community 40 - "Request Details Dialog"
Cohesion: 0.13
Nodes (22): formatDateTime(), ReplyBubble(), RequestDetailsDialog(), RequestDetailsDialogProps, Row(), fieldError(), MODIFICATION_LABELS, PAGE_LABELS (+14 more)

### Community 41 - "DCC Connectivity Checks"
Cohesion: 0.11
Nodes (18): DccConnectivity, execFileAsync, PingResult, runPing(), WsResult, Asset, AssetDetail, AssetNote (+10 more)

### Community 42 - "Access Control Page UI"
Cohesion: 0.24
Nodes (17): @tanstack/react-query, Page(), EmptyDescription(), EmptyMedia(), emptyMediaVariants, EmptyTitle(), Switch(), AcDevicesPanel() (+9 more)

### Community 43 - "Image Upload Routes"
Cohesion: 0.12
Nodes (17): dynamic, IMAGE_SIGNATURES, POST(), sniffImageExtension(), UPLOAD_DIRS, contentType(), FALLBACK_DIR, GET() (+9 more)

### Community 44 - "Nodemailer Mail Library"
Cohesion: 0.16
Nodes (21): nodemailer, assetLine(), bookingCreatedMail(), BookingEmailContext, bookingExtendedMail(), bookingReturnedMail(), ensureMailSettingsTable(), getMailConfig() (+13 more)

### Community 45 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 46 - "Middleware & Image Proxy"
Cohesion: 0.11
Nodes (9): config, nextConfig, next, Page(), Page(), RequestData, RequestPreview(), REPORTS (+1 more)

### Community 47 - "Login Auth Page"
Cohesion: 0.19
Nodes (17): Page(), CardFooter(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), AuthPage() (+9 more)

### Community 48 - "Landing & Documents Layout"
Cohesion: 0.14
Nodes (15): RequestsLayout(), RequestsLayoutProps, Page(), Page(), MES Logo SVG, MES Text, LandingCta(), EmblaCarousel() (+7 more)

### Community 49 - "Printer Form Dialogs"
Cohesion: 0.16
Nodes (18): Checkbox(), PrinterDetailsDialog(), PrinterDetailsDialogProps, Row(), clean(), fieldError(), fieldValidator(), PrinterFormContent() (+10 more)

### Community 50 - "TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+13 more)

### Community 51 - "Contracts Cards & Tables"
Cohesion: 0.18
Nodes (17): ContractsCardList(), ContractsCardListProps, cellStyle(), ContractsTable(), ContractsTableProps, StatusBadge(), TONE_CLASSES, BILLING_CYCLES (+9 more)

### Community 52 - "DCC Connectivity Charts"
Cohesion: 0.15
Nodes (18): ChartPoint, DccConnectivityChart(), DccConnectivityChartProps, formatCheckedAt(), booleanField, createSchema, DccDashboard, DccDetail (+10 more)

### Community 53 - "shadcn Registry & MCP"
Cohesion: 0.18
Nodes (20): components.json registry configuration, shadcn MCP Server, shadcn:get_add_command_for_items MCP tool, shadcn:get_audit_checklist MCP tool, shadcn:get_item_examples_from_registries MCP tool, shadcn:get_project_registries MCP tool, shadcn:list_items_in_registries MCP tool, shadcn:search_items_in_registries MCP tool (+12 more)

### Community 54 - "Combobox Components"
Cohesion: 0.13
Nodes (15): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxGroup(), ComboboxLabel(), ComboboxSeparator(), ComboboxTrigger() (+7 more)

### Community 55 - "Mail Settings Router"
Cohesion: 0.13
Nodes (18): bookingTestMail(), parseEmails(), sendMailWithConfig(), mailSettingsRouter, mailSettingsSchema, MailSettingsValues, MailSettingsView, Row (+10 more)

### Community 56 - "Go CLI Errors & Flags"
Cohesion: 0.17
Nodes (8): CommandError, UnsupportedError, flags, Resolve(), stripTrailingSlashes(), TestResolvePriority(), TestStripTrailingSlashes(), parseFlags()

### Community 57 - "MSSQL Setup Docs"
Cohesion: 0.14
Nodes (16): getERPPool (database.ts), ERP Environment Variables, MSSQL Health Check (/health), Microsoft SQL Server 2005+, MSSQL Database Setup, mssql npm package, tarn.js connection pooling, tedious.js driver (+8 more)

### Community 58 - "Access Control Constants"
Cohesion: 0.14
Nodes (16): AC_DEFAULT_DEVICE_PORT, AC_MAX_PAGE_SIZE, AC_SCHEMA, GROUP_DEFAULT_ORDER, GROUP_DEVICE_COLUMN, GROUP_SEARCH_SQL, MES_SCHEMA, USER_DEFAULT_ORDER (+8 more)

### Community 59 - "Access Control CSV Utils"
Cohesion: 0.12
Nodes (13): AcCard, CARD_TYPES, CardType, VERIFY_MODES, VerifyMode, AC_CARD_TYPE_LABELS, AC_EMP_SOURCE_LABELS, AC_EXCLUSIVE_FILTERS (+5 more)

### Community 60 - "Access Control Schemas"
Cohesion: 0.15
Nodes (16): AC_GROUP_SEARCH_FIELDS, AC_USER_FILTERS, AC_USER_SEARCH_FIELDS, AcDeviceListInput, AcDeviceListInputSchema, AcGroupIdInputSchema, AcGroupListInputSchema, AcGroupSearchField (+8 more)

### Community 61 - "Tapes Router Schemas"
Cohesion: 0.14
Nodes (16): assignmentSchema, createSchema, dateTimeSchema, locationSchema, monthSchema, Row, sequenceNumSchema, statusSchema (+8 more)

### Community 62 - "Go CLI Console UI"
Cohesion: 0.21
Nodes (14): Banner(), c(), ce(), detectColor(), Fields(), Info(), Link(), PromptClose() (+6 more)

### Community 63 - "Servers & Reports Layout"
Cohesion: 0.16
Nodes (8): react, Page(), ReportLayoutProps, STATUS_FILTER_VALUES, STATUS_FILTERS, ServersPage(), VIEW_VALUES, ChartLayoutProps

### Community 64 - "DCC Connectivity Report"
Cohesion: 0.23
Nodes (15): Card reader WiFi weak point, dcc_connectivity_logs monitoring table, Cron task pinging every DCC and card reader, 32 DCC stations (Raspberry Pi + card reader), DCCs dashboard and realtime view, DCC & Card Reader Connectivity Report - 10 September 2026, Solution B alt: external USB WiFi antenna, Solution C: live kiosk software update (+7 more)

### Community 65 - "Root Layout Providers"
Cohesion: 0.18
Nodes (11): next-themes, @trpc/client, geistMono, geistSans, inter, RootLayout(), toast, RootProviders() (+3 more)

### Community 66 - "DCC Realtime Dashboard"
Cohesion: 0.25
Nodes (12): Page(), EmptyHeader(), DccMiniChart(), DccRealtimeCard(), DccRealtimeGrid(), DccWithLogs, formatTime(), DccsPage() (+4 more)

### Community 67 - "Context Menu Components"
Cohesion: 0.13
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 68 - "Drawer Components"
Cohesion: 0.18
Nodes (14): Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay() (+6 more)

### Community 69 - "Attendance Router & Rules"
Cohesion: 0.22
Nodes (14): ATTENDANCE_RULES, AttendanceEmployee, AttendanceLog, attendanceRouter, AttendanceSummary, buildVlogTableName(), formatTime(), getWorkingMonthRange() (+6 more)

### Community 70 - "Printers Router"
Cohesion: 0.20
Nodes (15): addActionSchema, createSchema, LinkedTonerItem, PrinterActionItem, PrinterDetail, PrinterInfoItem, printersRouter, Row (+7 more)

### Community 71 - "Carousel Components"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 72 - "Azure Proxy Redirect Fix"
Cohesion: 0.26
Nodes (12): Apache reverse proxy in front of Next.js, APP_URL public base URL environment variable, Microsoft Azure OAuth login callback flow, Fix: Azure login redirecting to localhost:3000, /app/assets?new=<base64url> prefill payload contract, Original Bun/TS win-asset-collector, Cross-platform build script (APP_URL baked in), Go Win Asset Collector README (+4 more)

### Community 73 - "Go Payload Encoding"
Cohesion: 0.27
Nodes (9): Fields, BuildLink(), Encode(), mustDecode(), TestBuildLink(), TestEncodeDecodesToSameFields(), TestEncodeUsesUrlSafeAlphabet(), testFields() (+1 more)

### Community 74 - "Servers Grid & Table"
Cohesion: 0.29
Nodes (11): ServerCard(), ServersGrid(), ServersGridProps, groupByHostIP(), HostGroup, ServersTable(), ServersTableProps, StatusCell() (+3 more)

### Community 75 - "Go WMI Collection"
Cohesion: 0.17
Nodes (7): cimBIOS, cimComputerSystem, cimDiskDrive, cimNetworkAdapter, cimOperatingSystem, cimProcessor, cimSystemEnclosure

### Community 76 - "Attachment Components"
Cohesion: 0.20
Nodes (11): Attachment(), AttachmentAction(), AttachmentActions(), AttachmentContent(), AttachmentDescription(), AttachmentGroup(), AttachmentMedia(), attachmentMediaVariants (+3 more)

### Community 77 - "Toast Components"
Cohesion: 0.32
Nodes (11): ToastAction(), ToastClose(), ToastContent(), ToastDescription(), Toaster(), ToastIcon(), ToastList(), ToastPortal() (+3 more)

### Community 78 - "AC Devices Router"
Cohesion: 0.21
Nodes (11): AC_PERIPHERAL_TYPE, deviceCredentials(), getPeripheral(), listAccessControlDevices(), listGroupDeviceChoices(), Row, toDevice(), acQueryOne() (+3 more)

### Community 79 - "Provide Router Schemas"
Cohesion: 0.21
Nodes (11): createItemSchema, createSchema, mapProvideRows(), ProvideItem, ProvideLineItem, providesRouter, Row, StockItemOption (+3 more)

### Community 80 - "Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, @biomejs/biome, prisma, tailwindcss, @tailwindcss/postcss, @types/mssql, @types/node, @types/nodemailer (+3 more)

### Community 81 - "Tape Form Dialog"
Cohesion: 0.29
Nodes (10): dateTimeValidator(), fieldError(), nowLocalDateTime(), TapeFormContent(), TapeFormDialogProps, TapeFormValues, toLocalInput(), UsageValues (+2 more)

### Community 82 - "AC Photo Lookup"
Cohesion: 0.40
Nodes (10): toGroup(), acPhotoPath(), findAcUserPhoto(), md5(), Row, toAsset(), asInt(), asNumber() (+2 more)

### Community 83 - "Navigation Menu Components"
Cohesion: 0.24
Nodes (9): NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink(), NavigationMenuList(), NavigationMenuPositioner(), NavigationMenuTrigger() (+1 more)

### Community 84 - "AC Query Helper"
Cohesion: 0.29
Nodes (8): acQuery(), AcQueryError, asBool(), bindable(), BindScalar, BindValue, expandPlaceholders(), runQuery()

### Community 85 - "Requests Router"
Cohesion: 0.22
Nodes (8): REQUEST_STATUSES, createSchema, listSchema, RequestItem, RequestReplyItem, requestsRouter, Row, toRequest()

### Community 86 - "Reports Router"
Cohesion: 0.22
Nodes (9): AssetReportRow, dateSchema, PrinterReportRow, reportsRouter, Row, StockProvideRow, StockPurchaseRow, StockReportResult (+1 more)

### Community 87 - "Vendors Page Skeletons"
Cohesion: 0.44
Nodes (6): Page(), Skeleton(), VendorsCardList(), VendorsGridSkeleton(), VendorsListSkeleton(), VendorsPage()

### Community 88 - "NPM Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, deploy, deploy:remote, dev, lint, setup, start

### Community 89 - "AC Authorization Server"
Cohesion: 0.29
Nodes (7): AC_ROLE_NAME, AcSessionUser, canAccessControl(), hasMesAccessControlGrant(), Row, AC_TABLES, acProcedure

### Community 90 - "Stock Page Filters"
Cohesion: 0.38
Nodes (5): Page(), FILTER_LABELS, FILTER_VALUES, StockFilter, StockPage()

### Community 91 - "Deploy Script"
Cohesion: 0.67
Nodes (5): error(), log(), rollback_or_fail(), deploy.sh script, warn()

### Community 92 - "Alert Components"
Cohesion: 0.40
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 93 - "Resizable Panels"
Cohesion: 0.40
Nodes (3): react-resizable-panels, ResizableHandle(), ResizablePanelGroup()

### Community 94 - "Remote Deploy Script"
Cohesion: 0.70
Nodes (4): error(), log(), deploy-remote.sh script, warn()

### Community 95 - "shadcn Brand Icon"
Cohesion: 0.67
Nodes (4): Two Diagonal Slashes Emblem, Rounded Square Icon Container, shadcn/ui Component Library Brand, shadcn/ui Brand Icon (shadcn.png)

### Community 96 - "Maintenance Page"
Cohesion: 0.67
Nodes (4): Automatic 30s reload countdown, Constellation canvas background animation, ITSM maintenance page, prefers-reduced-motion support

### Community 97 - "Setup Script"
Cohesion: 0.50
Nodes (3): LD_LIBRARY_PATH, setup.sh script, TNS_ADMIN

### Community 99 - "Base UI Transitions"
Cohesion: 0.67
Nodes (3): Element changes kill disabled: pseudo-class variants, data-starting-style / data-ending-style transition animation idiom, Presence attributes replace data-[state=...]

## Knowledge Gaps
- **72 isolated node(s):** `@hookform/resolvers`, `@prisma/adapter-better-sqlite3`, `@prisma/client`, `@types/bcrypt`, `jotai` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 681 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Base UI Form Primitives` to `Employee Components`, `Dialog & Form Controls`, `Admin Pages & Dialogs`, `AG Grid Reports`, `Employee Directory & Azure`, `Stock & Vendor Grids`, `Charts & Inspections`, `App Logo & Sheet UI`, `Employee Detail Pages`, `Dashboard & Alerts`, `Booking Tables`, `Dropdown & Collapsible`, `Dialog Composites`, `Reports & Table Theme`, `Chat Bubble UI`, `Mail & Settings Pages`, `App Layout & Splash`, `IT Request & Reports`, `Assets Grid Views`, `Backup Tapes Views`, `Nuqs List Pages`, `Assets Page Filters`, `Health & Settings Layout`, `Request Details Dialog`, `Access Control Page UI`, `Login Auth Page`, `Printer Form Dialogs`, `Contracts Cards & Tables`, `Combobox Components`, `Servers & Reports Layout`, `Root Layout Providers`, `DCC Realtime Dashboard`, `Context Menu Components`, `Drawer Components`, `Carousel Components`, `Servers Grid & Table`, `Attachment Components`, `Toast Components`, `Navigation Menu Components`, `Vendors Page Skeletons`, `Stock Page Filters`, `Alert Components`, `Resizable Panels`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **What connects `@hookform/resolvers`, `@prisma/adapter-better-sqlite3`, `@prisma/client` to the rest of the system?**
  _72 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Base UI Form Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.03603960396039604 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Servers & Reports Layout` to `Base UI Form Primitives`, `Employee Components`, `Dialog & Form Controls`, `Admin Pages & Dialogs`, `AG Grid Reports`, `Employee Directory & Azure`, `Stock & Vendor Grids`, `Charts & Inspections`, `App Logo & Sheet UI`, `Dashboard & Alerts`, `Booking Tables`, `Dropdown & Collapsible`, `Reports & Table Theme`, `Chat Bubble UI`, `Package Manifest`, `Mail & Settings Pages`, `App Layout & Splash`, `IT Request & Reports`, `Assets Grid Views`, `Backup Tapes Views`, `Nuqs List Pages`, `Assets Page Filters`, `Health & Settings Layout`, `Request Details Dialog`, `Access Control Page UI`, `Middleware & Image Proxy`, `Login Auth Page`, `Landing & Documents Layout`, `Printer Form Dialogs`, `Contracts Cards & Tables`, `Combobox Components`, `Root Layout Providers`, `DCC Realtime Dashboard`, `Context Menu Components`, `Drawer Components`, `Carousel Components`, `Servers Grid & Table`, `Attachment Components`, `Toast Components`, `Vendors Page Skeletons`, `Stock Page Filters`, `Alert Components`, `App Home Redirect`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Should `Employee Components` be split into smaller, more focused modules?**
  _Cohesion score 0.055593685655456415 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `AG Grid Reports` to `Base UI Form Primitives`, `Employee Components`, `Dialog & Form Controls`, `Admin Pages & Dialogs`, `Employee Directory & Azure`, `Stock & Vendor Grids`, `Charts & Inspections`, `App Logo & Sheet UI`, `Employee Detail Pages`, `Booking Tables`, `Dropdown & Collapsible`, `Dialog Composites`, `Reports & Table Theme`, `Mail & Settings Pages`, `App Layout & Splash`, `IT Request & Reports`, `Assets Grid Views`, `Backup Tapes Views`, `Nuqs List Pages`, `Assets Page Filters`, `Health & Settings Layout`, `Request Details Dialog`, `Access Control Page UI`, `Middleware & Image Proxy`, `Login Auth Page`, `Landing & Documents Layout`, `Printer Form Dialogs`, `Contracts Cards & Tables`, `Combobox Components`, `Servers & Reports Layout`, `DCC Realtime Dashboard`, `Drawer Components`, `Carousel Components`, `Servers Grid & Table`, `Attachment Components`, `Toast Components`, `Tape Form Dialog`, `Vendors Page Skeletons`, `Stock Page Filters`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Should `Dialog & Form Controls` be split into smaller, more focused modules?**
  _Cohesion score 0.062342342342342344 - nodes in this community are weakly interconnected._