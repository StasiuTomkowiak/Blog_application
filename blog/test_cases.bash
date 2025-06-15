#!/bin/bash

BASE_URL="http://localhost:8080"
TEST_EMAIL="test-$(date +%s)@example.com"

echo "=== Testy API Bloga ==="

# Funkcja sprawdzająca status HTTP
check_status() {
    expected=$1
    actual=$2
    test_name=$3
    
    if [ "$actual" -eq "$expected" ]; then
        echo "✅ SUKCES: $test_name (Status: $actual)"
    else
        echo "❌ BŁĄD: $test_name (Oczekiwany: $expected, Otrzymany: $actual)"
    fi
}

# Test 1: Rejestracja
echo "Test 1: Rejestracja użytkownika"
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\", \"email\": \"$TEST_EMAIL\", \"password\": \"password123\"}")
check_status 201 $status "Rejestracja użytkownika"

# Test 2: Logowanie
echo "Test 2: Logowanie"
TOKEN=$(curl -s -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"password123\"}" | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4)
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"password123\"}")
check_status 200 $status "Logowanie"

# Test 3: Tworzenie kategorii
echo "Test 3: Tworzenie kategorii"
cat_response=$(curl -s -X POST $BASE_URL/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test Kategoria 7"}')
CATEGORY_ID=$(echo $cat_response | grep -o '"id":"[^"]*' | cut -d'"' -f4)
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name": "Test Kategoria4"}')
check_status 201 $status "Tworzenie kategorii"

# Test 4: Tworzenie tagów
echo "Test 4: Tworzenie tagów"
tag_response=$(curl -s -X POST $BASE_URL/api/v1/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"names": ["test-tag"]}')
TAG_ID=$(echo $tag_response | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/v1/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"names": ["api-tag"]}')
check_status 201 $status "Tworzenie tagów"

# Test 5: Tworzenie posta
echo "Test 5: Tworzenie posta"
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"title\": \"Test Blog Post\", \"content\": \"This is a test blog post with sufficient content to meet the minimum requirements.\", \"categoryId\": \"$CATEGORY_ID\", \"tagIds\": [\"$TAG_ID\"], \"status\": \"PUBLISHED\"}")
check_status 201 $status "Tworzenie posta"

# Test 6: Pobieranie kategorii (publiczne)
echo "Test 6: Pobieranie kategorii"
status=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/api/v1/categories)
check_status 200 $status "Pobieranie kategorii"

# Test 7: Dostęp do szkiców bez autoryzacji
echo "Test 7: Dostęp do szkiców bez autoryzacji"
status=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/api/v1/posts/drafts)
check_status 403 $status "Dostęp do szkiców bez autoryzacji"

# Test 8: Dostęp do szkiców z autoryzacją
echo "Test 8: Dostęp do szkiców z autoryzacją"
status=$(curl -s -o /dev/null -w "%{http_code}" -X GET $BASE_URL/api/v1/posts/drafts \
  -H "Authorization: Bearer $TOKEN")
check_status 200 $status "Dostęp do szkiców z autoryzacją"

# Test 9: Nieprawidłowe logowanie
echo "Test 9: Nieprawidłowe logowanie"
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "zly@email.com", "password": "zlehaslo"}')
check_status 401 $status "Nieprawidłowe logowanie"

echo "=== Koniec testów ==="