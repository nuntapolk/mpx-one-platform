#!/usr/bin/env bash
# End-to-end Keycloak BFF login test (headless, via curl cookie jars).
# Prereqs: Keycloak running on :8080 (realm mpx-one, client mpx-bff),
#          API + Web running with AUTH_ENABLED=true.
# Usage: bash scripts/test-auth-flow.sh [username] [password]
set -e
WEB="${WEB_URL:-http://localhost:3000}"
KC="${KEYCLOAK_URL:-http://localhost:8080}"
USER="${1:-admin@mpx.local}"
PASS="${2:-mpx1234}"
J=$(mktemp); KJ=$(mktemp)
GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'
ok(){ printf "${GREEN}✓${NC} %s\n" "$1"; }
fail(){ printf "${RED}✗ %s${NC}\n" "$1"; exit 1; }

echo "🔐 Keycloak BFF login flow test ($USER)"

AUTH_URL=$(curl -s -c "$J" -o /dev/null -w "%{redirect_url}" "$WEB/api/auth/login")
[[ "$AUTH_URL" == *"$KC"* ]] && ok "login → Keycloak authorize redirect" || fail "no authorize redirect"

HTML=$(curl -s -c "$KJ" "$AUTH_URL")
ACTION=$(echo "$HTML" | grep -oE 'action="[^"]*"' | head -1 | sed 's/action="//;s/"$//;s/\&amp;/\&/g')
[[ -n "$ACTION" ]] && ok "fetched Keycloak login form" || fail "no login form"

CB=$(curl -s -b "$KJ" -o /dev/null -w "%{redirect_url}" --data-urlencode "username=$USER" --data-urlencode "password=$PASS" "$ACTION")
[[ "$CB" == *"/api/auth/callback"* ]] && ok "credentials accepted → callback" || fail "login failed (check credentials)"

FIN=$(curl -s -b "$J" -c "$J" -o /dev/null -w "%{http_code}:%{redirect_url}" "$CB")
[[ "$FIN" == *"/dashboard"* ]] && ok "callback set session → /dashboard" || fail "callback failed ($FIN)"

ME=$(curl -s -b "$J" "$WEB/api/auth/me")
echo "$ME" | grep -q '"authenticated":true' && ok "session active: $(echo "$ME" | python3 -c 'import sys,json;print(json.load(sys.stdin)["user"]["email"])')" || fail "session not active"

CODE=$(curl -s -b "$J" -o /dev/null -w "%{http_code}" "$WEB/api/proxy/api/v1/ropa")
[[ "$CODE" == "200" ]] && ok "protected API via proxy → 200" || fail "proxy returned $CODE"

curl -s -b "$J" -c "$J" -o /dev/null "$WEB/api/auth/logout"
AFTER=$(curl -s -b "$J" -o /dev/null -w "%{http_code}" "$WEB/api/proxy/api/v1/ropa")
[[ "$AFTER" == "401" ]] && ok "logout → protected API 401" || fail "still authorized after logout ($AFTER)"

rm -f "$J" "$KJ"
printf "${GREEN}✅ Auth flow OK (login → session → API → logout)${NC}\n"
