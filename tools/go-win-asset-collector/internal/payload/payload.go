// Package payload builds the /app/assets?new=<base64url> link whose payload the
// ITSM app decodes to prefill the Add New Asset dialog.
package payload

import (
	"bytes"
	"encoding/base64"
	"encoding/json"

	"go-win-asset-collector/internal/mapfields"
)

// BuildLink returns the prefilled ITSM assets URL for the given fields.
func BuildLink(baseURL string, fields mapfields.Fields) string {
	return baseURL + "/app/assets?new=" + Encode(fields)
}

// Encode serializes fields the way JSON.stringify does (no HTML escaping) and
// base64url-encodes it like Node's Buffer.toString("base64url").
func Encode(fields mapfields.Fields) string {
	var buf bytes.Buffer
	enc := json.NewEncoder(&buf)
	enc.SetEscapeHTML(false)
	enc.SetIndent("", "")
	_ = enc.Encode(fields)
	data := buf.Bytes()
	if n := len(data); n > 0 && data[n-1] == '\n' {
		data = data[:n-1]
	}
	return base64.RawURLEncoding.EncodeToString(data)
}
