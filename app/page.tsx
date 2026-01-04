import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Wallet, 
  CalendarDays, 
  FileBarChart2, 
  Info, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardPage() {
  // Dados simulados para o Layout (Você conectará ao Prisma depois)
  const stats = [
    { label: "Total a Receber", value: "R$ 15.200,00", desc: "Pagamentos pendentes de clientes", color: "text-blue-600" },
    { label: "Total a Pagar", value: "R$ 4.350,00", desc: "Custos com colaboradores e terceiros", color: "text-red-600" },
    { label: "Margem Estimada", value: "R$ 10.850,00", desc: "Lucro bruto dos projetos ativos", color: "text-emerald-600" },
    { label: "Recebido (Mês)", value: "R$ 45.000,00", desc: "Entradas confirmadas em Janeiro", color: "text-foreground" },
  ];

  const urgentItems = [
    { id: 1, title: "Entrega: Vídeo Nike Institucional", type: "deadline", date: "Hoje, 18:00" },
    { id: 2, title: "Pagamento: Editor Free (João)", type: "payment", date: "Vence Amanhã" },
    { id: 3, title: "Captação: Casamento Silva", type: "event", date: "Sábado, 14:00" },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo do seu estúdio hoje.</p>
        </div>
        <div className="flex items-center space-x-2">
           <span className="text-sm text-muted-foreground bg-white px-3 py-1 rounded-full border shadow-sm">
             📅 {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </div>

      {/* SEÇÃO 1: Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TooltipProvider>
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground/50 hover:text-primary cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{stat.desc}</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                {index === 3 && (
                   <div className="text-xs text-emerald-600 flex items-center mt-1">
                     <TrendingUp className="h-3 w-3 mr-1" /> +12% vs mês anterior
                   </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TooltipProvider>
      </div>

      {/* SEÇÃO 2: Ações Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Link href="/projects/new" className="w-full">
            <Button className="w-full h-16 text-lg shadow-md hover:scale-[1.02] transition-transform" variant="default">
                <PlusCircle className="mr-2 h-6 w-6" /> Novo Projeto
            </Button>
         </Link>
         <Link href="/financial/payments" className="w-full">
            <Button className="w-full h-16 text-lg bg-white text-slate-700 border hover:bg-slate-50 shadow-sm" variant="outline">
                <Wallet className="mr-2 h-6 w-6 text-blue-500" /> Pagamentos
            </Button>
         </Link>
         <Link href="/tools/calendar" className="w-full">
            <Button className="w-full h-16 text-lg bg-white text-slate-700 border hover:bg-slate-50 shadow-sm" variant="outline">
                <CalendarDays className="mr-2 h-6 w-6 text-purple-500" /> Calendário
            </Button>
         </Link>
         <Link href="/financial/reports" className="w-full">
            <Button className="w-full h-16 text-lg bg-white text-slate-700 border hover:bg-slate-50 shadow-sm" variant="outline">
                <FileBarChart2 className="mr-2 h-6 w-6 text-orange-500" /> Relatórios
            </Button>
         </Link>
      </div>

      {/* Layout Dividido: Gráfico + Atenção */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        
        {/* Gráfico (Placeholder) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-slate-50 border-2 border-dashed rounded-md mx-4">
              <span className="text-muted-foreground flex items-center">
                 <ArrowUpRight className="mr-2 h-5 w-5" /> Gráfico será carregado aqui
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Atenção */}
        <Card className="col-span-3 shadow-sm border-l-4 border-l-yellow-400">
          <CardHeader>
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <CardTitle>Atenção Hoje</CardTitle>
            </div>
            <CardDescription>Itens que requerem sua ação imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentItems.length > 0 ? (
                  urgentItems.map((item) => (
                    <div key={item.id} className="flex items-start p-3 bg-white border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className={`mt-1 h-2 w-2 rounded-full mr-3 ${
                            item.type === 'deadline' ? 'bg-red-500' : 
                            item.type === 'payment' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {item.date}
                        </p>
                        </div>
                    </div>
                  ))
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                      <p>🎉 Tudo em dia por aqui!</p>
                  </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
