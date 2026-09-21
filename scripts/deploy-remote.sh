#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/../.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[DEPLOY-REMOTE]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo "========================================="
echo "  ITSM Remote Deployment"
echo "========================================="
echo ""

# --- Load .env ---
if [ ! -f "${ENV_FILE}" ]; then
  error ".env file not found at ${ENV_FILE}"
fi

DEPLOY_HOST=$(grep -E '^DEPLOY_HOST=' "${ENV_FILE}" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
DEPLOY_PATH=$(grep -E '^DEPLOY_PATH=' "${ENV_FILE}" | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "${DEPLOY_HOST}" ]; then
  error "DEPLOY_HOST not set in .env"
fi

if [ -z "${DEPLOY_PATH}" ]; then
  error "DEPLOY_PATH not set in .env"
fi

log "Target: ${DEPLOY_HOST}:${DEPLOY_PATH}"
echo ""

# --- SSH and deploy ---
log "Connecting to ${DEPLOY_HOST}..."
ssh -o ConnectTimeout=10 "${DEPLOY_HOST}" bash -lc "'
  set -e
  export PATH=\"\$HOME/.bun/bin:\$PATH\"

  echo \"--- Navigating to ${DEPLOY_PATH} ---\"
  cd \"${DEPLOY_PATH}\" || { echo \"Directory not found\"; exit 1; }

  echo \"--- Running deploy ---\"
  bun run deploy
'"

echo ""
log "========================================="
log "  Remote Deployment Triggered!"
log "========================================="
