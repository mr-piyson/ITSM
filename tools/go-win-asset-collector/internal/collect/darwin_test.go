package collect

import "testing"

func TestParseMacSize(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"1 TB", "1000000000000"},
		{"512.1 GB", "512100000000"},
		{"16 MB", "16000000"},
		{"500 KB", "500000"},
		{"0", "0"},
		{"", "0"},
		{"weird", "0"},
	}
	for _, tc := range cases {
		if got := parseMacSize(tc.in); got != tc.want {
			t.Errorf("parseMacSize(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}
