#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/opt/gvg-sim"
PUBLIC_DIR="/var/www/gvg-sim"
OCR_DIR="$PROJECT_DIR/ocr-service"
OCR_VENV="$OCR_DIR/.venv"
OCR_SERVICE="/etc/systemd/system/gvg-ocr.service"

cd "$PROJECT_DIR"

echo "==> Updating code"
git pull --ff-only

echo "==> Installing frontend dependencies"
npm ci

echo "==> Building frontend"
npm run build

echo "==> Publishing frontend build"
mkdir -p "$PUBLIC_DIR"
rsync -av --delete dist/ "$PUBLIC_DIR"/

echo "==> Fixing frontend ownership"
chown -R www-data:www-data "$PUBLIC_DIR"

echo "==> Preparing OCR backend venv"
cd "$OCR_DIR"

if [ ! -d "$OCR_VENV" ]; then
    python3 -m venv "$OCR_VENV"
fi

"$OCR_VENV/bin/python3" -m pip install --upgrade pip
"$OCR_VENV/bin/python3" -m pip install -r requirements.txt

echo "==> Installing/updating OCR systemd service"
cat > "$OCR_SERVICE" <<SERVICE
[Unit]
Description=GvG OCR Backend
After=network.target

[Service]
Type=simple
WorkingDirectory=$OCR_DIR
ExecStart=$OCR_VENV/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8090
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable gvg-ocr
systemctl restart gvg-ocr

echo "==> Waiting for OCR backend"
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8090/health >/dev/null 2>&1; then
    echo "OCR backend is ready"
    break
  fi

  if [ "$i" -eq 30 ]; then
    echo "OCR backend did not become ready in time"
    systemctl status gvg-ocr --no-pager || true
    journalctl -u gvg-ocr -n 80 --no-pager || true
    exit 1
  fi

  sleep 1
done

echo "==> Testing OCR backend directly"
curl -fsS http://127.0.0.1:8090/health

echo
echo "==> Validating nginx"
nginx -t

echo "==> Reloading nginx"
systemctl reload nginx

echo "==> Testing OCR backend through nginx"
curl -fsS -H "Host: mf69app.lptd.casa" http://127.0.0.1/ocr/health

echo
echo "==> Deploy completed successfully"
