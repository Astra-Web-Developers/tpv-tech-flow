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
  RotateCcw,
  FileCheck,
  X,
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
import { DialogoCerrarTicket } from "@/components/DialogoCerrarTicket";
import { DialogoFirmaTicket } from "@/components/DialogoFirmaTicket";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
}

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
  tecnico_cierre_id: string | null;
  solucion: string | null;
  firma_cliente: string | null;
  fecha_firma: string | null;
  etiquetas?: Etiqueta[];
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
  const [dialogCerrarOpen, setDialogCerrarOpen] = useState(false);
  const [dialogFirmaOpen, setDialogFirmaOpen] = useState(false);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [etiquetasTicket, setEtiquetasTicket] = useState<Etiqueta[]>([]);
  const [dialogEtiquetasOpen, setDialogEtiquetasOpen] = useState(false);
  const [dialogEditarOpen, setDialogEditarOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "",
  });
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [tecnicosAsignados, setTecnicosAsignados] = useState<string[]>([]);
  const [tecnicosAsignadosInfo, setTecnicosAsignadosInfo] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadTicket();
      loadMateriales();
      loadHistorial();
      loadEtiquetas();
      loadEtiquetasTicket();
      loadTecnicos();
      loadTecnicosAsignados();
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
      
      // Actualizar datos del formulario de edición
      setEditFormData({
        titulo: data.titulo,
        descripcion: data.descripcion || "",
        prioridad: data.prioridad,
      });
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

  const loadEtiquetas = async () => {
    try {
      const { data, error } = await supabase
        .from("etiquetas_tickets")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setEtiquetas(data || []);
    } catch (error) {
      console.error("Error cargando etiquetas:", error);
    }
  };

  const loadEtiquetasTicket = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets_etiquetas")
        .select(`
          etiquetas_tickets (
            id,
            nombre,
            color
          )
        `)
        .eq("ticket_id", id);

      if (error) throw error;
      setEtiquetasTicket(data?.map((e: any) => e.etiquetas_tickets) || []);
    } catch (error) {
      console.error("Error cargando etiquetas del ticket:", error);
    }
  };

  const agregarEtiqueta = async (etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from("tickets_etiquetas")
        .insert([{ ticket_id: id, etiqueta_id: etiquetaId }]);

      if (error) throw error;

      toast.success("Etiqueta agregada");
      loadEtiquetasTicket();
      setDialogEtiquetasOpen(false);
    } catch (error: any) {
      console.error("Error agregando etiqueta:", error);
      toast.error(error.message || "Error al agregar etiqueta");
    }
  };

  const eliminarEtiqueta = async (etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from("tickets_etiquetas")
        .delete()
        .eq("ticket_id", id)
        .eq("etiqueta_id", etiquetaId);

      if (error) throw error;

      toast.success("Etiqueta eliminada");
      loadEtiquetasTicket();
    } catch (error: any) {
      console.error("Error eliminando etiqueta:", error);
      toast.error(error.message || "Error al eliminar etiqueta");
    }
  };

  const guardarEdicion = async () => {
    try {
      // Actualizar información básica del ticket
      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          titulo: editFormData.titulo,
          descripcion: editFormData.descripcion,
          prioridad: editFormData.prioridad,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Obtener técnicos actuales
      const { data: currentTecnicos } = await supabase
        .from("tickets_tecnicos")
        .select("tecnico_id")
        .eq("ticket_id", id);

      const currentIds = currentTecnicos?.map(t => t.tecnico_id) || [];

      // Eliminar técnicos que ya no están asignados
      const toRemove = currentIds.filter(id => !tecnicosAsignados.includes(id));
      if (toRemove.length > 0) {
        await supabase
          .from("tickets_tecnicos")
          .delete()
          .eq("ticket_id", id)
          .in("tecnico_id", toRemove);
      }

      // Agregar nuevos técnicos
      const toAdd = tecnicosAsignados.filter(id => !currentIds.includes(id));
      if (toAdd.length > 0) {
        const inserts = toAdd.map(tecnico_id => ({
          ticket_id: id,
          tecnico_id,
        }));
        await supabase.from("tickets_tecnicos").insert(inserts);
      }

      toast.success("Ticket actualizado correctamente");
      setDialogEditarOpen(false);
      loadTicket();
      loadTecnicosAsignados();
    } catch (error: any) {
      console.error("Error actualizando ticket:", error);
      toast.error(error.message || "Error al actualizar el ticket");
    }
  };

  const abrirDialogoEditar = async () => {
    await Promise.all([loadTecnicos(), loadTecnicosAsignados()]);
    setDialogEditarOpen(true);
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

  const loadTecnicosAsignados = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("tickets_tecnicos")
        .select("tecnico_id")
        .eq("ticket_id", id);

      if (error) throw error;
      
      const tecnicoIds = data?.map(t => t.tecnico_id) || [];
      setTecnicosAsignados(tecnicoIds);

      // Cargar información de los técnicos
      if (tecnicoIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, nombre, apellidos")
          .in("id", tecnicoIds);

        if (profilesError) throw profilesError;
        setTecnicosAsignadosInfo(profilesData || []);
      } else {
        setTecnicosAsignadosInfo([]);
      }
    } catch (error) {
      console.error("Error cargando técnicos asignados:", error);
    }
  };

  const toggleTecnico = (tecnicoId: string) => {
    setTecnicosAsignados(prev => 
      prev.includes(tecnicoId)
        ? prev.filter(id => id !== tecnicoId)
        : [...prev, tecnicoId]
    );
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

  const abrirDialogoCerrar = () => {
    // Detener el temporizador si está activo antes de cerrar
    if (temporizadorActivo && tiempoActualId) {
      supabase.from("historial_tiempo").update({ fin: new Date().toISOString() }).eq("id", tiempoActualId);
      setTemporizadorActivo(false);
      setTiempoActualId(null);
    }
    setDialogCerrarOpen(true);
  };

  const reabrirTicket = async () => {
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          estado: "activo",
          tecnico_cierre_id: null,
          solucion: null,
          firma_cliente: null,
          fecha_firma: null,
          fecha_finalizacion: null,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Ticket reabierto correctamente");
      loadTicket();
    } catch (error: any) {
      console.error("Error reabriendo ticket:", error);
      toast.error(error.message || "Error al reabrir ticket");
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
    <div className="space-y-6 pb-8">
      {/* Header mejorado */}
      <div className="flex items-start justify-between gap-4 pb-6 border-b">
        <div className="flex items-start gap-4 flex-1">
          <Button variant="outline" size="icon" onClick={() => navigate("/tickets")} className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">Ticket #{ticket.numero}</h1>
              <div className="flex gap-2">
                <Badge variant={getPrioridadColor(ticket.prioridad)} className="text-sm px-3 py-1 capitalize">
                  {ticket.prioridad}
                </Badge>
                <Badge
                  variant={ticket.estado === "activo" ? "default" : "success"}
                  className="text-sm px-3 py-1 capitalize"
                >
                  {ticket.estado === "activo" ? "En Progreso" : "Finalizado"}
                </Badge>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">{ticket.titulo}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Creado el{" "}
              {new Date(ticket.fecha_creacion).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {/* Etiquetas */}
            <div className="flex flex-wrap gap-2 mt-3">
              {etiquetasTicket.map((etiqueta) => (
                <Badge
                  key={etiqueta.id}
                  style={{ backgroundColor: etiqueta.color }}
                  className="text-white px-3 py-1 flex items-center gap-2"
                >
                  {etiqueta.nombre}
                  {ticket.estado === "activo" && (
                    <X
                      className="h-3 w-3 cursor-pointer hover:opacity-70"
                      onClick={() => eliminarEtiqueta(etiqueta.id)}
                    />
                  )}
                </Badge>
              ))}
              {ticket.estado === "activo" && (
                <Dialog open={dialogEtiquetasOpen} onOpenChange={setDialogEtiquetasOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7">
                      <Plus className="h-3 w-3 mr-1" />
                      Etiqueta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar Etiqueta</DialogTitle>
                      <DialogDescription>Selecciona una etiqueta para agregar al ticket</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      {etiquetas
                        .filter((e) => !etiquetasTicket.find((et) => et.id === e.id))
                        .map((etiqueta) => (
                          <Button
                            key={etiqueta.id}
                            variant="outline"
                            className="justify-start"
                            onClick={() => agregarEtiqueta(etiqueta.id)}
                          >
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: etiqueta.color }}
                            />
                            {etiqueta.nombre}
                          </Button>
                        ))}
                      {etiquetas.filter((e) => !etiquetasTicket.find((et) => et.id === e.id)).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Todas las etiquetas ya están asignadas
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detalles principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Información del Ticket</span>
              <Dialog open={dialogEditarOpen} onOpenChange={setDialogEditarOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={abrirDialogoEditar}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Ticket</DialogTitle>
                    <DialogDescription>Modifica la información del ticket</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={editFormData.titulo}
                        onChange={(e) => setEditFormData({ ...editFormData, titulo: e.target.value })}
                        placeholder="Título del ticket"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción</Label>
                      <Textarea
                        value={editFormData.descripcion}
                        onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                        placeholder="Descripción del problema..."
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prioridad</Label>
                      <Select
                        value={editFormData.prioridad}
                        onValueChange={(value) => setEditFormData({ ...editFormData, prioridad: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">Baja</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Técnicos Asignados</Label>
                      <div className="grid grid-cols-2 gap-2 p-4 border rounded-md max-h-[200px] overflow-y-auto">
                        {tecnicos.length === 0 ? (
                          <p className="text-sm text-muted-foreground col-span-2">No hay técnicos disponibles</p>
                        ) : (
                          tecnicos.map((tecnico) => (
                            <div key={tecnico.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-tecnico-${tecnico.id}`}
                                checked={tecnicosAsignados.includes(tecnico.id)}
                                onChange={() => toggleTecnico(tecnico.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <label htmlFor={`edit-tecnico-${tecnico.id}`} className="text-sm cursor-pointer">
                                {tecnico.nombre} {tecnico.apellidos}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogEditarOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={guardarEdicion}>Guardar Cambios</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {ticket.descripcion && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Descripción
                </Label>
                <p className="text-sm leading-relaxed">{ticket.descripcion}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Cliente
                </Label>
                {ticket.clientes ? (
                  <p
                    className="font-medium text-primary cursor-pointer hover:underline"
                    onClick={() => ticket.cliente_id && navigate(`/clientes/${ticket.cliente_id}`)}
                  >
                    {ticket.clientes.nombre}
                  </p>
                ) : (
                  <p className="text-muted-foreground">Sin asignar</p>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                  Asignado a
                </Label>
                {tecnicosAsignadosInfo.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {tecnicosAsignadosInfo.map((tecnico, index) => (
                      <p key={index} className="font-medium">
                        {tecnico.nombre} {tecnico.apellidos || ""}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sin asignar</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones y Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.estado === "finalizado" && (
              <>
                <Alert className="bg-success/10 border-success mb-4">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success-foreground text-black">
                    Este ticket ha sido resuelto
                  </AlertDescription>
                </Alert>

                {ticket.solucion && (
                  <div className="p-4 bg-muted/50 rounded-lg mb-4">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                      Solución aplicada
                    </Label>
                    <p className="text-sm whitespace-pre-wrap">{ticket.solucion}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button onClick={reabrirTicket} className="w-full" size="lg" variant="outline">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Reabrir Ticket
                  </Button>

                  <Button
                    onClick={() => setDialogFirmaOpen(true)}
                    className="w-full"
                    size="lg"
                    variant={ticket.firma_cliente ? "secondary" : "default"}
                  >
                    <FileCheck className="h-5 w-5 mr-2" />
                    {ticket.firma_cliente ? "Ver Firma y Enviar" : "Firmar y Enviar"}
                  </Button>
                </div>
              </>
            )}

            {ticket.estado === "activo" && (
              <div className="space-y-3">
                <Button onClick={abrirDialogoCerrar} className="w-full" size="lg" variant="default">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Cerrar Ticket
                </Button>
                <Button onClick={() => setDialogEliminarOpen(true)} variant="destructive" className="w-full" size="lg">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Eliminar Ticket
                </Button>
              </div>
            )}

            {ticket.clientes && (
              <>
                <div className="border-t pt-4 mt-4">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">
                    Información del Cliente
                  </Label>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-base">{ticket.clientes.nombre}</p>
                      {ticket.clientes.cif && (
                        <p className="text-sm text-muted-foreground">CIF: {ticket.clientes.cif}</p>
                      )}
                    </div>

                    {ticket.clientes.telefono && (
                      <a
                        href={`tel:${ticket.clientes.telefono}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{ticket.clientes.telefono}</span>
                      </a>
                    )}

                    {ticket.clientes.email && (
                      <a
                        href={`mailto:${ticket.clientes.email}`}
                        className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <span className="text-muted-foreground">✉</span>
                        <span className="break-all">{ticket.clientes.email}</span>
                      </a>
                    )}

                    {ticket.clientes.direccion && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.clientes.direccion)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-sm hover:text-primary transition-colors"
                      >
                        <Navigation className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{ticket.clientes.direccion}</span>
                      </a>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => navigate(`/clientes/${ticket.cliente_id}`)}
                    >
                      Ver Perfil Completo
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Materiales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Materiales Utilizados</CardTitle>
            {ticket.estado === "activo" && (
              <Dialog open={dialogMaterialOpen} onOpenChange={setDialogMaterialOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          {materiales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se han agregado materiales a este ticket</p>
            </div>
          ) : (
            <div className="space-y-3">
              {materiales.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-base">{material.nombre}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {material.cantidad} {material.cantidad === 1 ? "unidad" : "unidades"} ×{" "}
                      {material.precio_unitario.toFixed(2)}€
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-lg">
                      {(material.cantidad * material.precio_unitario).toFixed(2)}€
                    </p>
                    {ticket.estado === "activo" && (
                      <Button variant="ghost" size="icon" onClick={() => eliminarMaterial(material.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Total Materiales</p>
                  <p className="text-2xl font-bold">
                    {materiales.reduce((sum, m) => sum + m.cantidad * m.precio_unitario, 0).toFixed(2)}€
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registro de Tiempo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Registro de Tiempo</CardTitle>
            </div>
            {ticket.estado === "activo" && (
              <Dialog open={dialogTiempoManualOpen} onOpenChange={setDialogTiempoManualOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Manual
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
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resumen de tiempo */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-5 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Tiempo Total del Ticket</p>
              <p className="text-3xl font-bold text-primary">
                {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}min
              </p>
            </div>
            {ticket.cliente_id && tiempoTotalCliente > 0 && (
              <div className="p-5 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Tiempo Total del Cliente</p>
                <p className="text-3xl font-bold">
                  {Math.floor(tiempoTotalCliente / 60)}h {tiempoTotalCliente % 60}min
                </p>
              </div>
            )}
          </div>

          {/* Botón temporizador */}
          {ticket.estado === "activo" && (
            <Button
              onClick={toggleTemporizador}
              className="w-full"
              size="lg"
              variant={temporizadorActivo ? "destructive" : "default"}
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
          )}

          {/* Historial */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Historial de Tiempo</h4>
            {historial.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground text-sm">No hay registros de tiempo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  let acumulado = 0;
                  return historial.map((registro) => {
                    if (registro.fin) {
                      acumulado += registro.duracion_minutos || 0;
                    }
                    return (
                      <div key={registro.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm mb-1">
                              {new Date(registro.inicio).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(registro.inicio).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {" → "}
                              {registro.fin
                                ? new Date(registro.fin).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "En progreso"}
                            </p>
                          </div>
                          <div className="text-right">
                            {registro.fin && (
                              <>
                                <Badge variant="outline" className="text-base font-semibold mb-1">
                                  {Math.floor((registro.duracion_minutos || 0) / 60)}h{" "}
                                  {(registro.duracion_minutos || 0) % 60}min
                                </Badge>
                                <p className="text-xs text-muted-foreground">
                                  Acum: {Math.floor(acumulado / 60)}h {acumulado % 60}min
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Técnico: <span className="font-medium">{registro.profiles.nombre}</span>
                        </p>
                        {registro.notas && <p className="text-sm bg-muted/50 p-2 rounded mt-2">{registro.notas}</p>}
                      </div>
                    );
                  });
                })()}
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

      {/* Diálogo de Cerrar Ticket */}
      <DialogoCerrarTicket
        open={dialogCerrarOpen}
        onOpenChange={setDialogCerrarOpen}
        ticketId={id!}
        onTicketCerrado={() => {
          loadTicket();
          loadHistorial();
        }}
      />

      {/* Diálogo de Firma */}
      {ticket && (
        <DialogoFirmaTicket
          open={dialogFirmaOpen}
          onOpenChange={setDialogFirmaOpen}
          ticket={ticket}
          cliente={ticket.clientes}
        />
      )}
    </div>
  );
};

export default DetalleTicket;
