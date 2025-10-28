import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Pause,
  Clock,
  Phone,
  Navigation,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  tiempo_total_minutos: number;
  fecha_creacion: string;
  cliente_id: string | null;
  clientes: { nombre: string; telefono: string; direccion: string; email: string; cif: string } | null;
}

interface Material {
  id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

interface HistorialTiempo {
  id: string;
  inicio: string;
  fin: string | null;
  duracion_minutos: number | null;
  notas: string | null;
  tecnico_id: string;
  profiles: { nombre: string };
}

const DetalleTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [historial, setHistorial] = useState<HistorialTiempo[]>([]);
  const [loading, setLoading] = useState(true);
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  const [tiempoActualId, setTiempoActualId] = useState<string | null>(null);
  const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: "", cantidad: 1, precio_unitario: 0 });
  const [dialogMaterialOpen, setDialogMaterialOpen] = useState(false);
  const [dialogEliminarOpen, setDialogEliminarOpen] = useState(false);
  const [motivoEliminacion, setMotivoEliminacion] = useState("");
  const [dialogTiempoManualOpen, setDialogTiempoManualOpen] = useState(false);
  const [tiempoManual, setTiempoManual] = useState({ inicio: "", fin: "", notas: "" });
  const [tiempoTotalCliente, setTiempoTotalCliente] = useState(0);

  useEffect(() => {
    if (id) {
      loadTicket();
      loadMateriales();
      loadHistorial();
    }
  }, [id]);

  useEffect(() => {
    if (ticket?.cliente_id) {
      loadTiempoTotalCliente(ticket.cliente_id);
    }
  }, [ticket?.cliente_id]);

  const loadTicket = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(
          `
          *,
          clientes (nombre, telefono, direccion, email, cif)
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      setTicket(data);
    } catch (error) {
      console.error("Error cargando ticket:", error);
      toast.error("Error al cargar ticket");
    } finally {
      setLoading(false);
    }
  };

  const loadMateriales = async () => {
    try {
      const { data, error } = await supabase
        .from("materiales")
        .select("*")
        .eq("ticket_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMateriales(data || []);
    } catch (error) {
      console.error("Error cargando materiales:", error);
    }
  };

  const loadHistorial = async () => {
    try {
      const { data: historialData, error } = await supabase
        .from("historial_tiempo")
        .select("*")
        .eq("ticket_id", id)
        .order("inicio", { ascending: false });

      if (error) throw error;

      // Cargar perfiles de técnicos
      if (historialData && historialData.length > 0) {
        const tecnicoIds = [...new Set(historialData.map((h) => h.tecnico_id))];
        const { data: perfiles } = await supabase.from("profiles").select("id, nombre").in("id", tecnicoIds);

        const perfilesMap = new Map(perfiles?.map((p) => [p.id, p]) || []);

        const historialConPerfiles = historialData.map((h) => ({
          ...h,
          profiles: { nombre: perfilesMap.get(h.tecnico_id)?.nombre || "Desconocido" },
        }));

        setHistorial(historialConPerfiles);

        // Check if there's an active timer
        const activo = historialConPerfiles.find((h) => !h.fin);
        if (activo) {
          setTemporizadorActivo(true);
          setTiempoActualId(activo.id);
        }
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    }
  };

  const loadTiempoTotalCliente = async (clienteId: string) => {
    try {
      // Obtener todos los tickets del cliente
      const { data: ticketsCliente, error: ticketsError } = await supabase
        .from("tickets")
        .select("tiempo_total_minutos")
        .eq("cliente_id", clienteId)
        .neq("estado", "eliminado");

      if (ticketsError) throw ticketsError;

      const total = ticketsCliente?.reduce((sum, t) => sum + (t.tiempo_total_minutos || 0), 0) || 0;
      setTiempoTotalCliente(total);
    } catch (error) {
      console.error("Error cargando tiempo total del cliente:", error);
    }
  };

  const agregarTiempoManual = async () => {
    try {
      if (!tiempoManual.inicio || !tiempoManual.fin) {
        toast.error("Por favor completa las fechas de inicio y fin");
        return;
      }

      const inicio = new Date(tiempoManual.inicio);
      const fin = new Date(tiempoManual.fin);
      const duracionMs = fin.getTime() - inicio.getTime();
      const duracionMinutos = Math.floor(duracionMs / (1000 * 60));

      if (duracionMinutos <= 0) {
        toast.error("La fecha de fin debe ser posterior a la de inicio");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      const { error } = await supabase.from("historial_tiempo").insert([
        {
          ticket_id: id,
          tecnico_id: userData.user.id,
          inicio: tiempoManual.inicio,
          fin: tiempoManual.fin,
          duracion_minutos: duracionMinutos,
          notas: tiempoManual.notas || null,
        },
      ]);

      if (error) throw error;

      toast.success("Registro de tiempo agregado");
      setTiempoManual({ inicio: "", fin: "", notas: "" });
      setDialogTiempoManualOpen(false);
      loadHistorial();
      loadTicket();
    } catch (error: any) {
      console.error("Error agregando tiempo manual:", error);
      toast.error(error.message || "Error al agregar registro");
    }
  };

  const toggleTemporizador = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      if (!temporizadorActivo) {
        // Start timer
        const { data, error } = await supabase
          .from("historial_tiempo")
          .insert([
            {
              ticket_id: id,
              tecnico_id: userData.user.id,
              inicio: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) throw error;
        setTiempoActualId(data.id);
        setTemporizadorActivo(true);
        toast.success("Temporizador iniciado");
      } else {
        // Stop timer
        const { error } = await supabase
          .from("historial_tiempo")
          .update({ fin: new Date().toISOString() })
          .eq("id", tiempoActualId);

        if (error) throw error;
        setTemporizadorActivo(false);
        setTiempoActualId(null);
        toast.success("Temporizador detenido");
      }

      loadHistorial();
      loadTicket();
    } catch (error: any) {
      console.error("Error con temporizador:", error);
      toast.error(error.message || "Error con temporizador");
    }
  };

  const agregarMaterial = async () => {
    try {
      const { error } = await supabase.from("materiales").insert([
        {
          ticket_id: id,
          ...nuevoMaterial,
        },
      ]);

      if (error) throw error;

      toast.success("Material agregado");
      setNuevoMaterial({ nombre: "", cantidad: 1, precio_unitario: 0 });
      setDialogMaterialOpen(false);
      loadMateriales();
    } catch (error: any) {
      console.error("Error agregando material:", error);
      toast.error(error.message || "Error al agregar material");
    }
  };

  const eliminarMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase.from("materiales").delete().eq("id", materialId);

      if (error) throw error;
      toast.success("Material eliminado");
      loadMateriales();
    } catch (error: any) {
      console.error("Error eliminando material:", error);
      toast.error(error.message || "Error al eliminar material");
    }
  };

  const marcarComoResuelto = async () => {
    try {
      // Detener el temporizador si está activo
      if (temporizadorActivo && tiempoActualId) {
        await supabase.from("historial_tiempo").update({ fin: new Date().toISOString() }).eq("id", tiempoActualId);
      }

      const { error } = await supabase
        .from("tickets")
        .update({
          estado: "finalizado",
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      setTemporizadorActivo(false);
      setTiempoActualId(null);
      toast.success("Ticket marcado como resuelto");
      loadTicket();
      loadHistorial();
    } catch (error: any) {
      console.error("Error finalizando ticket:", error);
      toast.error(error.message || "Error al finalizar ticket");
    }
  };

  const eliminarTicket = async () => {
    try {
      if (!motivoEliminacion.trim()) {
        toast.error("El motivo de eliminación es obligatorio");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      // Obtener información del técnico
      const { data: tecnico } = await supabase
        .from("profiles")
        .select("nombre, email")
        .eq("id", userData.user.id)
        .single();

      // Detener temporizador si está activo
      if (temporizadorActivo && tiempoActualId) {
        await supabase.from("historial_tiempo").update({ fin: new Date().toISOString() }).eq("id", tiempoActualId);
      }

      const { error } = await supabase
        .from("tickets")
        .update({
          estado: "eliminado",
          motivo_eliminacion: `[${tecnico?.nombre || userData.user.email}] ${motivoEliminacion}`,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Ticket eliminado correctamente");
      setDialogEliminarOpen(false);
      navigate("/tickets");
    } catch (error: any) {
      console.error("Error eliminando ticket:", error);
      toast.error(error.message || "Error al eliminar ticket");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Ticket no encontrado</p>
        <Button onClick={() => navigate("/tickets")}>Volver a Tickets</Button>
      </div>
    );
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "urgente":
        return "destructive";
      case "alta":
        return "warning";
      case "media":
        return "default";
      case "baja":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/tickets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Ticket #{ticket.numero}</h1>
            <p className="text-muted-foreground">{ticket.titulo}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={getPrioridadColor(ticket.prioridad)}>{ticket.prioridad}</Badge>
          <Badge variant={ticket.estado === "activo" ? "default" : "success"}>{ticket.estado}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Ticket</CardTitle>
            <Button variant="ghost" size="sm" className="absolute top-4 right-4">
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground text-sm">Título</Label>
              <p className="font-medium">{ticket.titulo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Cliente</Label>
              <p className="font-medium text-primary cursor-pointer hover:underline">
                {ticket.clientes?.nombre || "Sin cliente"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Asignado a</Label>
              <p>Técnico</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Estado</Label>
              <Badge variant={ticket.estado === "activo" ? "default" : "success"}>
                {ticket.estado === "activo" ? "Activo" : "Finalizado"}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Prioridad</Label>
              <Badge variant={getPrioridadColor(ticket.prioridad)} className="capitalize">
                {ticket.prioridad}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Fecha de Creación</Label>
              <p className="text-sm">{new Date(ticket.fecha_creacion).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">Descripción</Label>
              <p className="text-sm">{ticket.descripcion || "Sin descripción"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente y Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información del Cliente */}
            <div className="space-y-3 pb-4 border-b">
              <div>
                <p className="font-semibold text-lg">{ticket.clientes?.nombre || "Sin cliente"}</p>
              </div>
              {ticket.clientes?.cif && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">ID: </span>
                  <span>{ticket.clientes.cif}</span>
                </div>
              )}
              {ticket.clientes?.telefono && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <a href={`tel:${ticket.clientes.telefono}`} className="hover:text-primary hover:underline">
                    {ticket.clientes.telefono}
                  </a>
                </div>
              )}
              {ticket.clientes?.email && (
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground">✉</span>
                  <a href={`mailto:${ticket.clientes.email}`} className="hover:text-primary hover:underline text-sm">
                    {ticket.clientes.email}
                  </a>
                </div>
              )}
              {ticket.clientes?.direccion && (
                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.clientes.direccion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline text-sm"
                  >
                    {ticket.clientes.direccion}
                  </a>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/clientes/${ticket.cliente_id}`)}
              >
                Ver Perfil Completo
              </Button>
            </div>

            {/* Acciones Rápidas */}
            <div className="space-y-3">
              {ticket.estado === "activo" && (
                <>
                  <Button onClick={marcarComoResuelto} className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Marcar como Resuelto
                  </Button>
                  <Button
                    onClick={() => setDialogEliminarOpen(true)}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Eliminar Ticket
                  </Button>
                </>
              )}
              {ticket.estado === "finalizado" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Este ticket ya ha sido resuelto</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Materiales Utilizados</CardTitle>
            <Dialog open={dialogMaterialOpen} onOpenChange={setDialogMaterialOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Material</DialogTitle>
                  <DialogDescription>Registra un nuevo material utilizado en este ticket</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={nuevoMaterial.nombre}
                      onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, nombre: e.target.value })}
                      placeholder="Ej: Cable HDMI"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        min="1"
                        value={nuevoMaterial.cantidad}
                        onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, cantidad: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio Unitario (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={nuevoMaterial.precio_unitario}
                        onChange={(e) =>
                          setNuevoMaterial({ ...nuevoMaterial, precio_unitario: parseFloat(e.target.value) })
                        }
                      />
                    </div>
                  </div>
                  <Button onClick={agregarMaterial} className="w-full">
                    Agregar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {materiales.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No se han agregado materiales</p>
          ) : (
            <div className="space-y-2">
              {materiales.map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{material.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Cantidad: {material.cantidad} × {material.precio_unitario}€ ={" "}
                      {(material.cantidad * material.precio_unitario).toFixed(2)}€
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => eliminarMaterial(material.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-right font-bold">
                  Total: {materiales.reduce((sum, m) => sum + m.cantidad * m.precio_unitario, 0).toFixed(2)}€
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Registro de Tiempo</CardTitle>
            </div>
            <Dialog open={dialogTiempoManualOpen} onOpenChange={setDialogTiempoManualOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Registro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir Registro de Tiempo</DialogTitle>
                  <DialogDescription>Registra manualmente el tiempo dedicado a este ticket</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha y Hora de Inicio</Label>
                      <Input
                        type="datetime-local"
                        value={tiempoManual.inicio}
                        onChange={(e) => setTiempoManual({ ...tiempoManual, inicio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha y Hora de Fin</Label>
                      <Input
                        type="datetime-local"
                        value={tiempoManual.fin}
                        onChange={(e) => setTiempoManual({ ...tiempoManual, fin: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notas (opcional)</Label>
                    <Textarea
                      value={tiempoManual.notas}
                      onChange={(e) => setTiempoManual({ ...tiempoManual, notas: e.target.value })}
                      placeholder="Descripción del trabajo realizado..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogTiempoManualOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={agregarTiempoManual}>Agregar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Tiempo total dedicado:</p>
              <p className="text-2xl font-bold">
                {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}min
              </p>
            </div>
            {ticket.cliente_id && tiempoTotalCliente > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tiempo total del cliente:</p>
                <p className="text-lg font-semibold text-primary">
                  {Math.floor(tiempoTotalCliente / 60)}h {tiempoTotalCliente % 60}min
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={toggleTemporizador}
            className="w-full"
            size="lg"
            variant={temporizadorActivo ? "destructive" : "default"}
            disabled={ticket.estado !== "activo"}
          >
            {temporizadorActivo ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Detener Temporizador
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Iniciar Temporizador
              </>
            )}
          </Button>

          <div className="space-y-2 mt-6">
            <h4 className="font-semibold text-sm">Historial</h4>
            {historial.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">No hay registros de tiempo</p>
            ) : (
              <div className="space-y-2">
                {historial.map((registro) => (
                  <div key={registro.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm">
                        {new Date(registro.inicio).toLocaleDateString()}{" "}
                        {new Date(registro.inicio).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}{" "}
                        -
                        {registro.fin
                          ? ` ${new Date(registro.fin).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
                          : " En progreso"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Técnico: {registro.profiles.nombre}</p>
                    {registro.notas && <p className="text-xs text-muted-foreground mt-1">Notas: {registro.notas}</p>}
                    {registro.fin && (
                      <p className="text-sm font-semibold text-primary mt-2">
                        Duración: {Math.floor((registro.duracion_minutos || 0) / 60)}h{" "}
                        {(registro.duracion_minutos || 0) % 60}min
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Eliminación */}
      <Dialog open={dialogEliminarOpen} onOpenChange={setDialogEliminarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Eliminar Ticket
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Por favor, proporciona el motivo de la eliminación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo de eliminación *</Label>
              <Textarea
                value={motivoEliminacion}
                onChange={(e) => setMotivoEliminacion(e.target.value)}
                placeholder="Explica por qué estás eliminando este ticket..."
                rows={4}
                required
              />
            </div>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                El ticket será marcado como eliminado y se registrará tu usuario y el motivo.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogEliminarOpen(false);
                setMotivoEliminacion("");
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={eliminarTicket} disabled={!motivoEliminacion.trim()}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetalleTicket;
