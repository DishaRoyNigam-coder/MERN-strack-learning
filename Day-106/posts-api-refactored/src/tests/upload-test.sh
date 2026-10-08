#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIES="/tmp/upload-cookies-$$.txt"
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
    echo -e "${GREEN}  ✅ PASS${NC} $description (${actual})"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}  ❌ FAIL${NC} $description (expected $expected, got $actual)"
    FAILED=$((FAILED + 1))
  fi
}

echo ""
echo "============================================================"
echo "📤 File Upload Test Suite"
echo "============================================================"
echo ""

# --- Create test images ---
echo -e "${YELLOW}🎨 Creating test files...${NC}"

# Small valid JPEG (1x1 pixel, red)
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\x27 ,#\x1c\x1c(7),01444\x1f\x27\x39=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xd2\xcf \xff\xd9' > /tmp/test-image.jpg

# Not-an-image
echo "This is definitely not an image" > /tmp/not-an-image.txt

# Huge file (6MB, over the 5MB limit)
dd if=/dev/zero of=/tmp/huge.jpg bs=1M count=6 2>/dev/null

echo -e "${GREEN}  ✅ Test files created${NC}"
echo ""

# --- Login ---
echo -e "${YELLOW}🔑 Logging in...${NC}"
LOGIN=$(curl -s -c "$COOKIES" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"user123"}')

if echo "$LOGIN" | grep -q "success.*true"; then
  echo -e "${GREEN}  ✅ Logged in${NC}"
else
  echo -e "${RED}  ❌ Login failed${NC}"
  exit 1
fi
echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 1: Successful Uploads${NC}"

CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" \
  -X POST "$BASE_URL/api/auth/me/avatar" \
  -F "avatar=@/tmp/test-image.jpg")

test_case "Upload avatar (JPEG) → 200" "200" "$CODE"

echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 2: Authentication${NC}"

NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/api/auth/me/avatar" \
  -F "avatar=@/tmp/test-image.jpg")

test_case "Upload without auth → 401" "401" "$NO_AUTH"

echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 3: File Validation${NC}"

WRONG_TYPE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" \
  -X POST "$BASE_URL/api/auth/me/avatar" \
  -F "avatar=@/tmp/not-an-image.txt")

test_case "Non-image file → 422" "422" "$WRONG_TYPE"

TOO_BIG=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" \
  -X POST "$BASE_URL/api/auth/me/avatar" \
  -F "avatar=@/tmp/huge.jpg")

test_case "File too large (>5MB) → 413" "413" "$TOO_BIG"

WRONG_FIELD=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" \
  -X POST "$BASE_URL/api/auth/me/avatar" \
  -F "wrongfield=@/tmp/test-image.jpg")

test_case "Wrong field name → 400/422" "400" "$WRONG_FIELD"

echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 4: Static File Serving${NC}"

# Extract the avatar URL from the response
AVATAR_URL=$(curl -s -b "$COOKIES" -X POST "$BASE_URL/api/auth/me/avatar" \
  -F "avatar=@/tmp/test-image.jpg" \
  | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$AVATAR_URL" ]; then
  STATIC_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$AVATAR_URL")
  test_case "Static file is accessible → 200" "200" "$STATIC_CODE"
else
  echo -e "${RED}  ❌ Could not extract avatar URL${NC}"
  FAILED=$((FAILED + 1))
fi

echo ""

# ============================================================
echo -e "${YELLOW}📌 GROUP 5: Deletion${NC}"

DELETE_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -b "$COOKIES" -X DELETE "$BASE_URL/api/auth/me/avatar")

test_case "Delete avatar → 200" "200" "$DELETE_CODE"

# Verify it's gone
if [ -n "$AVATAR_URL" ]; then
  GONE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$AVATAR_URL")
  test_case "Deleted file no longer served → 404" "404" "$GONE_CODE"
fi

echo ""

# ============================================================
# RESULTS
# ============================================================
echo "============================================================"
TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All $TOTAL upload tests passed!${NC}"
else
  echo -e "${RED}❌ $FAILED of $TOTAL tests failed.${NC}"
  echo -e "${GREEN}   Passed: $PASSED${NC}"
fi
echo "============================================================"
echo ""

rm -f "$COOKIES" /tmp/test-image.jpg /tmp/not-an-image.txt /tmp/huge.jpg
exit $([ $FAILED -eq 0 ] && echo 0 || echo 1)