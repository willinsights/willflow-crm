#!/usr/bin/env tsx
/**
 * Script para adicionar subtasks de teste aos projetos existentes
 * Uso: bun run scripts/add-test-subtasks.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adicionando subtasks de teste...\n');

  // Buscar todos os projetos
  const projects = await prisma.project.findMany({
    take: 5, // Pegar apenas os 5 primeiros
    include: {
      subtasks: true,
    },
  });

  console.log(`📊 Encontrados ${projects.length} projetos\n`);

  if (projects.length === 0) {
    console.log('❌ Nenhum projeto encontrado!');
    console.log('💡 Crie pelo menos 1 projeto primeiro no sistema.\n');
    return;
  }

  for (const project of projects) {
    console.log(`📁 Projeto: ${project.title}`);
    console.log(`   Subtasks existentes: ${project.subtasks.length}`);

    if (project.subtasks.length >= 3) {
      console.log('   ✓ Já tem subtasks suficientes, pulando...\n');
      continue;
    }

    // Adicionar 3 subtasks de exemplo
    const subtasksToCreate = [
      {
        title: 'Edição principal do vídeo',
        description: 'Editar todo o material capturado, incluindo cortes, transições e correção de cor.',
        projectId: project.id,
        completed: false,
        priority: 'high' as const,
        status: 'in_progress' as const,
        estimatedHours: 10,
        actualHours: 7,
        tags: JSON.stringify(['edição', 'vídeo', 'prioritário']),
        order: 1,
      },
      {
        title: 'Revisão com cliente',
        description: 'Apresentar primeira versão para o cliente e coletar feedback.',
        projectId: project.id,
        completed: false,
        priority: 'medium' as const,
        status: 'todo' as const,
        estimatedHours: 2,
        actualHours: 0,
        tags: JSON.stringify(['revisão', 'cliente']),
        order: 2,
      },
      {
        title: 'Finalização e entrega',
        description: 'Aplicar ajustes finais, renderizar e entregar o projeto ao cliente.',
        projectId: project.id,
        completed: false,
        priority: 'urgent' as const,
        status: 'todo' as const,
        estimatedHours: 5,
        actualHours: 0,
        tags: JSON.stringify(['entrega', 'final']),
        order: 3,
      },
    ];

    for (const subtaskData of subtasksToCreate) {
      const subtask = await prisma.subtask.create({
        data: subtaskData,
      });

      console.log(`   ✓ Criada: ${subtask.title}`);

      // Adicionar checklist de exemplo
      await prisma.subtaskChecklist.createMany({
        data: [
          {
            subtaskId: subtask.id,
            title: 'Revisar material bruto',
            completed: true,
            order: 1,
            completedAt: new Date(),
            completedBy: 'admin@willflow.pt',
          },
          {
            subtaskId: subtask.id,
            title: 'Fazer cortes principais',
            completed: true,
            order: 2,
            completedAt: new Date(),
            completedBy: 'admin@willflow.pt',
          },
          {
            subtaskId: subtask.id,
            title: 'Adicionar transições',
            completed: false,
            order: 3,
          },
          {
            subtaskId: subtask.id,
            title: 'Correção de cor',
            completed: false,
            order: 4,
          },
          {
            subtaskId: subtask.id,
            title: 'Adicionar música',
            completed: false,
            order: 5,
          },
        ],
      });

      // Adicionar comentários de exemplo
      await prisma.subtaskComment.createMany({
        data: [
          {
            subtaskId: subtask.id,
            content: 'Começando a edição. Material está muito bom!',
            createdBy: 'editor@willflow.pt',
            isEdited: false,
          },
          {
            subtaskId: subtask.id,
            content: 'Cliente pediu para dar mais ênfase na cerimônia.',
            createdBy: 'admin@willflow.pt',
            isEdited: false,
          },
        ],
      });

      // Adicionar registro de atividade
      await prisma.subtaskActivity.createMany({
        data: [
          {
            subtaskId: subtask.id,
            action: 'created',
            newValue: subtask.title,
            userId: 'system',
          },
          {
            subtaskId: subtask.id,
            action: 'updated',
            field: 'status',
            oldValue: 'todo',
            newValue: subtask.status,
            userId: 'admin@willflow.pt',
          },
        ],
      });
    }

    console.log(`   ✅ Adicionadas 3 subtasks com checklist, comentários e histórico!\n`);
  }

  console.log('✅ Processo concluído!\n');
  console.log('🎯 AGORA FAÇA:');
  console.log('1. Abra: https://willflow-crm-production.up.railway.app');
  console.log('2. Login: admin@willflow.pt / admin123');
  console.log('3. Vá em Projetos');
  console.log('4. Clique em qualquer SUBTASK');
  console.log('5. O modal com 4 abas deve abrir! 🎉\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
