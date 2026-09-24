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

DEPLOY_LOG="${DEPLOY_PATH}/deploy.log"
DEPLOY_PID="${DEPLOY_PATH}/deploy.pid"

SSH_OPTIONS=(-o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=6)

log "Target: ${DEPLOY_HOST}:${DEPLOY_PATH}"
echo ""

# --- Kick off (or attach to) a detached deploy so an SSH drop cannot kill it ---
RUNNING="$(ssh "${SSH_OPTIONS[@]}" "${DEPLOY_HOST}" "if [ -f \"${DEPLOY_PID}\" ] && kill -0 \"\$(cat \"${DEPLOY_PID}\" 2>/dev/null)\" 2>/dev/null; then echo yes; fi" 2>/dev/null || true)"

if [ -n "${RUNNING}" ]; then
  log "A deployment already appears to be running on the server; attaching to its log."
else
  log "Launching detached deploy on ${DEPLOY_HOST}..."
  ssh "${SSH_OPTIONS[@]}" "${DEPLOY_HOST}" "export PATH=\"\$HOME/.bun/bin:\$PATH\"; cd \"${DEPLOY_PATH}\" && setsid nohup ./scripts/deploy.sh > \"${DEPLOY_LOG}\" 2>&1 < /dev/null & echo launched pid \$!"
fi

# --- Wait for the remote deploy pid (written by deploy.sh on startup) ---
REMOTE_PID=""
for _ in $(seq 1 30); do
  REMOTE_PID="$(ssh "${SSH_OPTIONS[@]}" "${DEPLOY_HOST}" "cat \"${DEPLOY_PID}\" 2>/dev/null" 2>/dev/null || true)"
  if [ -n "${REMOTE_PID}" ]; then break; fi
  sleep 1
done

if [ -n "${REMOTE_PID}" ]; then
  log "Deploy process on server (pid ${REMOTE_PID}). Log: ${DEPLOY_LOG}"
else
  warn "Could not read the remote deploy pid. Falling back to plain tail with a timeout."
fi

# --- Stream the log until a completion marker is printed ---
# If this SSH connection drops, the deploy keeps running on the server.
# Re-run this script to re-attach: it detects the running deploy and resumes monitoring.
TAIL_CMD="timeout 1800 tail -f -n +1 \"${DEPLOY_LOG}\""
if [ -n "${REMOTE_PID}" ]; then
  TAIL_CMD="tail -f --pid=${REMOTE_PID} -n +1 \"${DEPLOY_LOG}\""
fi

log "Streaming deployment output (Ctrl-C detaches; the deploy continues on the server)..."
echo ""

set +e
timeout 1800 ssh "${SSH_OPTIONS[@]}" "${DEPLOY_HOST}" "${TAIL_CMD}" 2>/dev/null | awk '/DEPLOY_(SUCCESS|FAILED)/{exit} {print; fflush()}'
STREAM_STATUS=$?
set -e

echo ""

# --- Fetch the final result marker from the server log ---
STATUS="$(ssh "${SSH_OPTIONS[@]}" "${DEPLOY_HOST}" "grep -hE 'DEPLOY_(SUCCESS|FAILED)' \"${DEPLOY_LOG}\" | tail -n 1" 2>/dev/null || true)"

case "${STATUS}" in
  *DEPLOY_SUCCESS*)
    log "========================================="
    log "  Deployment Complete!"
    log "========================================="
    ;;
  *DEPLOY_FAILED*)
    error "Deployment failed on the server (the previous build was restored if applicable). Full log: ${DEPLOY_LOG}"
    ;;
  *)
    if [ "${STREAM_STATUS}" -eq 124 ]; then
      error "Timed out waiting for the deploy after 30 minutes. It may still be running. Resume with: ssh ${DEPLOY_HOST} 'tail -f ${DEPLOY_LOG}'"
    fi
    error "No result marker found (interrupted?). The deploy continues on the server if it is still running. Resume with: ssh ${DEPLOY_HOST} 'tail -f ${DEPLOY_LOG}'"
    ;;
esac