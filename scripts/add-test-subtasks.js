// Script simplificado em JavaScript puro
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adicionando subtasks de teste...\n');

  // Buscar projetos
  const projects = await prisma.project.findMany({
    take: 3,
    include: { subtasks: true },
  });

  console.log(`📊 Encontrados ${projects.length} projetos\n`);

  if (projects.length === 0) {
    console.log('❌ Nenhum projeto encontrado!');
    console.log('💡 Crie pelo menos 1 projeto no sistema primeiro.\n');
    return;
  }

  for (const project of projects) {
    console.log(`📁 Projeto: ${project.title}`);
    
    if (project.subtasks.length >= 2) {
      console.log('   ✓ Já tem subtasks, pulando...\n');
      continue;
    }

    // Criar 3 subtasks
    const subtask1 = await prisma.subtask.create({
      data: {
        title: 'Edição principal do vídeo',
        description: 'Editar todo o material capturado, incluindo cortes, transições e correção de cor.',
        projectId: project.id,
        completed: false,
        priority: 'high',
        status: 'in_progress',
        estimatedHours: 10,
        actualHours: 7,
        tags: '["edição","vídeo","prioritário"]',
        order: 1,
      },
    });

    console.log(`   ✓ Criada: ${subtask1.title}`);

    // Adicionar checklist
    await prisma.subtaskChecklist.createMany({
      data: [
        {
          subtaskId: subtask1.id,
          title: 'Revisar material bruto',
          completed: true,
          order: 1,
          completedAt: new Date(),
          completedBy: 'admin@willflow.pt',
        },
        {
          subtaskId: subtask1.id,
          title: 'Fazer cortes principais',
          completed: true,
          order: 2,
          completedAt: new Date(),
        },
        {
          subtaskId: subtask1.id,
          title: 'Adicionar transições',
          completed: false,
          order: 3,
        },
        {
          subtaskId: subtask1.id,
          title: 'Correção de cor',
          completed: false,
          order: 4,
        },
      ],
    });

    // Adicionar comentários
    await prisma.subtaskComment.createMany({
      data: [
        {
          subtaskId: subtask1.id,
          content: 'Começando a edição. Material está muito bom!',
          createdBy: 'editor@willflow.pt',
          isEdited: false,
        },
        {
          subtaskId: subtask1.id,
          content: 'Cliente pediu para dar mais ênfase na cerimônia.',
          createdBy: 'admin@willflow.pt',
          isEdited: false,
        },
      ],
    });

    // Adicionar atividades
    await prisma.subtaskActivity.createMany({
      data: [
        {
          subtaskId: subtask1.id,
          action: 'created',
          newValue: subtask1.title,
          userId: 'system',
        },
        {
          subtaskId: subtask1.id,
          action: 'updated',
          field: 'status',
          oldValue: 'todo',
          newValue: 'in_progress',
          userId: 'admin@willflow.pt',
        },
      ],
    });

    const subtask2 = await prisma.subtask.create({
      data: {
        title: 'Revisão com cliente',
        description: 'Apresentar primeira versão e coletar feedback.',
        projectId: project.id,
        completed: false,
        priority: 'medium',
        status: 'todo',
        estimatedHours: 2,
        order: 2,
      },
    });

    console.log(`   ✓ Criada: ${subtask2.title}`);

    const subtask3 = await prisma.subtask.create({
      data: {
        title: 'Finalização e entrega',
        description: 'Aplicar ajustes finais e entregar ao cliente.',
        projectId: project.id,
        completed: false,
        priority: 'urgent',
        status: 'todo',
        estimatedHours: 5,
        order: 3,
      },
    });

    console.log(`   ✓ Criada: ${subtask3.title}`);
    console.log(`   ✅ Adicionadas 3 subtasks completas!\n`);
  }

  console.log('✅ CONCLUÍDO!\n');
  console.log('🎯 AGORA:');
  console.log('1. Faça hard refresh: Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Win)');
  console.log('2. Vá em Projetos');
  console.log('3. Clique em qualquer SUBTASK');
  console.log('4. Modal com 4 abas deve abrir! 🎉\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
