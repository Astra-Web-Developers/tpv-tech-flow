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
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit2,
  Wrench,
  AlertTriangle,
  FileX,
  FileDown,
  Send,
  History,
  CheckCircle2,
  FileText,
  Calendar,
  Building2,
  Upload,
  X,
  Users,
  Globe,
  Receipt,
  Briefcase,
  FileType,
  StickyNote,
  ScrollText,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logView, logUpdate, logCreate, logExport } from "@/lib/auditLog";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  logo_url: string | null;
  tiene_contrato_mantenimiento: boolean;
  tipo_contrato: string | null;
  fecha_alta_contrato: string | null;
  fecha_caducidad_contrato: string | null;
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
      const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single();

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
      ...historialCompleto.map((t) => [t.numero, t.titulo, t.estado, new Date(t.fecha_creacion).toLocaleDateString()]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-tickets-${cliente?.nombre || "cliente"}.csv`;
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

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo no puede superar los 5MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    if (cliente) {
      setCliente({ ...cliente, logo_url: "" });
    }
  };

  const uploadLogoToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("client-logos").upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading logo:", uploadError);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("client-logos").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadLogoToSupabase:", error);
      return null;
    }
  };

  const handleUpdate = async () => {
    if (!cliente) return;
    setUploadingLogo(true);

    try {
      let logoUrl = cliente.logo_url;

      // Si hay un archivo de logo, subirlo primero
      if (logoFile) {
        const uploadedUrl = await uploadLogoToSupabase(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          toast.error("Error al subir el logo, pero continuaremos sin él");
        }
      }

      const updatedCliente = {
        ...cliente,
        logo_url: logoUrl,
      };

      const { error } = await supabase.from("clientes").update(updatedCliente).eq("id", id);

      if (error) throw error;

      // Registrar actualización en auditoría
      if (id) {
        await logUpdate("clientes", id, {}, updatedCliente);
      }

      toast.success("Cliente actualizado");
      setEditMode(false);
      setLogoFile(null);
      setLogoPreview("");
      loadCliente();
    } catch (error: any) {
      console.error("Error actualizando cliente:", error);
      toast.error(error.message || "Error al actualizar cliente");
    } finally {
      setUploadingLogo(false);
    }
  };

  const agregarEquipo = async () => {
    try {
      const { error } = await supabase.from("equipos").insert([
        {
          cliente_id: id,
          ...nuevoEquipo,
          fecha_instalacion: new Date().toISOString(),
        },
      ]);

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

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;

      toast.success("Cliente eliminado correctamente");
      navigate("/clientes");
    } catch (error: any) {
      console.error("Error eliminando cliente:", error);
      toast.error(error.message || "Error al eliminar cliente");
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
          {cliente.logo_url && (
            <div className="w-16 h-16 rounded-lg border-2 border-border overflow-hidden flex items-center justify-center bg-background">
              <img
                src={cliente.logo_url}
                alt={`Logo ${cliente.nombre}`}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{cliente.nombre}</h1>
            {cliente.cif && <p className="text-muted-foreground">CIF: {cliente.cif}</p>}
          </div>
        </div>
        {editMode ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditMode(false);
                setLogoFile(null);
                setLogoPreview("");
                loadCliente();
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={uploadingLogo}>
              {uploadingLogo ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate(`/tickets/nuevo?cliente=${id}`)}
              className="bg-primary hover:bg-primary/90 shadow-md"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Ticket
            </Button>
            <Button onClick={() => setEditMode(true)} variant="outline" className="border-2 hover:bg-accent" size="lg">
              <Edit2 className="h-5 w-5 mr-2" />
              Editar
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-md"
              size="icon"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        )}
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
                <CardTitle className="text-blue-900">Tickets Abiertos ({ticketsAbiertos.length})</CardTitle>
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
                    <p className="font-semibold text-blue-900">
                      #{ticket.numero} - {ticket.titulo}
                    </p>
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
                      estaVencido
                        ? "border-red-300 bg-red-50"
                        : estaPorVencer
                          ? "border-orange-300 bg-orange-50"
                          : "border-green-300 bg-green-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{contrato.tipo}</p>
                        {contrato.notas && <p className="text-sm text-muted-foreground mt-1">{contrato.notas}</p>}
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
                          <p
                            className={`font-medium ${
                              estaVencido ? "text-red-600" : estaPorVencer ? "text-orange-600" : "text-green-600"
                            }`}
                          >
                            {fechaCaducidad.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {(estaPorVencer || estaVencido) && (
                      <div
                        className={`mt-3 flex items-center gap-2 px-3 py-2 rounded ${
                          estaVencido ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {estaVencido
                            ? `Vencido hace ${Math.abs(diasRestantes)} días`
                            : `Vence en ${diasRestantes} días`}
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
              <TabsList className="grid w-full grid-cols-9 gap-1">
                <TabsTrigger value="empresa" className="flex flex-col gap-1 py-3">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">Empresa</span>
                </TabsTrigger>
                <TabsTrigger value="contactos" className="flex flex-col gap-1 py-3">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Contactos</span>
                </TabsTrigger>
                <TabsTrigger value="ubicacion" className="flex flex-col gap-1 py-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs">Ubicación</span>
                </TabsTrigger>
                <TabsTrigger value="fiscal" className="flex flex-col gap-1 py-3">
                  <Receipt className="h-4 w-4" />
                  <span className="text-xs">Fiscal</span>
                </TabsTrigger>
                <TabsTrigger value="asesoria" className="flex flex-col gap-1 py-3">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Asesoría</span>
                </TabsTrigger>
                <TabsTrigger value="equipos" className="flex flex-col gap-1 py-3">
                  <Wrench className="h-4 w-4" />
                  <span className="text-xs">Equipos</span>
                </TabsTrigger>
                <TabsTrigger value="archivos" className="flex flex-col gap-1 py-3">
                  <FileType className="h-4 w-4" />
                  <span className="text-xs">Archivos</span>
                </TabsTrigger>
                <TabsTrigger value="notas" className="flex flex-col gap-1 py-3">
                  <StickyNote className="h-4 w-4" />
                  <span className="text-xs">Notas</span>
                </TabsTrigger>
                <TabsTrigger value="contrato" className="flex flex-col gap-1 py-3">
                  <ScrollText className="h-4 w-4" />
                  <span className="text-xs">Contrato</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="empresa" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estado Card */}
                  <Card className="border-2 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Estado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="activo"
                          checked={cliente.activo}
                          onCheckedChange={(checked) => setCliente({ ...cliente, activo: checked as boolean })}
                        />
                        <Label htmlFor="activo" className="cursor-pointer font-medium text-lg">
                          {cliente.activo ? "Activo" : "Inactivo"}
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Logo Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Logo de la Empresa
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
                          <TabsTrigger value="url">URL</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="space-y-3 mt-4">
                          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
                            {logoPreview || cliente.logo_url ? (
                              <div className="relative w-full">
                                <img
                                  src={logoPreview || cliente.logo_url || ""}
                                  alt="Vista previa"
                                  className="max-h-32 mx-auto object-contain rounded"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2"
                                  onClick={clearLogo}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                {logoFile && (
                                  <p className="text-xs text-center text-muted-foreground mt-2">{logoFile.name}</p>
                                )}
                              </div>
                            ) : (
                              <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">Click para seleccionar</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG hasta 5MB</p>
                              </label>
                            )}
                            <Input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoFileChange}
                            />
                          </div>
                        </TabsContent>

                        <TabsContent value="url" className="space-y-3 mt-4">
                          <Input
                            type="url"
                            placeholder="https://ejemplo.com/logo.png"
                            value={cliente.logo_url || ""}
                            onChange={(e) => setCliente({ ...cliente, logo_url: e.target.value })}
                          />
                          {cliente.logo_url && (
                            <div className="relative border-2 border-dashed rounded-lg p-4">
                              <img
                                src={cliente.logo_url}
                                alt="Logo preview"
                                className="max-h-32 mx-auto object-contain rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {/* Datos Básicos Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Datos Básicos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nombre de la Empresa *</Label>
                        <Input
                          value={cliente.nombre}
                          onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                          required
                          className="font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre Fiscal</Label>
                        <Input
                          value={cliente.nombre_fiscal || ""}
                          onChange={(e) => setCliente({ ...cliente, nombre_fiscal: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CIF/NIF</Label>
                        <Input
                          value={cliente.cif || ""}
                          onChange={(e) => setCliente({ ...cliente, cif: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fechas Card */}
                  <Card className="border-2 md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fechas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="fecha_alta_cliente">Fecha de Alta del Cliente</Label>
                        <Input
                          id="fecha_alta_cliente"
                          type="date"
                          value={cliente.fecha_alta_cliente || ""}
                          onChange={(e) => setCliente({ ...cliente, fecha_alta_cliente: e.target.value })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contactos" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contacto Principal Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Contacto Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Persona de Contacto</Label>
                        <Input
                          value={cliente.persona_contacto || ""}
                          onChange={(e) => setCliente({ ...cliente, persona_contacto: e.target.value })}
                          placeholder="Nombre del contacto"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          Teléfono
                        </Label>
                        <Input
                          value={cliente.telefono || ""}
                          onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                          placeholder="+34 123 456 789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={cliente.email || ""}
                          onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                          placeholder="contacto@empresa.com"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Encargado Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Encargado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nombre del Encargado</Label>
                        <Input
                          value={cliente.nombre_encargado || ""}
                          onChange={(e) => setCliente({ ...cliente, nombre_encargado: e.target.value })}
                          placeholder="Nombre del encargado"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          Teléfono del Encargado
                        </Label>
                        <Input
                          value={cliente.telefono_encargado || ""}
                          onChange={(e) => setCliente({ ...cliente, telefono_encargado: e.target.value })}
                          placeholder="+34 123 456 789"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ubicacion" className="space-y-6 mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dirección Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Dirección</Label>
                        <Input
                          value={cliente.direccion || ""}
                          onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                          placeholder="Calle, número, piso..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Código Postal</Label>
                        <Input
                          value={cliente.codigo_postal || ""}
                          onChange={(e) => setCliente({ ...cliente, codigo_postal: e.target.value })}
                          placeholder="00000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Población</Label>
                        <Input
                          value={cliente.poblacion || ""}
                          onChange={(e) => setCliente({ ...cliente, poblacion: e.target.value })}
                          placeholder="Población"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Provincia</Label>
                        <Input
                          value={cliente.provincia || ""}
                          onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })}
                          placeholder="Provincia"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-6 mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Información Fiscal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Selector Fiscal</Label>
                        <Select
                          value={cliente.selector_fiscal || ""}
                          onValueChange={(value) => setCliente({ ...cliente, selector_fiscal: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nada">Nada</SelectItem>
                            <SelectItem value="ticketbai">TicketBAI</SelectItem>
                            <SelectItem value="verifactu">VeriFactu</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>R. IVA</Label>
                        <Input
                          value={cliente.r_iva || ""}
                          onChange={(e) => setCliente({ ...cliente, r_iva: e.target.value })}
                          placeholder="R. IVA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Epígrafe</Label>
                        <Input
                          value={cliente.epigrafe || ""}
                          onChange={(e) => setCliente({ ...cliente, epigrafe: e.target.value })}
                          placeholder="Epígrafe"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="asesoria" className="space-y-6 mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Información de la Asesoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Nombre de la Asesoría</Label>
                        <Input
                          value={cliente.nombre_asesoria || ""}
                          onChange={(e) => setCliente({ ...cliente, nombre_asesoria: e.target.value })}
                          placeholder="Nombre de la asesoría"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          Teléfono Asesoría
                        </Label>
                        <Input
                          value={cliente.telefono_asesoria || ""}
                          onChange={(e) => setCliente({ ...cliente, telefono_asesoria: e.target.value })}
                          placeholder="+34 123 456 789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Persona de Contacto</Label>
                        <Input
                          value={cliente.persona_contacto_asesoria || ""}
                          onChange={(e) => setCliente({ ...cliente, persona_contacto_asesoria: e.target.value })}
                          placeholder="Nombre del contacto"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipos" className="space-y-6 mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Equipos del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Los equipos se pueden gestionar desde la sección de equipos en la vista de solo lectura.
                      </p>
                      <p className="text-xs text-muted-foreground">Sal del modo edición para gestionar equipos</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="archivos" className="space-y-6 mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileType className="h-4 w-4" />
                      Archivos PDF
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <FileType className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Los archivos PDF se pueden gestionar desde la sección de documentos en la vista de solo lectura.
                      </p>
                      <p className="text-xs text-muted-foreground">Sal del modo edición para gestionar documentos</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notas" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Información Destacada Card */}
                  <Card className="border-2 border-primary/30 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        Información Destacada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={cliente.informacion_destacada || ""}
                        onChange={(e) => setCliente({ ...cliente, informacion_destacada: e.target.value })}
                        rows={3}
                        placeholder="Información importante o destacada del cliente..."
                        className="bg-background"
                      />
                    </CardContent>
                  </Card>

                  {/* Notas Especiales Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <StickyNote className="h-4 w-4" />
                        Notas Especiales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={cliente.notas_especiales || ""}
                        onChange={(e) => setCliente({ ...cliente, notas_especiales: e.target.value })}
                        rows={3}
                        placeholder="Notas especiales sobre el cliente..."
                      />
                    </CardContent>
                  </Card>

                  {/* Notas Adicionales Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Notas Adicionales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={cliente.notas_adicionales || ""}
                        onChange={(e) => setCliente({ ...cliente, notas_adicionales: e.target.value })}
                        rows={3}
                        placeholder="Otras notas sobre el cliente..."
                      />
                    </CardContent>
                  </Card>

                  {/* Notas Generales Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ScrollText className="h-4 w-4" />
                        Notas Generales
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={cliente.notas || ""}
                        onChange={(e) => setCliente({ ...cliente, notas: e.target.value })}
                        rows={4}
                        placeholder="Notas generales del cliente..."
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contrato" className="space-y-6 mt-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ScrollText className="h-4 w-4" />
                      Contrato de Mantenimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <Checkbox
                        id="tiene_contrato_mantenimiento"
                        checked={cliente.tiene_contrato_mantenimiento}
                        onCheckedChange={(checked) =>
                          setCliente({ ...cliente, tiene_contrato_mantenimiento: checked as boolean })
                        }
                      />
                      <Label htmlFor="tiene_contrato_mantenimiento" className="cursor-pointer font-medium">
                        Tiene Contrato de Mantenimiento
                      </Label>
                    </div>

                    {cliente.tiene_contrato_mantenimiento && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-2 border-primary/20 rounded-lg bg-primary/5">
                        <div className="space-y-2">
                          <Label>Tipo de Contrato</Label>
                          <Select
                            value={cliente.tipo_contrato || ""}
                            onValueChange={(value) => setCliente({ ...cliente, tipo_contrato: value })}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trimestral">Trimestral</SelectItem>
                              <SelectItem value="semestral">Semestral</SelectItem>
                              <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Fecha de Alta
                          </Label>
                          <Input
                            type="date"
                            value={cliente.fecha_alta_contrato || ""}
                            onChange={(e) => setCliente({ ...cliente, fecha_alta_contrato: e.target.value })}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            Fecha de Caducidad
                          </Label>
                          <Input
                            type="date"
                            value={cliente.fecha_caducidad_contrato || ""}
                            onChange={(e) => setCliente({ ...cliente, fecha_caducidad_contrato: e.target.value })}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="empresa" className="w-full">
              <TabsList className="grid w-full grid-cols-9 text-xs">
                <TabsTrigger value="empresa">Empresa</TabsTrigger>
                <TabsTrigger value="contactos">Contactos</TabsTrigger>
                <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
                <TabsTrigger value="asesoria">Asesoría</TabsTrigger>
                <TabsTrigger value="equipos">Equipos</TabsTrigger>
                <TabsTrigger value="archivos">Archivos</TabsTrigger>
                <TabsTrigger value="notas">Notas</TabsTrigger>
                <TabsTrigger value="contrato">Contrato</TabsTrigger>
              </TabsList>

              <TabsContent value="empresa" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos de la Empresa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {cliente.logo_url && (
                      <div className="col-span-2 flex justify-center">
                        <img
                          src={cliente.logo_url}
                          alt={`Logo ${cliente.nombre}`}
                          className="max-h-32 object-contain rounded border p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Nombre de la Empresa</Label>
                      <p className="font-medium">{cliente.nombre}</p>
                    </div>
                    {cliente.nombre_fiscal && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Nombre Fiscal</Label>
                        <p className="font-medium">{cliente.nombre_fiscal}</p>
                      </div>
                    )}
                    {cliente.cif && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">CIF/NIF</Label>
                        <p className="font-medium">{cliente.cif}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Estado</Label>
                      <Badge variant={cliente.activo ? "default" : "secondary"}>
                        {cliente.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    {cliente.fecha_alta_cliente && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-muted-foreground">Fecha de Alta del Cliente</Label>
                        <p className="font-medium">{new Date(cliente.fecha_alta_cliente).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contactos" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personas de Contacto</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {cliente.persona_contacto && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-muted-foreground">Persona de Contacto</Label>
                        <p className="font-medium">{cliente.persona_contacto}</p>
                      </div>
                    )}
                    {cliente.telefono && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Teléfono</Label>
                        <a href={`tel:${cliente.telefono}`} className="font-medium hover:text-primary">
                          {cliente.telefono}
                        </a>
                      </div>
                    )}
                    {cliente.email && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Email</Label>
                        <a href={`mailto:${cliente.email}`} className="font-medium hover:text-primary">
                          {cliente.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {(cliente.nombre_encargado || cliente.telefono_encargado) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Encargado</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {cliente.nombre_encargado && (
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Nombre del Encargado</Label>
                          <p className="font-medium">{cliente.nombre_encargado}</p>
                        </div>
                      )}
                      {cliente.telefono_encargado && (
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Teléfono del Encargado</Label>
                          <a href={`tel:${cliente.telefono_encargado}`} className="font-medium hover:text-primary">
                            {cliente.telefono_encargado}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ubicacion" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dirección</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {cliente.direccion && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-muted-foreground">Dirección</Label>
                        <p className="font-medium">{cliente.direccion}</p>
                      </div>
                    )}
                    {cliente.codigo_postal && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Código Postal</Label>
                        <p className="font-medium">{cliente.codigo_postal}</p>
                      </div>
                    )}
                    {cliente.poblacion && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Población</Label>
                        <p className="font-medium">{cliente.poblacion}</p>
                      </div>
                    )}
                    {cliente.provincia && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-muted-foreground">Provincia</Label>
                        <p className="font-medium">{cliente.provincia}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información Fiscal</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {cliente.selector_fiscal && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Selector Fiscal</Label>
                        <p className="font-medium capitalize">{cliente.selector_fiscal}</p>
                      </div>
                    )}
                    {cliente.r_iva && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">R. IVA</Label>
                        <p className="font-medium">{cliente.r_iva}</p>
                      </div>
                    )}
                    {cliente.epigrafe && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Epígrafe</Label>
                        <p className="font-medium">{cliente.epigrafe}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="asesoria" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información de la Asesoría</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {cliente.nombre_asesoria && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-muted-foreground">Nombre de la Asesoría</Label>
                        <p className="font-medium">{cliente.nombre_asesoria}</p>
                      </div>
                    )}
                    {cliente.telefono_asesoria && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Teléfono Asesoría</Label>
                        <a href={`tel:${cliente.telefono_asesoria}`} className="font-medium hover:text-primary">
                          {cliente.telefono_asesoria}
                        </a>
                      </div>
                    )}
                    {cliente.persona_contacto_asesoria && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Persona de Contacto</Label>
                        <p className="font-medium">{cliente.persona_contacto_asesoria}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="equipos" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Equipos del Cliente</h3>
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
                          <Button onClick={agregarEquipo} className="w-full">
                            Agregar Equipo
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {equipos.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No hay equipos registrados</p>
                  ) : (
                    <div className="space-y-3">
                      {equipos.map((equipo) => (
                        <div key={equipo.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{equipo.tipo}</p>
                              {equipo.marca && <p className="text-sm text-muted-foreground">Marca: {equipo.marca}</p>}
                              {equipo.modelo && (
                                <p className="text-sm text-muted-foreground">Modelo: {equipo.modelo}</p>
                              )}
                              {equipo.numero_serie && (
                                <p className="text-sm text-muted-foreground">S/N: {equipo.numero_serie}</p>
                              )}
                              {equipo.fecha_instalacion && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Instalado: {new Date(equipo.fecha_instalacion).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="archivos" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Archivos PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Funcionalidad de gestión de documentos disponible próximamente.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="notas" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notas e Información</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {cliente.notas && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Razón Social / Notas</Label>
                        <p className="font-medium whitespace-pre-wrap">{cliente.notas}</p>
                      </div>
                    )}
                    {cliente.informacion_destacada && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Información Destacada</Label>
                        <p className="font-medium whitespace-pre-wrap">{cliente.informacion_destacada}</p>
                      </div>
                    )}
                    {cliente.notas_especiales && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Notas Especiales</Label>
                        <p className="font-medium whitespace-pre-wrap">{cliente.notas_especiales}</p>
                      </div>
                    )}
                    {cliente.notas_adicionales && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Notas Adicionales</Label>
                        <p className="font-medium whitespace-pre-wrap">{cliente.notas_adicionales}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contrato" className="space-y-6 mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contrato de Mantenimiento</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant={cliente.tiene_contrato_mantenimiento ? "default" : "secondary"}>
                        {cliente.tiene_contrato_mantenimiento ? "Tiene Contrato" : "Sin Contrato"}
                      </Badge>
                    </div>

                    {cliente.tiene_contrato_mantenimiento &&
                      (() => {
                        const fechaCaducidad = cliente.fecha_caducidad_contrato
                          ? new Date(cliente.fecha_caducidad_contrato)
                          : null;
                        const hoy = new Date();
                        const estaExpirado = fechaCaducidad ? fechaCaducidad < hoy : false;

                        return (
                          <div
                            className={`grid grid-cols-3 gap-4 p-4 border rounded-lg ${estaExpirado ? "border-red-300 bg-red-50" : ""}`}
                          >
                            {cliente.tipo_contrato && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Tipo de Contrato</Label>
                                <p className={`font-medium capitalize ${estaExpirado ? "text-red-600" : ""}`}>
                                  {cliente.tipo_contrato}
                                </p>
                              </div>
                            )}
                            {cliente.fecha_alta_contrato && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Fecha de Alta</Label>
                                <p className="font-medium">
                                  {new Date(cliente.fecha_alta_contrato).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {cliente.fecha_caducidad_contrato && (
                              <div className="space-y-1">
                                <Label className="text-muted-foreground">Fecha de Caducidad</Label>
                                <p className={`font-medium ${estaExpirado ? "text-red-600" : ""}`}>
                                  {new Date(cliente.fecha_caducidad_contrato).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                            {estaExpirado && (
                              <div className="col-span-3 flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm font-medium">Contrato expirado</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

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
                      <p className="font-medium">
                        #{ticket.numero} - {ticket.titulo}
                      </p>
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
                  <Button variant="outline" onClick={() => setShowAllTickets(!showAllTickets)}>
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
                      {historialCompleto.filter((t) => t.estado === "finalizado").length}
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
