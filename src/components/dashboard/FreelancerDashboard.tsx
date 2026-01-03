'use client';

import { useMemo } from 'react';
import {
  Camera,
  Clock,
  CheckCircle,
  Calendar,
  TrendingUp,
  Euro,
  Video,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  MapPin,
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLocale } from '@/lib/LocaleContext';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Project, User } from '@/lib/types';

interface FreelancerDashboardProps {
  projects: Project[];
  currentUser: User;
}

export default function FreelancerDashboard({
  projects,
  currentUser,
}: FreelancerDashboardProps) {
  const { formatCurrency, formatDate } = useLocale();

  // Filter projects assigned to this freelancer for captation
  const myProjects = useMemo(() => {
    return projects.filter(p => p.responsavelCaptacaoId === currentUser.id);
  }, [projects, currentUser.id]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = myProjects.length;
    const active = myProjects.filter(p => p.phase === 'captacao').length;
    const inEdition = myProjects.filter(p => p.phase === 'edicao').length;
    const completed = myProjects.filter(p => p.phase === 'finalizados').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Earnings
    const totalEarnings = myProjects.reduce((sum, p) => sum + p.captationCost, 0);
    const pendingPayment = myProjects
      .filter(p => p.freelancerPaymentStatus === 'a-pagar')
      .reduce((sum, p) => sum + p.captationCost, 0);
    const paidAmount = myProjects
      .filter(p => p.freelancerPaymentStatus === 'pago')
      .reduce((sum, p) => sum + p.captationCost, 0);

    // This month
    const now = new Date();
    const thisMonthProjects = myProjects.filter(p => {
      const created = new Date(p.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });
    const thisMonthEarnings = thisMonthProjects.reduce((sum, p) => sum + p.captationCost, 0);

    // Last month comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthProjects = myProjects.filter(p => {
      const created = new Date(p.createdAt);
      return created.getMonth() === lastMonth.getMonth() && created.getFullYear() === lastMonth.getFullYear();
    });
    const lastMonthEarnings = lastMonthProjects.reduce((sum, p) => sum + p.captationCost, 0);
    const earningsTrend = lastMonthEarnings > 0
      ? (((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1)
      : '0';

    return {
      total,
      active,
      inEdition,
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

  // Projects by captation status
  const projectsByStatus = useMemo(() => {
    const agendado = myProjects.filter(p => p.statusCaptacao === 'agendado').length;
    const emGravacao = myProjects.filter(p => p.statusCaptacao === 'em-gravacao').length;
    const uploadNas = myProjects.filter(p => p.statusCaptacao === 'upload-nas').length;
    const concluido = myProjects.filter(p => p.statusCaptacao === 'concluido').length;

    return [
      { name: 'Agendado', value: agendado, color: '#f59e0b' },
      { name: 'Em Gravação', value: emGravacao, color: '#3b82f6' },
      { name: 'Upload NAS', value: uploadNas, color: '#8b5cf6' },
      { name: 'Concluído', value: concluido, color: '#14b8a6' },
    ].filter(item => item.value > 0);
  }, [myProjects]);

  // Monthly data
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

      const ganhos = monthProjects.reduce((sum, p) => sum + p.captationCost, 0);

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        ganhos,
        projetos: monthProjects.length,
      });
    }

    return months;
  }, [myProjects]);

  // Upcoming shoots (agendado or em-gravacao)
  const upcomingShoots = useMemo(() => {
    return myProjects
      .filter(p => p.phase === 'captacao' && (p.statusCaptacao === 'agendado' || p.statusCaptacao === 'em-gravacao'))
      .sort((a, b) => {
        const dateA = a.clientDueDate ? new Date(a.clientDueDate).getTime() : Infinity;
        const dateB = b.clientDueDate ? new Date(b.clientDueDate).getTime() : Infinity;
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [myProjects]);

  // Recent completed
  const recentCompleted = useMemo(() => {
    return myProjects
      .filter(p => p.statusCaptacao === 'concluido' || p.phase !== 'captacao')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
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
          Aqui está o resumo das suas captações
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
                <p className="text-xs text-muted-foreground">Captações Ativas</p>
                <p className="text-xl font-bold text-orange-400">{metrics.active}</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.inEdition} em edição</p>
              </div>
              <Camera className="w-8 h-8 text-orange-400 opacity-50" />
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
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" style={{ fontSize: '11px' }} />
                <YAxis stroke="#888" style={{ fontSize: '11px' }} tickFormatter={(v) => formatCurrency(v).split(',')[0]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(v) => formatCurrency(v as number)}
                />
                <Bar dataKey="ganhos" fill="#10b981" radius={[4, 4, 0, 0]} name="Ganhos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="w-5 h-5 text-orange-400" />
              Status das Captações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projectsByStatus.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma captação ativa</p>
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
                    label={(props: any) => props.name}
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
        {/* Upcoming Shoots */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-orange-400" />
              Próximas Captações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingShoots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhuma captação agendada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingShoots.map((project) => (
                  <div key={project.id} className="p-3 rounded-lg glass border border-white/10 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {project.location && (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{project.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          project.statusCaptacao === 'agendado'
                            ? 'border-yellow-500/30 text-yellow-400'
                            : 'border-blue-500/30 text-blue-400'
                        }
                      >
                        {project.statusCaptacao === 'agendado' ? 'Agendado' : 'Em Gravação'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Euro className="w-5 h-5 text-green-400" />
              Status de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="text-sm">A Receber</span>
                </div>
                <span className="font-bold text-yellow-400">
                  {formatCurrency(metrics.pendingPayment)}
                </span>
              </div>
              <Progress
                value={
                  metrics.totalEarnings > 0
                    ? (metrics.pendingPayment / metrics.totalEarnings) * 100
                    : 0
                }
                className="h-2"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="text-sm">Recebido</span>
                </div>
                <span className="font-bold text-green-400">
                  {formatCurrency(metrics.paidAmount)}
                </span>
              </div>
              <Progress
                value={
                  metrics.totalEarnings > 0
                    ? (metrics.paidAmount / metrics.totalEarnings) * 100
                    : 0
                }
                className="h-2"
              />
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Ganhos</span>
                  <span className="font-bold text-purple-400">
                    {formatCurrency(metrics.totalEarnings)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média por projeto: {formatCurrency(metrics.total > 0 ? metrics.totalEarnings / metrics.total : 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
