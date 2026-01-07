# Kanban StatusKey Fix - Technical Documentation

## Problem Statement

The Kanban board was not displaying projects in their correct columns due to a character encoding mismatch between:
- Column titles (with Portuguese special characters): "Em execução", "Em edição", "Em revisão"
- Project status values in the database (ASCII-friendly): "em-execucao", "em-edicao", "em-revisao"

The KanbanBoard component was converting column titles to status keys using `title.toLowerCase().replace(/\s+/g, '-')`, which produced incorrect mappings:
- "Em execução" → "em-execução" (with ç) vs database "em-execucao" (without ç)
- "Em edição" → "em-edição" (with ç) vs database "em-edicao" (without ç)
- "Em revisão" → "em-revisão" (with ã) vs database "em-revisao" (without ã)

## Solution

Added an explicit `statusKey` field to the `KanbanColumn` model to store the correct ASCII-friendly status value, decoupling the display title from the database status value.

### Changes Made

#### 1. Schema Update (prisma/schema.prisma)

Added `statusKey` field to `KanbanColumn` model:

```prisma
model KanbanColumn {
  id             String   @id @default(uuid())
  organizationId String   @default("default")
  phase          String   // CAPTACAO | EDICAO
  title          String   @default("Default Title")
  statusKey      String?  // Status key para mapear com statusCaptacao/statusEdicao
  position       Int      @default(0)
  // ... other fields
}
```

#### 2. API Bootstrap Update (src/app/api/kanban/columns/bootstrap/route.ts)

Updated default columns to include statusKey:

```typescript
const DEFAULT_COLUMNS = {
  CAPTACAO: [
    { title: 'A agendar', statusKey: 'a-agendar', position: 0, ... },
    { title: 'Agendado', statusKey: 'agendado', position: 1, ... },
    { title: 'Em execução', statusKey: 'em-execucao', position: 2, ... },
    { title: 'Entregue', statusKey: 'entregue', position: 3, ... },
  ],
  EDICAO: [
    { title: 'A iniciar', statusKey: 'a-iniciar', position: 0, ... },
    { title: 'Em edição', statusKey: 'em-edicao', position: 1, ... },
    { title: 'Em revisão', statusKey: 'em-revisao', position: 2, ... },
    { title: 'Entregue', statusKey: 'entregue', position: 3, ... },
  ],
};
```

#### 3. Frontend Update (src/components/kanban/KanbanBoard.tsx)

Updated the component to use `statusKey` instead of deriving it from title:

```typescript
const getProjectsByColumnId = (columnId: string) => {
  const column = columns.find(c => c.id === columnId);
  if (!column) return [];
  
  // Use statusKey if available, otherwise fall back to title-based matching
  const statusToMatch = column.statusKey || column.title.toLowerCase().replace(/\s+/g, '-');
  
  return projects.filter(project => {
    const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
    return currentStatus === statusToMatch;
  });
};
```

#### 4. Seed Update (prisma/seed.ts)

Enhanced seed to:
- Include statusKey for all columns
- Add idempotency checks
- Support `SEED_CLEAN_DATABASE` and `SEED_WITH_SAMPLE_DATA` flags

```typescript
// Check if columns already exist
const existingColumns = await prisma.kanbanColumn.findMany({
  where: { organizationId }
})

if (existingColumns.length === 0) {
  // Create columns with statusKey
  const captacaoColumns = [
    { title: 'A agendar', statusKey: 'a-agendar', ... },
    // ...
  ]
}
```

## Testing

### Database Verification

```sql
-- Check column mapping
SELECT 
  kc.phase,
  kc.title as column_title,
  kc."statusKey",
  COUNT(p.id) as project_count
FROM kanban_columns kc
LEFT JOIN projects p ON (
  (kc.phase = 'CAPTACAO' AND p."statusCaptacao" = kc."statusKey") OR
  (kc.phase = 'EDICAO' AND p."statusEdicao" = kc."statusKey")
)
GROUP BY kc.phase, kc.position, kc.title, kc."statusKey"
ORDER BY kc.phase, kc.position;
```

Results show correct mapping:
- CAPTACAO: 1 project in "A agendar", 1 in "Agendado", 1 in "Em execução", 2 in "Entregue"
- EDICAO: 2 projects in "A iniciar", 1 in "Em edição", 1 in "Em revisão", 1 in "Entregue"

### API Testing

```bash
# Test CAPTACAO columns
curl http://localhost:3001/api/kanban/columns?phase=CAPTACAO

# Test EDICAO columns
curl http://localhost:3001/api/kanban/columns?phase=EDICAO
```

Both endpoints return columns with correct statusKey values.

## Seed Configuration

### Environment Variables

- `SEED_WITH_SAMPLE_DATA=true` - Create comprehensive sample data (6 clients, 10 projects)
- `SEED_CLEAN_DATABASE=true` - Clean existing data before seeding (use with caution)

### Usage

```bash
# First time setup with sample data
SEED_WITH_SAMPLE_DATA=true SEED_CLEAN_DATABASE=true npm run db:seed

# Idempotent mode (safe to run multiple times)
SEED_WITH_SAMPLE_DATA=true npm run db:seed

# Minimal setup (admin + columns only)
npm run db:seed
```

## Migration Guide

For existing installations:

1. Backup your database
2. Run schema migration:
   ```bash
   npx prisma db push
   ```
3. Add statusKey to existing columns:
   ```sql
   UPDATE kanban_columns 
   SET "statusKey" = 'a-agendar' 
   WHERE phase = 'CAPTACAO' AND title = 'A agendar';
   
   UPDATE kanban_columns 
   SET "statusKey" = 'agendado' 
   WHERE phase = 'CAPTACAO' AND title = 'Agendado';
   
   UPDATE kanban_columns 
   SET "statusKey" = 'em-execucao' 
   WHERE phase = 'CAPTACAO' AND title = 'Em execução';
   
   UPDATE kanban_columns 
   SET "statusKey" = 'entregue' 
   WHERE title = 'Entregue';
   
   UPDATE kanban_columns 
   SET "statusKey" = 'a-iniciar' 
   WHERE phase = 'EDICAO' AND title = 'A iniciar';
   
   UPDATE kanban_columns 
   SET "statusKey" = 'em-edicao' 
   WHERE phase = 'EDICAO' AND title = 'Em edição';
   
   UPDATE kanban_columns 
   SET "statusKey" = 'em-revisao' 
   WHERE phase = 'EDICAO' AND title = 'Em revisão';
   ```

## Benefits

1. **Correct Character Encoding**: Display titles can use proper Portuguese characters while database values remain ASCII-friendly
2. **Flexibility**: Allows renaming columns without breaking project associations
3. **Clarity**: Explicit mapping between display and data layers
4. **Idempotency**: Safe to run seed multiple times without duplicating data
5. **Comprehensive Sample Data**: Full dataset for testing and development

## Status Key Mapping

| Phase | Column Title | StatusKey | Notes |
|-------|-------------|-----------|-------|
| CAPTACAO | A agendar | a-agendar | Initial capture planning |
| CAPTACAO | Agendado | agendado | Capture scheduled |
| CAPTACAO | Em execução | em-execucao | Capture in progress |
| CAPTACAO | Entregue | entregue | Capture completed (locked) |
| EDICAO | A iniciar | a-iniciar | Editing to start |
| EDICAO | Em edição | em-edicao | Editing in progress |
| EDICAO | Em revisão | em-revisao | In client review |
| EDICAO | Entregue | entregue | Editing completed (locked) |

## Future Improvements

1. Consider adding statusKey index for faster queries
2. Add validation to ensure statusKey matches expected pattern
3. Create migration script for bulk statusKey updates
4. Add admin UI to manage custom columns with statusKey
