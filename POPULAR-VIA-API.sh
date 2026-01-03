#!/bin/bash

echo "🚀 Populando banco de dados via API do Railway..."
echo ""

API_URL="https://will-flow.up.railway.app/api"

echo "📋 Criando categorias..."

# Categoria 1: Hotel
curl -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel",
    "description": "Vídeos para hotéis e resorts",
    "color": "#3B82F6"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/cat_hotel.txt
echo "✅ Hotel criado"

# Categoria 2: Experiência
curl -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Experiência",
    "description": "Vídeos de experiências turísticas",
    "color": "#10B981"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/cat_exp.txt
echo "✅ Experiência criada"

# Categoria 3: Drone
curl -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Drone",
    "description": "Captação aérea com drone",
    "color": "#F59E0B"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/cat_drone.txt
echo "✅ Drone criado"

# Categoria 4: Reels
curl -X POST "$API_URL/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Reels",
    "description": "Conteúdo para redes sociais",
    "color": "#EF4444"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/cat_reels.txt
echo "✅ Reels criado"

echo ""
echo "👥 Criando clientes..."

# Cliente 1
curl -X POST "$API_URL/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana Silva",
    "email": "ana.silva@hotel.com",
    "phone": "+351 912 345 678",
    "company": "Hotel Vista Mar"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/client1.txt
echo "✅ Ana Silva criada"

# Cliente 2
curl -X POST "$API_URL/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Santos",
    "email": "joao.santos@experiencias.pt",
    "phone": "+351 913 456 789",
    "company": "Experiências Portugal"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/client2.txt
echo "✅ João Santos criado"

# Cliente 3
curl -X POST "$API_URL/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Costa",
    "email": "maria.costa@resort.com",
    "phone": "+351 914 567 890",
    "company": "Resort Algarve"
  }' 2>/dev/null | jq -r '.data.id' > /tmp/client3.txt
echo "✅ Maria Costa criada"

echo ""
echo "🎬 Criando projetos..."

# Ler IDs
CAT_HOTEL=$(cat /tmp/cat_hotel.txt)
CAT_DRONE=$(cat /tmp/cat_drone.txt)
CAT_REELS=$(cat /tmp/cat_reels.txt)
CLIENT1=$(cat /tmp/client1.txt)
CLIENT2=$(cat /tmp/client2.txt)
CLIENT3=$(cat /tmp/client3.txt)

# Data de hoje + 7 dias
DUE_DATE=$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+7d +"%Y-%m-%dT%H:%M:%SZ")

# Projeto 1
curl -X POST "$API_URL/projects" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Vídeo Promocional Hotel Vista Mar\",
    \"clientId\": \"$CLIENT1\",
    \"categoryId\": \"$CAT_HOTEL\",
    \"videoType\": \"hotel\",
    \"location\": \"Lisboa\",
    \"description\": \"Vídeo promocional para redes sociais\",
    \"clientPrice\": 2500,
    \"captationCost\": 800,
    \"editionCost\": 500,
    \"paymentStatus\": \"a-faturar\",
    \"freelancerPaymentStatus\": \"a-pagar\",
    \"clientDueDate\": \"$DUE_DATE\"
  }" 2>/dev/null
echo "✅ Projeto 1 criado"

# Projeto 2
DUE_DATE2=$(date -u -d "+14 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+14d +"%Y-%m-%dT%H:%M:%SZ")

curl -X POST "$API_URL/projects" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Tour Virtual Resort Algarve\",
    \"clientId\": \"$CLIENT3\",
    \"categoryId\": \"$CAT_DRONE\",
    \"videoType\": \"drone\",
    \"location\": \"Algarve\",
    \"description\": \"Tour aéreo do resort\",
    \"clientPrice\": 3500,
    \"captationCost\": 1200,
    \"editionCost\": 800,
    \"paymentStatus\": \"a-faturar\",
    \"freelancerPaymentStatus\": \"a-pagar\",
    \"clientDueDate\": \"$DUE_DATE2\"
  }" 2>/dev/null
echo "✅ Projeto 2 criado"

# Projeto 3
DUE_DATE3=$(date -u -d "+3 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+3d +"%Y-%m-%dT%H:%M:%SZ")

curl -X POST "$API_URL/projects" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Reels Experiências Portugal\",
    \"clientId\": \"$CLIENT2\",
    \"categoryId\": \"$CAT_REELS\",
    \"videoType\": \"reels\",
    \"location\": \"Porto\",
    \"description\": \"5 reels para Instagram\",
    \"clientPrice\": 1500,
    \"captationCost\": 400,
    \"editionCost\": 300,
    \"paymentStatus\": \"a-receber\",
    \"freelancerPaymentStatus\": \"a-pagar\",
    \"clientDueDate\": \"$DUE_DATE3\"
  }" 2>/dev/null
echo "✅ Projeto 3 criado"

# Limpar arquivos temporários
rm -f /tmp/cat_*.txt /tmp/client*.txt

echo ""
echo "🎉 Concluído!"
echo ""
echo "✅ 4 categorias criadas"
echo "✅ 3 clientes criados"
echo "✅ 3 projetos criados"
echo ""
echo "🌐 Acesse: https://will-flow.up.railway.app"
echo "📧 Email: admin@willflow.com"
echo "🔑 Senha: admin123"
echo ""
echo "🎯 Deve mostrar 3 projetos no Dashboard!"
