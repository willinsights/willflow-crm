"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Video,
  CheckCircle2,
  Wallet,
  PieChart,
  FileText,
  Calendar,
  Image as ImageIcon,
  Users,
  UserCog,
  Tags,
  Settings,
  Receipt,
  Camera,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    group: "VISÃO GERAL",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "PROJETOS",
    items: [
      { href: "/kanban?status=captacao", label: "Captação", icon: Camera },
      { href: "/kanban?status=edicao", label: "Edição", icon: Video },
      { href: "/kanban?status=finalizados", label: "Finalizados", icon: CheckCircle2 },
    ],
  },
  {
    group: "FINANÇAS",
    items: [
      { href: "/financial/payments", label: "Pagamentos", icon: Wallet },
      { href: "/financial/profitability", label: "Rentabilidade", icon: PieChart },
      { href: "/financial/reports", label: "Relatórios", icon: FileText },
      { href: "/financial/invoices", label: "Faturas", icon: Receipt },
    ],
  },
  {
    group: "FERRAMENTAS",
    items: [
      { href: "/tools/calendar", label: "Calendário", icon: Calendar },
      { href: "/tools/media", label: "Media", icon: ImageIcon },
    ],
  },
  {
    group: "GESTÃO",
    items: [
      { href: "/management/clients", label: "Clientes", icon: Users },
      { href: "/management/collaborators", label: "Colaboradores", icon: UserCog },
      { href: "/management/categories", label: "Categorias", icon: Tags },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="pb-12 min-h-screen w-64 bg-background border-r flex flex-col justify-between">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-6 px-4 text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            WillFlow
          </h2>
          <div className="space-y-1">
            {menuItems.map((group, i) => (
              <div key={i} className="py-2">
                <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {group.group}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground"
                        )}
                      >
                        <Icon className={cn("mr-2 h-4 w-4", isActive && "text-primary")} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Rodapé do Menu - Sistema */}
      <div className="px-3 py-4 border-t">
        <div className="space-y-1">
            <Link
                href="/settings"
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurações
            </Link>
             <Link
                href="/api/auth/signout"
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-red-100 hover:text-red-600 text-muted-foreground"
                )}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
            </Link>
        </div>
      </div>
    </div>
  );
}
