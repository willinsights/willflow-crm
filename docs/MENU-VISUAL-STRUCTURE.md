# Menu Lateral - Estrutura Visual

## Desktop - Modo Expandido

```
┌─────────────────────────────────────────┐
│  🎨 WillFlow                            │
│  Porque criar deve ser simples.        │
├─────────────────────────────────────────┤
│                                         │
│  VISÃO GERAL                            │
│  🏠 Dashboard                           │
│                                         │
│  PROJETOS                               │
│  🎥 Captação                        [2] │
│  ✏️  Edição                          [1] │
│  ✅ Finalizados                         │
│                                         │
│  FINANÇAS                               │
│  💶 Pagamentos                          │
│  📊 Relatórios                          │
│                                         │
│  FERRAMENTAS                            │
│  📅 Calendário                          │
│  📁 Media                               │
│                                         │
│  GESTÃO                                 │
│  💼 Clientes                            │
│  👥 Colaboradores                       │
│  🏷️  Categorias                         │
│                                         │
│  SISTEMA                                │
│  ⚙️  Configurações                      │
│                                         │
├─────────────────────────────────────────┤
│  Progresso do Mês                       │
│  Projetos: 2/5                          │
│  ████████░░░░░░░░░░ 40%                 │
│                                         │
│  Em andamento: 3                        │
│  Finalizados: 12                        │
├─────────────────────────────────────────┤
│  ◀ Recolher menu                        │
└─────────────────────────────────────────┘
```

## Desktop - Modo Colapsado

```
┌────┐
│ 🏠 │ Dashboard
├────┤
│    │
│ 🎥 │ Captação [2]
│ ✏️  │ Edição [1]
│ ✅ │ Finalizados
│    │
│ 💶 │ Pagamentos
│ 📊 │ Relatórios
│    │
│ 📅 │ Calendário
│ 📁 │ Media
│    │
│ 💼 │ Clientes
│ 👥 │ Colaboradores
│ 🏷️  │ Categorias
│    │
│ ⚙️  │ Configurações
│    │
├────┤
│ ▶  │ Expandir
└────┘
```

## Mobile - Bottom Navigation

```
┌─────────────────────────────────────────┐
│                                         │
│         CONTEÚDO PRINCIPAL              │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  🏠      🎥      ✏️       💰      ⋯      │
│  Início  Captação Edição  Finanças Mais │
└─────────────────────────────────────────┘
                                    │
                                    └─> Abre menu completo
```

## Mobile - Menu "Mais" (Sheet)

```
┌─────────────────────────────────────────┐
│  ═══                                    │
│                                         │
│  Menu                              ✕   │
├─────────────────────────────────────────┤
│  👤 João Silva                          │
│  Admin                                  │
├─────────────────────────────────────────┤
│                                         │
│  ✅  Finalizados                    ●  │
│  📊  Relatórios                         │
│  📅  Calendário                         │
│  📁  Media                              │
│  💼  Clientes                           │
│  👥  Colaboradores                      │
│  🏷️   Categorias                         │
│  ⚙️   Configurações                      │
│                                         │
├─────────────────────────────────────────┤
│  Tema                                   │
│  [🌙 Escuro] [☀️ Claro] [ OLED]         │
│                                         │
│  🚪 Sair                                │
└─────────────────────────────────────────┘
```

## Estado Ativo - Desktop

```
┌─────────────────────────────────────────┐
│  PROJETOS                               │
│  🎥 Captação                        [2] │
│▌ ✏️  Edição                          [1]│ ← Item ativo
│  ✅ Finalizados                         │
│                                         │
│  FINANÇAS                               │
│  💶 Pagamentos                          │
│  📊 Relatórios                          │
└─────────────────────────────────────────┘

Legend:
▌ = Barra indicadora roxo (purple-500)
Background do item ativo: rgba(255, 255, 255, 0.1)
Texto: purple-400
```

## Hierarquia de Cores

### Light Mode
```
Categorias: text-gray-500
Items: text-gray-700
Item ativo: text-purple-600
Hover: bg-purple-50
```

### Dark Mode
```
Categorias: text-gray-400
Items: text-gray-200
Item ativo: text-purple-400
Hover: bg-white/10
```

### OLED Mode
```
Background: #000000
Categorias: text-gray-500
Items: text-gray-100
Item ativo: text-purple-300
```

## Interações

### Desktop

1. **Click em item**
   - Navega para rota
   - Adiciona classe `.active`
   - Fecha sidebar em mobile

2. **Hover em item**
   - Background: `rgba(255, 255, 255, 0.1)`
   - Cursor: pointer
   - Transição: 300ms

3. **Click em "Recolher"**
   - Alterna entre expandido/colapsado
   - Salva estado em localStorage
   - Mostra tooltips quando colapsado

### Mobile

1. **Tap em bottom nav**
   - Navega imediatamente
   - Destaque visual

2. **Tap em "Mais"**
   - Abre sheet modal
   - Overlay com backdrop
   - Swipe down para fechar

3. **FAB (Floating Action Button)**
   - Sempre visível
   - Abre modal de criar projeto
   - Posição: bottom-right

## Animações e Transições

### Sidebar Collapse/Expand
```css
transition: all 300ms ease-out;
```

### Menu Items Hover
```css
transition: all 300ms;
```

### Mobile Sheet
```css
animation: slide-up 300ms ease-out;
```

### Active State
```css
transition: background 200ms, color 200ms;
```

## Responsividade Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px | Mobile compact |
| 640px - 1023px | Tablet (still uses mobile nav) |
| ≥ 1024px | Desktop sidebar |
| ≥ 1280px | Desktop sidebar + expanded content |

## Acessibilidade

### ARIA Labels
```html
<nav aria-label="Main navigation">
  <button aria-label="Dashboard" aria-current="page">
    ...
  </button>
</nav>
```

### Keyboard Navigation
- `Tab` - Navigate between items
- `Enter` / `Space` - Activate item
- `Escape` - Close mobile menu

### Focus States
```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-purple-500
focus-visible:ring-offset-2
```

## Performance

### Lazy Loading
- Menu renderizado uma vez
- Componentes de rota lazy-loaded

### Memorização
- `navigationSections` memoizado
- `projectsByPhase` calculado com useMemo

### Bundle Size
- Icons: tree-shaken from lucide-react
- CSS: purged by Tailwind

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Sidebar | ✅ | ✅ | ✅ | ✅ |
| Bottom Nav | ✅ | ✅ | ✅ | ✅ |
| Touch Gestures | ✅ | ✅ | ✅ | ✅ |
| Tooltips | ✅ | ✅ | ✅ | ✅ |
| Transitions | ✅ | ✅ | ✅ | ✅ |

---

**Nota:** Esta é uma representação visual em ASCII. Para visualizar o design real, execute o aplicativo em desenvolvimento.
