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
import { ArrowLeft, Phone, Mail, MapPin, Plus, Edit2, Wrench, AlertTriangle, FileX, FileDown, Send, History, CheckCircle2, FileText, Calendar, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  nombre_fiscal: string | null;
  persona_contacto: string | null;
  nombre_encargado: string | null;
  telefono_encargado: string | null;
  selector_fiscal: string | null;
  informacion_destacada: string | null;
  notas_especiales: string | null;
  notas_adicionales: string | null;
  nombre_asesoria: string | null;
  telefono_asesoria: string | null;
  persona_contacto_asesoria: string | null;
  r_iva: string | null;
  epigrafe: string | null;
  activo: boolean;
  fecha_alta_cliente: string | null;
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

interface Contrato {
  id: string;
  tipo: string;
  fecha_alta: string;
  fecha_caducidad: string;
  activo: boolean;
  notas: string | null;
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
  const [contratos, setContratos] = useState<Contrato[]>([]);
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
      loadContratos();
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

  const loadContratos = async () => {
    try {
      const { data, error } = await supabase
        .from("contratos_mantenimiento")
        .select("*")
        .eq("cliente_id", id)
        .order("fecha_alta", { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
      console.error("Error cargando contratos:", error);
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
      const { error } = await supabase
        .from("clientes")
        .update(cliente)
        .eq("id", id);

      if (error) throw error;

      // Registrar actualización en auditoría
      if (id) {
        await logUpdate("clientes", id, {}, cliente);
      }

      toast.success("Cliente actualizado");
      setEditMode(false);
      loadCliente();
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

      {/* Contratos de Mantenimiento */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Contratos de Mantenimiento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {contratos.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay contratos registrados</p>
          ) : (
            <div className="space-y-3">
              {contratos.map((contrato) => {
                const fechaCaducidad = new Date(contrato.fecha_caducidad);
                const hoy = new Date();
                const diasRestantes = Math.ceil((fechaCaducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                const estaPorVencer = diasRestantes <= 30 && diasRestantes > 0;
                const estaVencido = diasRestantes <= 0;

                return (
                  <div 
                    key={contrato.id} 
                    className={`p-4 border-2 rounded-lg ${
                      estaVencido ? 'border-red-300 bg-red-50' : 
                      estaPorVencer ? 'border-orange-300 bg-orange-50' : 
                      'border-green-300 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{contrato.tipo}</p>
                        {contrato.notas && (
                          <p className="text-sm text-muted-foreground mt-1">{contrato.notas}</p>
                        )}
                      </div>
                      <Badge variant={contrato.activo ? "default" : "secondary"}>
                        {contrato.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Inicio</p>
                          <p className="font-medium">{new Date(contrato.fecha_alta).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Vencimiento</p>
                          <p className={`font-medium ${
                            estaVencido ? 'text-red-600' : 
                            estaPorVencer ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {fechaCaducidad.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {(estaPorVencer || estaVencido) && (
                      <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded ${
                        estaVencido ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {estaVencido 
                            ? `Vencido hace ${Math.abs(diasRestantes)} días` 
                            : `Vence en ${diasRestantes} días`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {editMode ? (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="empresa" className="w-full">
              <TabsList className="grid w-full grid-cols-6 text-xs">
                <TabsTrigger value="empresa">Empresa</TabsTrigger>
                <TabsTrigger value="contactos">Contactos</TabsTrigger>
                <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
                <TabsTrigger value="asesoria">Asesoría</TabsTrigger>
                <TabsTrigger value="notas">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="empresa" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Nombre de la Empresa *</Label>
                    <Input value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre Fiscal</Label>
                    <Input value={cliente.nombre_fiscal || ""} onChange={(e) => setCliente({ ...cliente, nombre_fiscal: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>CIF/NIF</Label>
                    <Input value={cliente.cif || ""} onChange={(e) => setCliente({ ...cliente, cif: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Selector Fiscal</Label>
                    <Input value={cliente.selector_fiscal || ""} onChange={(e) => setCliente({ ...cliente, selector_fiscal: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Información Destacada</Label>
                    <Input value={cliente.informacion_destacada || ""} onChange={(e) => setCliente({ ...cliente, informacion_destacada: e.target.value })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contactos" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Persona de Contacto</Label>
                    <Input value={cliente.persona_contacto || ""} onChange={(e) => setCliente({ ...cliente, persona_contacto: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={cliente.telefono || ""} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={cliente.email || ""} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nombre del Encargado</Label>
                    <Input value={cliente.nombre_encargado || ""} onChange={(e) => setCliente({ ...cliente, nombre_encargado: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono del Encargado</Label>
                    <Input value={cliente.telefono_encargado || ""} onChange={(e) => setCliente({ ...cliente, telefono_encargado: e.target.value })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ubicacion" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Dirección</Label>
                    <Input value={cliente.direccion || ""} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Código Postal</Label>
                    <Input value={cliente.codigo_postal || ""} onChange={(e) => setCliente({ ...cliente, codigo_postal: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Población</Label>
                    <Input value={cliente.poblacion || ""} onChange={(e) => setCliente({ ...cliente, poblacion: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Provincia</Label>
                    <Input value={cliente.provincia || ""} onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>R. IVA</Label>
                    <Input value={cliente.r_iva || ""} onChange={(e) => setCliente({ ...cliente, r_iva: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Epígrafe</Label>
                    <Input value={cliente.epigrafe || ""} onChange={(e) => setCliente({ ...cliente, epigrafe: e.target.value })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="asesoria" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Nombre de la Asesoría</Label>
                    <Input value={cliente.nombre_asesoria || ""} onChange={(e) => setCliente({ ...cliente, nombre_asesoria: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono de la Asesoría</Label>
                    <Input value={cliente.telefono_asesoria || ""} onChange={(e) => setCliente({ ...cliente, telefono_asesoria: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Persona de Contacto de la Asesoría</Label>
                    <Input value={cliente.persona_contacto_asesoria || ""} onChange={(e) => setCliente({ ...cliente, persona_contacto_asesoria: e.target.value })} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notas" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notas Especiales</Label>
                    <Textarea value={cliente.notas_especiales || ""} onChange={(e) => setCliente({ ...cliente, notas_especiales: e.target.value })} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas Adicionales</Label>
                    <Textarea value={cliente.notas_adicionales || ""} onChange={(e) => setCliente({ ...cliente, notas_adicionales: e.target.value })} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas / Razón Social</Label>
                    <Textarea value={cliente.notas || ""} onChange={(e) => setCliente({ ...cliente, notas: e.target.value })} rows={4} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-6">
              <Button onClick={handleUpdate} className="w-full">Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cliente.notas && (
                <div className="flex items-start gap-3 pb-3 border-b">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Razón Social</p>
                    <p className="font-medium">{cliente.notas}</p>
                  </div>
                </div>
              )}
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
              {(cliente.direccion || cliente.poblacion || cliente.provincia) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Dirección</p>
                    {cliente.direccion && <p>{cliente.direccion}</p>}
                    {(cliente.poblacion || cliente.provincia) && (
                      <p className="text-sm text-muted-foreground">
                        {[cliente.poblacion, cliente.provincia].filter(Boolean).join(", ")}
                        {cliente.codigo_postal && ` (${cliente.codigo_postal})`}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cliente.notas_especiales && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Notas Especiales</p>
                    <p className="text-sm whitespace-pre-wrap">{cliente.notas_especiales}</p>
                  </div>
                )}
                {cliente.notas_adicionales && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Notas Adicionales</p>
                    <p className="text-sm whitespace-pre-wrap">{cliente.notas_adicionales}</p>
                  </div>
                )}
                {!cliente.notas_especiales && !cliente.notas_adicionales && (
                  <p className="text-muted-foreground">Sin notas</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
