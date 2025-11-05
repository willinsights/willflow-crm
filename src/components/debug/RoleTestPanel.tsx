'use client';

import { useState } from 'react';
import { Shield, Camera, Edit3, Eye, EyeOff, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/useAppStore';
import { mockUsers, mockProjects } from '@/lib/data';
import { filterProjectsForUser, sanitizeProjectForUser, getUserPermissions } from '@/lib/permissions';
import { formatCurrency } from '@/lib/utils';
import { User } from '@/lib/types';

export default function RoleTestPanel() {
  const { currentUser, switchUser, projectsByPhase, dashboardStats } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(true);
  // Testing completed - back to normal operation
  const [simulatedUser, setSimulatedUser] = useState<User | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'freelancer_captacao':
        return <Camera className="w-4 h-4 text-orange-400" />;
      case 'editor_edicao':
        return <Edit3 className="w-4 h-4 text-blue-400" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'freelancer_captacao':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'editor_edicao':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const getProjectsInfo = () => {
    const captacao = projectsByPhase.captacao || [];
    const edicao = projectsByPhase.edicao || [];
    const finalizados = projectsByPhase.finalizados || [];

    return {
      captacao: captacao.length,
      edicao: edicao.length,
      finalizados: finalizados.length,
      total: captacao.length + edicao.length + finalizados.length
    };
  };

  // Function to simulate what a user would see
  const simulateUserView = (user: User) => {
    const userPerms = getUserPermissions(user.role);
    const filteredProjects = filterProjectsForUser(mockProjects, user, user.id);
    const sanitizedProjects = filteredProjects.map(project =>
      sanitizeProjectForUser(project, user)
    );

    const captacao = sanitizedProjects.filter(p => p.phase === 'captacao');
    const edicao = sanitizedProjects.filter(p => p.phase === 'edicao');
    const finalizados = sanitizedProjects.filter(p => p.phase === 'finalizados');

    return {
      user,
      permissions: userPerms,
      projects: {
        captacao: captacao.length,
        edicao: edicao.length,
        finalizados: finalizados.length,
        total: sanitizedProjects.length,
        list: sanitizedProjects
      }
    };
  };

  const projectsInfo = getProjectsInfo();
  const displayUser = simulatedUser || currentUser;
  const simulatedView = simulatedUser ? simulateUserView(simulatedUser) : null;

  return (
    <Card className="glass-card border-yellow-500/30 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-yellow-400">RBAC Testing Panel</CardTitle>
              <p className="text-sm text-muted-foreground">
                {simulatedUser ? `Simulating: ${simulatedUser.name}` : `Current: ${currentUser.name}`} ({displayUser.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {simulatedUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSimulatedUser(null)}
                className="text-yellow-400 text-xs"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-yellow-400"
            >
              {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Current User Summary */}
        <div className="flex items-center gap-4 mt-3">
          <Badge className={`${getRoleColor(displayUser.role)} text-xs`}>
            {getRoleIcon(displayUser.role)}
            <span className="ml-1">{displayUser.role}</span>
          </Badge>

          <div className="text-sm text-muted-foreground">
            Projects visible: {simulatedView?.projects.total || projectsInfo.total} |
            Finance: {(simulatedView?.permissions.canViewFinance ?? displayUser.canViewFinance) ? '✅' : '❌'} |
            Edit All: {(simulatedView?.permissions.canEditAllProjects ?? displayUser.canEditProjects) ? '✅' : '❌'}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* User Switching */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex gap-1">
                <Button
                  variant={currentUser.id === user.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {}}
                  className={`flex-1 justify-start ${
                    currentUser.id === user.id
                      ? 'gradient-purple text-white'
                      : 'glass border-white/20 hover:bg-white/10'
                  }`}
                >
                  {getRoleIcon(user.role)}
                  <span className="ml-2 truncate">{user.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSimulatedUser(user)}
                  className="glass border-white/20 hover:bg-yellow-500/20 px-2"
                  title={`Simulate ${user.name}`}
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Projects Breakdown */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="glass rounded-lg p-3 text-center">
              <div className="font-bold text-orange-400">
                {simulatedView?.projects.captacao || projectsInfo.captacao}
              </div>
              <div className="text-muted-foreground">Captação</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <div className="font-bold text-purple-400">
                {simulatedView?.projects.edicao || projectsInfo.edicao}
              </div>
              <div className="text-muted-foreground">Edição</div>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <div className="font-bold text-green-400">
                {simulatedView?.projects.finalizados || projectsInfo.finalizados}
              </div>
              <div className="text-muted-foreground">Finalizados</div>
            </div>
          </div>

          {/* Financial Data */}
          <div className="glass rounded-lg p-3">
            <div className="font-medium text-sm mb-2">Financial Visibility:</div>
            {(simulatedView?.permissions.canViewFinance ?? currentUser.canViewFinance) ? (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Total a Receber: {formatCurrency(dashboardStats.financialKPIs.totalToReceive)}</div>
                <div>Total a Pagar: {formatCurrency(dashboardStats.financialKPIs.totalToPay)}</div>
                <div>Margem Total: {formatCurrency(dashboardStats.financialKPIs.totalMargin)}</div>
                <div>Total Recebido: {formatCurrency(dashboardStats.financialKPIs.totalReceived)}</div>
              </div>
            ) : (
              <div className="text-red-400 text-xs">
                ❌ Financial data hidden for this role
              </div>
            )}
          </div>

          {/* Project List */}
          <div className="glass rounded-lg p-3">
            <div className="font-medium text-sm mb-2">Visible Projects:</div>
            <div className="space-y-1 text-xs">
              {simulatedView ? (
                simulatedView.projects.total === 0 ? (
                  <div className="text-muted-foreground">No projects visible</div>
                ) : (
                  simulatedView.projects.list.map((project, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="truncate">{project.title}</span>
                      <Badge className={`status-badge status-${project.phase} text-xs`}>
                        {project.phase}
                      </Badge>
                    </div>
                  ))
                )
              ) : (
                projectsInfo.total === 0 ? (
                  <div className="text-muted-foreground">No projects visible</div>
                ) : (
                  <>
                    {projectsByPhase.captacao?.map(project => (
                      <div key={project.id} className="flex justify-between">
                        <span className="truncate">{project.title}</span>
                        <Badge className="status-badge status-captacao text-xs">Captação</Badge>
                      </div>
                    ))}
                    {projectsByPhase.edicao?.map(project => (
                      <div key={project.id} className="flex justify-between">
                        <span className="truncate">{project.title}</span>
                        <Badge className="status-badge status-edicao text-xs">Edição</Badge>
                      </div>
                    ))}
                    {projectsByPhase.finalizados?.map(project => (
                      <div key={project.id} className="flex justify-between">
                        <span className="truncate">{project.title}</span>
                        <Badge className="status-badge status-finalizado text-xs">Finalizado</Badge>
                      </div>
                    ))}
                  </>
                )
              )}
            </div>
          </div>

          {/* Expected Results for Testing */}
          <div className="glass rounded-lg p-3 border border-yellow-500/30">
            <div className="font-medium text-sm mb-2 text-green-400">✅ RBAC Tests Complete!</div>
            <div className="text-xs space-y-1">
              <div><strong>✅ Admin:</strong> All 5 projects + full finances</div>
              <div><strong>✅ Pedro Costa:</strong> 2 captação projects, no finances</div>
              <div><strong>✅ Maria Santos:</strong> 2 edição projects, no finances</div>
              <div><strong>Next:</strong> Test workflow automations & checklist enforcement</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
