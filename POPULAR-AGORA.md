# ⚡ POPULAR BANCO AGORA - Copie e Cole

## 🎯 Opção Mais Simples (Copie Todo o Bloco)

**Cole isso no seu terminal Mac**:

```bash
# Criar categorias
echo "Criando categorias..."
curl -X POST "https://will-flow.up.railway.app/api/categories" -H "Content-Type: application/json" -d '{"name":"Hotel","description":"Vídeos para hotéis","color":"#3B82F6"}' && echo " ✅ Hotel"
curl -X POST "https://will-flow.up.railway.app/api/categories" -H "Content-Type: application/json" -d '{"name":"Experiência","description":"Experiências turísticas","color":"#10B981"}' && echo " ✅ Experiência"
curl -X POST "https://will-flow.up.railway.app/api/categories" -H "Content-Type: application/json" -d '{"name":"Drone","description":"Captação aérea","color":"#F59E0B"}' && echo " ✅ Drone"
curl -X POST "https://will-flow.up.railway.app/api/categories" -H "Content-Type: application/json" -d '{"name":"Reels","description":"Redes sociais","color":"#EF4444"}' && echo " ✅ Reels"

# Criar clientes
echo "Criando clientes..."
curl -X POST "https://will-flow.up.railway.app/api/clients" -H "Content-Type: application/json" -d '{"name":"Ana Silva","email":"ana.silva@hotel.com","phone":"+351912345678","company":"Hotel Vista Mar"}' && echo " ✅ Ana Silva"
curl -X POST "https://will-flow.up.railway.app/api/clients" -H "Content-Type: application/json" -d '{"name":"João Santos","email":"joao.santos@exp.pt","phone":"+351913456789","company":"Experiências Portugal"}' && echo " ✅ João Santos"
curl -X POST "https://will-flow.up.railway.app/api/clients" -H "Content-Type: application/json" -d '{"name":"Maria Costa","email":"maria.costa@resort.com","phone":"+351914567890","company":"Resort Algarve"}' && echo " ✅ Maria Costa"

echo ""
echo "🎉 Pronto! Agora crie os projetos pelo painel web."
echo "🌐 Acesse: https://will-flow.up.railway.app"
```

---

## ✅ Depois de Executar

1. **Acesse**: https://will-flow.up.railway.app
2. **Login**: admin@willflow.com / admin123
3. **Clique em** "Novo Projeto" (botão roxo no canto superior direito)
4. **Preencha**:
   - Título: "Vídeo Promocional Hotel Vista Mar"
   - Cliente: Ana Silva
   - Categoria: Hotel
   - Fluxo: Completo (Captação + Edição)
   - Preço: 2500
   - Captação: 800
   - Edição: 500
5. **Clique em** "Criar Projeto"

**Repita para criar mais projetos!**

---

## 📊 O Que Vai Aparecer

Depois de criar 1-2 projetos pelo painel:

✅ **Dashboard**:
- Total de projetos: 2
- Clientes: 3
- Receita total: €X.XXX

✅ **Projetos → Edição**:
- Vídeo Promocional Hotel Vista Mar
- (outros que criar)

✅ **Clicar num projeto**:
- Painel modal abre!
- Todos os campos editáveis
- Autosave funciona

---

## 🚀 Testando o Painel Modal

1. Vá em "Projetos → Edição"
2. Clique em qualquer card de projeto
3. **Painel abre** com:
   - ✅ Título editável
   - ✅ 4 tabs (Descrição, Checklist, Comentários, Atividade)
   - ✅ Status e prioridade editáveis
   - ✅ Data de entrega
   - ✅ Categoria editável
   - ✅ Campo ID personalizado
   - ✅ Autosave (veja "Guardado" aparecer)

---

## 💡 Dica Rápida

Se quiser popular com 3 projetos de exemplo **automaticamente**, baixe e execute:

```bash
# No terminal Mac
cd ~/Downloads  # ou onde quiser
curl -O https://raw.githubusercontent.com/willinsights/willflow-crm/main/POPULAR-VIA-API.sh
chmod +x POPULAR-VIA-API.sh
./POPULAR-VIA-API.sh
```

Mas precisa ter `jq` instalado:
```bash
brew install jq
```

---

## ✅ Checklist de Verificação

- [ ] Executei os comandos curl acima
- [ ] Categorias apareceram (✅ Hotel, Experiência, Drone, Reels)
- [ ] Clientes apareceram (✅ Ana, João, Maria)
- [ ] Criei pelo menos 1 projeto pelo painel
- [ ] Dashboard mostra os números corretos
- [ ] Cliquei num projeto e o painel modal abriu
- [ ] Testei editar um campo e vi "Guardado"

---

🎉 **SISTEMA PRONTO PARA USO!**
