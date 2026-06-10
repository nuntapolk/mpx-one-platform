#!/usr/bin/env bash
# MPX-ONE health check — verify API (4000) + Web (3000) + key pages return 200
# Usage: bash scripts/health-check.sh   (or: npm run health  from mpx-governance-api)

API="${NEXT_PUBLIC_API_URL:-http://localhost:4000}"
WEB="${WEB_URL:-http://localhost:3000}"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'; DIM='\033[2m'; NC='\033[0m'
fail=0

check() {
  local label="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$url" 2>/dev/null)
  # healthy = any 2xx or 3xx (3xx = redirect, e.g. / → /dashboard)
  if [[ "$code" =~ ^[23][0-9][0-9]$ ]]; then
    printf "  ${GREEN}✓${NC} %-26s ${DIM}%s${NC} ${GREEN}%s${NC}\n" "$label" "$url" "$code"
  else
    printf "  ${RED}✗${NC} %-26s ${DIM}%s${NC} ${RED}%s${NC}\n" "$label" "$url" "${code:-no-response}"
    fail=1
  fi
}

echo ""
echo "🩺 MPX-ONE Health Check  ($(date '+%H:%M:%S'))"
echo "────────────────────────────────────────────────"

echo -e "${YELLOW}Backend API (${API})${NC}"
check "Health"            "$API/health"
check "Data Map"          "$API/api/v1/data-map"
check "Reports"           "$API/api/v1/reports"
check "ROPA"              "$API/api/v1/ropa"
check "DPIA"              "$API/api/v1/dpia"
check "External Parties"  "$API/api/v1/external-parties"
check "Swagger docs"      "$API/api/docs"

echo -e "${YELLOW}Frontend Web (${WEB})${NC}"
check "Home"              "$WEB/"
check "Dashboard"         "$WEB/dashboard"
check "ROPA"              "$WEB/inventory/ropa"
check "Data Map"          "$WEB/pdpa/data-map"
check "Reports"           "$WEB/pdpa/reports"
check "DPIA"              "$WEB/pdpa/dpia"

echo "────────────────────────────────────────────────"
if [ "$fail" = "0" ]; then
  printf "${GREEN}✅ ทุกบริการพร้อมใช้งาน (all healthy)${NC}\n\n"
  exit 0
else
  printf "${RED}❌ มีบริการที่ไม่ตอบสนอง — เช็ค log: /tmp/mpx-api.log, /tmp/mpx-web.log${NC}\n\n"
  exit 1
fi
