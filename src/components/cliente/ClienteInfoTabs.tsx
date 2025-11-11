import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EtiquetasManager } from "@/components/EtiquetasManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Building2,
  Users,
  MapPin,
  Receipt,
  Briefcase,
  Wrench,
  FileType,
  StickyNote,
  ScrollText,
  CheckCircle2,
  FileText,
  Calendar,
  Phone,
  Mail,
  Upload,
  X,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";

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

interface Contrato {
  id: string;
  tipo: string;
  fecha_alta: string;
  fecha_caducidad: string;
  activo: boolean;
  notas: string | null;
}

interface ClienteInfoTabsProps {
  cliente: Cliente;
  setCliente: (cliente: Cliente) => void;
  clienteId: string;
  onUpdate: () => void;
  logoFile: File | null;
  logoPreview: string;
  onLogoFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearLogo: () => void;
  contratos: Contrato[];
  dialogContratoOpen: boolean;
  setDialogContratoOpen: (open: boolean) => void;
  contratoEditando: Contrato | null;
  nuevoContrato: {
    tipo: string;
    fecha_alta: string;
    fecha_caducidad: string;
    notas: string;
  };
  setNuevoContrato: (contrato: any) => void;
  onGuardarContrato: () => void;
  onEditarContrato: (contrato: Contrato) => void;
  onEliminarContrato: (contratoId: string) => void;
  onAbrirDialogoNuevoContrato: () => void;
}

export const ClienteInfoTabs = ({
  cliente,
  setCliente,
  clienteId,
  onUpdate,
  logoFile,
  logoPreview,
  onLogoFileChange,
  onClearLogo,
  contratos,
  dialogContratoOpen,
  setDialogContratoOpen,
  contratoEditando,
  nuevoContrato,
  setNuevoContrato,
  onGuardarContrato,
  onEditarContrato,
  onEliminarContrato,
  onAbrirDialogoNuevoContrato,
}: ClienteInfoTabsProps) => {
  return (
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

              {/* Etiquetas Card */}
              <Card className="border-2 md:col-span-2">
                <CardContent className="pt-6">
                  <EtiquetasManager clienteId={clienteId} onUpdate={onUpdate} />
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
                              onClick={onClearLogo}
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
                          onChange={onLogoFileChange}
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
                  {cliente.direccion && (
                    <div className="md:col-span-2">
                      <Button
                        type="button"
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
                      </Button>
                    </div>
                  )}
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
            {/* Avisos */}
            <Card className="border-2 border-red-500/50 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  Avisos Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aviso_moroso"
                    checked={cliente.aviso_moroso}
                    onCheckedChange={(checked) =>
                      setCliente({ ...cliente, aviso_moroso: checked as boolean })
                    }
                  />
                  <Label htmlFor="aviso_moroso" className="cursor-pointer font-medium text-red-700">
                    Cliente Moroso
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label className="text-red-700">Avisos Adicionales (ej: Cobrar antes de trabajar)</Label>
                  <Textarea
                    value={cliente.aviso_cobrar_antes || ""}
                    onChange={(e) => setCliente({ ...cliente, aviso_cobrar_antes: e.target.value })}
                    rows={2}
                    placeholder="Cobrar antes de trabajar, requiere autorización, etc..."
                    className="bg-white border-red-300"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contratos de Mantenimiento */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ScrollText className="h-4 w-4" />
                    Contratos de Mantenimiento
                  </CardTitle>
                  <Dialog open={dialogContratoOpen} onOpenChange={setDialogContratoOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={onAbrirDialogoNuevoContrato}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Contrato
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {contratoEditando ? "Editar Contrato" : "Nuevo Contrato de Mantenimiento"}
                        </DialogTitle>
                        <DialogDescription>
                          Completa la información del contrato
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tipo de Contrato*</Label>
                          <Select
                            value={nuevoContrato.tipo}
                            onValueChange={(value) => setNuevoContrato({ ...nuevoContrato, tipo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trimestral">Trimestral</SelectItem>
                              <SelectItem value="semestral">Semestral</SelectItem>
                              <SelectItem value="anual">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Fecha de Alta*</Label>
                            <Input
                              type="date"
                              value={nuevoContrato.fecha_alta}
                              onChange={(e) =>
                                setNuevoContrato({ ...nuevoContrato, fecha_alta: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fecha de Caducidad*</Label>
                            <Input
                              type="date"
                              value={nuevoContrato.fecha_caducidad}
                              onChange={(e) =>
                                setNuevoContrato({ ...nuevoContrato, fecha_caducidad: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notas</Label>
                          <Textarea
                            value={nuevoContrato.notas}
                            onChange={(e) => setNuevoContrato({ ...nuevoContrato, notas: e.target.value })}
                            rows={3}
                            placeholder="Notas adicionales..."
                          />
                        </div>
                        <Button onClick={onGuardarContrato} className="w-full">
                          {contratoEditando ? "Actualizar Contrato" : "Crear Contrato"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {contratos.filter(c => c.activo).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay contratos activos</p>
                ) : (
                  <div className="space-y-3">
                    {contratos
                      .filter(c => c.activo)
                      .map((contrato) => {
                        const fechaCaducidad = new Date(contrato.fecha_caducidad);
                        const hoy = new Date();
                        const estaExpirado = fechaCaducidad < hoy;

                        return (
                          <div
                            key={contrato.id}
                            className={`p-4 border-2 rounded-lg ${
                              estaExpirado ? "border-red-300 bg-red-50" : "border-primary/20 bg-primary/5"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className={`font-semibold capitalize ${estaExpirado ? "text-red-700" : ""}`}>
                                  Contrato {contrato.tipo}
                                </p>
                                {estaExpirado && (
                                  <Badge variant="destructive" className="mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Expirado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEditarContrato(contrato)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onEliminarContrato(contrato.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <Label className="text-muted-foreground text-xs">Fecha de Alta</Label>
                                <p className="font-medium">
                                  {new Date(contrato.fecha_alta).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-xs">Fecha de Caducidad</Label>
                                <p className={`font-medium ${estaExpirado ? "text-red-700" : ""}`}>
                                  {new Date(contrato.fecha_caducidad).toLocaleDateString()}
                                </p>
                              </div>
                              {contrato.notas && (
                                <div className="col-span-2">
                                  <Label className="text-muted-foreground text-xs">Notas</Label>
                                  <p className="text-sm">{contrato.notas}</p>
                                </div>
                              )}
                            </div>
                          </div>
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
  );
};
