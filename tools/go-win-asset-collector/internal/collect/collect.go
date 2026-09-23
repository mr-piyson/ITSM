package collect

import (
	"net"
	"os"
	"os/exec"
	"runtime"
	"strings"
)

// Disk mirrors a raw disk node (size is bytes as a string, same shape the
// original collector produced so the field mapping stays identical).
type Disk struct {
	Model string `json:"model"`
	Size  string `json:"size"`
}

// Raw is the un-mapped, platform-collected snapshot of the machine.
type Raw struct {
	Serial       string
	Manufacturer string
	Model        string
	Processor    string
	OS           string
	Memory       string // bytes, decimal string
	Chassis      []int
	PCType       int
	Disks        []Disk
	IPv4         []string
	Hostname     string
}

// collectPlatform is set by each platform collector's init to route Collect.
var collectPlatform func() (*Raw, error)

// Collect dispatches to the platform collector. On unsupported platforms it
// returns a descriptive error so callers can suggest --dry-run.
func Collect() (*Raw, error) {
	if collectPlatform == nil {
		return nil, &UnsupportedError{S: runtime.GOOS}
	}
	return collectPlatform()
}

// UnsupportedError identifies platforms the collectors don't implement.
type UnsupportedError struct{ S string }

func (e *UnsupportedError) Error() string {
	return "unsupported platform \"" + e.S + "\"; use --dry-run to test with sample data"
}

// run executes a command and returns trimmed stdout, raising an error when it
// fails so collectors can fall back gracefully.
func run(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	var stdout, stderr strings.Builder
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		msg := strings.TrimSpace(stderr.String())
		if msg == "" {
			msg = "no output"
		}
		return "", &CommandError{Name: name, Err: err, Stderr: msg}
	}
	return strings.TrimSpace(stdout.String()), nil
}

// CommandError wraps a failing external command with its captured stderr.
type CommandError struct {
	Name   string
	Err    error
	Stderr string
}

func (e *CommandError) Error() string {
	return e.Name + " failed: " + e.Stderr
}

func (e *CommandError) Unwrap() error { return e.Err }

// readSysfs reads a sysfs-style text file, treating missing files and O.E.M.
// placeholder values as empty (same semantics as the original collector).
func readSysfs(path string) string {
	b, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	v := strings.TrimSpace(string(b))
	if v == "To be filled by O.E.M." {
		return ""
	}
	return v
}

// firstIPv4 returns the non-loopback IPv4 addresses of this host.
func firstIPv4() []string {
	ips := []string{}
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ips
	}
	for _, addr := range addrs {
		ipnet, ok := addr.(*net.IPNet)
		if !ok {
			continue
		}
		ip := ipnet.IP.To4()
		if ip == nil || ip.IsLoopback() {
			continue
		}
		ips = append(ips, ip.String())
	}
	return ips
}

func hostname() string {
	h, err := os.Hostname()
	if err != nil {
		return ""
	}
	return h
}
