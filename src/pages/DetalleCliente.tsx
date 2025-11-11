import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit2, CheckCircle2, Trash2, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logView, logUpdate } from "@/lib/auditLog";
import { ClienteInfoTabs } from "@/components/cliente/ClienteInfoTabs";
import { EquiposSection } from "@/components/cliente/EquiposSection";
import { ContratosSection } from "@/components/cliente/ContratosSection";
import { ClienteAlerts } from "@/components/cliente/ClienteAlerts";
import { DialogInactivacion } from "@/components/cliente/DialogInactivacion";
import { TicketsHistorial } from "@/components/cliente/TicketsHistorial";
import { Building2, Users, MapPin, Receipt, Briefcase, Wrench, FileType, StickyNote, ScrollText, FileText, Calendar, Phone, Mail, ExternalLink, AlertTriangle } from "lucide-react";

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
  motivo_inactivacion: string | null;
  aviso_moroso: boolean;
  aviso_cobrar_antes: string | null;
}

interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  numero_serie_bdp: string | null;
  numero_serie_wind: string | null;
  numero_serie_store_manager: string | null;
  numero_serie_cashlogy: string | null;
  numero_serie_impresora: string | null;
  contraseñas: string | null;
  tpv: string | null;
  wind: string | null;
  ram: string | null;
  impresora: string | null;
  software: string | null;
  v: string | null;
  tbai: string | null;
  c_inteligente: string | null;
  instalacion: string | null;
  pendrive_c_seg: string | null;
  garantia_inicio: string | null;
  garantia_fin: string | null;
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
    numero_serie_bdp: "",
    numero_serie_wind: "",
    numero_serie_store_manager: "",
    numero_serie_cashlogy: "",
    numero_serie_impresora: "",
    contraseñas: "",
    tpv: "",
    wind: "",
    ram: "",
    impresora: "",
    software: "",
    v: "",
    tbai: "",
    c_inteligente: "",
    instalacion: "",
    pendrive_c_seg: "",
    garantia_inicio: "",
    garantia_fin: "",
  });
  const [equipoConfigs, setEquipoConfigs] = useState<Record<string, string[]>>({});
  const [dialogInactivacionOpen, setDialogInactivacionOpen] = useState(false);
  const [motivoInactivacion, setMotivoInactivacion] = useState("");
  const [dialogContratoOpen, setDialogContratoOpen] = useState(false);
  const [contratoEditando, setContratoEditando] = useState<Contrato | null>(null);
  const [nuevoContrato, setNuevoContrato] = useState({
    tipo: "",
    fecha_alta: "",
    fecha_caducidad: "",
    notas: "",
  });

  useEffect(() => {
    if (id) {
      loadCliente();
      loadEquipos();
      loadTickets();
      loadContratos();
      loadEquipoConfigs();
    }
  }, [id]);

  useEffect(() => {
    if (contratos.length > 0 && editMode) {
      const contratoActivo = contratos.find(c => c.activo) || contratos[0];
      if (contratoActivo && cliente) {
        setCliente({
          ...cliente,
          tiene_contrato_mantenimiento: true,
          tipo_contrato: contratoActivo.tipo,
          fecha_alta_contrato: contratoActivo.fecha_alta,
          fecha_caducidad_contrato: contratoActivo.fecha_caducidad,
        });
      }
    }
  }, [contratos, editMode]);

  const loadCliente = async () => {
    try {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single();

      if (error) throw error;
      setCliente(data);

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
      const { data: abiertos, error: errorAbiertos } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", id)
        .eq("estado", "activo")
        .order("fecha_creacion", { ascending: false });

      if (errorAbiertos) throw errorAbiertos;
      setTicketsAbiertos(abiertos || []);

      const { data: completo, error: errorCompleto } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", id)
        .order("fecha_creacion", { ascending: false });

      if (errorCompleto) throw errorCompleto;
      setHistorialCompleto(completo || []);

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

  const loadEquipoConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("configuracion")
        .select("clave, valor")
        .like("clave", "equipo_opciones_%");

      if (error) throw error;

      const configs: Record<string, string[]> = {};
      data?.forEach((config) => {
        const key = config.clave.replace("equipo_opciones_", "");
        configs[key] = config.valor ? config.valor.split(",").map(v => v.trim()) : [];
      });
      setEquipoConfigs(configs);
    } catch (error) {
      console.error("Error cargando configuración de equipos:", error);
    }
  };

  const descargarLogo = async (logoUrl: string, nombreCliente: string) => {
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = logoUrl.split('.').pop()?.split('?')[0] || 'png';
      a.download = `logo-${nombreCliente.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Logo descargado");
    } catch (error) {
      console.error("Error descargando logo:", error);
      toast.error("Error al descargar el logo");
    }
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
      setNuevoEquipo({
        tipo: "",
        marca: "",
        modelo: "",
        numero_serie: "",
        numero_serie_bdp: "",
        numero_serie_wind: "",
        numero_serie_store_manager: "",
        numero_serie_cashlogy: "",
        numero_serie_impresora: "",
        contraseñas: "",
        tpv: "",
        wind: "",
        ram: "",
        impresora: "",
        software: "",
        v: "",
        tbai: "",
        c_inteligente: "",
        instalacion: "",
        pendrive_c_seg: "",
        garantia_inicio: "",
        garantia_fin: "",
      });
      setDialogEquipoOpen(false);
      loadEquipos();
    } catch (error: any) {
      console.error("Error agregando equipo:", error);
      toast.error(error.message || "Error al agregar equipo");
    }
  };

  const handleDelete = async () => {
    if (!cliente) return;

    if (cliente.activo) {
      setDialogInactivacionOpen(true);
      return;
    }

    if (!confirm("¿Deseas reactivar este cliente?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("clientes")
        .update({ activo: true, motivo_inactivacion: null })
        .eq("id", id);

      if (error) throw error;

      toast.success("Cliente reactivado correctamente");
      loadCliente();
    } catch (error: any) {
      console.error("Error actualizando estado del cliente:", error);
      toast.error(error.message || "Error al actualizar cliente");
    }
  };

  const confirmarInactivacion = async () => {
    if (!motivoInactivacion.trim()) {
      toast.error("Debes proporcionar un motivo para archivar el cliente");
      return;
    }

    try {
      const { error } = await supabase
        .from("clientes")
        .update({
          activo: false,
          motivo_inactivacion: motivoInactivacion
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Cliente archivado correctamente");
      setDialogInactivacionOpen(false);
      setMotivoInactivacion("");
      loadCliente();
    } catch (error: any) {
      console.error("Error archivando cliente:", error);
      toast.error(error.message || "Error al archivar cliente");
    }
  };

  const guardarContrato = async () => {
    if (!nuevoContrato.tipo || !nuevoContrato.fecha_alta || !nuevoContrato.fecha_caducidad) {
      toast.error("Completa todos los campos obligatorios");
      return;
    }

    try {
      if (contratoEditando) {
        const { error } = await supabase
          .from("contratos_mantenimiento")
          .update({
            tipo: nuevoContrato.tipo,
            fecha_alta: nuevoContrato.fecha_alta,
            fecha_caducidad: nuevoContrato.fecha_caducidad,
            notas: nuevoContrato.notas,
          })
          .eq("id", contratoEditando.id);

        if (error) throw error;
        toast.success("Contrato actualizado");
      } else {
        const { error } = await supabase.from("contratos_mantenimiento").insert([
          {
            cliente_id: id,
            tipo: nuevoContrato.tipo,
            fecha_alta: nuevoContrato.fecha_alta,
            fecha_caducidad: nuevoContrato.fecha_caducidad,
            notas: nuevoContrato.notas,
            activo: true,
          },
        ]);

        if (error) throw error;
        toast.success("Contrato agregado");
      }

      setNuevoContrato({ tipo: "", fecha_alta: "", fecha_caducidad: "", notas: "" });
      setContratoEditando(null);
      setDialogContratoOpen(false);
      loadContratos();
    } catch (error: any) {
      console.error("Error guardando contrato:", error);
      toast.error(error.message || "Error al guardar contrato");
    }
  };

  const editarContrato = (contrato: Contrato) => {
    setContratoEditando(contrato);
    setNuevoContrato({
      tipo: contrato.tipo,
      fecha_alta: contrato.fecha_alta,
      fecha_caducidad: contrato.fecha_caducidad,
      notas: contrato.notas || "",
    });
    setDialogContratoOpen(true);
  };

  const eliminarContrato = async (contratoId: string) => {
    if (!confirm("¿Estás seguro de eliminar este contrato?")) return;

    try {
      const { error } = await supabase
        .from("contratos_mantenimiento")
        .update({ activo: false })
        .eq("id", contratoId);

      if (error) throw error;
      toast.success("Contrato eliminado");
      loadContratos();
    } catch (error: any) {
      console.error("Error eliminando contrato:", error);
      toast.error(error.message || "Error al eliminar contrato");
    }
  };

  const abrirDialogoNuevoContrato = () => {
    setContratoEditando(null);
    setNuevoContrato({ tipo: "", fecha_alta: "", fecha_caducidad: "", notas: "" });
    setDialogContratoOpen(true);
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
      {/* Alertas del cliente */}
      <ClienteAlerts
        clienteActivo={cliente.activo}
        motivoInactivacion={cliente.motivo_inactivacion}
        ticketsAbiertos={ticketsAbiertos}
        clienteId={id!}
      />

      {/* Header del cliente */}
      <Card className="border-2 shadow-sm bg-gradient-to-r from-card to-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-6 flex-1 min-w-0">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigate("/clientes")} 
                className="shrink-0 mt-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              {cliente.logo_url && (
                <div className="relative group/logo shrink-0">
                  <div className="w-24 h-24 rounded-xl border-2 border-border overflow-hidden flex items-center justify-center bg-white shadow-md transition-all duration-300 group-hover/logo:shadow-lg group-hover/logo:border-primary/50">
                    <img
                      src={cliente.logo_url}
                      alt={`Logo ${cliente.nombre}`}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => {
                        e.currentTarget.parentElement!.style.display = "none";
                      }}
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 shadow-lg"
                    onClick={() => descargarLogo(cliente.logo_url!, cliente.nombre)}
                    title="Descargar logo"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold truncate">{cliente.nombre}</h1>
                  <Badge 
                    variant={cliente.activo ? "default" : "secondary"}
                    className={cliente.activo ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {cliente.activo ? "Activo" : "Archivado"}
                  </Badge>
                  {contratos.filter(c => c.activo).length > 0 && (
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      Con Contrato
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {cliente.cif && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-semibold">CIF:</span>
                      <span className="font-mono font-medium">{cliente.cif}</span>
                    </div>
                  )}
                  {cliente.telefono && (
                    <a 
                      href={`tel:${cliente.telefono}`}
                      className="flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      {cliente.telefono}
                    </a>
                  )}
                  {cliente.email && (
                    <a 
                      href={`mailto:${cliente.email}`}
                      className="flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      {cliente.email}
                    </a>
                  )}
                  {cliente.poblacion && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{cliente.poblacion}{cliente.provincia && `, ${cliente.provincia}`}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {editMode ? (
              <div className="flex gap-2 shrink-0">
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
              <div className="flex flex-wrap gap-3 shrink-0">
                <Button
                  onClick={() => navigate(`/tickets/nuevo?cliente=${id}`)}
                  className="bg-primary hover:bg-primary/90 shadow-md"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Ticket
                </Button>
                <Button 
                  onClick={() => setEditMode(true)} 
                  variant="outline" 
                  className="border-2 hover:bg-accent" 
                  size="lg"
                >
                  <Edit2 className="h-5 w-5 mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className={cliente.activo
                    ? "border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-md"
                    : "border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-md"
                  }
                  size="icon"
                  title={cliente.activo ? "Archivar cliente" : "Reactivar cliente"}
                >
                  {cliente.activo ? <Trash2 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de Inactivación */}
      <DialogInactivacion
        open={dialogInactivacionOpen}
        onOpenChange={setDialogInactivacionOpen}
        motivoInactivacion={motivoInactivacion}
        setMotivoInactivacion={setMotivoInactivacion}
        onConfirmar={confirmarInactivacion}
      />

      {/* Contratos de Mantenimiento */}
      <ContratosSection contratos={contratos} />

      {/* Tabs de información */}
      {editMode ? (
        <ClienteInfoTabs
          cliente={cliente}
          setCliente={setCliente}
          clienteId={id!}
          onUpdate={loadCliente}
          logoFile={logoFile}
          logoPreview={logoPreview}
          onLogoFileChange={handleLogoFileChange}
          onClearLogo={clearLogo}
          contratos={contratos}
          dialogContratoOpen={dialogContratoOpen}
          setDialogContratoOpen={setDialogContratoOpen}
          contratoEditando={contratoEditando}
          nuevoContrato={nuevoContrato}
          setNuevoContrato={setNuevoContrato}
          onGuardarContrato={guardarContrato}
          onEditarContrato={editarContrato}
          onEliminarContrato={eliminarContrato}
          onAbrirDialogoNuevoContrato={abrirDialogoNuevoContrato}
        />
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

              <TabsContent value="empresa" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Card */}
                  {cliente.logo_url && (
                    <Card className="md:col-span-2 border-2 bg-gradient-to-br from-muted/30 to-muted/50">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="relative group/logo-view">
                            <div className="bg-white rounded-xl border-2 border-border p-6 shadow-md transition-all duration-300 group-hover/logo-view:shadow-xl group-hover/logo-view:border-primary/50">
                              <img
                                src={cliente.logo_url}
                                alt={`Logo ${cliente.nombre}`}
                                className="max-h-40 object-contain"
                                onError={(e) => {
                                  e.currentTarget.parentElement!.style.display = "none";
                                }}
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/logo-view:opacity-100 transition-opacity duration-300 shadow-lg gap-2"
                              onClick={() => descargarLogo(cliente.logo_url!, cliente.nombre)}
                            >
                              <Download className="h-3.5 w-3.5" />
                              Descargar Logo
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Información Principal */}
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        Información Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Nombre de la Empresa
                        </Label>
                        <p className="text-lg font-semibold text-foreground">{cliente.nombre}</p>
                      </div>
                      {cliente.nombre_fiscal && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Nombre Fiscal
                          </Label>
                          <p className="font-medium text-foreground">{cliente.nombre_fiscal}</p>
                        </div>
                      )}
                      {cliente.cif && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            CIF/NIF
                          </Label>
                          <p className="font-mono font-semibold text-foreground">{cliente.cif}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Estado y Fechas */}
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Estado y Fechas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Estado
                        </Label>
                        <div>
                          <Badge 
                            variant={cliente.activo ? "default" : "secondary"}
                            className={cliente.activo ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {cliente.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                      {cliente.fecha_alta_cliente && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Fecha de Alta
                          </Label>
                          <p className="font-medium text-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(cliente.fecha_alta_cliente).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="contactos" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contacto Principal */}
                  <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Contacto Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cliente.persona_contacto && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Persona de Contacto
                          </Label>
                          <p className="text-lg font-semibold text-foreground">{cliente.persona_contacto}</p>
                        </div>
                      )}
                      {cliente.telefono && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            Teléfono
                          </Label>
                          <a 
                            href={`tel:${cliente.telefono}`} 
                            className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            {cliente.telefono}
                          </a>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Email
                          </Label>
                          <a 
                            href={`mailto:${cliente.email}`} 
                            className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline transition-colors break-all"
                          >
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="break-all">{cliente.email}</span>
                          </a>
                        </div>
                      )}
                      {!cliente.persona_contacto && !cliente.telefono && !cliente.email && (
                        <p className="text-sm text-muted-foreground italic">No hay información de contacto disponible</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Encargado */}
                  {(cliente.nombre_encargado || cliente.telefono_encargado) && (
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-primary" />
                          Encargado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {cliente.nombre_encargado && (
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Nombre del Encargado
                            </Label>
                            <p className="text-lg font-semibold text-foreground">{cliente.nombre_encargado}</p>
                          </div>
                        )}
                        {cliente.telefono_encargado && (
                          <div className="space-y-2 pt-2 border-t">
                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              Teléfono del Encargado
                            </Label>
                            <a 
                              href={`tel:${cliente.telefono_encargado}`} 
                              className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              {cliente.telefono_encargado}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ubicacion" className="space-y-6 mt-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Dirección Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cliente.direccion && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Dirección
                        </Label>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${cliente.direccion}, ${cliente.codigo_postal || ""} ${cliente.poblacion || ""}, ${cliente.provincia || ""}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-primary hover:underline flex items-center gap-2 transition-colors"
                          >
                            {cliente.direccion}
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      {cliente.codigo_postal && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Código Postal
                          </Label>
                          <p className="font-mono font-semibold text-foreground">{cliente.codigo_postal}</p>
                        </div>
                      )}
                      {cliente.poblacion && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Población
                          </Label>
                          <p className="font-semibold text-foreground">{cliente.poblacion}</p>
                        </div>
                      )}
                      {cliente.provincia && (
                        <div className="space-y-2 col-span-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Provincia
                          </Label>
                          <p className="font-semibold text-foreground">{cliente.provincia}</p>
                        </div>
                      )}
                    </div>
                    {cliente.direccion && (
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${cliente.direccion}, ${cliente.codigo_postal || ""} ${cliente.poblacion || ""}, ${cliente.provincia || ""}`
                              )}`,
                              "_blank"
                            );
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Ver en Google Maps
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                    {!cliente.direccion && !cliente.codigo_postal && !cliente.poblacion && !cliente.provincia && (
                      <p className="text-sm text-muted-foreground italic">No hay información de ubicación disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-6 mt-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      Información Fiscal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {cliente.selector_fiscal && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Selector Fiscal
                          </Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-base font-semibold capitalize">
                              {cliente.selector_fiscal}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {cliente.r_iva && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            R. IVA
                          </Label>
                          <p className="text-lg font-semibold text-foreground">{cliente.r_iva}</p>
                        </div>
                      )}
                      {cliente.epigrafe && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Epígrafe
                          </Label>
                          <p className="text-lg font-semibold text-foreground font-mono">{cliente.epigrafe}</p>
                        </div>
                      )}
                    </div>
                    {!cliente.selector_fiscal && !cliente.r_iva && !cliente.epigrafe && (
                      <p className="text-sm text-muted-foreground italic pt-4">No hay información fiscal disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="asesoria" className="space-y-6 mt-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Información de la Asesoría
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cliente.nombre_asesoria && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Nombre de la Asesoría
                        </Label>
                        <p className="text-lg font-semibold text-foreground">{cliente.nombre_asesoria}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                      {cliente.telefono_asesoria && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            Teléfono Asesoría
                          </Label>
                          <a 
                            href={`tel:${cliente.telefono_asesoria}`} 
                            className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            {cliente.telefono_asesoria}
                          </a>
                        </div>
                      )}
                      {cliente.persona_contacto_asesoria && (
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Persona de Contacto
                          </Label>
                          <p className="text-lg font-semibold text-foreground">{cliente.persona_contacto_asesoria}</p>
                        </div>
                      )}
                    </div>
                    {!cliente.nombre_asesoria && !cliente.telefono_asesoria && !cliente.persona_contacto_asesoria && (
                      <p className="text-sm text-muted-foreground italic pt-4">No hay información de asesoría disponible</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipos" className="space-y-6 mt-6">
                <EquiposSection
                  equipos={equipos}
                  dialogEquipoOpen={dialogEquipoOpen}
                  setDialogEquipoOpen={setDialogEquipoOpen}
                  nuevoEquipo={nuevoEquipo}
                  setNuevoEquipo={setNuevoEquipo}
                  equipoConfigs={equipoConfigs}
                  onAgregarEquipo={agregarEquipo}
                />
              </TabsContent>

              <TabsContent value="archivos" className="space-y-6 mt-6">
                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Archivos PDF
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <FileType className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-base font-semibold text-foreground">
                          Gestión de Documentos
                        </p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          La funcionalidad de gestión de documentos PDF estará disponible próximamente. 
                          Podrás subir, visualizar y descargar documentos relacionados con este cliente.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notas" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 gap-6">
                  {cliente.informacion_destacada && (
                    <Card className="border-2 border-primary/30 bg-primary/5 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-primary" />
                          Información Destacada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{cliente.informacion_destacada}</p>
                      </CardContent>
                    </Card>
                  )}
                  {cliente.notas_especiales && (
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <StickyNote className="h-4 w-4 text-primary" />
                          Notas Especiales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{cliente.notas_especiales}</p>
                      </CardContent>
                    </Card>
                  )}
                  {cliente.notas_adicionales && (
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Notas Adicionales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{cliente.notas_adicionales}</p>
                      </CardContent>
                    </Card>
                  )}
                  {cliente.notas && (
                    <Card className="border-2 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ScrollText className="h-4 w-4 text-primary" />
                          Notas Generales
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{cliente.notas}</p>
                      </CardContent>
                    </Card>
                  )}
                  {!cliente.notas && !cliente.informacion_destacada && !cliente.notas_especiales && !cliente.notas_adicionales && (
                    <Card className="border-2 shadow-sm">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground italic text-center">No hay notas disponibles</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contrato" className="space-y-6 mt-6">
                {(cliente.aviso_moroso || cliente.aviso_cobrar_antes) && (
                  <Card className="border-2 border-red-500/50 bg-red-50 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        Avisos Importantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cliente.aviso_moroso && (
                        <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg font-semibold shadow-sm">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                          <span className="text-base">CLIENTE MOROSO</span>
                        </div>
                      )}
                      {cliente.aviso_cobrar_antes && (
                        <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                          <p className="font-semibold whitespace-pre-wrap text-sm leading-relaxed">{cliente.aviso_cobrar_antes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card className="border-2 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ScrollText className="h-4 w-4 text-primary" />
                      Contratos de Mantenimiento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {contratos.filter(c => c.activo).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic text-center py-8">No hay contratos activos</p>
                    ) : (
                      <div className="space-y-4">
                        {contratos
                          .filter(c => c.activo)
                          .map((contrato) => {
                            const fechaCaducidad = new Date(contrato.fecha_caducidad);
                            const hoy = new Date();
                            const estaExpirado = fechaCaducidad < hoy;

                            return (
                              <Card
                                key={contrato.id}
                                className={`border-2 ${
                                  estaExpirado 
                                    ? "border-red-300 bg-red-50/50" 
                                    : "border-green-300 bg-green-50/30"
                                } shadow-sm`}
                              >
                                <CardContent className="pt-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <p className={`font-semibold capitalize text-lg ${estaExpirado ? "text-red-700" : "text-green-700"}`}>
                                          Contrato {contrato.tipo}
                                        </p>
                                        {estaExpirado ? (
                                          <Badge variant="destructive" className="ml-2">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Expirado
                                          </Badge>
                                        ) : (
                                          <Badge className="ml-2 bg-green-600 hover:bg-green-700">
                                            Activo
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Fecha de Alta
                                      </Label>
                                      <p className="font-medium text-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {new Date(contrato.fecha_alta).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        Fecha de Caducidad
                                      </Label>
                                      <p className={`font-medium flex items-center gap-2 ${estaExpirado ? "text-red-700" : "text-foreground"}`}>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        {new Date(contrato.fecha_caducidad).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    {contrato.notas && (
                                      <div className="col-span-full space-y-2 pt-2 border-t">
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                          Notas
                                        </Label>
                                        <p className="text-sm text-foreground leading-relaxed">{contrato.notas}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Historial Completo de Tickets */}
      <TicketsHistorial
        historialCompleto={historialCompleto}
        ticketsAbiertos={ticketsAbiertos}
        nombreCliente={cliente.nombre}
        clienteId={id!}
      />
    </div>
  );
};

export default DetalleCliente;
