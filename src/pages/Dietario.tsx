import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Evento {
  id: string;
  fecha: string;
  tipo: "ticket" | "venta" | "mantenimiento" | "ausencia";
  titulo: string;
  descripcion?: string;
}

const Dietario = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [vistaActual, setVistaActual] = useState<"mes" | "semana" | "dia">("mes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0],
    tipo: "ticket" as const,
  });

  useEffect(() => {
    loadEventos();
  }, [fechaActual]);

  const loadEventos = async () => {
    try {
      // Por ahora cargamos tickets como eventos
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select(`
          id,
          titulo,
          descripcion,
          fecha_creacion,
          estado
        `)
        .eq("estado", "activo")
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;

      const eventosTickets: Evento[] = (tickets || []).map(ticket => ({
        id: ticket.id,
        fecha: ticket.fecha_creacion,
        tipo: "ticket" as const,
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
      }));

      setEventos(eventosTickets);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      toast.error("Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "ticket": return "default";
      case "venta": return "success";
      case "mantenimiento": return "warning";
      case "ausencia": return "destructive";
      default: return "default";
    }
  };

  const getDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const dias = [];
    // Días vacíos al inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }

    return dias;
  };

  const getEventosDelDia = (dia: number) => {
    const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    return eventos.filter(evento => {
      const fechaEvento = new Date(evento.fecha);
      return fechaEvento.getDate() === dia &&
             fechaEvento.getMonth() === fecha.getMonth() &&
             fechaEvento.getFullYear() === fecha.getFullYear();
    });
  };

  const crearEvento = async () => {
    if (!nuevoEvento.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    try {
      // Por ahora creamos un ticket como evento
      const { error } = await supabase
        .from("tickets")
        .insert({
          titulo: nuevoEvento.titulo,
          descripcion: nuevoEvento.descripcion,
          estado: "activo",
          fecha_creacion: nuevoEvento.fecha,
        });

      if (error) throw error;

      toast.success("Evento creado exitosamente");
      setDialogOpen(false);
      setNuevoEvento({
        titulo: "",
        descripcion: "",
        fecha: new Date().toISOString().split('T')[0],
        tipo: "ticket",
      });
      loadEventos();
    } catch (error) {
      console.error("Error creando evento:", error);
      toast.error("Error al crear evento");
    }
  };

  const handleDiaClick = (dia: number) => {
    const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
    setNuevoEvento({
      ...nuevoEvento,
      fecha: fecha.toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dietario</h1>
          <p className="text-muted-foreground">Calendario de actividades y planificación</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
              <DialogDescription>
                Agrega un nuevo evento al calendario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={nuevoEvento.titulo}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })}
                  placeholder="Título del evento"
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={nuevoEvento.fecha}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={nuevoEvento.tipo}
                  onValueChange={(value: any) => setNuevoEvento({ ...nuevoEvento, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="ausencia">Ausencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                  placeholder="Descripción del evento (opcional)"
                  rows={3}
                />
              </div>
              <Button onClick={crearEvento} className="w-full">
                Crear Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => cambiarMes(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={() => cambiarMes(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={vistaActual === "dia" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("dia")}
              >
                Día
              </Button>
              <Button
                variant={vistaActual === "semana" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("semana")}
              >
                Semana
              </Button>
              <Button
                variant={vistaActual === "mes" ? "default" : "outline"}
                size="sm"
                onClick={() => setVistaActual("mes")}
              >
                Mes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center font-semibold text-sm text-muted-foreground p-2">
                {dia}
              </div>
            ))}

            {getDiasDelMes().map((dia, index) => {
              if (dia === null) {
                return <div key={`empty-${index}`} className="min-h-24 border rounded-lg bg-muted/20" />;
              }

              const eventosDelDia = getEventosDelDia(dia);
              const esHoy = 
                dia === new Date().getDate() &&
                fechaActual.getMonth() === new Date().getMonth() &&
                fechaActual.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={dia}
                  onClick={() => handleDiaClick(dia)}
                  className={`min-h-24 border rounded-lg p-2 cursor-pointer ${
                    esHoy ? "bg-primary/5 border-primary" : "bg-card"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className={`text-sm font-semibold mb-2 ${esHoy ? "text-primary" : ""}`}>
                    {dia}
                  </div>
                  <div className="space-y-1">
                    {eventosDelDia.slice(0, 3).map((evento) => (
                      <div
                        key={evento.id}
                        className="text-xs p-1 rounded bg-primary/10 text-primary truncate cursor-pointer hover:bg-primary/20"
                        title={evento.titulo}
                      >
                        {evento.titulo}
                      </div>
                    ))}
                    {eventosDelDia.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{eventosDelDia.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay eventos este mes</p>
          ) : (
            <div className="space-y-2">
              {eventos.slice(0, 10).map((evento) => (
                <div key={evento.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(evento.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{evento.titulo}</p>
                      {evento.descripcion && (
                        <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getTipoColor(evento.tipo)}>
                    {evento.tipo}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sistema de Fichaje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Estado Actual</span>
                </div>
                <Badge variant="secondary">Fichado</Badge>
              </div>
              <Button className="w-full" variant="outline">
                Fichar Entrada/Salida
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Última entrada: Hoy a las 08:30
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Checklist de materiales de la furgoneta
              </p>
              <Button className="w-full" variant="outline">
                Ver Checklist
              </Button>
              <p className="text-sm text-center">
                <span className="font-medium text-warning">Pendiente</span> · Próxima revisión: 01/12/2024
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dietario;
