import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Clock } from "lucide-react";
import { toast } from "sonner";

interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
  tiempo_total_minutos: number;
  clientes: { nombre: string } | null;
}

const Tickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          id,
          numero,
          titulo,
          prioridad,
          estado,
          fecha_creacion,
          tiempo_total_minutos,
          clientes (nombre)
        `)
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error cargando tickets:", error);
      toast.error("Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente": return "destructive";
      case "alta": return "warning";
      case "media": return "default";
      case "baja": return "secondary";
      default: return "default";
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo": return "default";
      case "finalizado": return "success";
      case "eliminado": return "secondary";
      default: return "default";
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.numero.toString().includes(searchTerm) ||
      ticket.clientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">Gestiona los tickets de servicio técnico</p>
        </div>
        <Button onClick={() => navigate("/tickets/nuevo")}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Ticket
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, número o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No se encontraron tickets</p>
              <Button onClick={() => navigate("/tickets/nuevo")}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      #{ticket.numero} - {ticket.titulo}
                    </CardTitle>
                    <CardDescription>
                      {ticket.clientes?.nombre || "Sin cliente asignado"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPrioridadColor(ticket.prioridad)}>
                      {ticket.prioridad}
                    </Badge>
                    <Badge variant={getEstadoColor(ticket.estado)}>
                      {ticket.estado}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}m
                  </div>
                  <div>
                    Creado: {new Date(ticket.fecha_creacion).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Tickets;
