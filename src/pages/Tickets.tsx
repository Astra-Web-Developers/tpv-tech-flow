import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Clock, LayoutGrid, List, Filter } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
}

interface Tecnico {
  nombre: string;
  apellidos?: string;
}

interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
  tiempo_total_minutos: number;
  clientes: { nombre: string } | null;
  etiquetas?: Etiqueta[];
  tecnicos_asignados?: Tecnico[];
}

const Tickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vistaActual, setVistaActual] = useState<"lista" | "kanban">("kanban");
  const [ordenarPor, setOrdenarPor] = useState<"prioridad" | "fecha" | "estado">("prioridad");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState<string>("todas");

  useEffect(() => {
    loadTickets();
    loadEtiquetas();
  }, []);

  const loadEtiquetas = async () => {
    try {
      const { data, error } = await supabase
        .from("etiquetas")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setEtiquetas(data || []);
    } catch (error) {
      console.error("Error cargando etiquetas:", error);
    }
  };

  const loadTickets = async () => {
    try {
      const { data: ticketsData, error } = await supabase
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

      // Cargar etiquetas y técnicos para cada ticket
      const ticketsCompletos = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          // Cargar etiquetas
          const { data: etiquetasData } = await supabase
            .from("tickets_etiquetas")
            .select(`
              etiquetas (
                id,
                nombre,
                color
              )
            `)
            .eq("ticket_id", ticket.id);

          // Cargar técnicos asignados
          const { data: tecnicosData } = await supabase
            .from("tickets_tecnicos")
            .select(`
              profiles:tecnico_id (
                nombre,
                apellidos
              )
            `)
            .eq("ticket_id", ticket.id);

          return {
            ...ticket,
            etiquetas: etiquetasData?.map((e: any) => e.etiquetas) || [],
            tecnicos_asignados: tecnicosData?.map((t: any) => t.profiles) || [],
          };
        })
      );

      setTickets(ticketsCompletos);
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

  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.numero.toString().includes(searchTerm) ||
        ticket.clientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.etiquetas?.some(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEstado = filtroEstado === "todos" || ticket.estado === filtroEstado;

      const matchesEtiqueta = 
        etiquetaSeleccionada === "todas" || 
        ticket.etiquetas?.some(e => e.id === etiquetaSeleccionada);

      return matchesSearch && matchesEstado && matchesEtiqueta;
    })
    .sort((a, b) => {
      if (ordenarPor === "prioridad") {
        const prioridadOrden: Record<string, number> = {
          urgente: 0,
          alta: 1,
          media: 2,
          baja: 3,
        };
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      } else if (ordenarPor === "fecha") {
        return new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
      } else if (ordenarPor === "estado") {
        return a.estado.localeCompare(b.estado);
      }
      return 0;
    });

  const ticketsPorColumna = {
    activo: filteredTickets.filter((t) => t.estado === "activo"),
    finalizado: filteredTickets.filter((t) => t.estado === "finalizado"),
    eliminado: filteredTickets.filter((t) => t.estado === "eliminado"),
  };

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

  const recuperarTicket = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se navegue al detalle
    
    try {
      const { error } = await supabase
        .from("tickets")
        .update({ 
          estado: "activo",
          motivo_eliminacion: null 
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast.success("Ticket recuperado exitosamente");
      loadTickets();
    } catch (error) {
      console.error("Error recuperando ticket:", error);
      toast.error("Error al recuperar el ticket");
    }
  };

  const renderTicketCard = (ticket: Ticket) => (
    <Card
      key={ticket.id}
      className="hover:shadow-md transition-shadow cursor-pointer mb-3"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-sm font-semibold mb-1">
                #{ticket.numero} - {ticket.titulo}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{ticket.clientes?.nombre || "Sin cliente"}</span>
                {ticket.tecnicos_asignados && ticket.tecnicos_asignados.length > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {ticket.tecnicos_asignados.map(t => `${t.nombre} ${t.apellidos || ''}`).join(", ")}
                    </span>
                  </>
                )}
              </div>
            </div>
            <Badge variant={getPrioridadColor(ticket.prioridad)} className="text-xs">
              {ticket.prioridad}
            </Badge>
          </div>
          {ticket.etiquetas && ticket.etiquetas.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {ticket.etiquetas.map((etiqueta) => (
                <Badge
                  key={etiqueta.id}
                  style={{ backgroundColor: etiqueta.color }}
                  className="text-white text-[10px] px-1.5 py-0"
                >
                  {etiqueta.nombre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}m
            </div>
            <div>
              {new Date(ticket.fecha_creacion).toLocaleDateString()}
            </div>
          </div>
          
          {ticket.estado === "eliminado" && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => recuperarTicket(ticket.id, e)}
              className="h-7 px-2"
            >
              Recuperar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, número, cliente o etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={etiquetaSeleccionada} onValueChange={setEtiquetaSeleccionada}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todas las etiquetas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las etiquetas</SelectItem>
            {etiquetas.map((etiqueta) => (
              <SelectItem key={etiqueta.id} value={etiqueta.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: etiqueta.color }}
                  />
                  {etiqueta.nombre}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={ordenarPor} onValueChange={(value: any) => setOrdenarPor(value)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Ordenar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prioridad">Por Prioridad</SelectItem>
            <SelectItem value="fecha">Por Fecha</SelectItem>
            <SelectItem value="estado">Por Estado</SelectItem>
          </SelectContent>
        </Select>

        <Tabs value={vistaActual} onValueChange={(value: any) => setVistaActual(value)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Vista Kanban */}
      {vistaActual === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna: Activo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Activo</h3>
              <Badge variant="default">{ticketsPorColumna.activo.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-lg">
              {ticketsPorColumna.activo.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No hay tickets activos
                </p>
              ) : (
                ticketsPorColumna.activo.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Columna: Finalizado */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Finalizado</h3>
              <Badge variant="success">{ticketsPorColumna.finalizado.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-lg">
              {ticketsPorColumna.finalizado.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No hay tickets finalizados
                </p>
              ) : (
                ticketsPorColumna.finalizado.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Columna: Eliminado */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Eliminado</h3>
              <Badge variant="secondary">{ticketsPorColumna.eliminado.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px] p-3 bg-muted/30 rounded-lg">
              {ticketsPorColumna.eliminado.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No hay tickets eliminados
                </p>
              ) : (
                ticketsPorColumna.eliminado.map(renderTicketCard)
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Vista Lista */
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
      )}
    </div>
  );
};

export default Tickets;
