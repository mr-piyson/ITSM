# Graph Report - ITSM  (2026-11-24)

## Corpus Check
- 498 files · ~236,453 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 20 file(s) not represented in the graph (top: (none) 13, .ico 2, .lock 1)

## Summary
- 2837 nodes · 9772 edges · 142 communities (119 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 118 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b3cd1c3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Base UI Form Primitives
- employee-combobox.tsx
- react.ts
- asset-details-dialog.tsx
- Button
- Employee Directory & Azure
- server-details-dialog.tsx
- apps/mes/inspection-results/page.tsx
- server-registry.ts
- App Logo & Sheet UI
- Project Dependencies
- migrate-radix-to-base skill guide
- utils.ts
- Chat & Messaging
- dashboard/router.ts
- DialogContent
- Dropdown & Collapsible
- purchase-form-dialog.tsx
- Biome Lint Config
- nuqs
- Chat Bubble UI
- Package Manifest
- ITSM Platform Overview
- Go Asset Collector Encoding
- Cron Route Handlers
- CardHeader
- Microsoft OAuth Routes
- progress.tsx
- request-form.tsx
- TableBody
- tapes-page.tsx
- employees/router.ts
- registry.ts
- Input
- employee-inventory-section.tsx
- Go Collector Tests
- Contract Reminder Mailer
- lucide-react
- Access Control Groups
- Go Hardware Collection
- requests/router.ts
- assets/router.ts
- EmptyMedia
- Image Upload Routes
- booking/router.ts
- shadcn Config
- request-preview.tsx
- recent-lists.tsx
- Card
- printers/router.ts
- TypeScript Config
- contracts-page.tsx
- employee-detail-page.tsx
- shadcn Registry & MCP
- Page
- protectedProcedure
- Go CLI Errors & Flags
- MSSQL Setup Docs
- Access Control Constants
- Access Control CSV Utils
- Access Control Schemas
- questionnaire.tsx
- Go CLI Console UI
- server-form-dialog.tsx
- DCC Connectivity Report
- Root Layout Providers
- sync-photos-page.tsx
- Context Menu Components
- Drawer Components
- attendance/router.ts
- servers/router.ts
- Carousel Components
- Azure Proxy Redirect Fix
- Go Payload Encoding
- dccs/router.ts
- Go WMI Collection
- stock-details-dialog.tsx
- Toast Components
- AC Devices Router
- sync-photos/router.ts
- Dev Dependencies
- tape-form-dialog.tsx
- AC Photo Lookup
- file.repository.ts
- AC Query Helper
- storage.service.ts
- upload.service.ts
- tapes/router.ts
- NPM Scripts
- access-control/router.ts
- CardContent
- Deploy Script
- daily-report-mail.ts
- dccs-page.tsx
- Remote Deploy Script
- shadcn Brand Icon
- Maintenance Page
- Setup Script
- vendors-page.tsx
- Base UI Transitions
- Prisma Config
- DCC SQL Schema
- Build Script
- PostCSS Config
- Base UI Imports
- Unverified Image Asset
- purchases/router.ts
- Sync Button TODO
- Go Asset Collector
- gen-routes.mjs
- dcc-details-dialog.tsx
- shadcn/ui skill
- Forms & Inputs
- provide/router.ts
- Portal > Positioner > Popup positioning model
- Base vs Radix
- vendors/router.ts
- reports/router.ts
- health-page.tsx
- secret/attendance-table.tsx
- pagination.tsx
- Styling & Customization
- shadcn MCP Server
- requests-page.tsx
- attachment.service.ts
- image.service.ts
- parseCsvInts
- reports-page.tsx
- file-upload-module.sql
- charts/README.md
- home/README.md
- inspection-results/README.md
- inspection-routes/README.md
- jobs/README.md
- packages/README.md
- panels/README.md
- quality/README.md
- shipments/README.md
- time-out/README.md
- walk

## God Nodes (most connected - your core abstractions)
1. `cn()` - 461 edges
2. `Button()` - 239 edges
3. `lucide-react` - 150 edges
4. `react` - 138 edges
5. `Input()` - 103 edges
6. `trpc` - 85 edges
7. `DialogContent()` - 74 edges
8. `DialogHeader()` - 71 edges
9. `DialogTitle()` - 71 edges
10. `Dialog()` - 70 edges

## Surprising Connections (you probably didn't know these)
- `To add a route / module` --references--> `icon()`  [INFERRED]
  AGENTS.md → src/apps/icons.ts
- `asChild (radix) vs render (base) chosen by components.json base field` --semantically_similar_to--> `asChild to render migration pattern`  [INFERRED] [semantically similar]
  .agents/skills/shadcn/SKILL.md → .agents/skills/migrate-radix-to-base/universal-patterns.md
- `Project iconLibrary configuration` --semantically_similar_to--> `Toast notifications follow the project base`  [INFERRED] [semantically similar]
  .agents/skills/shadcn/rules/icons.md → .agents/skills/shadcn/rules/composition.md
- `Cross-platform build script (APP_URL baked in)` --references--> `APP_URL public base URL environment variable`  [INFERRED]
  tools/go-win-asset-collector/README.md → docs/azure-auth-proxy-redirect-fix.md
- `handler()` --indirect_call--> `createContext()`  [INFERRED]
  src/app/api/trpc/[trpc]/route.ts → src/server/context.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **MSSQL Connection Architecture** — docs_mssql_setup_database_ts_get_erp_pool, docs_mssql_setup_mssql_npm_package, docs_mssql_setup_tedious_driver, docs_mssql_setup_tarn_pooling, docs_mssql_setup_microsoft_sql_server [EXTRACTED 0.90]
- **Oracle Database Connection Architecture** — docs_oracle_setup_database_ts_get_odb_pool, docs_oracle_setup_ensure_oracle_client, docs_oracle_setup_oracledb_npm, docs_oracle_setup_oracle_instant_client, docs_oracle_setup_tns_configuration [EXTRACTED 0.95]
- **Chat UI composition parts** — _agents_skills_shadcn_rules_chat_message_scroller, _agents_skills_shadcn_rules_chat_message_component, _agents_skills_shadcn_rules_chat_bubble_component, _agents_skills_shadcn_rules_chat_attachment_component, _agents_skills_shadcn_rules_chat_marker_component [EXTRACTED 1.00]
- **DCC pre-rollout remediation plan** — docs_reports_dcc_connectivity_report_2026_09_10_reader_direct_power_data_cable, docs_reports_dcc_connectivity_report_2026_09_10_pi_direct_ethernet, docs_reports_dcc_connectivity_report_2026_09_10_external_usb_wifi_antenna, docs_reports_dcc_connectivity_report_2026_09_10_live_kiosk_software_update [EXTRACTED 1.00]
- **shadcn MCP registry tool set** — _agents_skills_shadcn_mcp_get_project_registries, _agents_skills_shadcn_mcp_list_items_in_registries, _agents_skills_shadcn_mcp_search_items_in_registries, _agents_skills_shadcn_mcp_view_items_in_registries, _agents_skills_shadcn_mcp_get_item_examples_from_registries, _agents_skills_shadcn_mcp_get_add_command_for_items, _agents_skills_shadcn_mcp_get_audit_checklist [EXTRACTED 1.00]
- **Cron-Driven Scheduled Features** — readme_cron_jobs, readme_bookings_module, readme_servers_module, readme_backup_tapes_module, readme_vendor_contracts [EXTRACTED 1.00]
- **App icon visual composition (laptop + verified badge)** — tools_go_win_asset_collector_assets_icon, tools_go_win_asset_collector_assets_icon_laptop_motif, tools_go_win_asset_collector_assets_icon_verified_badge [EXTRACTED 1.00]
- **Menu family shares one canonical part mapping** — _agents_skills_migrate_radix_to_base_menus_canonical_menu_mapping, _agents_skills_migrate_radix_to_base_menus_dropdown_menu_to_menu, _agents_skills_migrate_radix_to_base_menus_navigation_menu_positioner_model, _agents_skills_migrate_radix_to_base_menus_close_on_click_default_flip, _agents_skills_migrate_radix_to_base_universal_patterns_portal_positioner_popup [EXTRACTED 1.00]
- **Four Enterprise Data Sources** — readme_multi_database_architecture, readme_mes_database, readme_iss_database, readme_erp_database, readme_mis_database [EXTRACTED 1.00]
- **Radix-to-Base UI migration knowledge base** — _agents_skills_migrate_radix_to_base_skill_doc, _agents_skills_migrate_radix_to_base_universal_patterns_doc, _agents_skills_migrate_radix_to_base_class_mapping_doc, _agents_skills_migrate_radix_to_base_consumer_props_doc, _agents_skills_migrate_radix_to_base_disclosure_doc, _agents_skills_migrate_radix_to_base_display_misc_doc, _agents_skills_migrate_radix_to_base_form_controls_doc, _agents_skills_migrate_radix_to_base_menus_doc, _agents_skills_migrate_radix_to_base_overlays_doc, _agents_skills_migrate_radix_to_base_wrapper_shapes_doc [EXTRACTED 1.00]
- **shadcn/ui Icon Composition** — _agents_skills_shadcn_assets_shadcn_shadcn_icon, _agents_skills_shadcn_assets_shadcn_double_slash_mark, _agents_skills_shadcn_assets_shadcn_rounded_square_field [EXTRACTED 1.00]
- **Web Frontend Technology Stack** — readme_nextjs, readme_react, readme_typescript, readme_tailwind, readme_shadcn_base_ui [EXTRACTED 1.00]
- **Layer-2 class and attribute rewrite layer** — _agents_skills_migrate_radix_to_base_class_mapping_doc, _agents_skills_migrate_radix_to_base_universal_patterns_presence_attributes, _agents_skills_migrate_radix_to_base_class_mapping_starting_ending_style_animations, _agents_skills_migrate_radix_to_base_class_mapping_dead_pseudo_class_variants, _agents_skills_migrate_radix_to_base_universal_patterns_css_var_rewrites [INFERRED 0.85]

## Communities (142 total, 23 thin omitted)

### Community 0 - "Base UI Form Primitives"
Cohesion: 0.03
Nodes (86): input-otp, react-resizable-panels, Accordion(), AccordionContent(), AccordionItem(), AccordionTrigger(), Alert(), AlertAction() (+78 more)

### Community 1 - "employee-combobox.tsx"
Cohesion: 0.13
Nodes (27): acInitials(), NavPath(), NavRecordItem(), PhotoRenderer(), EmployeeAvatar(), getEmployeeInitials(), EmployeeComboboxProps, EmployeeOption (+19 more)

### Community 2 - "react.ts"
Cohesion: 0.08
Nodes (39): sonner, @tanstack/react-form, SignInSchema, clean(), fieldError(), fieldValidator(), PrinterFormContent(), PrinterFormDialogProps (+31 more)

### Community 3 - "asset-details-dialog.tsx"
Cohesion: 0.19
Nodes (30): AssetDetailsDialog(), AssetDetailsDialogProps, Row(), MarkReceivedDialog(), PrinterDetailsDialog(), PrinterDetailsDialogProps, Row(), Row() (+22 more)

### Community 4 - "Button"
Cohesion: 0.11
Nodes (50): ag-grid-community, ag-grid-react, AcPager(), PAGE_SIZES, ContractForm(), ContractFormDialogProps, DccFormContent(), DccFormDialogProps (+42 more)

### Community 5 - "Employee Directory & Azure"
Cohesion: 0.06
Nodes (51): EmploymentStatusPill(), formatDate(), Pill(), PillTone, StaffTypePill(), TONES, EmployeesPage(), AvatarRenderer() (+43 more)

### Community 6 - "server-details-dialog.tsx"
Cohesion: 0.14
Nodes (24): ServerItem, Row(), ServerDetailsDialog(), ServerDetailsDialogProps, StatusBadge(), ServerCard(), ServersGrid(), ServersGridProps (+16 more)

### Community 7 - "apps/mes/inspection-results/page.tsx"
Cohesion: 0.11
Nodes (42): recharts, chartConfig, DailyAnalyticsChart(), DefectData, description, chartConfig, DefectTypeChart(), chartConfig (+34 more)

### Community 8 - "server-registry.ts"
Cohesion: 0.08
Nodes (44): @trpc/server, zod, handler(), checkMssql(), checkMysql(), checkOracle(), DbCheckResult, router (+36 more)

### Community 9 - "App Logo & Sheet UI"
Cohesion: 0.07
Nodes (52): Layout(), ResponsiveOverlay(), ResponsiveOverlayProps, AppShell(), AppShellProps, AppSidebar(), AppSidebarContent(), TeamSwitcher() (+44 more)

### Community 10 - "Project Dependencies"
Cohesion: 0.04
Nodes (53): dependencies, ag-grid-community, ag-grid-react, @base-ui/react, bcrypt, class-variance-authority, clsx, cmdk (+45 more)

### Community 11 - "migrate-radix-to-base skill guide"
Cohesion: 0.11
Nodes (21): Class-string rewrites reference (layer 2), Consumer call-site prop sweep, Consumer-side prop changes reference, Disclosure + toggle family props mapping, Display/misc props mapping (progress, scroll-area, separator, avatar, toast, form), Radix Form split into Form + Field + Fieldset, No-counterpart replacements (Label, AspectRatio, VisuallyHidden, AccessibleIcon, Direction), Menu family props mapping (dropdown-menu, context-menu, menubar, navigation-menu) (+13 more)

### Community 12 - "utils.ts"
Cohesion: 0.20
Nodes (17): ActivatedBadge(), DeletedBadge(), DeviceStatusBadge(), DirectionBadge(), AcDevicesPanel(), AcGroupDetailDialog(), Field(), AcGroupsTable() (+9 more)

### Community 13 - "Chat & Messaging"
Cohesion: 0.22
Nodes (16): Attachment (file/image attachment), Bubble (message surface), Chat & Messaging, Marker (system notes and dividers), Message (message row), MessageScroller (scrollable thread), MessageScroller hooks escape hatch, Streaming, anchoring and jump-to-latest behavior (+8 more)

### Community 14 - "dashboard/router.ts"
Cohesion: 0.07
Nodes (38): date-fns, AlertsPanel(), KIND_ICON, SEVERITY_CLASS, DashboardContent(), DashboardPage(), DashboardSkeleton(), ActiveContractsCard() (+30 more)

### Community 15 - "DialogContent"
Cohesion: 0.11
Nodes (59): AssetFormDialog(), ExtendDialog(), BookingDetailsDialog(), formatDateTime(), BookingFormDialog(), STATUS_TABS, STATUS_VALUES, StatusFilter (+51 more)

### Community 16 - "Dropdown & Collapsible"
Cohesion: 0.11
Nodes (39): DesktopDropdownItem(), DesktopNavItem(), MobileNavItem(), getInitials(), UserMenu(), Collapsible(), CollapsibleContent(), CollapsibleTrigger() (+31 more)

### Community 17 - "purchase-form-dialog.tsx"
Cohesion: 0.18
Nodes (32): BookingFormContent(), emptyValues, fieldError(), formSchema, FormValues, EmployeePicker(), fieldError(), FormItem (+24 more)

### Community 18 - "Biome Lint Config"
Cohesion: 0.05
Nodes (37): source, assist, actions, enabled, useExhaustiveDependencies, useUniqueElementIds, css, parser (+29 more)

### Community 19 - "nuqs"
Cohesion: 0.13
Nodes (20): nuqs, AssetsReport(), STATUSES, ExportButtons(), ExportButtonsProps, exportRowsToPdf(), PdfColumn, defaultFromDate() (+12 more)

### Community 20 - "Chat Bubble UI"
Cohesion: 0.08
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
Cohesion: 0.08
Nodes (31): config, nextConfig, next, bookingRow(), dynamic, escapeHtml(), GET(), Row (+23 more)

### Community 25 - "CardHeader"
Cohesion: 0.14
Nodes (20): DccMiniChart(), DccRealtimeCard(), formatTime(), StatCard(), features, LandingFeatures(), testimonials, ContractRemindersSection() (+12 more)

### Community 26 - "Microsoft OAuth Routes"
Cohesion: 0.09
Nodes (32): file-type, @t3-oss/env-nextjs, GET(), getSecureFlag(), getSessionOptions(), logLoginAttempt(), UserRow, GET() (+24 more)

### Community 27 - "progress.tsx"
Cohesion: 0.24
Nodes (8): framer-motion, AppLogoProps, Project Logo Image (src/assets/images/logo.png), SplashScreenProps, Progress(), ProgressIndicator(), ProgressTrack(), ProgressValue()

### Community 28 - "request-form.tsx"
Cohesion: 0.19
Nodes (15): Page(), hardwareCardClassName(), HardwareSelection(), HardwareSelectionProps, ITRequestPage(), RequestForm(), emptyRequestForm, RequestFormData (+7 more)

### Community 29 - "TableBody"
Cohesion: 0.15
Nodes (35): @tanstack/react-table, @tanstack/react-virtual, BookingTable(), BookingTableProps, cellStyle(), cellStyle(), ContractsTable(), ContractsTableProps (+27 more)

### Community 30 - "tapes-page.tsx"
Cohesion: 0.17
Nodes (16): TapeItem, TapeCard(), TapesGrid(), TapesGridProps, TapesPage(), VIEW_VALUES, assigned(), compareTapes() (+8 more)

### Community 31 - "employees/router.ts"
Cohesion: 0.16
Nodes (16): EmployeeTargetResult, EmployeeUpdateResults, normalizeOracleEmployee(), router, Row, toString(), AzureUserDetails, OracleConnection (+8 more)

### Community 32 - "registry.ts"
Cohesion: 0.10
Nodes (24): Repository layout (multi-app), Rules, This is NOT the Next.js you know, To add a route / module, SettingsLayout(), icon(), itsmApp, SettingsSidebar() (+16 more)

### Community 33 - "Input"
Cohesion: 0.12
Nodes (22): AssetFormContent(), AssetFormDialogProps, assetFormSchema, AssetFormValues, assetToFormValues(), clean(), emptyValues, fieldError() (+14 more)

### Community 34 - "employee-inventory-section.tsx"
Cohesion: 0.09
Nodes (34): AssetCard(), AssetsGrid(), AssetsGridProps, AssetsTable(), AssetsTableProps, cellStyle(), AssetItem, DccPingBadgeProps (+26 more)

### Community 35 - "Go Collector Tests"
Cohesion: 0.16
Nodes (18): TestDryRunShape(), TestReadSysfsIgnoresPlaceholders(), TestParseMacSize(), DryRun(), DetectType(), firstIP(), formatBytes(), formatDisks() (+10 more)

### Community 36 - "Contract Reminder Mailer"
Cohesion: 0.13
Nodes (24): mysql2, dynamic, GET(), assertVendorExists(), contractSchema, logChange(), reminderSettingsSchema, remindersRouter (+16 more)

### Community 37 - "lucide-react"
Cohesion: 0.13
Nodes (12): lucide-react, react, MesLayoutProps, icons, PrinterCard(), PrintersGrid(), PrintersGridProps, PrinterItem (+4 more)

### Community 38 - "Access Control Groups"
Cohesion: 0.22
Nodes (13): getAcGroupsByIds(), listAcGroups(), Row, toSummary(), acCount(), clampPageSize(), pageCount(), AcGroupListArgs (+5 more)

### Community 39 - "Go Hardware Collection"
Cohesion: 0.14
Nodes (19): spHardwareData, spStorageData, Collect(), firstIPv4(), Disk, Raw, hostname(), readSysfs() (+11 more)

### Community 40 - "requests/router.ts"
Cohesion: 0.11
Nodes (20): createSchema, listSchema, RequestItem, RequestReplyItem, router, Row, toRequest(), capitalize() (+12 more)

### Community 41 - "assets/router.ts"
Cohesion: 0.11
Nodes (18): Asset, AssetDetail, AssetNote, AssetRow, createAssetSchema, execFileAsync, hydrateAssetOwners(), normalizeAsset() (+10 more)

### Community 42 - "EmptyMedia"
Cohesion: 0.18
Nodes (21): AcGroupsPanel(), AcUsersPanel(), AccessControlPage(), TAB_VALUES, BookingPage(), PrintersPage(), ProvidePage(), PurchasePage() (+13 more)

### Community 43 - "Image Upload Routes"
Cohesion: 0.17
Nodes (12): contentType(), FALLBACK_DIR, GET(), isSafeName(), MIME_TYPES, PRIMARY_DIR, resolveWithin(), contentType() (+4 more)

### Community 44 - "booking/router.ts"
Cohesion: 0.11
Nodes (28): BookingAssetOption, createSchema, employeeNameFor(), router, Row, sendBookingNotification(), toDateString(), toDateTimeISO() (+20 more)

### Community 45 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 46 - "request-preview.tsx"
Cohesion: 0.53
Nodes (3): Page(), RequestData, RequestPreview()

### Community 47 - "recent-lists.tsx"
Cohesion: 0.19
Nodes (18): Page(), AuthPage(), SignInForm(), AssetRow(), DetailRow(), EmployeeRow(), EmptyRow(), getInitials() (+10 more)

### Community 48 - "Card"
Cohesion: 0.16
Nodes (13): Page(), Page(), LandingCta(), EmblaCarousel(), LandingHero(), LandingPage(), LogEntry, MouseTestingApp() (+5 more)

### Community 49 - "printers/router.ts"
Cohesion: 0.18
Nodes (16): addActionSchema, createSchema, LinkedTonerItem, PrinterActionItem, PrinterDetail, PrinterInfoItem, router, Row (+8 more)

### Community 50 - "TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+13 more)

### Community 51 - "contracts-page.tsx"
Cohesion: 0.15
Nodes (22): ContractsCardList(), ContractsCardListProps, ContractDetails(), ContractDetailsProps, DetailRow(), TextBlock(), ContractFormDialog(), CardsSkeleton() (+14 more)

### Community 52 - "employee-detail-page.tsx"
Cohesion: 0.21
Nodes (24): AccessBadge(), AdminBadge(), CardTypeBadge(), GroupBadges(), ValidityBadge(), VerifyModeBadge(), AcUserPhoto(), AcUserDetailDialog() (+16 more)

### Community 53 - "shadcn Registry & MCP"
Cohesion: 0.27
Nodes (13): shadcn CLI reference, shadcn:get_add_command_for_items MCP tool, Registry item address schemes, Built registry (generated item JSON), Registry Authoring and Addresses, GitHub source registries, Registry build and verify (npx shadcn build), registryDependencies item addressing (+5 more)

### Community 54 - "Page"
Cohesion: 0.10
Nodes (29): AttendancePage(), formatMinutes(), MONTHS, AttendanceEmployee, AddAttendanceLogPage(), formatMinutes(), MONTHS, EmptyState() (+21 more)

### Community 55 - "protectedProcedure"
Cohesion: 0.16
Nodes (15): bcrypt, mailSettingsSchema, MailSettingsValues, MailSettingsView, router, Row, generateToken(), hashPassword() (+7 more)

### Community 56 - "Go CLI Errors & Flags"
Cohesion: 0.17
Nodes (8): CommandError, UnsupportedError, flags, Resolve(), stripTrailingSlashes(), TestResolvePriority(), TestStripTrailingSlashes(), parseFlags()

### Community 57 - "MSSQL Setup Docs"
Cohesion: 0.14
Nodes (16): getERPPool (database.ts), ERP Environment Variables, MSSQL Health Check (/health), Microsoft SQL Server 2005+, MSSQL Database Setup, mssql npm package, tarn.js connection pooling, tedious.js driver (+8 more)

### Community 58 - "Access Control Constants"
Cohesion: 0.11
Nodes (21): AC_ROLE_NAME, AcSessionUser, Row, AC_DEFAULT_PAGE_SIZE, AC_MAX_PAGE_SIZE, AC_SCHEMA, AC_TABLES, GROUP_DEFAULT_ORDER (+13 more)

### Community 59 - "Access Control CSV Utils"
Cohesion: 0.11
Nodes (16): filtersParser, pageParser, perPageParser, searchInParser, AcCard, CARD_TYPES, CardType, VERIFY_MODES (+8 more)

### Community 60 - "Access Control Schemas"
Cohesion: 0.12
Nodes (15): AC_GROUP_SEARCH_FIELDS, AC_USER_FILTERS, AC_USER_SEARCH_FIELDS, AcDeviceListInput, AcDeviceListInputSchema, AcGroupIdInputSchema, AcGroupListInputSchema, AcGroupSearchField (+7 more)

### Community 61 - "questionnaire.tsx"
Cohesion: 0.08
Nodes (25): react-day-picker, @shadcn/react, buttonVariants, Calendar(), CalendarDayButton(), MessageScroller(), MessageScrollerButton(), MessageScrollerContent() (+17 more)

### Community 62 - "Go CLI Console UI"
Cohesion: 0.21
Nodes (14): Banner(), c(), ce(), detectColor(), Fields(), Info(), Link(), PromptClose() (+6 more)

### Community 63 - "server-form-dialog.tsx"
Cohesion: 0.12
Nodes (22): derivePeriod(), fieldError(), fieldValidator(), ImagePreview(), ServerFormContent(), ServerFormDialogProps, serverFormSchema, ServerFormValues (+14 more)

### Community 64 - "DCC Connectivity Report"
Cohesion: 0.23
Nodes (15): Card reader WiFi weak point, dcc_connectivity_logs monitoring table, Cron task pinging every DCC and card reader, 32 DCC stations (Raspberry Pi + card reader), DCCs dashboard and realtime view, DCC & Card Reader Connectivity Report - 10 September 2026, Solution B alt: external USB WiFi antenna, Solution C: live kiosk software update (+7 more)

### Community 65 - "Root Layout Providers"
Cohesion: 0.15
Nodes (13): next-themes, @tanstack/react-query, @trpc/client, geistMono, geistSans, inter, RootLayout(), RootProviders() (+5 more)

### Community 66 - "sync-photos-page.tsx"
Cohesion: 0.16
Nodes (18): SyncPhotoEmployee, SOURCE_META, SourceMeta, SyncPhotosPage(), ActionRenderer(), ActionRendererProps, StatusRenderer(), SYNC_STATUS_ICONS (+10 more)

### Community 67 - "Context Menu Components"
Cohesion: 0.13
Nodes (10): ContextMenuCheckboxItem(), ContextMenuContent(), ContextMenuItem(), ContextMenuLabel(), ContextMenuRadioItem(), ContextMenuSeparator(), ContextMenuShortcut(), ContextMenuSubContent() (+2 more)

### Community 68 - "Drawer Components"
Cohesion: 0.14
Nodes (17): RequestsLayout(), RequestsLayoutProps, MarketingNavbar(), NavMenu(), Drawer(), DrawerContent(), DrawerContext, DrawerContextProps (+9 more)

### Community 69 - "attendance/router.ts"
Cohesion: 0.13
Nodes (25): AttendanceTable(), AttendanceTableProps, formatMinutes(), getWeekday(), StatusBadge(), AttendanceLog, attendanceLogInput, AttendanceSummary (+17 more)

### Community 70 - "servers/router.ts"
Cohesion: 0.14
Nodes (20): addActionSchema, createSchema, execFileAsync, maintenancePeriodSchema, PingResult, router, Row, runPing() (+12 more)

### Community 71 - "Carousel Components"
Cohesion: 0.17
Nodes (14): embla-carousel-react, Carousel(), CarouselApi, CarouselContent(), CarouselContext, CarouselContextProps, CarouselItem(), CarouselNext() (+6 more)

### Community 72 - "Azure Proxy Redirect Fix"
Cohesion: 0.26
Nodes (12): Apache reverse proxy in front of Next.js, APP_URL public base URL environment variable, Microsoft Azure OAuth login callback flow, Fix: Azure login redirecting to localhost:3000, /app/assets?new=<base64url> prefill payload contract, Original Bun/TS win-asset-collector, Cross-platform build script (APP_URL baked in), Go Win Asset Collector README (+4 more)

### Community 73 - "Go Payload Encoding"
Cohesion: 0.27
Nodes (9): Fields, BuildLink(), Encode(), mustDecode(), TestBuildLink(), TestEncodeDecodesToSameFields(), TestEncodeUsesUrlSafeAlphabet(), testFields() (+1 more)

### Community 74 - "dccs/router.ts"
Cohesion: 0.15
Nodes (18): ChartPoint, DccConnectivityChart(), DccConnectivityChartProps, formatCheckedAt(), booleanField, createSchema, DccDashboard, DccDetail (+10 more)

### Community 75 - "Go WMI Collection"
Cohesion: 0.17
Nodes (7): cimBIOS, cimComputerSystem, cimDiskDrive, cimNetworkAdapter, cimOperatingSystem, cimProcessor, cimSystemEnclosure

### Community 76 - "stock-details-dialog.tsx"
Cohesion: 0.19
Nodes (16): StockItem, InfoRow(), StockDetailsDialog(), StockDetailsDialogProps, StockGrid(), StockGridProps, encodePath(), imageUrl() (+8 more)

### Community 77 - "Toast Components"
Cohesion: 0.32
Nodes (11): ToastAction(), ToastClose(), ToastContent(), ToastDescription(), Toaster(), ToastIcon(), ToastList(), ToastPortal() (+3 more)

### Community 78 - "AC Devices Router"
Cohesion: 0.24
Nodes (10): AC_DEFAULT_DEVICE_PORT, AC_PERIPHERAL_TYPE, getPeripheral(), listAccessControlDevices(), listGroupDeviceChoices(), Row, toDevice(), AcDeviceCredentials (+2 more)

### Community 79 - "sync-photos/router.ts"
Cohesion: 0.14
Nodes (18): buildBulkUpdateSql(), buildUpdatePicPathSql(), CountRow, EmployeePhotoRow, fetchEmpPicPaths(), fetchOraclePicPathMap(), OraclePicPathResult, PHOTO_SYNC_SOURCES (+10 more)

### Community 80 - "Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, @biomejs/biome, prisma, tailwindcss, @tailwindcss/postcss, @types/mssql, @types/node, @types/nodemailer (+3 more)

### Community 81 - "tape-form-dialog.tsx"
Cohesion: 0.29
Nodes (10): dateTimeValidator(), fieldError(), nowLocalDateTime(), TapeFormContent(), TapeFormDialogProps, TapeFormValues, toLocalInput(), UsageValues (+2 more)

### Community 82 - "AC Photo Lookup"
Cohesion: 0.40
Nodes (9): toGroup(), acPhotoPath(), findAcUserPhoto(), md5(), Row, toAsset(), asInt(), asNumber() (+1 more)

### Community 83 - "file.repository.ts"
Cohesion: 0.18
Nodes (17): AttachmentRecord, AttachmentRow, countStoragePathReferences(), createAttachment(), createFile(), deleteAttachmentsByEntity(), deleteFileById(), deleteFileIfOrphaned() (+9 more)

### Community 84 - "AC Query Helper"
Cohesion: 0.25
Nodes (9): acQuery(), AcQueryError, acQueryOne(), asBool(), bindable(), BindScalar, BindValue, expandPlaceholders() (+1 more)

### Community 85 - "storage.service.ts"
Cohesion: 0.22
Nodes (18): createReadStreamFor(), DATA_ROOT, datePath(), exists(), fileStat(), LEGACY_ISS_ITEMS, LEGACY_ISS_PRINTERS, LEGACY_ROOT (+10 more)

### Community 86 - "upload.service.ts"
Cohesion: 0.19
Nodes (12): dynamic, POST(), runtime, DELETE(), POST(), runtime, computeSha256(), deleteUpload() (+4 more)

### Community 87 - "tapes/router.ts"
Cohesion: 0.14
Nodes (16): assignmentSchema, createSchema, dateTimeSchema, locationSchema, monthSchema, router, Row, sequenceNumSchema (+8 more)

### Community 88 - "NPM Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, deploy, deploy:remote, dev, gen:routes, lint, setup (+1 more)

### Community 89 - "access-control/router.ts"
Cohesion: 0.32
Nodes (11): acProcedure, router, canAccessControl(), hasMesAccessControlGrant(), toPublicDevice(), countUsersInGroup(), deviceIdsForGroup(), getAcGroup() (+3 more)

### Community 90 - "CardContent"
Cohesion: 0.21
Nodes (11): AccountDetails(), fieldError(), fieldValidator(), formSchema, MeUser, ProfileForm(), ProfileSettingsPage(), Page() (+3 more)

### Community 91 - "Deploy Script"
Cohesion: 0.67
Nodes (5): error(), log(), rollback_or_fail(), deploy.sh script, warn()

### Community 92 - "daily-report-mail.ts"
Cohesion: 0.26
Nodes (14): router, settingsSchema, buildDailyReportMail(), DailyReportRunResult, DailyReportSettings, ensureDailyReportSettingsTable(), getDailyReportSettings(), normalizeEmails() (+6 more)

### Community 93 - "dccs-page.tsx"
Cohesion: 0.30
Nodes (8): DccRealtimeGrid(), DccWithLogs, DccsPage(), Page(), DccItem, INTERVAL_OPTIONS, PollingControls(), useDccRealtime()

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

### Community 98 - "vendors-page.tsx"
Cohesion: 0.26
Nodes (9): Vendor, VendorsCardList(), VendorsCardListProps, VendorCard(), VendorsGrid(), VendorsGridProps, VendorsGridSkeleton(), VendorsListSkeleton() (+1 more)

### Community 99 - "Base UI Transitions"
Cohesion: 0.67
Nodes (3): Element changes kill disabled: pseudo-class variants, data-starting-style / data-ending-style transition animation idiom, Presence attributes replace data-[state=...]

### Community 106 - "purchases/router.ts"
Cohesion: 0.16
Nodes (13): createItemSchema, createSchema, PurchaseItemOption, purchaseItemSchema, PurchaseLineItem, PurchaseServiceLine, purchaseServiceSchema, router (+5 more)

### Community 111 - "gen-routes.mjs"
Cohesion: 0.15
Nodes (8): allModules(), apps, imports, itsmEntries, jiti, mesEntries, missing, root

### Community 112 - "dcc-details-dialog.tsx"
Cohesion: 0.26
Nodes (9): DccDetailsDialog(), DccDetailsDialogProps, FeatureTag(), Row(), DccStatus, DccStatusBadge(), DccStatusBadgeProps, LandingFooter() (+1 more)

### Community 113 - "shadcn/ui skill"
Cohesion: 0.26
Nodes (12): Base UI manager-driven toast model, Radix CSS variable rewrites (--radix-* to generic vars), shadcn agent interface manifest (openai.yml), shadcn CLI commands (init/apply/add/search/view/docs/info/build), components.json project configuration, Semantic CSS variable theming (OKLCH tokens to Tailwind utilities), asChild (radix) vs render (base) chosen by components.json base field, shadcn always-enforced critical rules (styling, forms, composition, icons, chat) (+4 more)

### Community 114 - "Forms & Inputs"
Cohesion: 0.24
Nodes (12): Forms & Inputs, FieldGroup + Field form structure, Field validation and disabled states, FieldSet + FieldLegend grouping, Form control selection guide, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2-7 choices) use ToggleGroup, data-icon attribute for icons in Button (+4 more)

### Community 115 - "provide/router.ts"
Cohesion: 0.21
Nodes (11): createItemSchema, createSchema, mapProvideRows(), ProvideItem, ProvideLineItem, router, Row, StockItemOption (+3 more)

### Community 116 - "Portal > Positioner > Popup positioning model"
Cohesion: 0.18
Nodes (9): Form controls props mapping (select, checkbox, radio-group, switch, slider), Canonical menu-family part mapping, DropdownMenu to Menu rename and restructure, NavigationMenu anchored positioner model (Viewport split, Indicator to Icon), Dismiss callbacks replaced by onOpenChange eventDetails.reason + cancel(), HoverCard to PreviewCard rename, Radix export coverage matrix, Radix to Base UI part-rename table (+1 more)

### Community 117 - "Base vs Radix"
Cohesion: 0.44
Nodes (11): Accordion type/defaultValue semantics, asChild composition (radix), Base UI (base), Base vs Radix, nativeButton={false} for non-button renders, Radix UI (radix), render composition (base), Select items prop and placeholder (base vs radix) (+3 more)

### Community 118 - "vendors/router.ts"
Cohesion: 0.24
Nodes (10): contactSchema, insertContacts(), logChange(), router, Row, toContactRows(), updateSchema, VendorContact (+2 more)

### Community 119 - "reports/router.ts"
Cohesion: 0.22
Nodes (9): AssetReportRow, dateSchema, PrinterReportRow, router, Row, StockProvideRow, StockPurchaseRow, StockReportResult (+1 more)

### Community 120 - "health-page.tsx"
Cohesion: 0.36
Nodes (5): DBS, DbStatus, HealthPage(), StatusCard(), Spinner()

### Community 121 - "secret/attendance-table.tsx"
Cohesion: 0.36
Nodes (8): ActiveSide, formatMinutes(), getDayPunches(), getWeekday(), Props, SecretAttendanceTable(), StatusBadge(), toLocalHHmm()

### Community 122 - "pagination.tsx"
Cohesion: 0.28
Nodes (7): Pagination(), PaginationContent(), PaginationEllipsis(), PaginationLink(), PaginationLinkProps, PaginationNext(), PaginationPrevious()

### Community 123 - "Styling & Customization"
Cohesion: 0.36
Nodes (8): shadcn customization and theming guide, Built-in variants first, className for layout only, cn() for conditional classes, Styling & Customization, gap utilities instead of space-x/y, No manual z-index on overlays, Semantic color tokens

### Community 124 - "shadcn MCP Server"
Cohesion: 0.43
Nodes (8): components.json registry configuration, shadcn MCP Server, shadcn:get_audit_checklist MCP tool, shadcn:get_item_examples_from_registries MCP tool, shadcn:get_project_registries MCP tool, shadcn:list_items_in_registries MCP tool, shadcn:search_items_in_registries MCP tool, shadcn:view_items_in_registries MCP tool

### Community 125 - "requests-page.tsx"
Cohesion: 0.43
Nodes (4): RequestsPage(), STATUS_FILTER_VALUES, STATUS_FILTERS, statusLabel()

### Community 126 - "attachment.service.ts"
Cohesion: 0.33
Nodes (3): @paralleldrive/cuid2, createAttachment(), deleteAttachment()

### Community 127 - "image.service.ts"
Cohesion: 0.40
Nodes (5): sharp, ImageMetadata, isOptimizableImage(), processImage(), ProcessImageResult

### Community 128 - "parseCsvInts"
Cohesion: 0.47
Nodes (6): parseCsvInts(), deviceCredentials(), deviceIdsForGroups(), asString(), countUsersPerGroup(), getGroupsForUser()

## Knowledge Gaps
- **70 isolated node(s):** `@hookform/resolvers`, `@prisma/adapter-better-sqlite3`, `@prisma/client`, `@types/bcrypt`, `jotai` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 758 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Base UI Form Primitives` to `employee-combobox.tsx`, `react.ts`, `asset-details-dialog.tsx`, `Button`, `Employee Directory & Azure`, `server-details-dialog.tsx`, `apps/mes/inspection-results/page.tsx`, `App Logo & Sheet UI`, `utils.ts`, `dashboard/router.ts`, `DialogContent`, `Dropdown & Collapsible`, `purchase-form-dialog.tsx`, `nuqs`, `Chat Bubble UI`, `CardHeader`, `progress.tsx`, `TableBody`, `tapes-page.tsx`, `registry.ts`, `Input`, `employee-inventory-section.tsx`, `EmptyMedia`, `recent-lists.tsx`, `Card`, `contracts-page.tsx`, `employee-detail-page.tsx`, `Page`, `Access Control CSV Utils`, `questionnaire.tsx`, `Root Layout Providers`, `sync-photos-page.tsx`, `Context Menu Components`, `Drawer Components`, `Carousel Components`, `stock-details-dialog.tsx`, `Toast Components`, `CardContent`, `dccs-page.tsx`, `dcc-details-dialog.tsx`, `health-page.tsx`, `pagination.tsx`, `requests-page.tsx`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **What connects `@hookform/resolvers`, `@prisma/adapter-better-sqlite3`, `@prisma/client` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Base UI Form Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.0341681226946224 - nodes in this community are weakly interconnected._
- **Why does `Button()` connect `Button` to `Base UI Form Primitives`, `reports-page.tsx`, `react.ts`, `asset-details-dialog.tsx`, `employee-combobox.tsx`, `Employee Directory & Azure`, `server-details-dialog.tsx`, `apps/mes/inspection-results/page.tsx`, `App Logo & Sheet UI`, `DialogContent`, `Dropdown & Collapsible`, `purchase-form-dialog.tsx`, `nuqs`, `CardHeader`, `request-form.tsx`, `TableBody`, `tapes-page.tsx`, `Input`, `employee-inventory-section.tsx`, `lucide-react`, `EmptyMedia`, `request-preview.tsx`, `recent-lists.tsx`, `Card`, `contracts-page.tsx`, `employee-detail-page.tsx`, `Page`, `Access Control CSV Utils`, `questionnaire.tsx`, `server-form-dialog.tsx`, `sync-photos-page.tsx`, `Drawer Components`, `Carousel Components`, `stock-details-dialog.tsx`, `Toast Components`, `tape-form-dialog.tsx`, `CardContent`, `dccs-page.tsx`, `vendors-page.tsx`, `dcc-details-dialog.tsx`, `health-page.tsx`, `secret/attendance-table.tsx`, `pagination.tsx`, `requests-page.tsx`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `employee-combobox.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12857142857142856 - nodes in this community are weakly interconnected._
- **Why does `next` connect `Cron Route Handlers` to `reports-page.tsx`, `react.ts`, `employee-combobox.tsx`, `apps/mes/inspection-results/page.tsx`, `server-registry.ts`, `App Logo & Sheet UI`, `dashboard/router.ts`, `Dropdown & Collapsible`, `nuqs`, `Package Manifest`, `CardHeader`, `Microsoft OAuth Routes`, `progress.tsx`, `request-form.tsx`, `registry.ts`, `Contract Reminder Mailer`, `Image Upload Routes`, `request-preview.tsx`, `recent-lists.tsx`, `Card`, `employee-detail-page.tsx`, `Root Layout Providers`, `upload.service.ts`, `CardContent`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `react.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._