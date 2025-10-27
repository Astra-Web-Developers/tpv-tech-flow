import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Users, Clock, CheckCircle2 } from "lucide-react";

interface Stats {
  ticketsActivos: number;
  ticketsFinalizados: number;
  totalClientes: number;
  horasTotales: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    ticketsActivos: 0,
    ticketsFinalizados: 0,
    totalClientes: 0,
    horasTotales: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ticketsRes, clientesRes, horasRes] = await Promise.all([
        supabase.from("tickets").select("estado", { count: "exact" }),
        supabase.from("clientes").select("id", { count: "exact" }),
        supabase.from("historial_tiempo").select("duracion_minutos"),
      ]);

      const ticketsActivos = ticketsRes.data?.filter((t) => t.estado === "activo").length || 0;
      const ticketsFinalizados = ticketsRes.data?.filter((t) => t.estado === "finalizado").length || 0;
      const totalClientes = clientesRes.count || 0;
      const horasTotales = Math.round(
        (horasRes.data?.reduce((sum, h) => sum + (h.duracion_minutos || 0), 0) || 0) / 60
      );

      setStats({
        ticketsActivos,
        ticketsFinalizados,
        totalClientes,
        horasTotales,
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Tickets Activos",
      value: stats.ticketsActivos,
      icon: Ticket,
      color: "text-primary",
    },
    {
      title: "Tickets Finalizados",
      value: stats.ticketsFinalizados,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      title: "Total Clientes",
      value: stats.totalClientes,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Horas Trabajadas",
      value: stats.horasTotales,
      icon: Clock,
      color: "text-warning",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Vista general del sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Sistema de Gestión TPV</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Utiliza el menú lateral para navegar entre tickets, clientes y otras funciones del sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
