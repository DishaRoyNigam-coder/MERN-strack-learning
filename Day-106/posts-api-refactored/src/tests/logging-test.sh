#!/bin/bash

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_case() {
  local description="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" == "$expected" ]; then
    echo -e "${GREEN}  ✅ PASS${NC} $description"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} $description (expected $expected, got $actual)"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "============================================================"
echo "📝 Logging Test Suite"
echo "============================================================"
echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 1: Request ID in Headers${NC}"

HEADERS=$(curl -s -D - -o /dev/null http://localhost:3000/api/posts)

if echo "$HEADERS" | grep -qi "X-Request-Id"; then
  echo -e "${GREEN}  ✅ PASS${NC} X-Request-Id header present"
  PASSED=$((PASSED + 1))

  # Extract the ID for later
  REQ_ID=$(echo "$HEADERS" | grep -i "X-Request-Id" | awk '{print $2}' | tr -d '\r')
  echo -e "  ${YELLOW}Sample request ID: $REQ_ID${NC}"
else
  echo -e "${RED}  ❌ FAIL${NC} X-Request-Id header missing"
  FAILED=$((FAILED + 1))
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 2: Client-Provided Request ID${NC}"

CUSTOM_ID="my-custom-id-12345"
HEADERS=$(curl -s -D - -o /dev/null \
  -H "X-Request-Id: $CUSTOM_ID" \
  http://localhost:3000/api/posts)

if echo "$HEADERS" | grep -q "$CUSTOM_ID"; then
  echo -e "${GREEN}  ✅ PASS${NC} Server echoes back the client's request ID"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} Server didn't echo the client's request ID"
  FAILED=$((FAILED + 1))
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 3: Log Files Created${NC}"

if [ -d "logs" ]; then
  echo -e "${GREEN}  ✅ PASS${NC} logs/ directory exists"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} logs/ directory missing"
  FAILED=$((FAILED + 1))
fi

if ls logs/app-*.log > /dev/null 2>&1; then
  echo -e "${GREEN}  ✅ PASS${NC} App log file created"
  PASSED=$((PASSED + 1))
else
  echo -e "${RED}  ❌ FAIL${NC} No app log file found"
  FAILED=$((FAILED + 1))
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 4: Redaction Works${NC}"

# Send a login with a specific password
curl -s -o /dev/null -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"redaction-test@example.com","password":"super-secret-unique-password-xyz"}'

sleep 0.5

if grep -q "super-secret-unique-password-xyz" logs/*.log 2>/dev/null; then
  echo -e "${RED}  ❌ FAIL${NC} Password found in logs!"
  FAILED=$((FAILED + 1))
else
  echo -e "${GREEN}  ✅ PASS${NC} Password was NOT logged (redacted)"
  PASSED=$((PASSED + 1))
fi

# ============================================================
echo -e "${YELLOW}📌 GROUP 5: Structured JSON Format${NC}"

# Check that log files contain valid JSON
if [ -f "$(ls logs/app-*.log 2>/dev/null | head -1)" ]; then
  LATEST_LOG=$(ls logs/app-*.log | head -1)
  FIRST_LINE=$(head -1 "$LATEST_LOG")

  if echo "$FIRST_LINE" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ PASS${NC} Log file is valid JSON (structured)"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} Log file is not JSON"
    FAILED=$((FAILED + 1))
  fi

  # Check for required fields
  if echo "$FIRST_LINE" | jq -e '.timestamp' > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ PASS${NC} Log has 'timestamp' field"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} Missing 'timestamp'"
    FAILED=$((FAILED + 1))
  fi

  if echo "$FIRST_LINE" | jq -e '.level' > /dev/null 2>&1; then
    echo -e "${GREEN}  ✅ PASS${NC} Log has 'level' field"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} Missing 'level'"
    FAILED=$((FAILED + 1))
  fi
fi

# ============================================================
# RESULTS
# ============================================================
echo ""
echo "============================================================"
TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All $TOTAL logging tests passed!${NC}"
else
  echo -e "${RED}❌ $FAILED of $TOTAL tests failed.${NC}"
fi
echo "============================================================"
echo ""

exit $([ $FAILED -eq 0 ] && echo 0 || echo 1)