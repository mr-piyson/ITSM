#!/bin/bash
set -e

echo "========================================="
echo "  Oracle Instant Client Setup (Ubuntu)"
echo "========================================="

# Configuration
ORACLE_VERSION="23.4.0.24.05"
ORACLE_HOME="/opt/oracle/instantclient_23_4"
ORACLE_HOST="172.18.1.11"
ORACLE_PORT="1521"
ORACLE_SID="BFGPROD"
ORACLE_USER="bfgi"
ORACLE_PASSWORD="oracle123"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo ""
echo "[1/8] Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq libaio1 unzip curl

echo ""
echo "[2/8] Downloading Oracle Instant Client..."
curl -L -o /tmp/instantclient-basic-linux.zip \
  -H "User-Agent: Mozilla/5.0" \
  "https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-${ORACLE_VERSION}.zip"

if ! file /tmp/instantclient-basic-linux.zip | grep -q "Zip archive"; then
  echo "  Download failed. Please download manually from:"
  echo "  https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html"
  echo "  Place the file at /tmp/instantclient-basic-linux.zip and run this script again."
  exit 1
fi

echo ""
echo "[3/8] Installing to ${ORACLE_HOME}..."
sudo mkdir -p /opt/oracle
cd /opt/oracle
sudo unzip -o -q /tmp/instantclient-basic-linux.zip
sudo mv instantclient_*_${ORACLE_VERSION#*.} instantclient_23_4 2>/dev/null || true
rm /tmp/instantclient-basic-linux.zip

echo ""
echo "[4/8] Setting up environment variables..."
if ! grep -q "ORACLE_HOME=/opt/oracle/instantclient_23_4" ~/.bashrc 2>/dev/null; then
  cat >> ~/.bashrc << 'EOF'

# Oracle Instant Client
export ORACLE_HOME=/opt/oracle/instantclient_23_4
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
echo "[5/8] Creating tnsnames.ora..."
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
echo "[6/8] Creating .env file..."
if [ ! -f "${PROJECT_ROOT}/.env" ]; then
  cat > "${PROJECT_ROOT}/.env" << EOF
# Oracle Database
ORACLE_HOST="${ORACLE_HOST}"
ORACLE_PORT="${ORACLE_PORT}"
ORACLE_SERVICE_NAME="${ORACLE_SID}"
ORACLE_USER="${ORACLE_USER}"
ORACLE_PASSWORD="${ORACLE_PASSWORD}"
ORACLE_CLIENT_DIR="${ORACLE_HOME}"
TNS_ADMIN="${ORACLE_HOME}/network/admin"
EOF
  echo "  Created .env at project root"
else
  echo "  .env already exists, skipping"
fi

echo ""
echo "[7/8] Verifying installation..."
if [ -f "$ORACLE_HOME/libclntsh.so" ]; then
  echo "  libclntsh.so found"
else
  echo "  WARNING: libclntsh.so not found"
fi

echo ""
echo "[8/8] Cleaning up..."

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
