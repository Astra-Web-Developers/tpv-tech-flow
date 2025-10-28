import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Phone, Mail, MapPin, Plus, Edit2, Wrench, AlertTriangle, FileX, FileDown, Send, History, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { logView, logUpdate, logCreate, logExport } from "@/lib/auditLog";

interface Cliente {
  id: string;
  nombre: string;
  cif: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  poblacion: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  notas: string | null;
}

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  fecha_instalacion: string | null;
}

interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  estado: string;
  fecha_creacion: string;
}

const DetalleCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [dialogEquipoOpen, setDialogEquipoOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [ticketsAbiertos, setTicketsAbiertos] = useState<Ticket[]>([]);
  const [historialCompleto, setHistorialCompleto] = useState<Ticket[]>([]);
  const [nuevoEquipo, setNuevoEquipo] = useState({
    tipo: "",
    marca: "",
    modelo: "",
    numero_serie: "",
  });

  useEffect(() => {
    if (id) {
      loadCliente();
      loadEquipos();
      loadTickets();
    }
  }, [id]);

  const loadCliente = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCliente(data);

      // Registrar visualización del cliente
      if (id) {
        await logView("clientes", id);
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
      toast.error("Error al cargar cliente");
    } finally {
      setLoading(false);
    }
  };

  const loadEquipos = async () => {
    try {
      const { data, error } = await supabase
        .from("equipos")
        .select("*")
        .eq("cliente_id", id)
        .eq("activo", true)
        .order("fecha_instalacion", { ascending: false });

      if (error) throw error;
      setEquipos(data || []);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    }
  };

  const loadTickets = async () => {
    try {
      // Cargar tickets abiertos
      const { data: abiertos, error: errorAbiertos } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", id)
        .eq("estado", "activo")
        .order("fecha_creacion", { ascending: false });

      if (errorAbiertos) throw errorAbiertos;
      setTicketsAbiertos(abiertos || []);

      // Cargar historial completo
      const { data: completo, error: errorCompleto } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", id)
        .order("fecha_creacion", { ascending: false });

      if (errorCompleto) throw errorCompleto;
      setHistorialCompleto(completo || []);

      // Cargar tickets recientes para la sección existente
      const { data, error } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", id)
        .order("fecha_creacion", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    }
  };

  const exportarHistorial = async () => {
    const csv = [
      ["Número", "Título", "Estado", "Fecha Creación"],
      ...historialCompleto.map(t => [
        t.numero,
        t.titulo,
        t.estado,
        new Date(t.fecha_creacion).toLocaleDateString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-tickets-${cliente?.nombre || 'cliente'}.csv`;
    a.click();

    // Registrar exportación en auditoría
    if (id) {
      await logExport("tickets", `Exportación de historial completo de tickets del cliente ${cliente?.nombre}`);
    }

    toast.success("Historial exportado");
  };

  const enviarHistorialEmail = async () => {
    // Aquí implementarías el envío por email
    toast.info("Función de envío por email próximamente");
  };

  const handleUpdate = async () => {
    if (!cliente) return;

    try {
      const updateData = {
        nombre: cliente.nombre,
        cif: cliente.cif,
        telefono: cliente.telefono,
        email: cliente.email,
        direccion: cliente.direccion,
        poblacion: cliente.poblacion,
        provincia: cliente.provincia,
        codigo_postal: cliente.codigo_postal,
        notas: cliente.notas,
      };

      const { error } = await supabase
        .from("clientes")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Registrar actualización en auditoría
      if (id) {
        await logUpdate("clientes", id, {}, updateData);
      }

      toast.success("Cliente actualizado");
      setEditMode(false);
    } catch (error: any) {
      console.error("Error actualizando cliente:", error);
      toast.error(error.message || "Error al actualizar cliente");
    }
  };

  const agregarEquipo = async () => {
    try {
      const { error } = await supabase
        .from("equipos")
        .insert([{
          cliente_id: id,
          ...nuevoEquipo,
          fecha_instalacion: new Date().toISOString(),
        }]);

      if (error) throw error;

      toast.success("Equipo agregado");
      setNuevoEquipo({ tipo: "", marca: "", modelo: "", numero_serie: "" });
      setDialogEquipoOpen(false);
      loadEquipos();
    } catch (error: any) {
      console.error("Error agregando equipo:", error);
      toast.error(error.message || "Error al agregar equipo");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Cliente no encontrado</p>
        <Button onClick={() => navigate("/clientes")}>Volver a Clientes</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/clientes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
            {cliente.cif && <p className="text-muted-foreground">CIF: {cliente.cif}</p>}
          </div>
        </div>
        <Button onClick={() => setEditMode(!editMode)} variant={editMode ? "default" : "outline"}>
          <Edit2 className="h-4 w-4 mr-2" />
          {editMode ? "Guardar" : "Editar"}
        </Button>
      </div>

      {/* Alertas Visuales */}
      <div className="flex gap-3">
        {/* Alerta Moroso - Descomentar y conectar con campo de BD */}
        {/* {cliente.es_moroso && (
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-3 rounded-lg border-2 border-red-300 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            CLIENTE MOROSO
          </div>
        )} */}
        {/* Alerta Sin Contrato */}
        {/* {!cliente.tiene_contrato && (
          <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-3 rounded-lg border-2 border-orange-300 font-semibold">
            <FileX className="h-5 w-5" />
            SIN CONTRATO DE MANTENIMIENTO
          </div>
        )} */}
      </div>

      {/* Tickets Abiertos - Prominente */}
      {ticketsAbiertos.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-blue-900">
                  Tickets Abiertos ({ticketsAbiertos.length})
                </CardTitle>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/tickets/nuevo?cliente=${id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ticket
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ticketsAbiertos.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-white border-2 border-blue-300 rounded-lg hover:shadow-md cursor-pointer transition-all"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">#{ticket.numero} - {ticket.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      Creado: {new Date(ticket.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-blue-600">ACTIVO</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CIF</Label>
                  <Input
                    value={cliente.cif || ""}
                    onChange={(e) => setCliente({ ...cliente, cif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={cliente.telefono || ""}
                    onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={cliente.email || ""}
                    onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                  />
                </div>
                <Button onClick={handleUpdate} className="w-full">Guardar Cambios</Button>
              </>
            ) : (
              <>
                {cliente.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${cliente.telefono}`} className="hover:text-primary">
                      {cliente.telefono}
                    </a>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <a href={`mailto:${cliente.email}`} className="hover:text-primary">
                      {cliente.email}
                    </a>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{cliente.direccion}</p>
                      {(cliente.codigo_postal || cliente.poblacion || cliente.provincia) && (
                        <p className="text-sm text-muted-foreground">
                          {cliente.codigo_postal} {cliente.poblacion} {cliente.provincia}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <Textarea
                value={cliente.notas || ""}
                onChange={(e) => setCliente({ ...cliente, notas: e.target.value })}
                rows={8}
                placeholder="Notas sobre el cliente..."
              />
            ) : (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {cliente.notas || "Sin notas"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Equipos</CardTitle>
            <Dialog open={dialogEquipoOpen} onOpenChange={setDialogEquipoOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Equipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Equipo</DialogTitle>
                  <DialogDescription>Registra un nuevo equipo del cliente</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Equipo</Label>
                    <Input
                      value={nuevoEquipo.tipo}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, tipo: e.target.value })}
                      placeholder="Ej: TPV, Cash Guard, Balanza"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Marca</Label>
                      <Input
                        value={nuevoEquipo.marca}
                        onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, marca: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Modelo</Label>
                      <Input
                        value={nuevoEquipo.modelo}
                        onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, modelo: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Serie</Label>
                    <Input
                      value={nuevoEquipo.numero_serie}
                      onChange={(e) => setNuevoEquipo({ ...nuevoEquipo, numero_serie: e.target.value })}
                    />
                  </div>
                  <Button onClick={agregarEquipo} className="w-full">Agregar Equipo</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {equipos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay equipos registrados</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {equipos.map((equipo) => (
                <div key={equipo.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{equipo.tipo}</p>
                      {(equipo.marca || equipo.modelo) && (
                        <p className="text-sm text-muted-foreground">
                          {equipo.marca} {equipo.modelo}
                        </p>
                      )}
                      {equipo.numero_serie && (
                        <p className="text-xs text-muted-foreground mt-1">
                          S/N: {equipo.numero_serie}
                        </p>
                      )}
                      {equipo.fecha_instalacion && (
                        <p className="text-xs text-muted-foreground">
                          Instalado: {new Date(equipo.fecha_instalacion).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial Completo de Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <CardTitle>Historial Completo de Tickets</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={exportarHistorial}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button size="sm" variant="outline" onClick={enviarHistorialEmail}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historialCompleto.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay tickets registrados</p>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(showAllTickets ? historialCompleto : historialCompleto.slice(0, 10)).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">#{ticket.numero} - {ticket.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ticket.fecha_creacion).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.estado === "activo" ? (
                        <Badge variant="default">Activo</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Finalizado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {historialCompleto.length > 10 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllTickets(!showAllTickets)}
                  >
                    {showAllTickets ? "Mostrar menos" : `Mostrar todos (${historialCompleto.length})`}
                  </Button>
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{ticketsAbiertos.length}</p>
                    <p className="text-sm text-muted-foreground">Abiertos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {historialCompleto.filter(t => t.estado === "finalizado").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Finalizados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{historialCompleto.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DetalleCliente;
