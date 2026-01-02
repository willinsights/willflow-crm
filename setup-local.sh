#!/bin/bash

# 🚀 Script de Setup Local - WillFlow CRM
# Configura ambiente local para desenvolvimento

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Setup Local - WillFlow CRM + Task Details          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se Docker está rodando
echo -e "${YELLOW}1️⃣  Verificando Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando!${NC}"
    echo ""
    echo "Por favor, inicie o Docker e rode este script novamente."
    echo ""
    echo "Ou configure DATABASE_URL manualmente no .env para usar:"
    echo "  - Banco do Railway"
    echo "  - PostgreSQL já instalado localmente"
    exit 1
fi
echo -e "${GREEN}✅ Docker está rodando${NC}"

# Iniciar PostgreSQL via Docker
echo ""
echo -e "${YELLOW}2️⃣  Iniciando PostgreSQL...${NC}"
docker-compose up -d postgres

# Aguardar PostgreSQL estar pronto
echo -e "${BLUE}   Aguardando PostgreSQL ficar pronto...${NC}"
sleep 5

until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo -e "${YELLOW}   Aguardando PostgreSQL...${NC}"
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL pronto!${NC}"

# Verificar se .env existe
echo ""
echo -e "${YELLOW}3️⃣  Verificando .env...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Criando .env...${NC}"
    cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/willflow_crm"
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
fi
echo -e "${GREEN}✅ .env configurado${NC}"

# Instalar dependências
echo ""
echo -e "${YELLOW}4️⃣  Instalando dependências...${NC}"
bun install
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# Aplicar migrations
echo ""
echo -e "${YELLOW}5️⃣  Aplicando migrations no banco de dados...${NC}"
bunx prisma migrate dev --name init_with_task_details
echo -e "${GREEN}✅ Migrations aplicadas${NC}"

# Gerar Prisma Client
echo ""
echo -e "${YELLOW}6️⃣  Gerando Prisma Client...${NC}"
bunx prisma generate
echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# Seed (opcional)
echo ""
read -p "$(echo -e ${YELLOW}Deseja popular o banco com dados de exemplo? [s/N]:${NC} )" -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}7️⃣  Populando banco de dados...${NC}"
    bun run db:seed
    echo -e "${GREEN}✅ Banco populado${NC}"
fi

# Resumo
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                 ✅ Setup Completo!                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ PostgreSQL rodando em:${NC} localhost:5432"
echo -e "${GREEN}✅ Banco de dados:${NC} willflow_crm"
echo -e "${GREEN}✅ Migrations aplicadas${NC}"
echo -e "${GREEN}✅ Prisma Client gerado${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo ""
echo "  1. Iniciar servidor de desenvolvimento:"
echo "     ${BLUE}bun run dev${NC}"
echo ""
echo "  2. Acessar aplicação:"
echo "     ${BLUE}http://localhost:3000${NC}"
echo ""
echo "  3. Ver banco de dados (Prisma Studio):"
echo "     ${BLUE}bunx prisma studio${NC}"
echo ""
echo "  4. Parar PostgreSQL quando terminar:"
echo "     ${BLUE}docker-compose down${NC}"
echo ""
echo -e "${GREEN}Boa sorte! 🚀${NC}"
echo ""
