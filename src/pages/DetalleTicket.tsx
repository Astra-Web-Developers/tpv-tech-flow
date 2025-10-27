import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Play, Pause, Clock, Phone, Navigation, Calendar, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  tiempo_total_minutos: number;
  fecha_creacion: string;
  clientes: { nombre: string; telefono: string; direccion: string } | null;
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

  useEffect(() => {
    if (id) {
      loadTicket();
      loadMateriales();
      loadHistorial();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          clientes (nombre, telefono, direccion)
        `)
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
        const tecnicoIds = [...new Set(historialData.map(h => h.tecnico_id))];
        const { data: perfiles } = await supabase
          .from("profiles")
          .select("id, nombre")
          .in("id", tecnicoIds);

        const perfilesMap = new Map(perfiles?.map(p => [p.id, p]) || []);
        
        const historialConPerfiles = historialData.map(h => ({
          ...h,
          profiles: { nombre: perfilesMap.get(h.tecnico_id)?.nombre || "Desconocido" }
        }));

        setHistorial(historialConPerfiles);

        // Check if there's an active timer
        const activo = historialConPerfiles.find(h => !h.fin);
        if (activo) {
          setTemporizadorActivo(true);
          setTiempoActualId(activo.id);
        }
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
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
          .insert([{
            ticket_id: id,
            tecnico_id: userData.user.id,
            inicio: new Date().toISOString(),
          }])
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
      const { error } = await supabase
        .from("materiales")
        .insert([{
          ticket_id: id,
          ...nuevoMaterial,
        }]);

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
      const { error } = await supabase
        .from("materiales")
        .delete()
        .eq("id", materialId);

      if (error) throw error;
      toast.success("Material eliminado");
      loadMateriales();
    } catch (error: any) {
      console.error("Error eliminando material:", error);
      toast.error(error.message || "Error al eliminar material");
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    try {
      const updates: any = { estado: nuevoEstado };
      if (nuevoEstado === "finalizado") {
        updates.fecha_finalizacion = new Date().toISOString();
      }

      const { error } = await supabase
        .from("tickets")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      toast.success(`Ticket marcado como ${nuevoEstado}`);
      loadTicket();
    } catch (error: any) {
      console.error("Error cambiando estado:", error);
      toast.error(error.message || "Error al cambiar estado");
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
      case "urgente": return "destructive";
      case "alta": return "warning";
      case "media": return "default";
      case "baja": return "secondary";
      default: return "default";
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
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Descripción</Label>
              <p>{ticket.descripcion || "Sin descripción"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Cliente</Label>
              <p className="font-medium">{ticket.clientes?.nombre || "Sin cliente"}</p>
            </div>
            <div className="flex gap-2">
              {ticket.clientes?.telefono && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${ticket.clientes.telefono}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </a>
                </Button>
              )}
              {ticket.clientes?.direccion && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.clientes.direccion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Navegar
                  </a>
                </Button>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Tiempo Total</Label>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Clock className="h-5 w-5" />
                {Math.floor(ticket.tiempo_total_minutos / 60)}h {ticket.tiempo_total_minutos % 60}m
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Fecha Creación</Label>
              <p>{new Date(ticket.fecha_creacion).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Control de Tiempo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {ticket.estado === "activo" && (
              <div className="space-y-2">
                <Label>Cambiar Estado</Label>
                <Select onValueChange={cambiarEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="finalizado">Finalizar Ticket</SelectItem>
                    <SelectItem value="eliminado">Eliminar Ticket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
                        onChange={(e) => setNuevoMaterial({ ...nuevoMaterial, precio_unitario: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button onClick={agregarMaterial} className="w-full">Agregar</Button>
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
                      Cantidad: {material.cantidad} × {material.precio_unitario}€ = {(material.cantidad * material.precio_unitario).toFixed(2)}€
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => eliminarMaterial(material.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-right font-bold">
                  Total: {materiales.reduce((sum, m) => sum + (m.cantidad * m.precio_unitario), 0).toFixed(2)}€
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          {historial.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay registros de tiempo</p>
          ) : (
            <div className="space-y-2">
              {historial.map((registro) => (
                <div key={registro.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{registro.profiles.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Inicio: {new Date(registro.inicio).toLocaleString()}
                    </p>
                    {registro.fin && (
                      <p className="text-sm text-muted-foreground">
                        Fin: {new Date(registro.fin).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {registro.fin ? (
                      <Badge variant="secondary">
                        {Math.floor((registro.duracion_minutos || 0) / 60)}h {(registro.duracion_minutos || 0) % 60}m
                      </Badge>
                    ) : (
                      <Badge variant="default">En progreso</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalleTicket;
