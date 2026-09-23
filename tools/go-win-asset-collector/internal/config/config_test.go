package config

import (
	"os"
	"testing"
)

func TestResolvePriority(t *testing.T) {
	defer os.Unsetenv("ITSM_APP_URL")

	if got := Resolve("http://baked", ""); got != "http://baked" {
		t.Errorf("no override: got %q", got)
	}
	if got := Resolve("http://baked", "http://flag"); got != "http://flag" {
		t.Errorf("flag should win: got %q", got)
	}
	os.Setenv("ITSM_APP_URL", "http://env/")
	if got := Resolve("http://baked", ""); got != "http://env" {
		t.Errorf("env should win over baked: got %q", got)
	}
	if got := Resolve("http://baked", "http://flag/"); got != "http://flag" {
		t.Errorf("flag should beat env: got %q", got)
	}
}

func TestStripTrailingSlashes(t *testing.T) {
	if got := stripTrailingSlashes("http://a/"); got != "http://a" {
		t.Errorf("got %q", got)
	}
	if got := stripTrailingSlashes("http://a///"); got != "http://a" {
		t.Errorf("got %q", got)
	}
}
