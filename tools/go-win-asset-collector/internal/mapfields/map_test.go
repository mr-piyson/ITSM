package mapfields

import (
	"testing"

	"go-win-asset-collector/internal/collect"
)

func TestDetectType(t *testing.T) {
	cases := []struct {
		name    string
		chassis []int
		pcType  int
		want    string
	}{
		{"notebook", []int{10}, 0, "Laptop"},
		{"convertible", []int{31}, 0, "Laptop"},
		{"tablet", []int{30}, 0, "Tablet"},
		{"desktop pc type only", nil, 2, "Laptop"},
		{"desktop", []int{3}, 0, "Desktop"},
		{"no data falls back to desktop", nil, 0, "Desktop"},
		{"pc type wins over desktop chassis (TS parity)", []int{3}, 2, "Laptop"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := DetectType(tc.chassis, tc.pcType); got != tc.want {
				t.Errorf("DetectType(%v,%d) = %q, want %q", tc.chassis, tc.pcType, got, tc.want)
			}
		})
	}
}

func TestFormatMemory(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"34610982912", "32 GB"},
		{"8589934592", "8 GB"},
		{"0", ""},
		{"garbage", ""},
	}
	for _, tc := range cases {
		if got := formatMemory(tc.in); got != tc.want {
			t.Errorf("formatMemory(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestFormatDisks(t *testing.T) {
	disks := []collect.Disk{
		{Model: "Samsung SSD 990 PRO 1TB", Size: "1000204886016"},
		{Model: "AVeryVeryLongDiskModelNameThatGetsTruncated", Size: "500107862016"},
		{Model: "Third disk ignored", Size: "1024"},
	}
	want := "Samsung SSD 990 PRO 1TB 932 GB + AVeryVeryLongDiskModelNa 466 GB"
	if got := formatDisks(disks); got != want {
		t.Errorf("formatDisks = %q, want %q", got, want)
	}
}

func TestMapDryRunParity(t *testing.T) {
	got := Map(collect.DryRun())
	// Values below match the original TypeScript collector's dry-run output.
	want := Fields{
		Type:         "Tablet",
		SerialNumber: "CN-X1234-5678-9A0B",
		Manufacturer: "Dell Inc.",
		Model:        "Precision 5480",
		Processor:    "Intel(R) Core(TM) Ultra 7 155H",
		OS:           "Microsoft Windows 11 Pro",
		Memory:       "32 GB",
		HDD:          "Samsung SSD 990 PRO 1TB 932 GB + WDC WDS500G2B0A-0",
		DeviceName:   "NEWPC-001",
		IP:           "192.168.10.15",
	}
	if got != want {
		t.Errorf("Map(DryRun()) mismatch:\n got=%+v\nwant=%+v", got, want)
	}
}

func TestFirstIP(t *testing.T) {
	cases := []struct {
		ips  []string
		want string
	}{
		{[]string{"fe80::1", "10.0.0.5"}, "10.0.0.5"},
		{[]string{"not-an-ip", "2001:db8::1"}, ""},
		{nil, ""},
	}
	for _, tc := range cases {
		if got := firstIP(tc.ips); got != tc.want {
			t.Errorf("firstIP(%v) = %q, want %q", tc.ips, got, tc.want)
		}
	}
}

func TestTruncateStaysOnRuneBoundary(t *testing.T) {
	long := "x" + "y"
	for i := 0; i < 60; i++ {
		long += "\u00e9"
	}
	got := truncate(long)
	if len([]rune(got)) != max {
		t.Errorf("truncate length = %d, want %d", len([]rune(got)), max)
	}
}
