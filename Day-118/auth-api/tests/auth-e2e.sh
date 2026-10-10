#!/bin/bash

BASE_URL="http://localhost:4000"
COOKIES="/tmp/auth-e2e-$$.txt"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_case() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$actual" == "$expected" ]; then
    echo -e "${GREEN}  ✅ PASS${NC} $desc ($actual)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} $desc (expected $expected, got $actual)"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "============================================================"
echo "🔐 Auth API — End-to-End Test Suite"
echo "============================================================"
echo ""

# ============================================================
echo -e "${YELLOW}📌 1. Registration${NC}"

EMAIL="test-$(date +%s)@example.com"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -c "$COOKIES" -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"E2E Test\",\"email\":\"$EMAIL\",\"password\":\"test123456\"}")
test_case "Register new user → 201" "201" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dup\",\"email\":\"$EMAIL\",\"password\":\"test123456\"}")
test_case "Duplicate email → 409" "409" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"X","email":"bad","password":"1"}')
test_case "Invalid input → 422" "422" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 2. Login${NC}"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -c "$COOKIES" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"test123456\"}")
test_case "Login with correct creds → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"wrong\"}")
test_case "Login with wrong password → 401" "401" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 3. Cookie Auth${NC}"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" "$BASE_URL/api/auth/me")
test_case "GET /me with cookie → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/auth/me")
test_case "GET /me without cookie → 401" "401" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 4. Bearer Auth${NC}"

# Login to get token
LOGIN_RESP=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"test123456\"}")
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN")
  test_case "GET /me with Bearer → 200" "200" "$CODE"
else
  echo -e "${RED}  ❌ Could not extract token${NC}"
  FAILED=$((FAILED + 1))
fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/api/auth/me" -H "Authorization: Bearer invalid.token.xyz")
test_case "GET /me with invalid token → 401" "401" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 5. Profile Update${NC}"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" -X PATCH "$BASE_URL/api/auth/me" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}')
test_case "PATCH /me (name) → 200" "200" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 6. Change Password${NC}"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" -X PATCH "$BASE_URL/api/auth/me/password" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"test123456","newPassword":"newpass789"}')
test_case "Change password → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"newpass789\"}")
test_case "Login with new password → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"test123456\"}")
test_case "Old password no longer works → 401" "401" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 7. Admin${NC}"

# Login as admin
ADMIN_COOKIES="/tmp/auth-admin-$$.txt"
curl -s -c "$ADMIN_COOKIES" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123456"}' > /dev/null

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$ADMIN_COOKIES" "$BASE_URL/api/admin/users")
test_case "GET /admin/users (admin) → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" "$BASE_URL/api/admin/users")
test_case "GET /admin/users (regular user) → 403" "403" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 8. Rate Limiting${NC}"

for i in {1..6}; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"ratelimit@example.com","password":"wrong"}')
done
test_case "6th failed login is rate limited → 429" "429" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 9. Forgot Password${NC}"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\"}")
test_case "Forgot password (existing email) → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}')
test_case "Forgot password (unknown email) → 200 (no leak)" "200" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 10. Security Headers${NC}"

HEADERS=$(curl -s -D - -o /dev/null "$BASE_URL/api/auth/me")

echo "$HEADERS" | grep -qi "x-frame-options: deny" && \
  { echo -e "${GREEN}  ✅ PASS${NC} X-Frame-Options present"; PASSED=$((PASSED+1)); } || \
  { echo -e "${RED}  ❌ FAIL${NC} X-Frame-Options missing"; FAILED=$((FAILED+1)); }

echo "$HEADERS" | grep -qi "content-security-policy" && \
  { echo -e "${GREEN}  ✅ PASS${NC} CSP present"; PASSED=$((PASSED+1)); } || \
  { echo -e "${RED}  ❌ FAIL${NC} CSP missing"; FAILED=$((FAILED+1)); }

echo "$HEADERS" | grep -qi "x-content-type-options: nosniff" && \
  { echo -e "${GREEN}  ✅ PASS${NC} nosniff present"; PASSED=$((PASSED+1)); } || \
  { echo -e "${RED}  ❌ FAIL${NC} nosniff missing"; FAILED=$((FAILED+1)); }

# ============================================================
echo -e "${YELLOW}📌 11. Logout${NC}"


CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" -c "$COOKIES" \
  -X POST "$BASE_URL/api/auth/logout")
test_case "Logout → 200" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" "$BASE_URL/api/auth/me")
test_case "GET /me after logout → 401" "401" "$CODE"

# ============================================================
echo ""
echo "============================================================"
TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All $TOTAL tests passed! 🎉${NC}"
else
  echo -e "${RED}❌ $FAILED of $TOTAL tests failed.${NC}"
fi
echo "============================================================"
echo ""

rm -f "$COOKIES" "$ADMIN_COOKIES"
exit $([ $FAILED -eq 0 ] && echo 0 || echo 1)