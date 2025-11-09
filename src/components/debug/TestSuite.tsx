'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Circle,
  Download,
  RotateCcw,
  Play,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TestItem {
  id: string;
  category: string;
  description: string;
  status: 'pending' | 'passed' | 'failed';
  notes?: string;
}

const INITIAL_TESTS: TestItem[] = [
  // Autenticação
  { id: 'auth-login', category: 'Autenticação', description: 'Login funciona com credenciais corretas', status: 'pending' },
  { id: 'auth-logout', category: 'Autenticação', description: 'Logout funciona e limpa sessão', status: 'pending' },
  { id: 'auth-persist', category: 'Autenticação', description: 'Sessão persiste após refresh da página', status: 'pending' },
  { id: 'auth-invalid', category: 'Autenticação', description: 'Login rejeita credenciais inválidas', status: 'pending' },

  // Projetos
  { id: 'project-create-hotel', category: 'Projetos', description: 'Criar projeto tipo Hotel', status: 'pending' },
  { id: 'project-create-exp', category: 'Projetos', description: 'Criar projeto tipo Experiência', status: 'pending' },
  { id: 'project-edit', category: 'Projetos', description: 'Editar projeto existente', status: 'pending' },
  { id: 'project-move-captacao', category: 'Projetos', description: 'Mover projeto entre status na Captação', status: 'pending' },
  { id: 'project-move-edicao', category: 'Projetos', description: 'Mover projeto entre status na Edição', status: 'pending' },
  { id: 'project-move-finalizado', category: 'Projetos', description: 'Mover projeto para Finalizados', status: 'pending' },

  // Clientes
  { id: 'client-create', category: 'Clientes', description: 'Criar novo cliente', status: 'pending' },
  { id: 'client-edit', category: 'Clientes', description: 'Editar dados do cliente', status: 'pending' },
  { id: 'client-stats', category: 'Clientes', description: 'Estatísticas do cliente atualizam', status: 'pending' },

  // Categorias
  { id: 'category-create', category: 'Categorias', description: 'Criar nova categoria', status: 'pending' },
  { id: 'category-edit', category: 'Categorias', description: 'Editar categoria existente', status: 'pending' },

  // Finalizados
  { id: 'finished-filter', category: 'Finalizados', description: 'Filtros funcionam na página Finalizados', status: 'pending' },
  { id: 'finished-pagination', category: 'Finalizados', description: 'Paginação funciona corretamente', status: 'pending' },
  { id: 'finished-search', category: 'Finalizados', description: 'Busca encontra projetos', status: 'pending' },

  // UI/UX
  { id: 'ui-theme-toggle', category: 'Interface', description: 'Toggle tema claro/escuro funciona', status: 'pending' },
  { id: 'ui-theme-persist', category: 'Interface', description: 'Preferência de tema persiste', status: 'pending' },
  { id: 'ui-search', category: 'Interface', description: 'Pesquisa global funciona', status: 'pending' },
  { id: 'ui-notifications', category: 'Interface', description: 'Notificações aparecem corretamente', status: 'pending' },
  { id: 'ui-responsive', category: 'Interface', description: 'Layout responsivo em mobile', status: 'pending' },

  // Relatórios
  { id: 'reports-load', category: 'Relatórios', description: 'Relatórios carregam sem erros', status: 'pending' },
  { id: 'reports-data', category: 'Relatórios', description: 'Dados dos gráficos estão corretos', status: 'pending' },

  // Performance
  { id: 'perf-load', category: 'Performance', description: 'Página carrega em menos de 3s', status: 'pending' },
  { id: 'perf-navigation', category: 'Performance', description: 'Navegação entre páginas é fluida', status: 'pending' },
];

export default function TestSuite() {
  const [tests, setTests] = useState<TestItem[]>(INITIAL_TESTS);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  const updateTestStatus = (id: string, status: 'pending' | 'passed' | 'failed') => {
    setTests(prev => prev.map(test =>
      test.id === id ? { ...test, status } : test
    ));
  };

  const resetTests = () => {
    setTests(INITIAL_TESTS);
    setNotes({});
  };

  const exportReport = () => {
    const categories = [...new Set(tests.map(t => t.category))];

    let report = '# 📋 Relatório de Testes - Audiovisual CRM\n\n';
    report += `**Data:** ${new Date().toLocaleString('pt-PT')}\n\n`;

    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const pending = tests.filter(t => t.status === 'pending').length;

    report += `## 📊 Resumo\n\n`;
    report += `- ✅ **Passaram:** ${passed}/${tests.length}\n`;
    report += `- ❌ **Falharam:** ${failed}/${tests.length}\n`;
    report += `- ⏳ **Pendentes:** ${pending}/${tests.length}\n`;
    report += `- 📈 **Taxa de Sucesso:** ${((passed / tests.length) * 100).toFixed(1)}%\n\n`;

    categories.forEach(category => {
      report += `## ${category}\n\n`;
      const categoryTests = tests.filter(t => t.category === category);

      categoryTests.forEach(test => {
        const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏳';
        report += `${icon} **${test.description}**\n`;
        if (notes[test.id]) {
          report += `   - Notas: ${notes[test.id]}\n`;
        }
        report += '\n';
      });
    });

    report += '\n---\n\n';
    report += '**© 2024 WillFlow - Porque criar deve ser simples.**\n';

    // Download file
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = [...new Set(tests.map(t => t.category))];
  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;
  const successRate = tests.length > 0 ? (passedCount / tests.length) * 100 : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">Suite de Testes</h1>
        <p className="text-muted-foreground">
          Teste todas as funcionalidades do sistema e gere relatórios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Passaram</span>
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">{passedCount}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Falharam</span>
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400">{failedCount}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Pendentes</span>
            <Circle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
            <AlertCircle className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gradient">{successRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={exportReport}
          className="gradient-purple hover:gradient-purple-hover"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
        <Button
          onClick={resetTests}
          variant="outline"
          className="glass border-white/20"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Resetar Testes
        </Button>
      </div>

      {/* Tests by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryTests = tests.filter(t => t.category === category);
          const categoryPassed = categoryTests.filter(t => t.status === 'passed').length;

          return (
            <div key={category} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{category}</h2>
                <span className="text-sm text-muted-foreground">
                  {categoryPassed}/{categoryTests.length} passaram
                </span>
              </div>

              <div className="space-y-3">
                {categoryTests.map(test => (
                  <div
                    key={test.id}
                    className="glass rounded-lg p-4 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icons */}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => updateTestStatus(test.id, 'passed')}
                          className={`p-1 rounded transition-all ${
                            test.status === 'passed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'text-muted-foreground hover:text-green-400'
                          }`}
                          title="Marcar como passou"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateTestStatus(test.id, 'failed')}
                          className={`p-1 rounded transition-all ${
                            test.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'text-muted-foreground hover:text-red-400'
                          }`}
                          title="Marcar como falhou"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateTestStatus(test.id, 'pending')}
                          className={`p-1 rounded transition-all ${
                            test.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'text-muted-foreground hover:text-yellow-400'
                          }`}
                          title="Marcar como pendente"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Description and Notes */}
                      <div className="flex-1">
                        <p className="font-medium mb-2">{test.description}</p>
                        <input
                          type="text"
                          placeholder="Adicionar notas..."
                          value={notes[test.id] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [test.id]: e.target.value }))}
                          className="w-full px-3 py-2 text-sm glass rounded border border-white/10 focus:border-purple-500/50 bg-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="glass-card p-6 mt-6 border-l-4 border-purple-500">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-400" />
          Como usar esta suite de testes
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1 ml-7">
          <li>• Clique nos ícones (✓, ✗, ○) para marcar o status de cada teste</li>
          <li>• Adicione notas em cada teste para documentar problemas ou observações</li>
          <li>• Use "Exportar Relatório" para gerar um arquivo Markdown com os resultados</li>
          <li>• "Resetar Testes" limpa todos os status e notas</li>
          <li>• Execute os testes em ordem para verificar todas as funcionalidades</li>
        </ul>
      </div>
    </div>
  );
}
