#!/usr/bin/env bash
#
# Builds the Go Asset Collector for Windows x64, macOS arm64 and Linux x64.
#
# - Reads APP_URL from the repository root .env and bakes it in via -ldflags.
# - Regenerates the icon (assets/icon.png + assets/icon.ico).
# - Embeds the icon + version resource into the Windows exe via go-winres.
# - Copies the binaries to the repo's public/downloads so the web app can
#   serve them (names suffixed with -Go so they don't clobber the Bun builds).
#
# Usage: scripts/build.sh [all|win|mac|linux]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

DEFAULT_TARGET="all"
TARGET="${1:-$DEFAULT_TARGET}"

if [[ "$TARGET" != "all" && "$TARGET" != "win" && "$TARGET" != "mac" && "$TARGET" != "linux" ]]; then
  echo "Unknown target '$TARGET'. Valid: all, win, mac, linux." >&2
  exit 1
fi

APP_URL="$(grep -E '^APP_URL=' "$REPO_ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"'" || true)"
if [[ -z "$APP_URL" ]]; then
  echo "APP_URL is not set in '$REPO_ROOT/.env'. Set it and re-run (or pass --url at runtime)." >&2
  exit 1
fi

VERSION="$(git -C "$REPO_ROOT" describe --tags --always --dirty 2>/dev/null || echo dev)"
COMMIT="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo none)"

LDFLAGS="-s -w -X main.defaultAppURL=$APP_URL -X main.version=$VERSION -X main.commit=$COMMIT"

mkdir -p "$TOOL_DIR/dist" "$REPO_ROOT/public/downloads"

echo "==> Generating icon"
( cd "$TOOL_DIR" && go run ./cmd/genicon )

build_target() {
  local goos="$1" goarch="$2" out="$3"
  echo "==> Building $goos/$goarch -> dist/$out"
  if [[ "$goos" == "windows" ]]; then
    echo "    Generating Windows resources (icon + version info)"
    ( cd "$TOOL_DIR" && go run github.com/tc-hib/go-winres@latest make \
        --in winres/winres.json --arch amd64 --out rsrc \
        --product-version "$VERSION" --file-version "$VERSION" )
  fi
  ( cd "$TOOL_DIR" && \
    CGO_ENABLED=0 GOOS="$goos" GOARCH="$goarch" \
    go build -trimpath -ldflags "$LDFLAGS" -o "dist/$out" . )
  cp "$TOOL_DIR/dist/$out" "$REPO_ROOT/public/downloads/$out"
  echo "    Copied to public/downloads/$out"
}

if [[ "$TARGET" == "all" || "$TARGET" == "win" ]]; then
  build_target windows amd64 "ITSM-AssetCollector-Go.exe"
fi
if [[ "$TARGET" == "all" || "$TARGET" == "mac" ]]; then
  build_target darwin arm64 "itsm-asset-collector-go-macos-arm64"
fi
if [[ "$TARGET" == "all" || "$TARGET" == "linux" ]]; then
  build_target linux amd64 "itsm-asset-collector-go-linux-x64"
fi

echo "All targets built."