# Go Win Asset Collector

A single-file, cross-platform rewrite of `tools/win-asset-collector` in **Go**.
It collects hardware info from the current PC and opens the ITSM **Add New
Asset** dialog prefilled — same `/app/assets?new=<base64url>` payload contract,
but smaller, faster, and more trusted on corporate machines.

| | Bun/TS original | Go rewrite |
| --- | --- | --- |
| Binary size (Windows) | 86 MB | **3.1 MB** |
| Windows data source | PowerShell `-ExecutionPolicy Bypass` | **WMI/COM directly (no PowerShell)** |
| Windows icon in Explorer | none (unsigned, generic) | **embedded `.ico` + version info + manifest** |
| Runtime deps on target PC | none | none (static binaries) |
| Launch time | ~300 ms (embedded Bun) | ~10 ms |

## What's collected

The exact 10 form fields the ITSM asset form expects (`type` auto-detected from
the SMBIOS chassis type):

`type`, `serialNumber`, `manufacturer`, `model`, `processor`, `os`, `memory`,
`hdd`, `deviceName`, `ip`

| Platform | Mechanism |
| --- | --- |
| Windows | WMI via COM (`Win32_BIOS/ComputerSystem/OperatingSystem/Processor/SystemEnclosure/DiskDrive/NetworkAdapterConfiguration`) — no PowerShell subprocess, `CGO_ENABLED=0` |
| Linux | DMI sysfs + `/proc` + `lsblk` (fallback `/sys/block`) |
| macOS | `system_profiler`, `sysctl`, `sw_vers` |

## Enhancements over the original

- **No PowerShell anywhere.** Windows collection uses `github.com/yusufpapurcu/wmi`
  over COM, so there's no `-ExecutionPolicy Bypass` for EDR/AV to flag.
- **Embedded Explorer icon.** `cmd/genicon` renders a laptop + green "verified"
  badge and `go-winres` embeds it (plus version info + DPI-aware manifest) into
  the `.exe`. The icon also ships as `assets/icon.png` / `assets/icon.ico`.
- **Small static binaries** — `-trimpath -ldflags "-s -w"`, `CGO_ENABLED=0`.
- **`--save <file>`** writes the collected fields to a JSON report.
- **`--version`** prints git-tagged version baked in at build time.
- **Colored, aligned console output** (auto-disabled in pipes / `NO_COLOR` /
  legacy consoles).
- **`ITSM_APP_URL` env override** in addition to the baked-in URL and `--url`.
- **Unit tests** for mapping, payload encoding, config precedence, and the
  collectors' pure helpers.

## Directory layout

```
main.go                     CLI: flags, browser-open, output
internal/collect/           platform collectors (build-tagged)
internal/mapfields/         Raw -> form fields (TS parity)
internal/payload/           base64url link builder
internal/config/            URL resolution
internal/ui/                ANSI console helpers
cmd/genicon/                icon generator (stdlib only)
assets/                     icon.png + icon.ico (generated)
winres/winres.json          go-winres resource definition
scripts/build.sh            builds all targets, copies to public/downloads
```

## Build

Prerequisite: Go ≥ 1.22.

```bash
scripts/build.sh            # all targets (reads APP_URL from repo root .env)
scripts/build.sh win        # or one target: win | mac | linux
```

Outputs (also copied to `public/downloads/`, suffixed `-Go` so they don't
clobber the Bun builds):

| Target | Output |
| --- | --- |
| Windows x64 | `ITSM-AssetCollector-Go.exe` |
| macOS arm64 | `itsm-asset-collector-go-macos-arm64` |
| Linux x64 | `itsm-asset-collector-go-linux-x64` |

`APP_URL` is baked via `-ldflags -X main.defaultAppURL=...`; the build fails if
it's not set in the repo root `.env` (override at runtime with `--url` or
`ITSM_APP_URL`).

## Usage (on the target machine)

```
ITSM-AssetCollector-Go.exe                          # open browser, prefilled
ITSM-AssetCollector-Go.exe --save report.json
itsm-asset-collector-go-macos-arm64 --url https://itsm.example.com
itsm-asset-collector-go-linux-x64 --json            # print payload, no browser
./collector --no-open                               # print the URL only
./collector --version
```

Local dev/test:

```bash
go run . --dry-run --no-open --url http://localhost:4000
go run . --dry-run --json
go test ./...
```

## Trust notes

- The URL payload is untrusted **by design** — the web side keeps the same
  zod-whitelist + length caps in `src/lib/asset-prefill.ts`.
- Windows code signing (Authenticode) and macOS notarization are *not* set up,
  same as the original; those are the next step for SmartScreen/Gatekeeper
  trust. The embedded icon/version resources are free polish in the meantime.
- Linux `product_serial` can require root on some kernels — an empty serial is
  left for the technician, as before.