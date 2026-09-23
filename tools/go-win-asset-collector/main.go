// ITSM Asset Collector (Go)
//
// Collects hardware info from the current machine and opens the ITSM
// "Add New Asset" dialog prefilled via /app/assets?new=<base64url>.
// Same payload contract as the original tools/win-asset-collector.
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"

	"go-win-asset-collector/internal/collect"
	"go-win-asset-collector/internal/config"
	"go-win-asset-collector/internal/mapfields"
	"go-win-asset-collector/internal/payload"
	"go-win-asset-collector/internal/ui"
)

// Injected at build time via -ldflags -X (see scripts/build.sh).
var (
	defaultAppURL = ""
	version       = "dev"
	commit        = "none"
)

type flags struct {
	url     string
	dryRun  bool
	json    bool
	noOpen  bool
	save    string
	help    bool
	version bool
}

func main() {
	f, err := parseFlags(os.Args[1:])
	if err != nil {
		fmt.Fprintln(os.Stderr, "Error: "+err.Error())
		printHelp()
		os.Exit(1)
	}
	if f.help {
		printHelp()
		return
	}
	if f.version {
		printVersion()
		return
	}

	appURL := config.Resolve(defaultAppURL, f.url)
	if appURL == "" {
		fmt.Fprintln(os.Stderr, "No ITSM URL configured. Pass --url <url>, set ITSM_APP_URL, or build with APP_URL set in .env.")
		os.Exit(1)
	}

	ui.Banner("ITSM ASSET COLLECTOR")

	var raw *collect.Raw
	if f.dryRun {
		raw = collect.DryRun()
		ui.Warn("Using sample data (--dry-run).")
	} else {
		raw, err = collect.Collect()
		if err != nil {
			fmt.Fprintln(os.Stderr, "Failed to collect hardware info: "+err.Error())
			os.Exit(1)
		}
	}

	fields := mapfields.Map(raw)
	if f.json {
		rawJSON, _ := json.MarshalIndent(fields, "", "  ")
		fmt.Println(string(rawJSON))
		return
	}
	if f.save != "" {
		rawJSON, _ := json.MarshalIndent(fields, "", "  ")
		if err := os.WriteFile(f.save, append(rawJSON, '\n'), 0o644); err != nil {
			fmt.Fprintln(os.Stderr, "Failed to save report: "+err.Error())
			os.Exit(1)
		}
		ui.Success("Report saved to " + f.save)
	}

	link := payload.BuildLink(appURL, fields)
	ui.Fields(rowsOf(fields))

	if f.noOpen {
		ui.Info("Assets URL (--no-open):")
		ui.Link("URL", link)
		return
	}

	if err := openInBrowser(link); err != nil {
		fmt.Fprintln(os.Stderr, "Failed to open browser: "+err.Error())
		fmt.Fprintln(os.Stderr, "Open this URL manually:")
		fmt.Fprintln(os.Stderr, "  "+link)
		os.Exit(1)
	}
	ui.Success("Opened the ITSM 'Add New Asset' dialog.")
	ui.Link("URL", link)
	ui.PromptClose()
}

// rowsOf returns the fields in the same order as the web form.
func rowsOf(f mapfields.Fields) [][2]string {
	return [][2]string{
		{"type", f.Type},
		{"serialNumber", f.SerialNumber},
		{"manufacturer", f.Manufacturer},
		{"model", f.Model},
		{"processor", f.Processor},
		{"os", f.OS},
		{"memory", f.Memory},
		{"hdd", f.HDD},
		{"deviceName", f.DeviceName},
		{"ip", f.IP},
	}
}

func openInBrowser(url string) error {
	switch runtime.GOOS {
	case "windows":
		// rundll32 avoids cmd.exe quoting pitfalls with the base64 payload.
		return exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Run()
	case "darwin":
		return exec.Command("open", url).Run()
	default:
		return exec.Command("xdg-open", url).Run()
	}
}

func parseFlags(args []string) (*flags, error) {
	f := &flags{}
	for i := 0; i < len(args); i++ {
		arg := args[i]
		switch {
		case arg == "--url":
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return nil, fmt.Errorf("--url requires a value")
			}
			i++
			f.url = args[i]
		case strings.HasPrefix(arg, "--url="):
			f.url = strings.TrimPrefix(arg, "--url=")
		case arg == "--dry-run":
			f.dryRun = true
		case arg == "--json":
			f.json = true
		case arg == "--no-open":
			f.noOpen = true
		case arg == "--save":
			if i+1 >= len(args) || strings.HasPrefix(args[i+1], "--") {
				return nil, fmt.Errorf("--save requires a file path")
			}
			i++
			f.save = args[i]
		case strings.HasPrefix(arg, "--save="):
			f.save = strings.TrimPrefix(arg, "--save=")
		case arg == "--help" || arg == "-h" || arg == "-?":
			f.help = true
		case arg == "--version":
			f.version = true
		default:
			if !strings.HasPrefix(arg, "--") {
				f.url = arg
			} else {
				return nil, fmt.Errorf("unknown option: %s", arg)
			}
		}
	}
	return f, nil
}

func printHelp() {
	fmt.Println(`ITSM Asset Collector
Collects hardware info from this PC and opens the ITSM "Add New Asset" dialog prefilled.

Usage:
  ITSM-AssetCollector-Go.exe [options]

Options:
  --url <url>     Override the ITSM base URL baked into this build
  --save <file>   Write the collected fields to a JSON report file
  --json          Print the collected payload as JSON (no browser)
  --dry-run       Use sample data (for testing on non-Windows)
  --no-open       Collect data and print the link without opening the browser
  --version       Print the collector version
  --help          Show this help`)
}

func printVersion() {
	fmt.Printf("ITSM Asset Collector %s (commit %s, %s/%s)\n", version, commit, runtime.GOOS, runtime.GOARCH)
}
