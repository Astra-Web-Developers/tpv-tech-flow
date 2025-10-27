import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Mail } from "lucide-react";
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

interface Cliente {
  id: string;
  nombre: string;
  cif: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  poblacion: string | null;
}

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    cif: "",
    telefono: "",
    email: "",
    direccion: "",
    poblacion: "",
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      toast.error("Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("clientes").insert([formData]);

      if (error) throw error;

      toast.success("Cliente creado exitosamente");
      setDialogOpen(false);
      setFormData({
        nombre: "",
        cif: "",
        telefono: "",
        email: "",
        direccion: "",
        poblacion: "",
      });
      loadClientes();
    } catch (error: any) {
      console.error("Error creando cliente:", error);
      toast.error(error.message || "Error al crear cliente");
    }
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono?.includes(searchTerm)
  );

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Cliente</DialogTitle>
              <DialogDescription>
                Completa los datos del cliente. Los campos con * son obligatorios.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cif">CIF</Label>
                  <Input
                    id="cif"
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poblacion">Población</Label>
                  <Input
                    id="poblacion"
                    value={formData.poblacion}
                    onChange={(e) => setFormData({ ...formData, poblacion: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Cliente</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, CIF o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClientes.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">No se encontraron clientes</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredClientes.map((cliente) => (
            <Card 
              key={cliente.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/clientes/${cliente.id}`)}
            >
              <CardHeader>
                <CardTitle>{cliente.nombre}</CardTitle>
                {cliente.cif && (
                  <CardDescription>CIF: {cliente.cif}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {cliente.telefono && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${cliente.telefono}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                      {cliente.telefono}
                    </a>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${cliente.email}`} className="hover:text-primary" onClick={(e) => e.stopPropagation()}>
                      {cliente.email}
                    </a>
                  </div>
                )}
                {cliente.direccion && (
                  <p className="text-sm text-muted-foreground">{cliente.direccion}</p>
                )}
                {cliente.poblacion && (
                  <p className="text-sm text-muted-foreground">{cliente.poblacion}</p>
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
