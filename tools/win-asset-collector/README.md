# ITSM Asset Collector

A standalone single-file executable that collects hardware info from a PC and
opens the ITSM **Add New Asset** dialog with the fields already filled in.

Built for **Windows**, **macOS**, and **Linux** from a single machine (Bun's
cross-compilation bundles the Bun runtime into each binary — no dependencies on
the target systems).

## How it works

1. Reads PC specs: WMI via PowerShell on Windows, DMI sysfs + `/proc` + `lsblk`
   on Linux, `system_profiler` + `sysctl` + `sw_vers` on macOS.
2. Maps them to the asset form fields (`type` auto-detected as Desktop / Laptop /
   Tablet from the SMBIOS chassis type).
3. Builds `/app/assets?new=<base64url>` and opens it in the default browser.
4. The ITSM app opens the dialog prefilled and auto-generates the asset code; the
   technician picks `location`, `department`, and `owner`, then submits.

## Build

```bash
bun install
bun run build                 # all targets (reads APP_URL from the repo root .env)
bun run build:win             #    or a single target
bun run build:mac
bun run build:linux
```

Builds run with a pinned Bun (`bunx bun@1.4.2`, downloaded on first use) so the
macOS ARM binary carries a valid signature on current macOS. Outputs in `dist/`:

| Target | Build | Output |
| --- | --- | --- |
| Windows x64 | `build:win` | `ITSM-AssetCollector.exe` |
| macOS arm64 | `build:mac` | `itsm-asset-collector-macos-arm64` |
| Linux x64 | `build:linux` | `itsm-asset-collector-linux-x64` |

`APP_URL` is baked into each binary from the repo root `.env`; the build fails if
it is unset (pass `--url` at runtime to override).

## Usage (on the target machine)

```
ITSM-AssetCollector.exe                 # open browser with prefilled dialog
itsm-asset-collector-macos-arm64 --url https://itsm.example.com
itsm-asset-collector-linux-x64 --json   # print the collected payload, no browser
./collector --no-open                   # print the assets URL without opening
./collector --help
```

Non-Windows (e.g. testing the web flow on a dev Mac):

```bash
bun run src/index.ts --dry-run --no-open --url http://localhost:4000
```

## Dev notes

- `src/build-config.ts` is a committed stub; `scripts/build.ts` overwrites it with
  the repo root `.env` `APP_URL` before compiling. Rebuild if the URL changes.
- The URL payload is untrusted by design: `src/lib/asset-prefill.ts` on the web
  side whitelists keys, clamps lengths, and validates `type` before prefill.
- Linux: reading `/sys/class/dmi/id/product_serial` can require `root` on some
  kernels — an empty serial leaves the required field for the technician to fill.
- The build script pins Bun **>= 1.4.2**. Older Bun versions embed an adhoc
  signature in the macOS arm64 binary that macOS 26+/27 rejects (`Killed: 9`
  before `main` runs). Keep the pinned version — never compile the macOS target
  with an older Bun.
- Windows and Linux binaries are cross-compiled; smoke-test them on real hardware
  (a Windows PC / Linux desktop) since they can't execute on the build machine.