// Package mapfields maps the raw platform snapshot into the asset form fields,
// equivalent to the original collector's src/map.ts so the payload contract
// with /app/assets?new= stays unchanged.
package mapfields

import (
	"math"
	"net"
	"strconv"
	"strings"

	"go-win-asset-collector/internal/collect"
)

// Fields is the payload sent to the ITSM app (the zod-whitelisted keys).
type Fields struct {
	Type         string `json:"type"`
	SerialNumber string `json:"serialNumber"`
	Manufacturer string `json:"manufacturer"`
	Model        string `json:"model"`
	Processor    string `json:"processor"`
	OS           string `json:"os"`
	Memory       string `json:"memory"`
	HDD          string `json:"hdd"`
	DeviceName   string `json:"deviceName"`
	IP           string `json:"ip"`
}

const max = 50

var laptopChassis = map[int]bool{8: true, 9: true, 10: true, 11: true, 12: true, 14: true, 31: true}
var tabletChassis = map[int]bool{30: true, 32: true}

// Map converts raw collected data into the form fields.
func Map(raw *collect.Raw) Fields {
	return Fields{
		Type:         DetectType(raw.Chassis, raw.PCType),
		SerialNumber: truncate(raw.Serial),
		Manufacturer: truncate(raw.Manufacturer),
		Model:        truncate(raw.Model),
		Processor:    truncate(raw.Processor),
		OS:           truncate(raw.OS),
		Memory:       truncate(formatMemory(raw.Memory)),
		HDD:          truncate(formatDisks(raw.Disks)),
		DeviceName:   truncate(raw.Hostname),
		IP:           truncate(firstIP(raw.IPv4)),
	}
}

// DetectType determines Desktop / Laptop / Tablet from the SMBIOS chassis type.
func DetectType(chassis []int, pcType int) string {
	for _, c := range chassis {
		if laptopChassis[c] {
			return "Laptop"
		}
	}
	for _, c := range chassis {
		if tabletChassis[c] {
			return "Tablet"
		}
	}
	if pcType == 2 {
		return "Laptop"
	}
	return "Desktop"
}

// truncate keeps at most max runes, matching the original 50-char clamp.
func truncate(value string) string {
	runes := []rune(value)
	if len(runes) > max {
		return string(runes[:max])
	}
	return value
}

func formatMemory(bytes string) string {
	value, err := strconv.ParseFloat(bytes, 64)
	if err != nil || value <= 0 {
		return ""
	}
	return strconv.FormatInt(int64(math.Round(value/(1024*1024*1024))), 10) + " GB"
}

func formatDisks(disks []collect.Disk) string {
	n := len(disks)
	if n > 2 {
		n = 2
	}
	parts := make([]string, 0, n)
	for _, disk := range disks[:n] {
		size := formatBytes(disk.Size)
		name := truncateRunes(disk.Model, 24)
		switch {
		case name == "":
			parts = append(parts, size)
		case size == "":
			parts = append(parts, name)
		default:
			parts = append(parts, name+" "+size)
		}
	}
	return strings.Join(parts, " + ")
}

func formatBytes(value string) string {
	bytes, err := strconv.ParseFloat(value, 64)
	if err != nil || bytes <= 0 {
		return ""
	}
	size := bytes / 1024 / 1024 / 1024
	unit := "GB"
	if size >= 1024 {
		size /= 1024
		unit = "TB"
	}
	if size >= 100 {
		return strconv.FormatInt(int64(math.Round(size)), 10) + " " + unit
	}
	return strconv.FormatFloat(size, 'f', 1, 64) + " " + unit
}

func firstIP(ips []string) string {
	for _, ip := range ips {
		if net.ParseIP(ip) != nil && net.ParseIP(ip).To4() != nil {
			return ip
		}
	}
	return ""
}

func truncateRunes(value string, maxRunes int) string {
	runes := []rune(value)
	if len(runes) > maxRunes {
		return string(runes[:maxRunes])
	}
	return value
}
