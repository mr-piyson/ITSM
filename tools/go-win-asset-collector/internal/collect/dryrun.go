package collect

// DryRun returns the same sample dataset the original collector shipped, for
// testing on machines that can't (or shouldn't) probe real hardware.
func DryRun() *Raw {
	return &Raw{
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
}
