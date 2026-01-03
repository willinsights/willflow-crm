'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  Euro,
  Target,
  Award,
  Clock,
  Calendar,
  CheckCircle,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
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
import { Project, User } from '@/lib/types';
import { useLocale } from '@/lib/LocaleContext';

interface FreelancerPerformanceProps {
  projects: Project[];
  currentUser: User | null;
}

export default function FreelancerPerformance({
  projects,
  currentUser,
}: FreelancerPerformanceProps) {
  const { formatCurrency } = useLocale();

  const isFreelancer = currentUser?.role === 'freelancer_captacao';
  const isEditor = currentUser?.role === 'editor_edicao';

  // Filter projects for current user
  const userProjects = useMemo(() => {
    return projects.filter(
      (p) =>
        p.responsavelCaptacaoId === currentUser?.id ||
        p.responsavelEdicaoId === currentUser?.id
    );
  }, [projects, currentUser]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = userProjects.length;
    const active = userProjects.filter((p) => p.phase !== 'finalizados').length;
    const completed = userProjects.filter((p) => p.phase === 'finalizados').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Earnings calculation
    let totalEarnings = 0;
    let pendingPayment = 0;
    let paidAmount = 0;

    userProjects.forEach((p) => {
      if (isFreelancer && p.responsavelCaptacaoId === currentUser?.id) {
        totalEarnings += p.captationCost;
        if (p.freelancerPaymentStatus === 'a-pagar') {
          pendingPayment += p.captationCost;
        } else if (p.freelancerPaymentStatus === 'pago') {
          paidAmount += p.captationCost;
        }
      }
      if (isEditor && p.responsavelEdicaoId === currentUser?.id) {
        totalEarnings += p.editionCost;
        if (p.freelancerPaymentStatus === 'a-pagar') {
          pendingPayment += p.editionCost;
        } else if (p.freelancerPaymentStatus === 'pago') {
          paidAmount += p.editionCost;
        }
      }
    });

    // This month earnings
    const now = new Date();
    const thisMonthProjects = userProjects.filter((p) => {
      const created = new Date(p.createdAt);
      return (
        created.getMonth() === now.getMonth() &&
        created.getFullYear() === now.getFullYear()
      );
    });

    let thisMonthEarnings = 0;
    thisMonthProjects.forEach((p) => {
      if (isFreelancer && p.responsavelCaptacaoId === currentUser?.id) {
        thisMonthEarnings += p.captationCost;
      }
      if (isEditor && p.responsavelEdicaoId === currentUser?.id) {
        thisMonthEarnings += p.editionCost;
      }
    });

    // Last month earnings for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthProjects = userProjects.filter((p) => {
      const created = new Date(p.createdAt);
      return (
        created.getMonth() === lastMonth.getMonth() &&
        created.getFullYear() === lastMonth.getFullYear()
      );
    });

    let lastMonthEarnings = 0;
    lastMonthProjects.forEach((p) => {
      if (isFreelancer && p.responsavelCaptacaoId === currentUser?.id) {
        lastMonthEarnings += p.captationCost;
      }
      if (isEditor && p.responsavelEdicaoId === currentUser?.id) {
        lastMonthEarnings += p.editionCost;
      }
    });

    const earningsTrend =
      lastMonthEarnings > 0
        ? (((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1)
        : '0';

    const avg = total > 0 ? totalEarnings / total : 0;

    return {
      total,
      active,
      completed,
      rate,
      totalEarnings,
      pendingPayment,
      paidAmount,
      thisMonthEarnings,
      earningsTrend,
      avg,
    };
  }, [userProjects, currentUser, isFreelancer, isEditor]);

  // Monthly data for charts
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-PT', { month: 'short' });

      const monthProjects = userProjects.filter((p) => {
        const created = new Date(p.createdAt);
        return (
          created.getMonth() === month.getMonth() &&
          created.getFullYear() === month.getFullYear()
        );
      });

      let ganhos = 0;
      monthProjects.forEach((p) => {
        if (isFreelancer && p.responsavelCaptacaoId === currentUser?.id) {
          ganhos += p.captationCost;
        }
        if (isEditor && p.responsavelEdicaoId === currentUser?.id) {
          ganhos += p.editionCost;
        }
      });

      const concluidos = monthProjects.filter((p) => p.phase === 'finalizados').length;

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        ganhos,
        projetos: monthProjects.length,
        concluidos,
      });
    }

    return months;
  }, [userProjects, currentUser, isFreelancer, isEditor]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const captacao = userProjects.filter((p) => p.phase === 'captacao').length;
    const edicao = userProjects.filter((p) => p.phase === 'edicao').length;
    const finalizados = userProjects.filter((p) => p.phase === 'finalizados').length;

    return [
      { name: 'Captação', value: captacao, color: '#f59e0b' },
      { name: 'Edição', value: edicao, color: '#9139e4' },
      { name: 'Finalizados', value: finalizados, color: '#14b8a6' },
    ].filter((item) => item.value > 0);
  }, [userProjects]);

  // Upcoming deadlines
  const deadlines = useMemo(() => {
    const now = new Date();
    return userProjects
      .filter((p) => {
        if (!p.clientDueDate) return false;
        const due = new Date(p.clientDueDate);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 14;
      })
      .map((p) => {
        const due = new Date(p.clientDueDate!);
        const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { title: p.title, due, days };
      })
      .sort((a, b) => a.days - b.days)
      .slice(0, 5);
  }, [userProjects]);

  const trendIsPositive = Number(metrics.earningsTrend) >= 0;
  const trendClassName = trendIsPositive ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Este Mês</p>
                <p className="text-xl font-bold text-green-400">
                  {formatCurrency(metrics.thisMonthEarnings)}
                </p>
                <div className={'flex items-center text-xs mt-1 ' + trendClassName}>
                  {trendIsPositive ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
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
              <Target className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-xl font-bold text-blue-400">{metrics.rate}%</p>
                <Progress value={metrics.rate} className="h-1 mt-2" />
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

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" style={{ fontSize: '11px' }} />
                <YAxis
                  stroke="#888"
                  style={{ fontSize: '11px' }}
                  tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                  formatter={(v) => formatCurrency(v as number)}
                />
                <Area
                  type="monotone"
                  dataKey="ganhos"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorG)"
                  name="Ganhos"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Projetos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" style={{ fontSize: '11px' }} />
                <YAxis stroke="#888" style={{ fontSize: '11px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="projetos" name="Total" fill="#9139e4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="concluidos" name="Concluídos" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Status dos Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                Nenhum projeto
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={(props: any) => props.name + ' ' + (props.percent * 100).toFixed(0) + '%'}
                    labelLine={false}
                  >
                    {statusData.map((e, i) => (
                      <Cell key={'cell-' + i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Status de Pagamentos</CardTitle>
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
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Ganhos</span>
                  <span className="font-bold text-purple-400">
                    {formatCurrency(metrics.totalEarnings)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média por projeto: {formatCurrency(metrics.avg)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-orange-400" />
              Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deadlines.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                <CheckCircle className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Nenhum prazo próximo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deadlines.map((d, i) => {
                  let borderClass = 'border-white/10 bg-white/5';
                  let badgeClass = 'border-blue-500/30 text-blue-400';

                  if (d.days <= 3) {
                    borderClass = 'border-red-500/30 bg-red-500/5';
                    badgeClass = 'border-red-500/30 text-red-400';
                  } else if (d.days <= 7) {
                    borderClass = 'border-yellow-500/30 bg-yellow-500/5';
                    badgeClass = 'border-yellow-500/30 text-yellow-400';
                  }

                  return (
                    <div key={i} className={'p-3 rounded-lg border ' + borderClass}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <Badge variant="outline" className={badgeClass}>
                          {d.days === 1 ? 'Amanhã' : d.days + ' dias'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {d.due.toLocaleDateString('pt-PT')}
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
