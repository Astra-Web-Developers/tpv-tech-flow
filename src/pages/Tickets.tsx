import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Clock, LayoutGrid, List, Filter, User, Users, Building2, Calendar, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<string>("todos");

  useEffect(() => {
    loadTickets();
    loadEtiquetas();
    loadTecnicos();
  }, []);

  const loadEtiquetas = async () => {
    try {
      const { data, error } = await supabase
        .from("etiquetas_tickets" as any)
        .select("*")
        .order("nombre");

      if (error) throw error;
      setEtiquetas((data || []) as unknown as Etiqueta[]);
    } catch (error) {
      console.error("Error cargando etiquetas:", error);
    }
  };

  const loadTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, apellidos")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setTecnicos(data || []);
    } catch (error) {
      console.error("Error cargando técnicos:", error);
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
          // Cargar etiquetas - usando join manual ya que el tipo no está definido
          const { data: ticketsEtiquetasData } = await supabase
            .from("tickets_etiquetas")
            .select("etiqueta_id")
            .eq("ticket_id", ticket.id);
          
          let etiquetas: Etiqueta[] = [];
          if (ticketsEtiquetasData && ticketsEtiquetasData.length > 0) {
            const etiquetaIds = ticketsEtiquetasData.map(e => e.etiqueta_id);
            const { data: etiquetasData } = await supabase
              .from("etiquetas_tickets" as any)
              .select("id, nombre, color")
              .in("id", etiquetaIds);
            etiquetas = (etiquetasData || []) as unknown as Etiqueta[];
          }

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
            etiquetas: etiquetas,
            tecnicos_asignados: tecnicosData?.map((t: any) => t.profiles).filter(Boolean) || [],
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
      case "urgente": return "bg-red-600 hover:bg-red-700 text-white";
      case "alta": return "bg-orange-500 hover:bg-orange-600 text-white";
      case "media": return "bg-blue-500 hover:bg-blue-600 text-white";
      case "baja": return "bg-gray-500 hover:bg-gray-600 text-white";
      default: return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "activo": return "bg-green-600 hover:bg-green-700 text-white";
      case "finalizado": return "bg-blue-600 hover:bg-blue-700 text-white";
      case "eliminado": return "bg-gray-500 hover:bg-gray-600 text-white";
      default: return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const getPrioridadBorder = (prioridad: string) => {
    switch (prioridad) {
      case "urgente": return "border-l-4 border-red-600";
      case "alta": return "border-l-4 border-orange-500";
      case "media": return "border-l-4 border-blue-500";
      case "baja": return "border-l-4 border-gray-400";
      default: return "border-l-4 border-gray-400";
    }
  };

  const getIniciales = (nombre: string, apellidos?: string) => {
    const inicialNombre = nombre?.charAt(0).toUpperCase() || "";
    const inicialApellido = apellidos?.charAt(0).toUpperCase() || "";
    return `${inicialNombre}${inicialApellido}` || "?";
  };

  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.numero.toString().includes(searchTerm) ||
        ticket.clientes?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.etiquetas?.some(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ticket.tecnicos_asignados?.some(t =>
          `${t.nombre} ${t.apellidos || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesEstado = filtroEstado === "todos" || ticket.estado === filtroEstado;

      const matchesEtiqueta =
        etiquetaSeleccionada === "todas" ||
        ticket.etiquetas?.some(e => e.id === etiquetaSeleccionada);

      const matchesTecnico =
        tecnicoSeleccionado === "todos" ||
        ticket.tecnicos_asignados?.some(t => t.nombre === tecnicoSeleccionado);

      return matchesSearch && matchesEstado && matchesEtiqueta && matchesTecnico;
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
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer mb-3 border-2 ${getPrioridadBorder(ticket.prioridad)} hover:scale-[1.02] bg-card`}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <CardHeader className="pb-3 space-y-3">
        {/* Header con número y prioridad */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold mb-2 line-clamp-2">
              #{ticket.numero} - {ticket.titulo}
            </CardTitle>
          </div>
          <Badge className={`${getPrioridadColor(ticket.prioridad)} text-xs font-semibold capitalize shrink-0`}>
            {ticket.prioridad}
          </Badge>
        </div>

        {/* Cliente */}
        {ticket.clientes?.nombre && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium text-foreground truncate">{ticket.clientes.nombre}</span>
          </div>
        )}

        {/* Técnicos asignados - Destacado */}
        {ticket.tecnicos_asignados && ticket.tecnicos_asignados.length > 0 ? (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Users className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              {ticket.tecnicos_asignados.map((tecnico, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-md border border-primary/20"
                >
                  <Avatar className="h-6 w-6 border-2 border-primary/30">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getIniciales(tecnico.nombre, tecnico.apellidos)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {tecnico.nombre} {tecnico.apellidos || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-2 border-t text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="text-xs italic">Sin técnico asignado</span>
          </div>
        )}

        {/* Etiquetas */}
        {ticket.etiquetas && ticket.etiquetas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {ticket.etiquetas.map((etiqueta) => (
              <Badge
                key={etiqueta.id}
                style={{ backgroundColor: etiqueta.color, borderColor: etiqueta.color }}
                className="text-white text-[10px] px-2 py-0.5 font-medium border"
              >
                {etiqueta.nombre}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">
                {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}m
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium">
                {new Date(ticket.fecha_creacion).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short'
                })}
              </span>
            </div>
          </div>
          
          {ticket.estado === "eliminado" && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => recuperarTicket(ticket.id, e)}
              className="h-7 px-3 text-xs"
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
      <Card className="border-2 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Primera fila: Búsqueda y vista */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, número, cliente, técnico o etiqueta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              <Tabs value={vistaActual} onValueChange={(value: any) => setVistaActual(value)} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-2 h-11">
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

            {/* Segunda fila: Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={tecnicoSeleccionado} onValueChange={setTecnicoSeleccionado}>
                <SelectTrigger className="w-full sm:w-[220px] h-11">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Todos los técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los técnicos</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.id} value={tecnico.nombre}>
                      {tecnico.nombre} {tecnico.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={etiquetaSeleccionada} onValueChange={setEtiquetaSeleccionada}>
                <SelectTrigger className="w-full sm:w-[220px] h-11">
                  <SelectValue placeholder="Todas las etiquetas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las etiquetas</SelectItem>
                  {etiquetas.map((etiqueta) => (
                    <SelectItem key={etiqueta.id} value={etiqueta.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: etiqueta.color } as React.CSSProperties}
                        />
                        {etiqueta.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ordenarPor} onValueChange={(value: any) => setOrdenarPor(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prioridad">Por Prioridad</SelectItem>
                  <SelectItem value="fecha">Por Fecha</SelectItem>
                  <SelectItem value="estado">Por Estado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista Kanban */}
      {vistaActual === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna: Activo */}
          <div className="space-y-4">
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-green-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Activo
                  </CardTitle>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white font-semibold">
                    {ticketsPorColumna.activo.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
            <div className="space-y-3 min-h-[400px] p-4 bg-gradient-to-b from-green-50/30 to-transparent rounded-lg border-2 border-green-100">
              {ticketsPorColumna.activo.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    No hay tickets activos
                  </p>
                </div>
              ) : (
                ticketsPorColumna.activo.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Columna: Finalizado */}
          <div className="space-y-4">
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Finalizado
                  </CardTitle>
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    {ticketsPorColumna.finalizado.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
            <div className="space-y-3 min-h-[400px] p-4 bg-gradient-to-b from-blue-50/30 to-transparent rounded-lg border-2 border-blue-100">
              {ticketsPorColumna.finalizado.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    No hay tickets finalizados
                  </p>
                </div>
              ) : (
                ticketsPorColumna.finalizado.map(renderTicketCard)
              )}
            </div>
          </div>

          {/* Columna: Eliminado */}
          <div className="space-y-4">
            <Card className="border-2 border-gray-200 bg-gray-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-700 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Eliminado
                  </CardTitle>
                  <Badge className="bg-gray-500 hover:bg-gray-600 text-white font-semibold">
                    {ticketsPorColumna.eliminado.length}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
            <div className="space-y-3 min-h-[400px] p-4 bg-gradient-to-b from-gray-50/30 to-transparent rounded-lg border-2 border-gray-100">
              {ticketsPorColumna.eliminado.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">
                    No hay tickets eliminados
                  </p>
                </div>
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
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-semibold text-foreground mb-2">No se encontraron tickets</p>
                <p className="text-sm text-muted-foreground mb-6">Intenta ajustar los filtros de búsqueda</p>
                <Button onClick={() => navigate("/tickets/nuevo")} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`hover:shadow-lg transition-all duration-200 cursor-pointer border-2 ${getPrioridadBorder(ticket.prioridad)} hover:scale-[1.01]`}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <CardTitle className="text-lg font-bold flex-1">
                          #{ticket.numero} - {ticket.titulo}
                        </CardTitle>
                        <div className="flex gap-2 shrink-0">
                          <Badge className={`${getPrioridadColor(ticket.prioridad)} capitalize`}>
                            {ticket.prioridad}
                          </Badge>
                          <Badge className={`${getEstadoBadgeColor(ticket.estado)} capitalize`}>
                            {ticket.estado}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Cliente */}
                        {ticket.clientes?.nombre && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm font-medium text-foreground">{ticket.clientes.nombre}</span>
                          </div>
                        )}

                        {/* Técnicos - Destacado */}
                        {ticket.tecnicos_asignados && ticket.tecnicos_asignados.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex items-center gap-2 flex-wrap">
                              {ticket.tecnicos_asignados.map((tecnico, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 bg-primary/10 px-2 py-1 rounded-md border border-primary/20"
                                >
                                  <Avatar className="h-5 w-5 border border-primary/30">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
                                      {getIniciales(tecnico.nombre, tecnico.apellidos)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-semibold text-foreground">
                                    {tecnico.nombre} {tecnico.apellidos || ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="text-xs italic">Sin técnico asignado</span>
                          </div>
                        )}
                      </div>

                      {/* Etiquetas */}
                      {ticket.etiquetas && ticket.etiquetas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ticket.etiquetas.map((etiqueta) => (
                            <Badge
                              key={etiqueta.id}
                              style={{ backgroundColor: etiqueta.color, borderColor: etiqueta.color }}
                              className="text-white text-[10px] px-2 py-0.5 font-medium border"
                            >
                              {etiqueta.nombre}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}m
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        Creado: {new Date(ticket.fecha_creacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {ticket.estado === "eliminado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => recuperarTicket(ticket.id, e)}
                        className="ml-auto"
                      >
                        Recuperar
                      </Button>
                    )}
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
