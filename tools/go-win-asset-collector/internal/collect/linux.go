//go:build linux

package collect

import (
	"encoding/json"
	"os"
	"regexp"
	"strconv"
	"strings"
)

var (
	cpuNameRe    = regexp.MustCompile(`(?i)(?:model name|Hardware)\s*:\s*(.+)`)
	prettyNameRe = regexp.MustCompile(`(?m)^PRETTY_NAME\s*=\s*"?([^"\n]+)"?`)
	memTotalRe   = regexp.MustCompile(`(?im)^MemTotal:\s*(\d+)\s*kB`)
)

func init() {
	collectPlatform = collectLinux
}

func collectLinux() (*Raw, error) {
	raw := &Raw{
		Serial:       readSysfs("/sys/class/dmi/id/product_serial"),
		Manufacturer: readSysfs("/sys/class/dmi/id/sys_vendor"),
		Model:        readSysfs("/sys/class/dmi/id/product_name"),
		Hostname:     hostname(),
		IPv4:         firstIPv4(),
	}

	if match := cpuNameRe.FindStringSubmatch(readSysfs("/proc/cpuinfo")); len(match) > 1 {
		raw.Processor = strings.TrimSpace(match[1])
	}
	if match := prettyNameRe.FindStringSubmatch(readSysfs("/etc/os-release")); len(match) > 1 {
		raw.OS = strings.TrimSpace(match[1])
	}
	if match := memTotalRe.FindStringSubmatch(readSysfs("/proc/meminfo")); len(match) > 1 {
		if kb, err := strconv.ParseUint(match[1], 10, 64); err == nil {
			raw.Memory = strconv.FormatUint(kb*1024, 10)
		}
	}
	if chassis := readSysfs("/sys/class/dmi/id/chassis_type"); chassis != "" {
		if n, err := strconv.Atoi(chassis); err == nil {
			raw.Chassis = []int{n}
		}
	}

	if disks, err := lsblkDisks(); err == nil && len(disks) > 0 {
		raw.Disks = disks
	} else {
		raw.Disks = sysfsDisks()
	}
	return raw, nil
}

func lsblkDisks() ([]Disk, error) {
	stdout, err := run("lsblk", "-b", "-d", "-J", "-o", "NAME,MODEL,SIZE,TYPE")
	if err != nil {
		return nil, err
	}
	var parsed struct {
		Blockdevices []struct {
			Name  string `json:"name"`
			Model string `json:"model"`
			Size  string `json:"size"`
			Type  string `json:"type"`
		} `json:"blockdevices"`
	}
	if err := json.Unmarshal([]byte(stdout), &parsed); err != nil {
		return nil, err
	}
	disks := []Disk{}
	for _, device := range parsed.Blockdevices {
		size, err := strconv.ParseUint(device.Size, 10, 64)
		if err != nil || size == 0 || device.Type != "disk" {
			continue
		}
		disks = append(disks, Disk{Model: device.Model, Size: strconv.FormatUint(size, 10)})
	}
	return disks, nil
}

func sysfsDisks() []Disk {
	disks := []Disk{}
	root := "/sys/block"
	entries, err := os.ReadDir(root)
	if err != nil {
		return disks
	}
	for _, entry := range entries {
		name := entry.Name()
		if strings.HasPrefix(name, "loop") || strings.HasPrefix(name, "ram") {
			continue
		}
		model := readSysfs(root + "/" + name + "/device/model")
		size := readSysfs(root + "/" + name + "/size")
		if size == "" {
			continue
		}
		// /sys/block/*/size is in 512-byte sectors.
		sectors, err := strconv.ParseUint(size, 10, 64)
		if err != nil {
			continue
		}
		disks = append(disks, Disk{Model: model, Size: strconv.FormatUint(sectors*512, 10)})
	}
	return disks
}
