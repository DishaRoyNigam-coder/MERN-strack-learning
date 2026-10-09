#!/bin/bash

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

test_case() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" == "$expected" ]; then
    echo -e "${GREEN}  ✅ PASS${NC} $description (${actual})"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} $description (expected $expected, got $actual)"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "============================================================"
echo "🚫 Rate Limiting Test Suite"
echo "============================================================"
echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 1: Login Rate Limit${NC}"

# Send 5 failed logins
for i in {1..5}; do
  curl -s -o /dev/null -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"ratelimit-test@example.com","password":"wrong"}'
done

# The 6th should be rate limited
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ratelimit-test@example.com","password":"wrong"}')

test_case "6th failed login → 429" "429" "$CODE"

# ============================================================
echo -e "${YELLOW}📌 GROUP 2: Rate Limit Headers${NC}"

# Use a fresh email to avoid the previous limit
HEADERS=$(curl -s -D - -o /dev/null \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"headers-test@example.com","password":"wrong"}')

if echo "$HEADERS" | grep -qi "ratelimit-limit"; then
  echo -e "${GREEN}  ✅ PASS${NC} RateLimit-Limit header present"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} RateLimit-Limit header missing"
  FAILED=$((FAILED + 1))
fi

if echo "$HEADERS" | grep -qi "x-ratelimit-remaining"; then
  echo -e "${GREEN}  ✅ PASS${NC} X-RateLimit-Remaining header present"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} X-RateLimit-Remaining header missing"
  FAILED=$((FAILED + 1))
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 3: Retry-After Header${NC}"

# Send 5 more failed logins to trigger limit
for i in {1..5}; do
  curl -s -o /dev/null -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"retry-after-test@example.com","password":"wrong"}'
done

RETRY_HEADERS=$(curl -s -D - -o /dev/null \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"retry-after-test@example.com","password":"wrong"}')

if echo "$RETRY_HEADERS" | grep -qi "retry-after"; then
  echo -e "${GREEN}  ✅ PASS${NC} Retry-After header present"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} Retry-After header missing"
  FAILED=$((FAILED + 1))
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 4: Different Keys Have Different Limits${NC}"

# Alice's failed attempts shouldn't affect Bob's
for i in {1..5}; do
  curl -s -o /dev/null -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"alice-ratelimit@example.com","password":"wrong"}'
done

# Bob's first attempt should still be 401 (not 429)
BOB_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bob-ratelimit@example.com","password":"wrong"}')

test_case "Different email has separate quota → 401" "401" "$BOB_CODE"

# ============================================================
echo -e "${YELLOW}📌 GROUP 5: General API Rate Limit${NC}"

# Check that GET requests are limited
GEN_HEADERS=$(curl -s -D - -o /dev/null "$BASE_URL/api/posts")
if echo "$GEN_HEADERS" | grep -qi "x-ratelimit-limit"; then
  echo -e "${GREEN}  ✅ PASS${NC} General limiter headers present"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} General limiter headers missing"
  FAILED=$((FAILED + 1))
fi

# ============================================================
# RESULTS
# ============================================================
echo ""
echo "============================================================"
TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All $TOTAL rate-limit tests passed!${NC}"
else
  echo -e "${RED}❌ $FAILED of $TOTAL tests failed.${NC}"
fi
echo "============================================================"
echo ""

exit $([ $FAILED -eq 0 ] && echo 0 || echo 1)