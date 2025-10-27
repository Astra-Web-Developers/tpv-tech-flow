import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Tecnico {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  foto_url: string | null;
  especialidades: string[] | null;
  activo: boolean;
}

const Tecnicos = () => {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    telefono: "",
    especialidades: [] as string[],
    activo: true,
    rol: "tecnico"
  });

  useEffect(() => {
    loadTecnicos();
  }, []);

  const loadTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setTecnicos(data || []);
    } catch (error) {
      console.error("Error cargando técnicos:", error);
      toast.error("Error al cargar técnicos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Crear usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
          }
        }
      });

      if (authError) throw authError;

      // Actualizar perfil con información adicional
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            apellidos: formData.apellidos,
            telefono: formData.telefono,
            especialidades: formData.especialidades,
            activo: formData.activo,
          })
          .eq("id", authData.user.id);

        if (profileError) throw profileError;

      // Asignar rol
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: formData.rol as any
          });

        if (roleError) throw roleError;
      }

      toast.success("Técnico creado exitosamente");
      setIsDialogOpen(false);
      loadTecnicos();
      setFormData({
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        especialidades: [],
        activo: true,
        rol: "tecnico"
      });
    } catch (error: any) {
      console.error("Error creando técnico:", error);
      toast.error(error.message || "Error al crear técnico");
    }
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ activo: !activo })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Técnico ${!activo ? "activado" : "desactivado"}`);
      loadTecnicos();
    } catch (error) {
      console.error("Error actualizando técnico:", error);
      toast.error("Error al actualizar técnico");
    }
  };

  const filteredTecnicos = tecnicos.filter(t =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.apellidos && t.apellidos.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando técnicos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Técnicos</h1>
          <p className="text-muted-foreground">Gestión de personal técnico</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Técnico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Técnico</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked as boolean })}
                />
                <Label htmlFor="activo">Técnico Activo</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Crear Técnico</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar técnicos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTecnicos.map((tecnico) => (
          <Card key={tecnico.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {tecnico.foto_url ? (
                      <img src={tecnico.foto_url} alt={tecnico.nombre} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {tecnico.nombre.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tecnico.nombre} {tecnico.apellidos}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tecnico.email}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant={tecnico.activo ? "default" : "secondary"}
                  onClick={() => toggleActivo(tecnico.id, tecnico.activo)}
                >
                  {tecnico.activo ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tecnico.telefono && (
                  <p className="text-sm">
                    <span className="font-medium">Tel:</span> {tecnico.telefono}
                  </p>
                )}
                {tecnico.especialidades && tecnico.especialidades.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tecnico.especialidades.map((esp, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                )}
                <Badge variant={tecnico.activo ? "success" : "secondary"}>
                  {tecnico.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTecnicos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron técnicos</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Tecnicos;
