#!/bin/bash

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

check_header() {
  local description="$1"
  local header_name="$2"
  local expected_pattern="$3"

  local headers=$(curl -s -D - -o /dev/null "$BASE_URL/api/posts")
  local value=$(echo "$headers" | grep -i "^$header_name:" | head -1 | sed "s/^$header_name: //I" | tr -d '\r')

  if [ -z "$value" ]; then
    echo -e "${RED}  ❌ FAIL${NC} $description — header missing"
    FAILED=$((FAILED + 1))
    return
  fi

  if echo "$value" | grep -qi "$expected_pattern"; then
    echo -e "${GREEN}  ✅ PASS${NC} $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} $description"
    echo -e "${YELLOW}     Expected: $expected_pattern${NC}"
    echo -e "${YELLOW}     Got:      $value${NC}"
    FAILED=$((FAILED + 1))
  fi
}

check_absent() {
  local description="$1"
  local header_name="$2"

  local headers=$(curl -s -D - -o /dev/null "$BASE_URL/api/posts")
  if echo "$headers" | grep -qi "^$header_name:"; then
    echo -e "${RED}  ❌ FAIL${NC} $description — header should be absent"
    FAILED=$((FAILED + 1))
  else
    echo -e "${GREEN}  ✅ PASS${NC} $description"
    PASSED=$((PASSED + 1))
  fi
}

echo ""
echo "============================================================"
echo "🛡️  Security Headers Test Suite"
echo "============================================================"
echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 1: Core Security Headers${NC}"

check_header "Content-Security-Policy is set" "Content-Security-Policy" "default-src"
check_header "X-Frame-Options is DENY" "X-Frame-Options" "DENY"
check_header "X-Content-Type-Options is nosniff" "X-Content-Type-Options" "nosniff"
check_header "Referrer-Policy is no-referrer" "Referrer-Policy" "no-referrer"
check_header "X-DNS-Prefetch-Control is off" "X-DNS-Prefetch-Control" "off"
check_header "X-Download-Options is noopen" "X-Download-Options" "noopen"
check_header "X-Permitted-Cross-Domain-Policies is none" "X-Permitted-Cross-Domain-Policies" "none"

# ============================================================
echo -e "${YELLOW}📌 GROUP 2: Cross-Origin Policies${NC}"

check_header "Cross-Origin-Opener-Policy is same-origin" "Cross-Origin-Opener-Policy" "same-origin"
check_header "Cross-Origin-Resource-Policy is set" "Cross-Origin-Resource-Policy" "same-origin"
check_header "Origin-Agent-Cluster is set" "Origin-Agent-Cluster" "?1"

# ============================================================
echo -e "${YELLOW}📌 GROUP 3: Hide Server Info${NC}"

check_absent "X-Powered-By is removed" "X-Powered-By"

# ============================================================
echo -e "${YELLOW}📌 GROUP 4: Dev vs Prod Behavior${NC}"

# In development, HSTS should NOT be present (would break localhost)
if [ "$NODE_ENV" == "development" ]; then
  check_absent "HSTS is disabled in development" "Strict-Transport-Security"
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 5: Uploads CORP Override${NC}"

# Create a test file first
mkdir -p uploads/avatars
echo "test" > uploads/avatars/security-test.txt

UPLOAD_HEADERS=$(curl -s -D - -o /dev/null "$BASE_URL/uploads/avatars/security-test.txt")
UPLOAD_CORP=$(echo "$UPLOAD_HEADERS" | grep -i "cross-origin-resource-policy" | sed "s/^[^:]*: //I" | tr -d '\r')

if echo "$UPLOAD_CORP" | grep -qi "cross-origin"; then
  echo -e "${GREEN}  ✅ PASS${NC} Uploads route has relaxed CORP (cross-origin)"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} Uploads route CORP is not cross-origin (got: $UPLOAD_CORP)"
  FAILED=$((FAILED + 1))
fi

rm -f uploads/avatars/security-test.txt

# ============================================================
echo -e "${YELLOW}📌 GROUP 6: Permissions-Policy${NC}"

check_header "Permissions-Policy is set" "Permissions-Policy" "camera"

# ============================================================
# RESULTS
# ============================================================
echo ""
echo "============================================================"
TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All $TOTAL security header tests passed!${NC}"
else
  echo -e "${RED}❌ $FAILED of $TOTAL tests failed.${NC}"
fi
echo "============================================================"
echo ""

exit $([ $FAILED -eq 0 ] && echo 0 || echo 1)