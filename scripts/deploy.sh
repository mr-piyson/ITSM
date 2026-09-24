#!/bin/bash
set -e
set -E

APP_NAME="itsm"
SERVICE_NAME="${APP_NAME}.service"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT=3000
APP_USER="$(whoami)"
NODE_ENV="production"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()   { echo -e "${GREEN}=>${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; echo "DEPLOY_FAILED" >&2; exit 1; }

rollback_or_fail() {
  echo ""
  if [ -d "${APP_DIR}/.next-old" ]; then
    warn "Deployment failed. Restoring previous build..."
    sudo systemctl stop ${SERVICE_NAME} || true
    rm -rf "${APP_DIR}/.next"
    mv "${APP_DIR}/.next-old" "${APP_DIR}/.next"
    sudo systemctl start ${SERVICE_NAME} || true
    warn "Previous build restored. Logs: journalctl -u ${SERVICE_NAME} -f"
  else
    error "Deployment failed. The previously running build was left untouched."
  fi
  echo "DEPLOY_FAILED" >&2
  exit 1
}

trap rollback_or_fail ERR

echo "$$" > "${APP_DIR}/deploy.pid" 2>/dev/null || true

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
BUN_BIN="$(command -v bun)"

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
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=${NODE_ENV}
Environment=PORT=${PORT}
ExecStart=${BUN_BIN} run start
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

# --- Apache maintenance page (served while the backend is down) ---
if [ -f /etc/apache2/apache2.conf ]; then
  MAINT_CONF="/etc/apache2/conf-available/itsm-maintenance.conf"

  if [ ! -f "${MAINT_CONF}" ]; then
    log "Creating Apache maintenance config: ${MAINT_CONF}"

    sudo tee "${MAINT_CONF}" > /dev/null << EOF
# ITSM maintenance page (managed by scripts/deploy.sh)
Alias /maintenance.html ${APP_DIR}/public/maintenance.html
ProxyPass /maintenance.html !
<Files "maintenance.html">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</Files>
ErrorDocument 502 /maintenance.html
ErrorDocument 503 /maintenance.html
EOF

    sudo a2enconf itsm-maintenance > /dev/null
    log "Apache maintenance config created and enabled."
  else
    log "Apache maintenance config already exists."
  fi

  sudo systemctl reload apache2
  log "Maintenance page will be shown for all routes until the app is ready."
else
  warn "Apache not found. Skipping maintenance page setup (the app will show raw 502 errors during deploy)."
fi
echo ""

# --- Pull application source ---
log "Pulling latest changes..."
cd "${APP_DIR}"
git reset --hard HEAD
git pull origin main

log "Installing dependencies..."
"${BUN_BIN}" install --frozen-lockfile

# --- Build to a staging directory while the old app keeps serving ---
log "Building to staging directory (.next-deploy)..."
rm -rf "${APP_DIR}/.next-deploy"
rm -rf "${APP_DIR}/.env.local"

NEXT_DIST_DIR=".next-deploy" "${BUN_BIN}" run build

# --- Atomic swap & restart (downtime is only these three commands) ---
log "Stopping service and swapping build... (downtime starts now)"
sudo systemctl stop ${SERVICE_NAME} || true

mv "${APP_DIR}/.next" "${APP_DIR}/.next-old"
mv "${APP_DIR}/.next-deploy" "${APP_DIR}/.next"

log "Starting service..."
sudo systemctl start ${SERVICE_NAME}

log "Waiting for application to become ready..."
READY=0
for _ in $(seq 1 60); do
  CODE="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/" || true)"
  case "${CODE}" in
    2*|3*) READY=1; break;;
  esac
  sleep 1
done

if [ "${READY}" = "1" ]; then
  log "Application is up and serving requests."
  rm -rf "${APP_DIR}/.next-old"
else
  warn "New build did not become ready within 60s. Restoring previous build..."
  sudo systemctl stop ${SERVICE_NAME} || true
  rm -rf "${APP_DIR}/.next"
  mv "${APP_DIR}/.next-old" "${APP_DIR}/.next"
  sudo systemctl start ${SERVICE_NAME} || true

  log "Waiting for restored application to become ready..."
  RESTORED=0
  for _ in $(seq 1 60); do
    CODE="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${PORT}/" || true)"
    case "${CODE}" in
      2*|3*) RESTORED=1; break;;
    esac
    sleep 1
  done

  if [ "${RESTORED}" = "1" ]; then
    warn "Previous build was restored and is serving requests. New build rejected."
  else
    error "Previous build also failed to start. Check: journalctl -u ${SERVICE_NAME} -f"
  fi
  echo "DEPLOY_FAILED" >&2
  exit 1
fi

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
echo "DEPLOY_SUCCESS"