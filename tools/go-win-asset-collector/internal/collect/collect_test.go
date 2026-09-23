package collect

import (
	"reflect"
	"testing"
)

func TestDryRunShape(t *testing.T) {
	raw := DryRun()
	want := &Raw{
		Serial:       "CN-X1234-5678-9A0B",
		Manufacturer: "Dell Inc.",
		Model:        "Precision 5480",
		Processor:    "Intel(R) Core(TM) Ultra 7 155H",
		OS:           "Microsoft Windows 11 Pro",
		Memory:       "34610982912",
		Chassis:      []int{30},
		PCType:       2,
		Disks: []Disk{
			{Model: "Samsung SSD 990 PRO 1TB", Size: "1000204886016"},
			{Model: "WDC WDS500G2B0A-00SM50", Size: "500107862016"},
		},
		IPv4:     []string{"192.168.10.15"},
		Hostname: "NEWPC-001",
	}
	if !reflect.DeepEqual(raw, want) {
		t.Errorf("DryRun mismatch:\n got=%+v\nwant=%+v", raw, want)
	}
}

func TestFirstIPv4ExcludesLoopback(t *testing.T) {
	ips := firstIPv4()
	for _, ip := range ips {
		if ip == "127.0.0.1" || ip == "::1" {
			t.Errorf("loopback address leaked: %q", ip)
		}
	}
}

func TestReadSysfsIgnoresPlaceholders(t *testing.T) {
	if got := readSysfs("/nonexistent"); got != "" {
		t.Errorf("missing file should be empty, got %q", got)
	}
}
