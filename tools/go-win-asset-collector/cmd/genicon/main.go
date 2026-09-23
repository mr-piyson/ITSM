// Command genicon renders the collector's app icon (laptop + green "verified"
// badge) to assets/icon.png and assets/icon.ico. Pure standard library.
package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"os"
	"path/filepath"
)

const supersample = 1024

func main() {
	root := filepath.Join(moduleRoot(), "assets")
	if err := os.MkdirAll(root, 0o755); err != nil {
		fatal(err)
	}

	src := render(supersample)

	sizes := []int{16, 24, 32, 48, 64, 128, 256}
	frames := make([][]byte, 0, len(sizes))
	for _, size := range sizes {
		img := downsample(src, size)
		if size == 256 {
			frames = append(frames, encodePNGFrame(img))
		} else {
			frames = append(frames, encodeBMPFrame(img))
		}
	}
	if err := writeFile(filepath.Join(root, "icon.ico"), encodeICO(frames, sizes)); err != nil {
		fatal(err)
	}

	// Also save the 256px PNG for docs / web previews.
	var buf bytes.Buffer
	if err := png.Encode(&buf, downsample(src, 256)); err != nil {
		fatal(err)
	}
	if err := writeFile(filepath.Join(root, "icon.png"), buf.Bytes()); err != nil {
		fatal(err)
	}

	fmt.Println("Generated assets/icon.png and assets/icon.ico")
}

// --- drawing ----------------------------------------------------------------

func render(size int) *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, size, size))

	bgTop := nrgb(0x0f, 0x17, 0x2a) // slate-900
	bgBottom := nrgb(0x1e, 0x29, 0x3b)
	for y := 0; y < size; y++ {
		t := float64(y) / float64(size-1)
		c := lerp(bgTop, bgBottom, t)
		for x := 0; x < size; x++ {
			img.SetNRGBA(x, y, c)
		}
	}

	// Soft vignette in the corners for depth.
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			dx := float64(x - size/2)
			dy := float64(y - size/2)
			d := math.Sqrt(dx*dx+dy*dy) / float64(size)
			if d > 0.62 {
				alpha := uint8(255 * math.Min(((d-0.62)/0.12), 0.35))
				over(img, x, y, color.NRGBA{R: 0, G: 0, B: 0, A: alpha})
			}
		}
	}

	// Laptop glyph.
	panelOuter := roundedRect(272, 220, 752, 560, 30)
	panelScreen := roundedRect(300, 244, 724, 532, 16)
	base := roundedRect(232, 576, 792, 664, 26)
	trackpad := roundedRect(388, 600, 636, 646, 12)

	screenTop := nrgb(0x06, 0xb6, 0xd4) // cyan-500
	screenBottom := nrgb(0x25, 0x63, 0xeb)
	lightPanel := nrgb(0xf1, 0xf5, 0xf9)
	darkOnLight := nrgb(0xcb, 0xd5, 0xe1)

	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			switch {
			case base.hit(x, y):
				img.SetNRGBA(x, y, lightPanel)
			case trackpad.hit(x, y):
				img.SetNRGBA(x, y, darkOnLight)
			case panelOuter.hit(x, y):
				img.SetNRGBA(x, y, lightPanel)
			case panelScreen.hit(x, y):
				t := float64(y) / float64(size)
				img.SetNRGBA(x, y, lerp(screenTop, screenBottom, t))
			}
		}
	}

	// A thin darker edge under the display for separation.
	strokeRect(272, 560, 752, 566, img, darkOnLight)

	// Green verification badge, bottom right.
	badge := circle(760, 766, 118)
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			if badge.hit(x, y) {
				img.SetNRGBA(x, y, nrgb(0x22, 0xc5, 0x5e)) // green-500
			}
		}
	}
	// White ring inset.
	ring := circle(760, 766, 86)
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			if ring.hit(x, y) {
				img.SetNRGBA(x, y, nrgb(0xff, 0xff, 0xff))
			}
		}
	}
	fillRing := circle(760, 766, 66)
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			if fillRing.hit(x, y) {
				img.SetNRGBA(x, y, nrgb(0x22, 0xc5, 0x5e))
			}
		}
	}

	// White check mark inside the badge.
	checkLines := [][4]int{{710, 772, 746, 806}, {746, 806, 826, 712}}
	for _, ln := range checkLines {
		drawThickLine(img, ln[0], ln[1], ln[2], ln[3], 34, border)
	}
	return img
}

var border = color.NRGBA{R: 0xff, G: 0xff, B: 0xff, A: 0xff}

// over alpha-blends src onto the canvas pixel (straight-alpha).
func over(img *image.NRGBA, x, y int, src color.NRGBA) {
	dst := img.NRGBAAt(x, y)
	sa := float64(src.A) / 255
	da := float64(dst.A) / 255
	out := color.NRGBA{
		R: uint8(float64(src.R)*sa + float64(dst.R)*da*(1-sa)),
		G: uint8(float64(src.G)*sa + float64(dst.G)*da*(1-sa)),
		B: uint8(float64(src.B)*sa + float64(dst.B)*da*(1-sa)),
		A: uint8(255*(sa+da*(1-sa)) + 0.5),
	}
	img.SetNRGBA(x, y, out)
}

func drawThickLine(img *image.NRGBA, x0, y0, x1, y1, thickness int, col color.NRGBA) {
	minX, maxX := minmax(x0, x1)
	minY, maxY := minmax(y0, y1)
	r := float64(thickness) / 2
	for y := minY - thickness; y <= maxY+thickness; y++ {
		for x := minX - thickness; x <= maxX+thickness; x++ {
			if distToSegment(float64(x)+0.5, float64(y)+0.5, float64(x0), float64(y0), float64(x1), float64(y1)) <= r {
				if x >= 0 && y >= 0 && x < img.Rect.Dx() && y < img.Rect.Dy() {
					img.SetNRGBA(x, y, col)
				}
			}
		}
	}
}

func strokeRect(x1, y1, x2, y2 int, img *image.NRGBA, col color.NRGBA) {
	for y := y1; y < y2; y++ {
		for x := x1; x < x2; x++ {
			if y >= 0 && x >= 0 && x < img.Rect.Dx() && y < img.Rect.Dy() {
				img.SetNRGBA(x, y, col)
			}
		}
	}
}

// --- predicates --------------------------------------------------------------

type shape struct {
	x1, y1, x2, y2, radius int
	cx, cy, r              int
	kind                   int
}

const shapeRound = 1
const shapeCircle = 2

func roundedRect(x1, y1, x2, y2, radius int) shape {
	return shape{x1: x1, y1: y1, x2: x2, y2: y2, radius: radius, kind: shapeRound}
}

func circle(cx, cy, r int) shape {
	return shape{cx: cx, cy: cy, r: r, kind: shapeCircle}
}

func (s shape) hit(x, y int) bool {
	if s.kind == shapeCircle {
		dx := float64(x - s.cx)
		dy := float64(y - s.cy)
		return dx*dx+dy*dy <= float64(s.r)*float64(s.r)
	}
	if x < s.x1 || x > s.x2 || y < s.y1 || y > s.y2 {
		return false
	}
	r := float64(s.radius)
	corners := []struct{ cx, cy float64 }{
		{float64(s.x1 + s.radius), float64(s.y1 + s.radius)},
		{float64(s.x2 - s.radius), float64(s.y1 + s.radius)},
		{float64(s.x1 + s.radius), float64(s.y2 - s.radius)},
		{float64(s.x2 - s.radius), float64(s.y2 - s.radius)},
	}
	for _, c := range corners {
		dx := float64(x) + 0.5 - c.cx
		dy := float64(y) + 0.5 - c.cy
		if dx*dx+dy*dy > r*r {
			// Outside this corner's circle — only matters near the corner.
			nearX := x < s.x1+s.radius || x > s.x2-s.radius
			nearY := y < s.y1+s.radius || y > s.y2-s.radius
			if nearX && nearY {
				return false
			}
		}
	}
	return true
}

func distToSegment(px, py, ax, ay, bx, by float64) float64 {
	dx := bx - ax
	dy := by - ay
	if dx == 0 && dy == 0 {
		return math.Hypot(px-ax, py-ay)
	}
	t := ((px-ax)*dx + (py-ay)*dy) / (dx*dx + dy*dy)
	if t < 0 {
		t = 0
	}
	if t > 1 {
		t = 1
	}
	return math.Hypot(px-(ax+t*dx), py-(ay+t*dy))
}

// --- scaling / encoding -----------------------------------------------------

func downsample(src *image.NRGBA, size int) *image.NRGBA {
	ratio := float64(src.Rect.Dx()) / float64(size)
	dst := image.NewNRGBA(image.Rect(0, 0, size, size))
	for y := 0; y < size; y++ {
		for x := 0; x < size; x++ {
			x0 := int(float64(x) * ratio)
			y0 := int(float64(y) * ratio)
			x1 := int(float64(x+1) * ratio)
			y1 := int(float64(y+1) * ratio)
			var r, g, b, a, n uint32
			for yy := y0; yy < y1; yy++ {
				for xx := x0; xx < x1; xx++ {
					p := src.NRGBAAt(xx, yy)
					r += uint32(p.R)
					g += uint32(p.G)
					b += uint32(p.B)
					a += uint32(p.A)
					n++
				}
			}
			if n == 0 {
				continue
			}
			dst.SetNRGBA(x, y, color.NRGBA{
				R: uint8(r / n),
				G: uint8(g / n),
				B: uint8(b / n),
				A: uint8(a / n),
			})
		}
	}
	return dst
}

func encodePNGFrame(img *image.NRGBA) []byte {
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		fatal(err)
	}
	return buf.Bytes()
}

func encodeBMPFrame(img *image.NRGBA) []byte {
	size := img.Rect.Dx()
	buf := new(bytes.Buffer)
	header := struct {
		Size            uint32
		Width           int32
		Height          int32
		Planes          uint16
		BitCount        uint16
		Compression     uint32
		SizeImage       uint32
		XPels, YPels    int32
		ClrUsed, ClrImp uint32
	}{
		Size:      40,
		Width:     int32(size),
		Height:    int32(size * 2),
		Planes:    1,
		BitCount:  32,
		SizeImage: uint32(size * size * 4),
	}
	_ = binary.Write(buf, binary.LittleEndian, header)
	for y := size - 1; y >= 0; y-- {
		for x := 0; x < size; x++ {
			p := img.NRGBAAt(x, y)
			_ = buf.WriteByte(p.B)
			_ = buf.WriteByte(p.G)
			_ = buf.WriteByte(p.R)
			_ = buf.WriteByte(p.A)
		}
	}
	andMaskRows := size / 4
	for y := 0; y < andMaskRows; y++ {
		_ = buf.WriteByte(0)
	}
	return buf.Bytes()
}

func encodeICO(frames [][]byte, sizes []int) []byte {
	output := new(bytes.Buffer)
	header := make([]byte, 6)
	binary.LittleEndian.PutUint16(header[0:], 0)
	binary.LittleEndian.PutUint16(header[2:], 1)
	binary.LittleEndian.PutUint16(header[4:], uint16(len(frames)))
	_, _ = output.Write(header)

	offset := 6 + 16*len(frames)
	for i, frame := range frames {
		entry := make([]byte, 16)
		if sizes[i] == 256 {
			entry[0] = 0
			entry[1] = 0
		} else {
			entry[0] = byte(sizes[i])
			entry[1] = byte(sizes[i])
		}
		entry[2] = 0
		entry[3] = 0
		binary.LittleEndian.PutUint16(entry[4:], 1) // planes
		binary.LittleEndian.PutUint16(entry[6:], 32)
		binary.LittleEndian.PutUint32(entry[8:], uint32(len(frame)))
		binary.LittleEndian.PutUint32(entry[12:], uint32(offset))
		_, _ = output.Write(entry)
		offset += len(frame)
	}
	for _, frame := range frames {
		_, _ = output.Write(frame)
	}
	return output.Bytes()
}

// --- helpers -----------------------------------------------------------------

func nrgb(r, g, b uint8) color.NRGBA {
	return color.NRGBA{R: r, G: g, B: b, A: 0xff}
}

func lerp(a, b color.NRGBA, t float64) color.NRGBA {
	return color.NRGBA{
		R: uint8(float64(a.R) + (float64(b.R)-float64(a.R))*t),
		G: uint8(float64(a.G) + (float64(b.G)-float64(a.G))*t),
		B: uint8(float64(a.B) + (float64(b.B)-float64(a.B))*t),
		A: 0xff,
	}
}

func minmax(a, b int) (int, int) {
	if a < b {
		return a, b
	}
	return b, a
}

func writeFile(path string, data []byte) error {
	return os.WriteFile(path, data, 0o644)
}

// moduleRoot walks up from the working directory until it finds the module's
// go.mod, so genicon is safe to run from anywhere.
func moduleRoot() string {
	dir, err := os.Getwd()
	if err != nil {
		fatal(err)
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			fatal(fmt.Errorf("could not find go.mod"))
		}
		dir = parent
	}
}

func fatal(err error) {
	fmt.Fprintln(os.Stderr, "genicon:", err)
	os.Exit(1)
}
