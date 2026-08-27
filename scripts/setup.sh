#!/bin/bash
set -e

echo "========================================="
echo "  Oracle Instant Client Setup (Ubuntu)"
echo "========================================="

# Configuration
ORACLE_VERSION="23.26.3.0.0"
ORACLE_HOST="172.18.1.11"
ORACLE_PORT="1521"
ORACLE_SID="BFGPROD"
ORACLE_USER="bfgi"
ORACLE_PASSWORD="oracle123"
ORACLE_HOME="/opt/oracle/instantclient_23"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Check if already installed
INSTALLED=false
if [ -f "$ORACLE_HOME/libclntsh.so" ] || [ -f "$ORACLE_HOME/libclntsh.so.23.1" ]; then
  INSTALLED=true
  echo ""
  echo "  Oracle Instant Client already installed at $ORACLE_HOME"
fi

echo ""
echo "[1/6] Installing system dependencies..."
if ! dpkg -l | grep -q "libaio1"; then
  sudo apt-get update -qq
  sudo apt-get install -y -qq libaio1 libaio-dev unzip curl
else
  echo "  System dependencies already installed"
fi

# libnsl is named differently across Ubuntu versions
LIBNSL_PKG=""
if dpkg -l | grep -q "libnsl2"; then
  LIBNSL_PKG="libnsl2"
elif dpkg -l | grep -q "libnsl1"; then
  LIBNSL_PKG="libnsl1"
else
  if apt-cache show libnsl2 &>/dev/null; then
    LIBNSL_PKG="libnsl2"
  elif apt-cache show libnsl1 &>/dev/null; then
    LIBNSL_PKG="libnsl1"
  fi
fi

if [ -n "$LIBNSL_PKG" ]; then
  echo "  Installing $LIBNSL_PKG..."
  sudo apt-get install -y -qq "$LIBNSL_PKG"
else
  echo "  libnsl not available (may not be needed on this Ubuntu version)"
fi

if [ "$INSTALLED" = false ]; then
  echo ""
  echo "[2/6] Downloading Oracle Instant Client..."
  if [ -f /tmp/instantclient-basic-linux.zip ] && file /tmp/instantclient-basic-linux.zip | grep -q "Zip archive"; then
    echo "  File already exists and is valid, skipping download"
  else
    rm -f /tmp/instantclient-basic-linux.zip
    curl -L -o /tmp/instantclient-basic-linux.zip \
      -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
      -H "Accept: application/octet-stream" \
      "https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-${ORACLE_VERSION}.zip" || true

    if ! file /tmp/instantclient-basic-linux.zip | grep -q "Zip archive"; then
      echo "  Auto-download failed. Trying alternative URL..."
      curl -L -o /tmp/instantclient-basic-linux.zip \
        -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
        "https://download.oracle.com/otn_software/linux/instantclient/2326300/instantclient-basic-linux.x64-23.26.3.0.0.zip" || true
    fi

    if ! file /tmp/instantclient-basic-linux.zip | grep -q "Zip archive"; then
      echo ""
      echo "  Download failed. Please download manually:"
      echo "  1. Go to: https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html"
      echo "  2. Download 'Basic Package (ZIP)' for version 23.26.3.0.0"
      echo "  3. Place the file at: /tmp/instantclient-basic-linux.zip"
      echo "  4. Run this script again"
      exit 1
    fi
  fi

  echo ""
  echo "[3/6] Installing to /opt/oracle..."
  sudo mkdir -p /opt/oracle
  cd /opt/oracle
  sudo unzip -o -q /tmp/instantclient-basic-linux.zip
  EXTRACTED_DIR=$(ls -d instantclient_* | head -1)
  sudo mv "$EXTRACTED_DIR" instantclient_23 2>/dev/null || true
  rm /tmp/instantclient-basic-linux.zip

  echo ""
  echo "  Updating shared library cache..."
  echo "/opt/oracle/instantclient_23" | sudo tee /etc/ld.so.conf.d/oracle-instantclient.conf > /dev/null
  sudo ldconfig
else
  echo ""
  echo "[2/6] Skipping download (already installed)"
  echo ""
  echo "[3/6] Skipping installation (already installed)"
fi

echo ""
echo "[4/6] Setting up environment variables..."
if ! grep -q "ORACLE_HOME=/opt/oracle/instantclient_23" ~/.bashrc 2>/dev/null; then
  cat >> ~/.bashrc << 'EOF'

# Oracle Instant Client
export ORACLE_HOME=/opt/oracle/instantclient_23
export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH
export TNS_ADMIN=$ORACLE_HOME/network/admin
export PATH=$ORACLE_HOME:$PATH
EOF
  echo "  Added to ~/.bashrc"
else
  echo "  Already configured in ~/.bashrc"
fi

export ORACLE_HOME
export LD_LIBRARY_PATH=$ORACLE_HOME:$LD_LIBRARY_PATH
export TNS_ADMIN=$ORACLE_HOME/network/admin

echo ""
echo "[5/6] Creating tnsnames.ora..."
sudo mkdir -p "$ORACLE_HOME/network/admin"
sudo tee "$ORACLE_HOME/network/admin/tnsnames.ora" > /dev/null << EOF
BFG =
  (DESCRIPTION =
    (ADDRESS =
      (PROTOCOL = TCP)
      (HOST = ${ORACLE_HOST})
      (PORT = ${ORACLE_PORT})
    )
    (CONNECT_DATA =
      (SID = ${ORACLE_SID})
    )
  )
EOF
echo "  Created tnsnames.ora"

echo ""
echo "[6/6] Creating .env file..."
cp "${PROJECT_ROOT}/.env" "${PROJECT_ROOT}/.env.bak" 2>/dev/null || true
cat > "${PROJECT_ROOT}/.env" << 'ENVEOF'
MES_DATABASE="mysql://root:bfgA$$essDb@172.18.1.20:3306"
ISS_DATABASE="mysql://admin:$Admin2629@172.18.1.137:3306/ISS"

ERP_USER="MES"
ERP_PASSWORD='M3$Ep!2X'
ERP_SERVER="172.18.1.31"
ERP_DATABASE="ERP10Live"

COOKIE_SECURE=false

# Oracle Database
ORACLE_HOST="172.18.1.11"
ORACLE_PORT="1521"
ORACLE_SERVICE_NAME="BFGPROD"
ORACLE_USER="bfgi"
ORACLE_PASSWORD="oracle123"
ORACLE_CLIENT_DIR="/opt/oracle/instantclient_23"
TNS_ADMIN="/opt/oracle/instantclient_23/network/admin"
ENVEOF
echo "  Created .env at project root"
[ -f "${PROJECT_ROOT}/.env.bak" ] && echo "  Backup saved to .env.bak"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Environment variables added to ~/.bashrc."
echo "Run 'source ~/.bashrc' to apply changes."
echo ""
echo "Test connection:"
echo "  \$ORACLE_HOME/sqlplus ${ORACLE_USER}/${ORACLE_PASSWORD}@//${ORACLE_HOST}:${ORACLE_PORT}/${ORACLE_SID}"
echo ""
