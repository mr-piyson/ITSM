// Package ui renders the console output: a compact help/vars-style layout with
// ANSI colors when the terminal supports them (never in pipes, never when
// NO_COLOR is set, and never on legacy Windows consoles).
package ui

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

const (
	reset  = "\x1b[0m"
	bold   = "\x1b[1m"
	cyan   = "\x1b[36m"
	green  = "\x1b[32m"
	yellow = "\x1b[33m"
	dim    = "\x1b[2m"
)

var (
	colorEnabled       = detectColor(os.Stdout)
	stderrColorEnabled = detectColor(os.Stderr)
)

func detectColor(out *os.File) bool {
	if os.Getenv("NO_COLOR") != "" {
		return false
	}
	stat, err := out.Stat()
	if err != nil || stat.Mode()&os.ModeCharDevice == 0 {
		return false
	}
	if os.Getenv("TERM") == "dumb" {
		return false
	}
	return true
}

func c(code, s string) string {
	if !colorEnabled {
		return s
	}
	return code + s + reset
}

func ce(code, s string) string {
	if !stderrColorEnabled {
		return s
	}
	return code + s + reset
}

// Banner draws the app title banner shown at startup.
func Banner(title string) {
	fmt.Println()
	fmt.Println(c(bold+cyan, "  "+title))
}

// Fields prints the mapped asset fields aligned in columns.
func Fields(rows [][2]string) {
	width := 0
	for _, row := range rows {
		if len(row[0]) > width {
			width = len(row[0])
		}
	}
	for _, row := range rows {
		label := row[0]
		if label != "" {
			label = strings.ToUpper(label) + "  "
		}
		fmt.Printf("  %s%s\n", c(cyan+dim, label), c(bold, row[1]))
	}
	fmt.Println()
}

// Link prints the final ITSM link prominently.
func Link(label, url string) {
	fmt.Printf("  %s%s\n", c(cyan+dim, strings.ToUpper(label)+"  "), c(green+bold, url))
	fmt.Println()
}

// Info prints a neutral status line (used for --json, --no-open output).
func Info(line string) {
	fmt.Println(c(dim, line))
}

// Success prints a green confirmation line.
func Success(line string) {
	fmt.Println(c(bold+green, line))
}

// Warn prints a yellow warning.
func Warn(line string) {
	fmt.Fprintln(os.Stderr, ce(yellow, line))
}

// PromptClose waits for Enter when stdin is an interactive terminal.
func PromptClose() {
	stat, err := os.Stdin.Stat()
	if err != nil || stat.Mode()&os.ModeCharDevice == 0 {
		return
	}
	fmt.Print(c(dim, "  Press Enter to close... "))
	reader := bufio.NewReader(os.Stdin)
	_, _ = reader.ReadBytes('\n')
}
