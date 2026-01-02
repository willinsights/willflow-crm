#!/bin/bash

# Test Production APIs - WillFlow CRM
# URL: https://will-flow.up.railway.app

BASE_URL="https://will-flow.up.railway.app"

echo "🚀 TESTANDO APIs WillFlow CRM - PRODUÇÃO"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL=0
PASSED=0
FAILED=0

# Function to test API
test_api() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    TOTAL=$((TOTAL + 1))

    echo -n "[$TOTAL] $description... "

    if [ -z "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✅ OK ($response)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL ($response)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# GET APIs
echo "📥 GET APIs (Leitura)"
echo "--------------------"
test_api "GET" "/api/health" "" "Health Check"
test_api "GET" "/api/projects" "" "List Projects"
test_api "GET" "/api/clients" "" "List Clients"
test_api "GET" "/api/categories" "" "List Categories"
test_api "GET" "/api/users" "" "List Users"
echo ""

# POST APIs - Criar recursos de teste
echo "📤 POST APIs (Criação)"
echo "----------------------"

# Get first client ID for testing
CLIENT_ID=$(curl -s "$BASE_URL/api/clients" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
PROJECT_ID=$(curl -s "$BASE_URL/api/projects" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo -e "${YELLOW}🔍 Client ID para testes: $CLIENT_ID${NC}"
echo -e "${YELLOW}🔍 Project ID para testes: $PROJECT_ID${NC}"
echo ""

if [ -n "$CLIENT_ID" ]; then
    test_api "POST" "/api/clients/$CLIENT_ID/communications" \
        '{"type":"email","subject":"Teste Produção","content":"Email de teste do script automatizado","date":"2025-11-09T09:30:00Z"}' \
        "Create Client Communication"

    test_api "POST" "/api/clients/$CLIENT_ID/notes" \
        '{"content":"Nota de teste em produção - Script automatizado V100","createdBy":"admin@willflow.com"}' \
        "Create Client Note"
else
    echo -e "${RED}❌ Nenhum cliente encontrado, pulando testes de comunicação${NC}"
fi

if [ -n "$PROJECT_ID" ]; then
    test_api "POST" "/api/projects/$PROJECT_ID/budget" \
        '{"category":"Equipamentos","description":"Câmera teste","amount":5000,"type":"expense"}' \
        "Create Budget Item"

    test_api "POST" "/api/projects/$PROJECT_ID/files" \
        '{"name":"video-teste.mp4","size":1048576,"type":"video/mp4","url":"https://example.com/test.mp4"}' \
        "Upload Project File"
else
    echo -e "${RED}❌ Nenhum projeto encontrado, pulando testes de orçamento/files${NC}"
fi

echo ""

# PUT APIs - Atualizar recursos
echo "🔄 PUT APIs (Atualização)"
echo "-------------------------"

if [ -n "$PROJECT_ID" ]; then
    test_api "PUT" "/api/projects/$PROJECT_ID/status" \
        '{"phase":"captacao","statusCaptacao":"em-progresso"}' \
        "Update Project Status"
fi

echo ""

# GET APIs com ID específico
echo "📋 GET APIs com ID (Detalhes)"
echo "-----------------------------"

if [ -n "$PROJECT_ID" ]; then
    test_api "GET" "/api/projects/$PROJECT_ID" "" "Get Project Details"
    test_api "GET" "/api/projects/$PROJECT_ID/budget" "" "Get Project Budget"
    test_api "GET" "/api/projects/$PROJECT_ID/files" "" "Get Project Files"
fi

if [ -n "$CLIENT_ID" ]; then
    test_api "GET" "/api/clients/$CLIENT_ID" "" "Get Client Details"
    test_api "GET" "/api/clients/$CLIENT_ID/communications" "" "Get Client Communications"
    test_api "GET" "/api/clients/$CLIENT_ID/notes" "" "Get Client Notes"
fi

echo ""
echo "=========================================="
echo "📊 RESULTADOS FINAIS"
echo "=========================================="
echo -e "Total de testes: $TOTAL"
echo -e "${GREEN}✅ Passou: $PASSED${NC}"
echo -e "${RED}❌ Falhou: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}✅ Sistema 100% funcional em produção${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Alguns testes falharam. Verifique os logs acima.${NC}"
    exit 1
fi
