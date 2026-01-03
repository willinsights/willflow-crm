import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adicionando subtasks de exemplo...\n');

  // Buscar projetos existentes
  const projects = await prisma.project.findMany({
    take: 5, // Pegar os 5 primeiros projetos
    orderBy: { createdAt: 'desc' }
  });

  if (projects.length === 0) {
    console.log('❌ Nenhum projeto encontrado no banco de dados.');
    console.log('💡 Crie alguns projetos primeiro antes de adicionar subtasks.');
    return;
  }

  console.log(`✅ Encontrados ${projects.length} projetos\n`);

  // Adicionar subtasks em cada projeto
  for (const project of projects) {
    console.log(`📝 Projeto: ${project.title}`);

    // Criar 3-5 subtasks por projeto
    const subtasksCount = Math.floor(Math.random() * 3) + 3; // 3-5 subtasks

    const subtasksToCreate = [];

    for (let i = 0; i < subtasksCount; i++) {
      const subtaskTemplates = [
        { title: 'Importar arquivos do NAS', completed: true },
        { title: 'Fazer decupagem inicial', completed: true },
        { title: 'Editar sequência principal', completed: false },
        { title: 'Adicionar trilha sonora', completed: false },
        { title: 'Correção de cores', completed: false },
        { title: 'Exportar versão final', completed: false },
        { title: 'Revisar com cliente', completed: false },
        { title: 'Fazer ajustes finais', completed: false },
        { title: 'Entregar versão final', completed: false },
      ];

      const template = subtaskTemplates[i % subtaskTemplates.length];

      subtasksToCreate.push({
        projectId: project.id,
        title: template.title,
        description: `Descrição detalhada da tarefa: ${template.title}`,
        completed: template.completed,
        priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
        status: template.completed ? 'done' : i % 2 === 0 ? 'in_progress' : 'todo',
        order: i,
        dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // i+1 dias no futuro
        estimatedHours: Math.floor(Math.random() * 8) + 2, // 2-10 horas
        actualHours: template.completed ? Math.floor(Math.random() * 6) + 1 : undefined,
      });
    }

    // Criar subtasks no banco
    await prisma.subtask.createMany({
      data: subtasksToCreate
    });

    console.log(`   ✅ Criadas ${subtasksCount} subtasks\n`);
  }

  // Mostrar estatísticas finais
  const totalSubtasks = await prisma.subtask.count();
  console.log(`\n🎉 Concluído! Total de subtasks no banco: ${totalSubtasks}`);
  console.log('\n💡 Agora você pode:');
  console.log('   1. Acessar https://will-flow.up.railway.app');
  console.log('   2. Ir para Projetos → Edição');
  console.log('   3. Clicar numa subtarefa dentro do card');
  console.log('   4. O painel Asana-style vai abrir! 🎉\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
