'use client';

import { useMemo } from 'react';
import {
  Edit3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Euro,
  Video,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLocale } from '@/lib/LocaleContext';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Project, Client, User } from '@/lib/types';

interface EditorDashboardProps {
  projects: Project[];
  currentUser: User;
  clients: Client[];
}

export default function EditorDashboard({
  projects,
  currentUser,
  clients,
}: EditorDashboardProps) {
  const { formatCurrency, formatDate } = useLocale();

  // Filter projects assigned to this editor
  const myProjects = useMemo(() => {
    return projects.filter(p => p.responsavelEdicaoId === currentUser.id);
  }, [projects, currentUser.id]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = myProjects.length;
    const active = myProjects.filter(p => p.phase !== 'finalizados').length;
    const completed = myProjects.filter(p => p.phase === 'finalizados').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Earnings
    const totalEarnings = myProjects.reduce((sum, p) => sum + p.editionCost, 0);
    const pendingPayment = myProjects
      .filter(p => p.freelancerPaymentStatus === 'a-pagar')
      .reduce((sum, p) => sum + p.editionCost, 0);
    const paidAmount = myProjects
      .filter(p => p.freelancerPaymentStatus === 'pago')
      .reduce((sum, p) => sum + p.editionCost, 0);

    // This month
    const now = new Date();
    const thisMonthProjects = myProjects.filter(p => {
      const created = new Date(p.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });
    const thisMonthEarnings = thisMonthProjects.reduce((sum, p) => sum + p.editionCost, 0);

    // Last month comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthProjects = myProjects.filter(p => {
      const created = new Date(p.createdAt);
      return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthEarnings = lastMonthProjects.reduce((sum, p) => sum + p.editionCost, 0);
    const earningsTrend = lastMonthEarnings > 0
      ? (((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1)
      : '0';

    return {
      total,
      active,
      completed,
      completionRate,
      totalEarnings,
      pendingPayment,
      paidAmount,
      thisMonthEarnings,
      thisMonthProjects: thisMonthProjects.length,
      earningsTrend: Number(earningsTrend),
    };
  }, [myProjects]);

  // Projects by status
  const projectsByStatus = useMemo(() => {
    const receberFicheiros = myProjects.filter(p => p.statusEdicao === 'receber-ficheiros').length;
    const decupagem = myProjects.filter(p => p.statusEdicao === 'decupagem').length;
    const emEdicao = myProjects.filter(p => p.statusEdicao === 'em-edicao').length;
    const feedback = myProjects.filter(p => p.statusEdicao === 'feedback').length;
    const revisaoCliente = myProjects.filter(p => p.statusEdicao === 'revisao-cliente').length;
    const entregue = myProjects.filter(p => p.statusEdicao === 'entregue').length;

    return [
      { name: 'Receber Ficheiros', value: receberFicheiros, color: '#f59e0b' },
      { name: 'Decupagem', value: decupagem, color: '#8b5cf6' },
      { name: 'Em Edição', value: emEdicao, color: '#3b82f6' },
      { name: 'Feedback', value: feedback, color: '#ec4899' },
      { name: 'Revisão Cliente', value: revisaoCliente, color: '#f97316' },
      { name: 'Entregue', value: entregue, color: '#14b8a6' },
    ].filter(item => item.value > 0);
  }, [myProjects]);

  // Monthly earnings data
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-PT', { month: 'short' });

      const monthProjects = myProjects.filter(p => {
        const created = new Date(p.createdAt);
        return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
      });

      const ganhos = monthProjects.reduce((sum, p) => sum + p.editionCost, 0);
      const concluidos = monthProjects.filter(p => p.phase === 'finalizados').length;

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        ganhos,
        projetos: monthProjects.length,
        concluidos,
      });
    }

    return months;
  }, [myProjects]);

  // Upcoming deadlines
  const deadlines = useMemo(() => {
    const now = new Date();
    return myProjects
      .filter(p => {
        if (!p.clientDueDate) return false;
        const due = new Date(p.clientDueDate);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 14;
      })
      .map(p => {
        const due = new Date(p.clientDueDate!);
        const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...p, daysUntil: days };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [myProjects]);

  // Active projects list
  const activeProjects = useMemo(() => {
    return myProjects
      .filter(p => p.phase !== 'finalizados')
      .sort((a, b) => {
        if (!a.clientDueDate) return 1;
        if (!b.clientDueDate) return -1;
        return new Date(a.clientDueDate).getTime() - new Date(b.clientDueDate).getTime();
      })
      .slice(0, 5);
  }, [myProjects]);

  const trendIsPositive = metrics.earningsTrend >= 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">
          Olá, {currentUser.name.split(' ')[0]}!
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Aqui está o resumo dos seus projetos de edição
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ganhos Este Mês</p>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(metrics.thisMonthEarnings)}
                </p>
                <div className={`flex items-center text-xs mt-1 ${trendIsPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {trendIsPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {metrics.earningsTrend}% vs mês anterior
                </div>
              </div>
              <Euro className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Projetos Ativos</p>
                <p className="text-xl font-bold text-purple-400">{metrics.active}</p>
                <p className="text-xs text-muted-foreground mt-1">de {metrics.total} total</p>
              </div>
              <Edit3 className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-xl font-bold text-blue-400">{metrics.completionRate}%</p>
                <Progress value={metrics.completionRate} className="h-1 mt-2" />
              </div>
              <Award className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">A Receber</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatCurrency(metrics.pendingPayment)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(metrics.paidAmount)} recebido
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Ganhos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" style={{ fontSize: '11px' }} />
                <YAxis stroke="#888" style={{ fontSize: '11px' }} tickFormatter={(v) => formatCurrency(v).split(',')[0]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(v) => formatCurrency(v as number)}
                />
                <Area type="monotone" dataKey="ganhos" stroke="#10b981" fillOpacity={1} fill="url(#colorGanhos)" name="Ganhos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="w-5 h-5 text-purple-400" />
              Status dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum projeto ativo</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={projectsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={(props: any) => `${props.name.split(' ')[0]}`}
                    labelLine={false}
                  >
                    {projectsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Edit3 className="w-5 h-5 text-purple-400" />
              Projetos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum projeto ativo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((project) => (
                  <div key={project.id} className="p-3 rounded-lg glass border border-white/10 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.client?.name}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {project.statusEdicao?.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-orange-400" />
              Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum prazo próximo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deadlines.map((d) => {
                  let borderClass = 'border-white/10 bg-white/5';
                  let badgeClass = 'border-blue-500/30 text-blue-400';

                  if (d.daysUntil <= 3) {
                    borderClass = 'border-red-500/30 bg-red-500/5';
                    badgeClass = 'border-red-500/30 text-red-400';
                  } else if (d.daysUntil <= 7) {
                    borderClass = 'border-yellow-500/30 bg-yellow-500/5';
                    badgeClass = 'border-yellow-500/30 text-yellow-400';
                  }

                  return (
                    <div key={d.id} className={`p-3 rounded-lg border ${borderClass}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <Badge variant="outline" className={badgeClass}>
                          {d.daysUntil === 1 ? 'Amanhã' : `${d.daysUntil} dias`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(new Date(d.clientDueDate!))}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
