#!/usr/bin/env bash
set -euo pipefail

# Migrate legacy image files into the file-upload module storage pattern:
#   $DATA_DIR/uploads/YYYY/MM/<id>.<ext>
# Produces a manifest CSV for DB/File backfill. No DB writes, no source deletion.
#
# Usage:
#   ./scripts/migrate-images-to-file-module.sh [--dry-run] [--data-dir PATH] [--out FILE] [--date-source mtime|today] [SOURCE_DIR ...]
# Examples:
#   ./scripts/migrate-images-to-file-module.sh --dry-run ../ISS/itemsImages ../ISS/printersImages
#   DATA_DIR=.data ./scripts/migrate-images-to-file-module.sh ../ISS/itemsImages ../ISS/printersImages

usage() {
  cat <<'EOF'
Usage: migrate-images-to-file-module.sh [options] [SOURCE_DIR ...]

Options:
  --dry-run              Plan only; do not copy files or create output dirs
  --data-dir PATH        Target data root (default: ${DATA_DIR:-.data})
  --out FILE             Manifest CSV path (default: <data-dir>/migration-manifest.csv)
  --date-source MODE     Partition date: mtime|today (default: mtime)
  -h, --help             Show help

Notes:
  - Copies into: <data-dir>/uploads/YYYY/MM/<id>.<ext>
  - Dedupes by SHA-256 content: identical files share one destination (manifest records each source).
  - Generates an id via uuidgen if available, else openssl rand, else timestamp+random.
  - Manifest columns: old_path,old_basename,new_storage_path,dest_path,sha256,size_bytes,ext,date_partition,source_root,dedup_of
  - Review and back up before running. Run DB backfill separately to create File rows and rewrite image references.
EOF
}

DRY_RUN=0
DATA_DIR="${DATA_DIR:-.data}"
OUT=""
DATE_SOURCE="mtime"
SOURCES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --data-dir) DATA_DIR="${2:-}"; shift 2 ;;
    --out) OUT="${2:-}"; shift 2 ;;
    --date-source) DATE_SOURCE="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    --) shift; while [[ $# -gt 0 ]]; do SOURCES+=("$1"); shift; done ;;
    -*) echo "Unknown option: $1" >&2; usage; exit 2 ;;
    *) SOURCES+=("$1"); shift ;;
  esac
done

# Default legacy sources for this repo (adjust as needed)
if [[ ${#SOURCES[@]} -eq 0 ]]; then
  SOURCES=("../ISS/itemsImages" "../ISS/printersImages")
fi

case "$DATE_SOURCE" in
  mtime|today) ;;
  *) echo "Invalid --date-source: $DATE_SOURCE (use mtime|today)" >&2; exit 2 ;;
esac

UPLOAD_ROOT="${DATA_DIR%/}/uploads"
if [[ -z "$OUT" ]]; then
  OUT="${DATA_DIR%/}/migration-manifest.csv"
fi

hash_file() {
  local f="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$f" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$f" | awk '{print $1}'
  elif command -v openssl >/dev/null 2>&1; then
    openssl dgst -sha256 "$f" | awk '{print $NF}'
  else
    echo "No SHA-256 tool found (need sha256sum, shasum, or openssl)" >&2
    exit 3
  fi
}

file_size() {
  local f="$1"
  if stat -f%z "$f" >/dev/null 2>&1; then
    stat -f%z "$f"           # macOS/BSD
  else
    stat -c%s "$f"           # GNU
  fi
}

file_mtime_ym() {
  local f="$1"
  if [[ "$DATE_SOURCE" == "today" ]]; then
    date -u +"%Y/%m"
    return
  fi
  if stat -f "%Sm" -t "%Y/%m" "$f" >/dev/null 2>&1; then
    stat -f "%Sm" -t "%Y/%m" "$f"   # macOS/BSD
  else
    date -u -r "$f" +"%Y/%m" 2>/dev/null || date -u -d "@$(stat -c%Y "$f")" +"%Y/%m"  # GNU
  fi
}

gen_id() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen | tr '[:upper:]' '[:lower:]' | tr -d '-'
  elif command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 12
  else
    printf '%s%06d' "$(date +%s)" "$RANDOM"
  fi
}

csv_escape() {
  local s="${1//\"/\"\"}"
  printf '"%s"' "$s"
}

lower_ext() {
  local base="$1"
  local ext="${base##*.}"
  if [[ "$ext" == "$base" ]]; then
    printf ''
  else
    printf '%s' "$ext" | tr '[:upper:]' '[:lower:]'
  fi
}

is_image_ext() {
  case "$1" in
    jpg|jpeg|png|gif|webp|bmp|svg|tif|tiff|avif|heic|heif|ico) return 0 ;;
    *) return 1 ;;
  esac
}

echo "DATA_DIR=$DATA_DIR"
echo "UPLOAD_ROOT=$UPLOAD_ROOT"
echo "OUT=$OUT"
echo "DATE_SOURCE=$DATE_SOURCE"
echo "DRY_RUN=$DRY_RUN"
echo "SOURCES: ${SOURCES[*]}"

mkdir -p "$(dirname "$OUT")"
if [[ $DRY_RUN -eq 0 ]]; then
  mkdir -p "$UPLOAD_ROOT"
fi

# Header
printf '%s\n' "old_path,old_basename,new_storage_path,dest_path,sha256,size_bytes,ext,date_partition,source_root,dedup_of" > "$OUT"

# sha256 -> new_storage_path|dest_path|ext|date_partition (bash 3 compatible via temp logic not needed on macOS bash 4 absent, but macOS default bash 3 lacks assoc arrays; use awk fallback not trivial)
# Use a temp mapping file for portability (macOS /bin/bash 3.x)
SEEN_MAP="$(mktemp -t migrate-images.XXXXXX)"
trap 'rm -f "$SEEN_MAP"' EXIT

processed=0
copied=0
deduped=0
skipped=0

for src in "${SOURCES[@]}"; do
  if [[ ! -d "$src" ]]; then
    echo "WARN: source not found or not a directory, skipping: $src" >&2
    continue
  fi
  src_abs="$(cd "$src" && pwd)"

  while IFS= read -r -d '' f; do
    base="$(basename "$f")"
    ext="$(lower_ext "$base")"

    # Migrate image files only by default; comment this block to include all files.
    if ! is_image_ext "$ext"; then
      skipped=$((skipped+1))
      continue
    fi

    sha="$(hash_file "$f")"
    size="$(file_size "$f")"
    ym="$(file_mtime_ym "$f")"

    prev="$(awk -F'\t' -v k="$sha" '$1==k{print $2"\t"$3"\t"$4"\t"$5; exit}' "$SEEN_MAP" || true)"
    if [[ -n "$prev" ]]; then
      IFS=$'\t' read -r new_sp dest_p d_ext d_ym <<< "$prev"
      dedup_of="$new_sp"
      new_sp_out="$new_sp"
      dest_out="$dest_p"
      ym_out="$d_ym"
      ext_out="$d_ext"
      deduped=$((deduped+1))
    else
      id="$(gen_id)"
      new_name="${id}.${ext}"
      rel_dir="${ym}"
      new_sp="/uploads/${rel_dir}/${new_name}"
      dest_p="${UPLOAD_ROOT}/${rel_dir}/${new_name}"
      if [[ $DRY_RUN -eq 0 ]]; then
        mkdir -p "${UPLOAD_ROOT}/${rel_dir}"
        cp -p "$f" "$dest_p"
      fi
      printf '%s\t%s\t%s\t%s\t%s\n' "$sha" "$new_sp" "$dest_p" "$ext" "$ym" >> "$SEEN_MAP"
      dedup_of=""
      new_sp_out="$new_sp"
      dest_out="$dest_p"
      ym_out="$ym"
      ext_out="$ext"
      copied=$((copied+1))
    fi

    printf '%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n' \
      "$(csv_escape "$f")" \
      "$(csv_escape "$base")" \
      "$(csv_escape "$new_sp_out")" \
      "$(csv_escape "$dest_out")" \
      "$(csv_escape "$sha")" \
      "$(csv_escape "$size")" \
      "$(csv_escape "$ext_out")" \
      "$(csv_escape "$ym_out")" \
      "$(csv_escape "$src_abs")" \
      "$(csv_escape "$dedup_of")" >> "$OUT"

    processed=$((processed+1))
  done < <(find "$src" -type f -print0)
done

echo "Done. processed=$processed copied_unique=$copied dedup_refs=$deduped skipped_non_image=$skipped"
echo "Manifest: $OUT"
if [[ $DRY_RUN -eq 1 ]]; then
  echo "(dry-run: no files copied)"
fi
