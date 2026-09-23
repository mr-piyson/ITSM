//go:build windows

package collect

import (
	"fmt"
	"net"
	"strconv"

	"github.com/yusufpapurcu/wmi"
)

// CIM structures mirror the exact Win32_* properties the original PowerShell
// collector queried. Queries run over WMI/COM directly — no PowerShell, no
// -ExecutionPolicy Bypass — which corporate AV/EDR trusts far more.

type cimBIOS struct {
	SerialNumber string
}

type cimComputerSystem struct {
	Manufacturer        string
	Model               string
	TotalPhysicalMemory uint64
	PCSystemType        uint16
}

type cimOperatingSystem struct {
	Caption string
}

type cimProcessor struct {
	Name string
}

type cimSystemEnclosure struct {
	ChassisTypes []uint16
}

type cimDiskDrive struct {
	Model string
	Size  uint64
}

type cimNetworkAdapter struct {
	IPAddress []string
}

func init() {
	collectPlatform = collectWindows
}

func collectWindows() (*Raw, error) {
	raw := &Raw{}

	var bios []cimBIOS
	if err := wmi.Query("SELECT SerialNumber FROM Win32_BIOS", &bios); err != nil {
		return nil, fmt.Errorf("Win32_BIOS: %w", err)
	}
	if len(bios) > 0 {
		raw.Serial = bios[0].SerialNumber
	}

	var cs []cimComputerSystem
	if err := wmi.Query("SELECT Manufacturer, Model, TotalPhysicalMemory, PCSystemType FROM Win32_ComputerSystem", &cs); err != nil {
		return nil, fmt.Errorf("Win32_ComputerSystem: %w", err)
	}
	if len(cs) > 0 {
		raw.Manufacturer = cs[0].Manufacturer
		raw.Model = cs[0].Model
		raw.PCType = int(cs[0].PCSystemType)
		raw.Memory = strconv.FormatUint(cs[0].TotalPhysicalMemory, 10)
	}

	var os []cimOperatingSystem
	if err := wmi.Query("SELECT Caption FROM Win32_OperatingSystem", &os); err != nil {
		return nil, fmt.Errorf("Win32_OperatingSystem: %w", err)
	}
	if len(os) > 0 {
		raw.OS = os[0].Caption
	}

	var proc []cimProcessor
	if err := wmi.Query("SELECT Name FROM Win32_Processor", &proc); err != nil {
		return nil, fmt.Errorf("Win32_Processor: %w", err)
	}
	if len(proc) > 0 {
		raw.Processor = proc[0].Name
	}

	var encl []cimSystemEnclosure
	if err := wmi.Query("SELECT ChassisTypes FROM Win32_SystemEnclosure", &encl); err != nil {
		return nil, fmt.Errorf("Win32_SystemEnclosure: %w", err)
	}
	if len(encl) > 0 {
		for _, chassis := range encl[0].ChassisTypes {
			raw.Chassis = append(raw.Chassis, int(chassis))
		}
	}

	var disks []cimDiskDrive
	if err := wmi.Query("SELECT Model, Size FROM Win32_DiskDrive", &disks); err != nil {
		return nil, fmt.Errorf("Win32_DiskDrive: %w", err)
	}
	for _, disk := range disks {
		raw.Disks = append(raw.Disks, Disk{Model: disk.Model, Size: strconv.FormatUint(disk.Size, 10)})
	}

	var netcfgs []cimNetworkAdapter
	if err := wmi.Query("SELECT IPAddress FROM Win32_NetworkAdapterConfiguration WHERE IPEnabled = True", &netcfgs); err != nil {
		return nil, fmt.Errorf("Win32_NetworkAdapterConfiguration: %w", err)
	}
	for _, cfg := range netcfgs {
		for _, ip := range cfg.IPAddress {
			parsed := net.ParseIP(ip)
			if parsed != nil && parsed.To4() != nil {
				raw.IPv4 = append(raw.IPv4, ip)
			}
		}
	}

	raw.Hostname = hostname()
	return raw, nil
}
