'use client';

import { useMemo } from 'react';
import {
  Video,
  CheckCircle,
  Clock,
  Camera,
  Edit3,
  BarChart3,
  TrendingUp,
  Calendar,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
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
import { Project } from '@/lib/types';

interface ViewerDashboardProps {
  projects: Project[];
  projectsByPhase?: {
    captacao: Project[];
    edicao: Project[];
    finalizados: Project[];
  };
}

export default function ViewerDashboard({
  projects,
  projectsByPhase,
}: ViewerDashboardProps) {
  const { formatDate } = useLocale();

  // Calculate phase distribution
  const phaseDistribution = useMemo(() => {
    if (projectsByPhase) {
      return [
        { name: 'Captação', value: projectsByPhase.captacao.length, color: '#f59e0b' },
        { name: 'Edição', value: projectsByPhase.edicao.length, color: '#9139e4' },
        { name: 'Finalizados', value: projectsByPhase.finalizados.length, color: '#14b8a6' },
      ].filter(item => item.value > 0);
    }

    const captacao = projects.filter(p => p.phase === 'captacao').length;
    const edicao = projects.filter(p => p.phase === 'edicao').length;
    const finalizados = projects.filter(p => p.phase === 'finalizados').length;

    return [
      { name: 'Captação', value: captacao, color: '#f59e0b' },
      { name: 'Edição', value: edicao, color: '#9139e4' },
      { name: 'Finalizados', value: finalizados, color: '#14b8a6' },
    ].filter(item => item.value > 0);
  }, [projects, projectsByPhase]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.phase !== 'finalizados').length;
    const completed = projects.filter(p => p.phase === 'finalizados').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, active, completed, completionRate };
  }, [projects]);

  // Monthly project volume
  const monthlyVolume = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-PT', { month: 'short' });

      const monthProjects = projects.filter(p => {
        const created = new Date(p.createdAt);
        return created.getMonth() === month.getMonth() && created.getFullYear() === month.getFullYear();
      });

      const finalizados = monthProjects.filter(p => p.phase === 'finalizados').length;

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        total: monthProjects.length,
        finalizados,
      });
    }

    return months;
  }, [projects]);

  // Video types distribution
  const videoTypes = useMemo(() => {
    const types: Record<string, number> = {};
    projects.forEach(p => {
      const type = p.videoType || 'outro';
      types[type] = (types[type] || 0) + 1;
    });

    const typeLabels: Record<string, string> = {
      hotel: 'Hotel',
      experiencia: 'Experiência',
      drone: 'Drone',
      reels: 'Reels',
      outro: 'Outro',
    };

    const colors = ['#9139e4', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];

    return Object.entries(types)
      .map(([type, count], index) => ({
        name: typeLabels[type] || type,
        value: count,
        color: colors[index % colors.length],
      }))
      .filter(item => item.value > 0);
  }, [projects]);

  // Recent projects
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [projects]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-gradient">Visão Geral</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          Resumo do status dos projetos (modo visualização)
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
        <p className="text-sm text-purple-400">
          <strong>Modo Visualização:</strong> Você tem acesso de leitura aos projetos.
          Para editar ou criar projetos, solicite permissões ao administrador.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Projetos</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Video className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-orange-400">{metrics.active}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Finalizados</p>
                <p className="text-2xl font-bold text-green-400">{metrics.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
                <p className="text-2xl font-bold text-blue-400">{metrics.completionRate}%</p>
                <Progress value={metrics.completionRate} className="h-1 mt-2" />
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phase Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Distribuição por Fase
            </CardTitle>
          </CardHeader>
          <CardContent>
            {phaseDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum projeto</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={phaseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={(props: any) => `${props.name} (${props.value})`}
                    labelLine={false}
                  >
                    {phaseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Monthly Volume */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-purple-400" />
              Volume Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" style={{ fontSize: '11px' }} />
                <YAxis stroke="#888" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                <Bar dataKey="total" fill="#9139e4" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="finalizados" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Finalizados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="w-5 h-5 text-purple-400" />
            Projetos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum projeto</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg glass border border-white/10 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={
                        project.phase === 'captacao'
                          ? 'border-yellow-500/30 text-yellow-400'
                          : project.phase === 'edicao'
                          ? 'border-purple-500/30 text-purple-400'
                          : 'border-green-500/30 text-green-400'
                      }
                    >
                      {project.phase === 'captacao' ? 'Captação' : project.phase === 'edicao' ? 'Edição' : 'Finalizado'}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{project.title}</h3>
                  <p className="text-xs text-muted-foreground">{project.client?.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(new Date(project.createdAt))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Types */}
      {videoTypes.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="w-5 h-5 text-purple-400" />
              Tipos de Vídeo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {videoTypes.map((type, index) => (
                <div
                  key={type.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-sm">{type.name}</span>
                  <Badge variant="secondary" className="bg-white/10">
                    {type.value}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
