#!/bin/bash
set -e

APP_NAME="itsm"
SERVICE_NAME="${APP_NAME}.service"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT=3000
NODE_USER="$(whoami)"
NODE_ENV="production"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo "========================================="
echo "  ITSM Deployment Script"
echo "========================================="
echo ""

# --- Pre-flight checks ---
log "Running pre-flight checks..."

if [ "$(id -u)" -eq 0 ]; then
  error "Do not run this script as root. Use a regular user with sudo privileges."
fi

if ! command -v bun &> /dev/null; then
  error "bun is not installed. Install it first: curl -fsSL https://bun.sh/install | bash"
fi

if ! command -v node &> /dev/null; then
  error "node is not installed."
fi

if ! command -v git &> /dev/null; then
  error "git is not installed."
fi

if [ ! -f "${APP_DIR}/package.json" ]; then
  error "package.json not found in ${APP_DIR}"
fi

if [ ! -f "${APP_DIR}/.env" ]; then
  warn ".env file not found. Make sure it exists before running the app."
fi

log "Pre-flight checks passed."
echo ""

# --- Create systemd service if it doesn't exist ---
if ! systemctl list-unit-files | grep -q "^${SERVICE_NAME}"; then
  log "Creating systemd service: ${SERVICE_NAME}"

  sudo tee /etc/systemd/system/${SERVICE_NAME} > /dev/null << EOF
[Unit]
Description=ITSM Next.js Application
After=network.target

[Service]
Type=simple
User=${NODE_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=${NODE_ENV}
Environment=PORT=${PORT}
ExecStart=$(which bun) run start
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl enable ${SERVICE_NAME}
  log "Service created and enabled."
else
  log "Service ${SERVICE_NAME} already exists."
fi
echo ""

# --- Update application ---
log "Pulling latest changes..."
cd "${APP_DIR}"
git reset --hard HEAD
git pull origin main

log "Installing dependencies..."
bun install

log "Building application..."
bun run build

# --- Restart service ---
log "Restarting service..."
sudo systemctl restart ${SERVICE_NAME}

echo ""
log "========================================="
log "  Deployment Complete!"
log "========================================="
log ""
log "Service status:"
sudo systemctl status ${SERVICE_NAME} --no-pager || true
log ""
log "App running at: http://localhost:${PORT}"
log "Logs: journalctl -u ${SERVICE_NAME} -f"
