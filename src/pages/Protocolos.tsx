import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Folder, Download, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Documento {
  id: string;
  nombre: string;
  descripcion: string | null;
  carpeta: string | null;
  url: string;
  version: number;
  created_at: string;
  profiles?: { nombre: string } | null;
}

const Protocolos = () => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [carpetas, setCarpetas] = useState<string[]>([]);
  const [carpetaActual, setCarpetaActual] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCarpetaDialogOpen, setIsCarpetaDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    carpeta: "",
    url: ""
  });
  const [nuevaCarpeta, setNuevaCarpeta] = useState("");

  useEffect(() => {
    loadDocumentos();
  }, []);

  const loadDocumentos = async () => {
    try {
      const { data, error } = await supabase
        .from("documentos")
        .select(`
          *,
          profiles:created_by (nombre)
        `)
        .eq("tipo", "protocolo")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocumentos(data as any || []);

      // Extraer carpetas únicas
      const carpetasUnicas = [...new Set(data?.map(d => d.carpeta).filter(Boolean))] as string[];
      setCarpetas(carpetasUnicas);
    } catch (error) {
      console.error("Error cargando protocolos:", error);
      toast.error("Error al cargar protocolos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("documentos")
        .insert({
          tipo: "protocolo",
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          carpeta: formData.carpeta || null,
          url: formData.url,
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Protocolo añadido exitosamente");
      setIsDialogOpen(false);
      loadDocumentos();
      resetForm();
    } catch (error: any) {
      console.error("Error añadiendo protocolo:", error);
      toast.error("Error al añadir protocolo");
    }
  };

  const handleCrearCarpeta = async () => {
    if (!nuevaCarpeta.trim()) {
      toast.error("El nombre de la carpeta no puede estar vacío");
      return;
    }

    if (carpetas.includes(nuevaCarpeta)) {
      toast.error("Ya existe una carpeta con ese nombre");
      return;
    }

    setCarpetas([...carpetas, nuevaCarpeta]);
    toast.success("Carpeta creada");
    setIsCarpetaDialogOpen(false);
    setNuevaCarpeta("");
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este protocolo?")) return;

    try {
      const { error } = await supabase
        .from("documentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Protocolo eliminado");
      loadDocumentos();
    } catch (error: any) {
      console.error("Error eliminando protocolo:", error);
      toast.error("Error al eliminar protocolo");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      carpeta: "",
      url: ""
    });
  };

  const documentosFiltrados = documentos.filter(doc => {
    const matchesCarpeta = carpetaActual === null || doc.carpeta === carpetaActual;
    const matchesSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCarpeta && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando protocolos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Protocolos</h1>
          <p className="text-muted-foreground">Documentación y procedimientos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCarpetaDialogOpen} onOpenChange={setIsCarpetaDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Folder className="h-4 w-4 mr-2" />
                Nueva Carpeta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Carpeta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre_carpeta">Nombre de la carpeta</Label>
                  <Input
                    id="nombre_carpeta"
                    value={nuevaCarpeta}
                    onChange={(e) => setNuevaCarpeta(e.target.value)}
                    placeholder="Ej: Instalación TPV"
                  />
                </div>
                <Button onClick={handleCrearCarpeta} className="w-full">
                  Crear Carpeta
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Protocolo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Añadir Protocolo</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del documento *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Protocolo de instalación"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Breve descripción del protocolo"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="carpeta">Carpeta</Label>
                  <select
                    id="carpeta"
                    value={formData.carpeta}
                    onChange={(e) => setFormData({ ...formData, carpeta: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Sin carpeta</option>
                    {carpetas.map((carpeta) => (
                      <option key={carpeta} value={carpeta}>
                        {carpeta}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="url">URL del documento *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://ejemplo.com/documento.pdf"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sube el PDF a un servicio externo (Google Drive, Dropbox, etc.) y pega el enlace aquí
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Añadir Protocolo</Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow ${carpetaActual === null ? "border-primary" : ""}`}
          onClick={() => setCarpetaActual(null)}
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Todos los protocolos</span>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {documentos.length} documentos
            </p>
          </CardContent>
        </Card>

        {carpetas.map((carpeta) => {
          const count = documentos.filter(d => d.carpeta === carpeta).length;
          return (
            <Card
              key={carpeta}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${carpetaActual === carpeta ? "border-primary" : ""}`}
              onClick={() => setCarpetaActual(carpeta)}
            >
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-2">
                  <Folder className="h-5 w-5" />
                  <span className="font-medium">{carpeta}</span>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {count} documentos
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar protocolos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {documentosFiltrados.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{doc.nombre}</CardTitle>
                    {doc.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1">{doc.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleEliminar(doc.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {doc.carpeta && (
                  <Badge variant="secondary">
                    <Folder className="h-3 w-3 mr-1" />
                    {doc.carpeta}
                  </Badge>
                )}
                <span>Versión {doc.version}</span>
                <span>
                  Añadido: {new Date(doc.created_at).toLocaleDateString()}
                </span>
                {doc.profiles && (
                  <span>Por: {doc.profiles.nombre}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documentosFiltrados.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron protocolos" : "No hay protocolos en esta carpeta"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Protocolos;
