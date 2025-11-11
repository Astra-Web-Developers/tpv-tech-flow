import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Mail, Upload, X, Image as ImageIcon, AlertTriangle, FileX, Tag, FileDown, Download, MapPin } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { logCreate } from "@/lib/auditLog";
import { Badge } from "@/components/ui/badge";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
}

interface ClienteConEtiquetas extends Cliente {
  etiquetas?: Etiqueta[];
  tipo_contrato?: string | null;
}

interface Cliente {
  id: string;
  nombre: string;
  nombre_fiscal: string | null;
  cif: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  codigo_postal: string | null;
  poblacion: string | null;
  provincia: string | null;
  logo_url: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  fecha_alta_cliente: string | null;
  selector_fiscal: string | null;
  informacion_destacada: string | null;
  notas_especiales: string | null;
  notas_adicionales: string | null;
  nombre_asesoria: string | null;
  telefono_asesoria: string | null;
  persona_contacto_asesoria: string | null;
  r_iva: string | null;
  epigrafe: string | null;
  motivo_inactivacion: string | null;
}

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ClienteConEtiquetas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<Etiqueta[]>([]);
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    logo_url: "",
    persona_contacto: "",
    telefono: "",
    email: "",
    nombre_fiscal: "",
    cif: "",
    nombre_encargado: "",
    telefono_encargado: "",
    direccion: "",
    codigo_postal: "",
    poblacion: "",
    provincia: "",
    activo: true,
    fecha_alta_cliente: new Date().toISOString().split('T')[0],
    selector_fiscal: "",
    informacion_destacada: "",
    notas_especiales: "",
    notas_adicionales: "",
    nombre_asesoria: "",
    telefono_asesoria: "",
    persona_contacto_asesoria: "",
    r_iva: "",
    epigrafe: "",
    tiene_contrato_mantenimiento: false,
    tipo_contrato: "",
    fecha_alta_contrato: "",
    fecha_caducidad_contrato: "",
  });

  useEffect(() => {
    loadClientes();
    loadEtiquetas();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nombre");

      if (error) throw error;

      // Cargar etiquetas y contratos para cada cliente
      const clientesConEtiquetas = await Promise.all(
        (data || []).map(async (cliente) => {
          const { data: etiquetasData } = await supabase
            .from("clientes_etiquetas")
            .select("etiqueta_id, etiquetas_clientes(id, nombre, color)")
            .eq("cliente_id", cliente.id);

          const etiquetas = etiquetasData?.map((item: any) => item.etiquetas_clientes).filter(Boolean) || [];
          
          // Cargar contrato activo
          const { data: contratoData } = await supabase
            .from("contratos_mantenimiento")
            .select("tipo")
            .eq("cliente_id", cliente.id)
            .eq("activo", true)
            .maybeSingle();

          return { 
            ...cliente, 
            etiquetas,
            tipo_contrato: contratoData?.tipo || null
          };
        })
      );

      setClientes(clientesConEtiquetas);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const loadEtiquetas = async () => {
    try {
      const { data, error } = await supabase
        .from("etiquetas_clientes")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setEtiquetasDisponibles(data || []);
    } catch (error) {
      console.error("Error cargando etiquetas:", error);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona un archivo de imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 5MB');
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
    setLogoPreview('');
    setFormData({ ...formData, logo_url: '' });
  };

  const uploadLogoToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('client-logos')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('client-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadLogoToSupabase:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingLogo(true);

    try {
      let logoUrl = formData.logo_url;

      // Si hay un archivo de logo, subirlo primero
      if (logoFile) {
        const uploadedUrl = await uploadLogoToSupabase(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          toast.error("Error al subir el logo, pero continuaremos sin él");
        }
      }

      // Convertir strings vacíos a null para campos de fecha
      const clienteData = {
        ...formData,
        logo_url: logoUrl,
        fecha_alta_cliente: formData.fecha_alta_cliente || null,
        fecha_alta_contrato: formData.fecha_alta_contrato || null,
        fecha_caducidad_contrato: formData.fecha_caducidad_contrato || null,
      };

      const { data: nuevoCliente, error } = await supabase
        .from("clientes")
        .insert([clienteData])
        .select()
        .single();

      if (error) throw error;

      // Registrar creación en auditoría
      if (nuevoCliente) {
        await logCreate("clientes", nuevoCliente.id, clienteData);
      }

      toast.success("Cliente creado exitosamente");
      setDialogOpen(false);
      setFormData({
        nombre: "",
        logo_url: "",
        persona_contacto: "",
        telefono: "",
        email: "",
        nombre_fiscal: "",
        cif: "",
        nombre_encargado: "",
        telefono_encargado: "",
        direccion: "",
        codigo_postal: "",
        poblacion: "",
        provincia: "",
        activo: true,
        fecha_alta_cliente: new Date().toISOString().split('T')[0],
        selector_fiscal: "",
        informacion_destacada: "",
        notas_especiales: "",
        notas_adicionales: "",
        nombre_asesoria: "",
        telefono_asesoria: "",
        persona_contacto_asesoria: "",
        r_iva: "",
        epigrafe: "",
        tiene_contrato_mantenimiento: false,
        tipo_contrato: "",
        fecha_alta_contrato: "",
        fecha_caducidad_contrato: "",
      });
      setLogoFile(null);
      setLogoPreview('');
      loadClientes();
    } catch (error: any) {
      console.error("Error creando cliente:", error);
      toast.error(error.message || "Error al crear cliente");
    } finally {
      setUploadingLogo(false);
    }
  };

  const exportarPDF = async () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(16);
      doc.text("Listado de Clientes", 14, 15);

      // Fecha del reporte
      doc.setFontSize(10);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);
      doc.text(`Total de clientes: ${filteredClientes.length}`, 14, 28);

      // Preparar datos para la tabla
      const tableData = filteredClientes.map((cliente) => [
        cliente.nombre,
        cliente.cif || "-",
        cliente.telefono || "-",
        cliente.poblacion || "-",
        cliente.provincia || "-",
        cliente.selector_fiscal || "-",
        cliente.tipo_contrato || "-",
      ]);

      // Crear tabla
      autoTable(doc, {
        startY: 34,
        head: [["Nombre", "CIF", "Teléfono", "Ciudad", "Provincia", "Módulo Fiscal", "Tipo Contrato"]],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
        },
      });

      // Agregar logo en la parte inferior derecha
      try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        const reader = new FileReader();

        await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const pageHeight = doc.internal.pageSize.getHeight();
            const pageWidth = doc.internal.pageSize.getWidth();
            const logoWidth = 30;
            const logoHeight = 15;
            const margin = 10;

            // Posicionar en la parte inferior derecha
            const x = pageWidth - logoWidth - margin;
            const y = pageHeight - logoHeight - margin;

            doc.addImage(base64data, 'PNG', x, y, logoWidth, logoHeight);
            resolve(null);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (logoError) {
        console.error("Error cargando logo:", logoError);
        // Continuar sin logo si hay error
      }

      // Guardar PDF
      doc.save(`listado-clientes-${new Date().toISOString().split('T')[0]}.pdf`);

      toast.success("Listado exportado en PDF");
    } catch (error) {
      console.error("Error exportando PDF:", error);
      toast.error("Error al exportar el listado");
    }
  };

  const descargarLogo = async (logoUrl: string, nombreCliente: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el detalle del cliente
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

  const filteredClientes = clientes.filter((cliente) => {
    // Filtro por estado activo/inactivo
    if (mostrarInactivos) {
      // Solo mostrar inactivos
      if (cliente.activo) {
        return false;
      }
    } else {
      // Solo mostrar activos
      if (!cliente.activo) {
        return false;
      }
    }

    // Filtro por búsqueda de texto (expandido)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchLower) ||
      cliente.cif?.toLowerCase().includes(searchLower) ||
      cliente.telefono?.includes(searchTerm) ||
      cliente.poblacion?.toLowerCase().includes(searchLower) ||
      cliente.provincia?.toLowerCase().includes(searchLower) ||
      cliente.selector_fiscal?.toLowerCase().includes(searchLower) ||
      cliente.tipo_contrato?.toLowerCase().includes(searchLower);

    // Filtro por etiquetas seleccionadas
    const matchesEtiquetas =
      etiquetasSeleccionadas.length === 0 ||
      etiquetasSeleccionadas.some((etiquetaId) =>
        cliente.etiquetas?.some((e) => e.id === etiquetaId)
      );

    return matchesSearch && matchesEtiquetas;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la base de datos de clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarPDF} disabled={filteredClientes.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => navigate("/clientes/nuevo")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{clientes.length}</div>
            <p className="text-xs text-blue-600 mt-1">{filteredClientes.length} mostrados</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{clientes.filter(c => c.activo).length}</div>
            <p className="text-xs text-green-600 mt-1">{((clientes.filter(c => c.activo).length / clientes.length) * 100).toFixed(0)}% del total</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700">Con Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{clientes.filter(c => c.tipo_contrato).length}</div>
            <p className="text-xs text-orange-600 mt-1">De mantenimiento</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700">Etiquetas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{etiquetasDisponibles.length}</div>
            <p className="text-xs text-purple-600 mt-1">Categorías disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Mantener el diálogo para uso futuro si es necesario, pero oculto */}
      {false && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ display: 'none' }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Crear Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Completa los datos del cliente. Los campos con * son obligatorios.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="empresa" className="w-full">
                <TabsList className="grid w-full grid-cols-9 text-xs">
                  <TabsTrigger value="empresa">Empresa</TabsTrigger>
                  <TabsTrigger value="contactos">Contactos</TabsTrigger>
                  <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                  <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
                  <TabsTrigger value="asesoria">Asesoría</TabsTrigger>
                  <TabsTrigger value="equipos">Equipos</TabsTrigger>
                  <TabsTrigger value="archivos">Archivos PDF</TabsTrigger>
                  <TabsTrigger value="notas">Notas</TabsTrigger>
                  <TabsTrigger value="contrato">Contrato</TabsTrigger>
                </TabsList>

                {/* Tab: Empresa */}
                <TabsContent value="empresa" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Datos de la Empresa</h3>
                    <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Logo de la Empresa</Label>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
                        <TabsTrigger value="url">URL</TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-3">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
                          {logoPreview ? (
                            <div className="relative w-full">
                              <img
                                src={logoPreview}
                                alt="Vista previa"
                                className="max-h-32 mx-auto object-contain rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-0 right-0"
                                onClick={clearLogo}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <p className="text-xs text-center text-muted-foreground mt-2">
                                {logoFile?.name}
                              </p>
                            </div>
                          ) : (
                            <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm font-medium">Click para seleccionar imagen</p>
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

                      <TabsContent value="url" className="space-y-3">
                        <Input
                          id="logo_url"
                          type="url"
                          placeholder="https://ejemplo.com/logo.png"
                          value={formData.logo_url}
                          onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        />
                        {formData.logo_url && (
                          <div className="relative">
                            <img
                              src={formData.logo_url}
                              alt="Logo preview"
                              className="max-h-32 mx-auto object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="nombre">Nombre de la Empresa *</Label>
                    <Input
                      id="nombre"
                      placeholder="Ej: Restaurante El Buen Sabor"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre_fiscal">Nombre Fiscal</Label>
                    <Input
                      id="nombre_fiscal"
                      placeholder="Razón social"
                      value={formData.nombre_fiscal}
                      onChange={(e) => setFormData({ ...formData, nombre_fiscal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cif">CIF/NIF</Label>
                    <Input
                      id="cif"
                      placeholder="B12345678"
                      value={formData.cif}
                      onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                    />
                  </div>

                  {/* Estado y Fecha de Alta */}
                  <div className="space-y-2 col-span-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="activo"
                          checked={formData.activo}
                          onCheckedChange={(checked) => setFormData({ ...formData, activo: checked as boolean })}
                        />
                        <Label htmlFor="activo" className="cursor-pointer">Cliente Activo</Label>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="fecha_alta_cliente">Fecha de Alta del Cliente</Label>
                        <Input
                          id="fecha_alta_cliente"
                          type="date"
                          value={formData.fecha_alta_cliente}
                          onChange={(e) => setFormData({ ...formData, fecha_alta_cliente: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                  </div>
                </TabsContent>

                {/* Tab: Contactos */}
                <TabsContent value="contactos" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personas de Contacto</h3>
                    <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="persona_contacto">Nombre de la Persona de Contacto</Label>
                    <Input
                      id="persona_contacto"
                      placeholder="Juan Pérez"
                      value={formData.persona_contacto}
                      onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Encargado</h3>
                    <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_encargado">Nombre del Encargado</Label>
                    <Input
                      id="nombre_encargado"
                      placeholder="María García"
                      value={formData.nombre_encargado}
                      onChange={(e) => setFormData({ ...formData, nombre_encargado: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono_encargado">Teléfono del Encargado</Label>
                    <Input
                      id="telefono_encargado"
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={formData.telefono_encargado}
                      onChange={(e) => setFormData({ ...formData, telefono_encargado: e.target.value })}
                    />
                  </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Ubicación */}
                <TabsContent value="ubicacion" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Dirección</h3>
                    <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      placeholder="Calle Principal, 123"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigo_postal">Código Postal</Label>
                    <Input
                      id="codigo_postal"
                      placeholder="28001"
                      value={formData.codigo_postal}
                      onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="poblacion">Población</Label>
                    <Input
                      id="poblacion"
                      placeholder="Madrid"
                      value={formData.poblacion}
                      onChange={(e) => setFormData({ ...formData, poblacion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="provincia">Provincia</Label>
                    <Input
                      id="provincia"
                      placeholder="Madrid"
                      value={formData.provincia}
                      onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    />
                  </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Fiscal */}
                <TabsContent value="fiscal" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información Fiscal</h3>
                    <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="selector_fiscal">Selector Fiscal</Label>
                    <Select value={formData.selector_fiscal} onValueChange={(value) => setFormData({ ...formData, selector_fiscal: value })}>
                      <SelectTrigger id="selector_fiscal">
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
                    <Label htmlFor="r_iva">R. IVA</Label>
                    <Input
                      id="r_iva"
                      placeholder="21%"
                      value={formData.r_iva}
                      onChange={(e) => setFormData({ ...formData, r_iva: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epigrafe">Epígrafe</Label>
                    <Input
                      id="epigrafe"
                      placeholder="Código epígrafe"
                      value={formData.epigrafe}
                      onChange={(e) => setFormData({ ...formData, epigrafe: e.target.value })}
                    />
                  </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Asesoría */}
                <TabsContent value="asesoria" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Información de la Asesoría</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="nombre_asesoria">Nombre de la Asesoría</Label>
                        <Input
                          id="nombre_asesoria"
                          placeholder="Asesoría Fiscal SL"
                          value={formData.nombre_asesoria}
                          onChange={(e) => setFormData({ ...formData, nombre_asesoria: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono_asesoria">Teléfono Asesoría</Label>
                        <Input
                          id="telefono_asesoria"
                          type="tel"
                          placeholder="+34 600 000 000"
                          value={formData.telefono_asesoria}
                          onChange={(e) => setFormData({ ...formData, telefono_asesoria: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="persona_contacto_asesoria">Persona de Contacto</Label>
                        <Input
                          id="persona_contacto_asesoria"
                          placeholder="Nombre del contacto"
                          value={formData.persona_contacto_asesoria}
                          onChange={(e) => setFormData({ ...formData, persona_contacto_asesoria: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Equipos */}
                <TabsContent value="equipos" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Equipos del Cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Los equipos se gestionarán después de crear el cliente desde la página de detalle.
                    </p>
                    <div className="p-6 border-2 border-dashed rounded-lg text-center">
                      <p className="text-muted-foreground">Esta sección estará disponible después de crear el cliente</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Archivos PDF */}
                <TabsContent value="archivos" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Archivos PDF</h3>
                    <p className="text-sm text-muted-foreground">
                      Podrás subir archivos PDF después de crear el cliente desde la página de detalle.
                    </p>
                    <div className="p-6 border-2 border-dashed rounded-lg text-center">
                      <p className="text-muted-foreground">Esta sección estará disponible después de crear el cliente</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Notas */}
                <TabsContent value="notas" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notas e Información</h3>
                    <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="informacion_destacada">Información Destacada</Label>
                    <Textarea
                      id="informacion_destacada"
                      placeholder="Información importante que debe destacarse..."
                      value={formData.informacion_destacada}
                      onChange={(e) => setFormData({ ...formData, informacion_destacada: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notas_especiales">Notas Especiales</Label>
                    <Textarea
                      id="notas_especiales"
                      placeholder="Notas especiales del cliente..."
                      value={formData.notas_especiales}
                      onChange={(e) => setFormData({ ...formData, notas_especiales: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notas_adicionales">Notas Adicionales</Label>
                    <Textarea
                      id="notas_adicionales"
                      placeholder="Otras notas adicionales..."
                      value={formData.notas_adicionales}
                      onChange={(e) => setFormData({ ...formData, notas_adicionales: e.target.value })}
                      rows={2}
                    />
                  </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Contrato */}
                <TabsContent value="contrato" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contrato de Mantenimiento</h3>
                    <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tiene_contrato_mantenimiento"
                      checked={formData.tiene_contrato_mantenimiento}
                      onCheckedChange={(checked) => setFormData({ ...formData, tiene_contrato_mantenimiento: checked as boolean })}
                    />
                    <Label htmlFor="tiene_contrato_mantenimiento" className="cursor-pointer">
                      Tiene Contrato de Mantenimiento
                    </Label>
                  </div>

                  {formData.tiene_contrato_mantenimiento && (
                    <div className="grid grid-cols-3 gap-4 pl-6 border-l-2 border-primary">
                      <div className="space-y-2">
                        <Label htmlFor="tipo_contrato">Tipo de Contrato</Label>
                        <Select value={formData.tipo_contrato} onValueChange={(value) => setFormData({ ...formData, tipo_contrato: value })}>
                          <SelectTrigger id="tipo_contrato">
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
                        <Label htmlFor="fecha_alta_contrato">Fecha de Alta</Label>
                        <Input
                          id="fecha_alta_contrato"
                          type="date"
                          value={formData.fecha_alta_contrato}
                          onChange={(e) => setFormData({ ...formData, fecha_alta_contrato: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fecha_caducidad_contrato">Fecha de Caducidad</Label>
                        <Input
                          id="fecha_caducidad_contrato"
                          type="date"
                          value={formData.fecha_caducidad_contrato}
                          onChange={(e) => setFormData({ ...formData, fecha_caducidad_contrato: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={uploadingLogo}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploadingLogo}>
                  {uploadingLogo ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Subiendo logo...
                    </>
                  ) : (
                    'Crear Cliente'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, CIF, teléfono, ciudad, provincia, módulo fiscal o tipo de contrato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 px-4 border rounded-md bg-card">
            <Checkbox
              id="mostrar-inactivos"
              checked={mostrarInactivos}
              onCheckedChange={(checked) => setMostrarInactivos(checked as boolean)}
            />
            <Label htmlFor="mostrar-inactivos" className="cursor-pointer whitespace-nowrap">
              Mostrar inactivos
            </Label>
          </div>
        </div>

        {etiquetasDisponibles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Filtrar por etiquetas
            </Label>
            <div className="flex flex-wrap gap-2">
              {etiquetasDisponibles.map((etiqueta) => {
                const isSelected = etiquetasSeleccionadas.includes(etiqueta.id);
                return (
                  <Badge
                    key={etiqueta.id}
                    style={{
                      backgroundColor: isSelected ? etiqueta.color : "transparent",
                      color: isSelected ? "white" : etiqueta.color,
                      borderColor: etiqueta.color,
                    }}
                    className="cursor-pointer border-2 hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setEtiquetasSeleccionadas((prev) =>
                        isSelected
                          ? prev.filter((id) => id !== etiqueta.id)
                          : [...prev, etiqueta.id]
                      );
                    }}
                  >
                    {etiqueta.nombre}
                  </Badge>
                );
              })}
              {etiquetasSeleccionadas.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEtiquetasSeleccionadas([])}
                  className="h-6"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No se encontraron clientes</p>
              <Button onClick={() => navigate("/clientes/nuevo")}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredClientes.map((cliente) => (
            <Card
              key={cliente.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:border-primary/60 overflow-hidden group relative ${
                !cliente.activo ? "opacity-60 border-muted" : "border-border/50"
              }`}
              onClick={() => navigate(`/clientes/${cliente.id}`)}
            >
              {/* Logo Header con efecto mejorado */}
              {cliente.logo_url && (
                <div className="bg-gradient-to-br from-muted/40 to-muted/60 p-8 flex items-center justify-center border-b transition-all duration-300 group-hover:from-primary/10 group-hover:to-primary/20 relative">
                  <img
                    src={cliente.logo_url}
                    alt={`Logo ${cliente.nombre}`}
                    className="max-h-28 max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.parentElement!.style.display = 'none';
                    }}
                  />
                  {/* Botón de descarga del logo */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                    onClick={(e) => descargarLogo(cliente.logo_url!, cliente.nombre, e)}
                    title="Descargar logo"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{cliente.nombre}</CardTitle>
                      {!cliente.activo && (
                        <Badge variant="secondary" className="text-xs">
                          Archivado
                        </Badge>
                      )}
                      {cliente.tipo_contrato && (
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          {cliente.tipo_contrato}
                        </Badge>
                      )}
                    </div>
                    {cliente.nombre_fiscal && (
                      <CardDescription className="font-semibold text-base text-foreground/80">{cliente.nombre_fiscal}</CardDescription>
                    )}
                    {cliente.cif && (
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <span className="font-semibold text-foreground/70">CIF:</span>
                        <span className="font-mono">{cliente.cif}</span>
                      </CardDescription>
                    )}
                    {!cliente.activo && cliente.motivo_inactivacion && (
                      <div className="mt-2 p-2.5 bg-destructive/10 border border-destructive/30 rounded-md text-xs">
                        <span className="font-semibold text-destructive">Motivo: </span>
                        <span className="text-muted-foreground">{cliente.motivo_inactivacion}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3.5 pb-6">
                {cliente.etiquetas && cliente.etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-3 border-b">
                    {cliente.etiquetas.map((etiqueta) => (
                      <Badge
                        key={etiqueta.id}
                        style={{ backgroundColor: etiqueta.color }}
                        className="text-xs shadow-sm"
                      >
                        {etiqueta.nombre}
                      </Badge>
                    ))}
                  </div>
                )}
                {cliente.telefono && (
                  <div className="flex items-center gap-2.5 text-sm group/phone">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/phone:bg-primary/20 transition-colors">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <a
                      href={`tel:${cliente.telefono}`}
                      className="text-primary hover:underline font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cliente.telefono}
                    </a>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-2.5 text-sm group/email">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/email:bg-primary/20 transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <a
                      href={`mailto:${cliente.email}`}
                      className="text-primary hover:underline truncate font-semibold"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cliente.email}
                    </a>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="pt-3 border-t">
                    <div className="flex items-start gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground/80 mb-1">Dirección</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {cliente.direccion}
                          {cliente.codigo_postal && <><br /><span className="font-mono">{cliente.codigo_postal}</span></>}
                          {cliente.poblacion && ` - ${cliente.poblacion}`}
                          {cliente.provincia && ` (${cliente.provincia})`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Clientes;
