// Package config resolves the ITSM base URL: --url flag overrides an optional
// ITSM_APP_URL env var, which overrides the URL baked in at build time.
package config

import (
	"os"
	"strings"
)

// Resolve returns the application base URL with a single trailing slash.
func Resolve(baked string, flag string) string {
	value := ""
	switch {
	case flag != "":
		value = flag
	case os.Getenv("ITSM_APP_URL") != "":
		value = os.Getenv("ITSM_APP_URL")
	default:
		value = baked
	}
	return stripTrailingSlashes(value)
}

func stripTrailingSlashes(url string) string {
	for strings.HasSuffix(url, "/") {
		url = strings.TrimSuffix(url, "/")
	}
	return url
}
