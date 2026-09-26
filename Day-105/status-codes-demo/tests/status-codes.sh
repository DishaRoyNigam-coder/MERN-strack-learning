#!/bin/bash

# ============================================================
# Status Code Test Suite
# ============================================================

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Helper: Test a request and check status code
test_status() {
  local description="$1"
  local expected="$2"
  local method="$3"
  local url="$4"
  local data="$5"

  if [ -n "$data" ]; then
    actual=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$url" \
      -H "Content-Type: application/json" -d "$data")
  else
    actual=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$url")
  fi

  if [ "$actual" == "$expected" ]; then
    echo -e "${GREEN}✅ PASS${NC} $description → $actual"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}❌ FAIL${NC} $description → Expected $expected, got $actual"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "============================================================"
echo "🧪 HTTP Status Code Test Suite"
echo "============================================================"
echo ""

echo "📌 200 OK — Success cases"
test_status "GET /api/users" 200 GET "/api/users"
test_status "GET /api/users/1" 200 GET "/api/users/1"
test_status "PUT /api/users/2" 200 PUT "/api/users/2" '{"name":"Bob Smith","email":"bob@example.com","age":35,"role":"user"}'
test_status "PATCH /api/users/2" 200 PATCH "/api/users/2" '{"age":36}'

echo ""
echo "📌 201 Created"
test_status "POST /api/users" 201 POST "/api/users" '{"name":"Test User","email":"test'$(date +%s)'@example.com","age":30}'

echo ""
echo "📌 400 Bad Request"
test_status "GET /api/users/abc" 400 GET "/api/users/abc"
test_status "GET /api/users/-1" 400 GET "/api/users/-1"

echo ""
echo "📌 404 Not Found"
test_status "GET /api/users/9999" 404 GET "/api/users/9999"
test_status "GET /api/nonexistent" 404 GET "/api/nonexistent"

echo ""
echo "📌 409 Conflict"
test_status "POST duplicate email" 409 POST "/api/users" '{"name":"Alice Duplicate","email":"alice@example.com"}'

echo ""
echo "📌 422 Unprocessable Entity"
test_status "POST invalid data" 422 POST "/api/users" '{"name":"X","email":"bad","age":-5}'

echo ""
echo "============================================================"
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "============================================================"
echo ""

exit $([ $FAILED -eq 0 ] && echo 0 || echo 1)