package payload

import (
	"encoding/base64"
	"encoding/json"
	"testing"

	"go-win-asset-collector/internal/mapfields"
)

func testFields() mapfields.Fields {
	return mapfields.Fields{
		Type:         "Desktop",
		SerialNumber: "S123",
		Manufacturer: "Apple Inc.",
		Model:        "Mac16,10",
		Processor:    "Apple M4",
		OS:           "macOS 27.0",
		Memory:       "16 GB",
		HDD:          "APPLE SSD AP0256Z 228 GB",
		DeviceName:   "mini.local",
		IP:           "10.0.0.8",
	}
}

func TestEncodeDecodesToSameFields(t *testing.T) {
	fields := testFields()
	encoded := Encode(fields)

	if encoded == "" {
		t.Fatal("Encode returned empty string")
	}
	if _, err := base64.RawURLEncoding.DecodeString(encoded); err != nil {
		t.Fatalf("not valid base64url: %v", err)
	}

	decoded := map[string]string{}
	if err := json.Unmarshal(mustDecode(encoded), &decoded); err != nil {
		t.Fatalf("payload is not valid JSON: %v", err)
	}
	if decoded["type"] != fields.Type || decoded["deviceName"] != fields.DeviceName {
		t.Errorf("decode mismatch: %+v", decoded)
	}
}

func TestEncodeUsesUrlSafeAlphabet(t *testing.T) {
	for _, r := range testFields().SerialNumber + testFields().DeviceName {
		_ = r
	}
	encoded := Encode(testFields())
	for _, c := range encoded {
		if c == '+' || c == '/' {
			t.Errorf("found URL-unsafe char %q in %q", c, encoded)
		}
	}
}

func TestBuildLink(t *testing.T) {
	got := BuildLink("http://localhost:4000", testFields())
	want := "http://localhost:4000/app/assets?new=" + Encode(testFields())
	if got != want {
		t.Errorf("BuildLink = %q, want %q", got, want)
	}
}

func mustDecode(s string) []byte {
	data, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		panic(err)
	}
	return data
}
