//go:build darwin

package collect

import (
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
)

var macSizeRe = regexp.MustCompile(`(?i)^([\d.]+)\s*(B|KB|MB|GB|TB)$`)

func init() {
	collectPlatform = collectMacos
}

type spHardwareData struct {
	SPHardwareDataType []struct {
		SerialNumber    string `json:"serial_number"`
		MachineModel    string `json:"machine_model"`
		ModelIdentifier string `json:"model_identifier"`
		ModelName       string `json:"model_name"`
	} `json:"SPHardwareDataType"`
}

type spStorageData struct {
	SPStorageDataType []struct {
		Name          string `json:"_name"`
		Size          string `json:"_size"`
		SizeInBytes   *int64 `json:"size_in_bytes"`
		PhysicalDrive struct {
			DeviceName string `json:"device_name"`
		} `json:"physical_drive"`
	} `json:"SPStorageDataType"`
}

func collectMacos() (*Raw, error) {
	raw := &Raw{
		Manufacturer: "Apple Inc.",
		Hostname:     hostname(),
		IPv4:         firstIPv4(),
	}

	// Hardware identity (serial / model).
	if stdout, err := run("system_profiler", "SPHardwareDataType", "-json"); err == nil {
		var parsed spHardwareData
		if json.Unmarshal([]byte(stdout), &parsed) == nil && len(parsed.SPHardwareDataType) > 0 {
			item := parsed.SPHardwareDataType[0]
			raw.Serial = item.SerialNumber
			raw.Model = firstNonEmpty(item.ModelIdentifier, item.MachineModel, item.ModelName)
			modelName := firstNonEmpty(item.MachineModel, item.ModelName)
			if strings.Contains(modelName, "mini") || strings.Contains(modelName, "book") {
				raw.PCType = 2
			} else {
				raw.PCType = 1
			}
		}
	}
	if raw.PCType == 0 {
		raw.PCType = 1
	}

	// Memory.
	if stdout, err := run("sysctl", "-n", "hw.memsize"); err == nil {
		raw.Memory = strings.TrimSpace(stdout)
	}

	// Processor. Apple Silicon may not expose machdep.cpu.brand_string.
	if stdout, err := run("sysctl", "-n", "machdep.cpu.brand_string"); err == nil {
		raw.Processor = strings.TrimSpace(stdout)
	} else if stdout, err := run("sysctl", "-n", "hw.model"); err == nil {
		raw.Processor = strings.TrimSpace(stdout)
	}

	// OS name + version.
	productName, errName := run("sw_vers", "-productName")
	productVersion, errVersion := run("sw_vers", "-productVersion")
	if errName == nil && errVersion == nil {
		raw.OS = strings.TrimSpace(productName) + " " + strings.TrimSpace(productVersion)
	}

	// Storage volumes.
	if stdout, err := run("system_profiler", "SPStorageDataType", "-json"); err == nil {
		var parsed spStorageData
		if json.Unmarshal([]byte(stdout), &parsed) == nil {
			raw.Disks = dedupeDisks(parsed.SPStorageDataType)
		}
	}
	return raw, nil
}

func dedupeDisks(items []struct {
	Name          string `json:"_name"`
	Size          string `json:"_size"`
	SizeInBytes   *int64 `json:"size_in_bytes"`
	PhysicalDrive struct {
		DeviceName string `json:"device_name"`
	} `json:"physical_drive"`
}) []Disk {
	disks := []Disk{}
	seen := map[string]bool{}
	for _, item := range items {
		model := firstNonEmpty(item.PhysicalDrive.DeviceName, item.Name)
		size := "0"
		if item.SizeInBytes != nil {
			size = strconv.FormatInt(*item.SizeInBytes, 10)
		} else {
			size = parseMacSize(item.Size)
		}
		if toNumber(size) <= 0 {
			continue
		}
		key := model + ":" + size
		if seen[key] {
			continue
		}
		seen[key] = true
		disks = append(disks, Disk{Model: model, Size: size})
	}
	return disks
}

// parseMacSize converts system_profiler sizes like "1 TB" or "512.1 GB" to
// bytes; unparseable input becomes "0" (mirroring the original behavior).
func parseMacSize(size string) string {
	match := macSizeRe.FindStringSubmatch(strings.TrimSpace(size))
	if match == nil {
		return "0"
	}
	value, err := strconv.ParseFloat(match[1], 64)
	if err != nil || value <= 0 {
		return "0"
	}
	multipliers := map[string]float64{"B": 1, "KB": 1e3, "MB": 1e6, "GB": 1e9, "TB": 1e12}
	multiplier, ok := multipliers[strings.ToUpper(match[2])]
	if !ok {
		return "0"
	}
	return strconv.FormatInt(int64(value*multiplier+0.5), 10)
}

func toNumber(s string) float64 {
	n, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return n
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
