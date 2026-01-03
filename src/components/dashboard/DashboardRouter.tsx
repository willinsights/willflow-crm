'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/useAppStore';
import { getUserPermissions } from '@/lib/permissions';
import AdminDashboard from './AdminDashboard';
import EditorDashboard from './EditorDashboard';
import FreelancerDashboard from './FreelancerDashboard';
import ViewerDashboard from './ViewerDashboard';

interface DashboardRouterProps {
  onViewChange?: (view: string) => void;
}

export default function DashboardRouter({ onViewChange }: DashboardRouterProps) {
  const { currentUser, projects, clients, users, dashboardStats, projectsByPhase } = useAppStore();

  const permissions = useMemo(() => getUserPermissions(currentUser), [currentUser]);

  // Determine which dashboard to show based on role
  const dashboardComponent = useMemo(() => {
    if (!currentUser) {
      return <ViewerDashboard projects={projects} />;
    }

    switch (currentUser.role) {
      case 'admin':
        return (
          <AdminDashboard
            projects={projects}
            clients={clients}
            users={users}
            dashboardStats={dashboardStats}
            projectsByPhase={projectsByPhase}
            onViewChange={onViewChange}
          />
        );

      case 'editor_edicao':
        return (
          <EditorDashboard
            projects={projects}
            currentUser={currentUser}
            clients={clients}
          />
        );

      case 'freelancer_captacao':
        return (
          <FreelancerDashboard
            projects={projects}
            currentUser={currentUser}
          />
        );

      case 'visualizer':
        return (
          <ViewerDashboard
            projects={projects}
            projectsByPhase={projectsByPhase}
          />
        );

      default:
        // Fallback to viewer dashboard for unknown roles
        return <ViewerDashboard projects={projects} />;
    }
  }, [currentUser, projects, clients, users, dashboardStats, projectsByPhase]);

  return dashboardComponent;
}
