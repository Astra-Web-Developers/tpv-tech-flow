import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Cliente {
  id: string;
  nombre: string;
}

interface Tecnico {
  id: string;
  nombre: string;
  email: string;
}

const NuevoTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    cliente_id: "",
    tecnicos_asignados: [] as string[],
  });

  useEffect(() => {
    loadClientes();
    loadTecnicos();
  }, []);

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    }
  };

  const loadTecnicos = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, email")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      setTecnicos(data || []);
    } catch (error) {
      console.error("Error cargando técnicos:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuario no autenticado");

      // Crear ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert([{
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          prioridad: formData.prioridad,
          cliente_id: formData.cliente_id || null,
          created_by: userData.user.id,
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Asignar técnicos
      if (formData.tecnicos_asignados.length > 0) {
        const asignaciones = formData.tecnicos_asignados.map(tecnico_id => ({
          ticket_id: ticket.id,
          tecnico_id,
        }));

        const { error: asignError } = await supabase
          .from("tickets_tecnicos")
          .insert(asignaciones);

        if (asignError) throw asignError;
      }

      toast.success("Ticket creado exitosamente");
      navigate(`/tickets/${ticket.id}`);
    } catch (error: any) {
      console.error("Error creando ticket:", error);
      toast.error(error.message || "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  const toggleTecnico = (tecnicoId: string) => {
    setFormData(prev => ({
      ...prev,
      tecnicos_asignados: prev.tecnicos_asignados.includes(tecnicoId)
        ? prev.tecnicos_asignados.filter(id => id !== tecnicoId)
        : [...prev.tecnicos_asignados, tecnicoId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/tickets")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nuevo Ticket</h1>
          <p className="text-muted-foreground">Crea un nuevo ticket de servicio técnico</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  placeholder="Ej: Reparación TPV no enciende"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad *</Label>
                <Select value={formData.prioridad} onValueChange={(value) => setFormData({ ...formData, prioridad: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el problema o tarea..."
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Técnicos Asignados</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 border rounded-md">
                  {tecnicos.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-2">No hay técnicos disponibles</p>
                  ) : (
                    tecnicos.map((tecnico) => (
                      <div key={tecnico.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`tecnico-${tecnico.id}`}
                          checked={formData.tecnicos_asignados.includes(tecnico.id)}
                          onChange={() => toggleTecnico(tecnico.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`tecnico-${tecnico.id}`} className="text-sm cursor-pointer">
                          {tecnico.nombre}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/tickets")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Ticket"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NuevoTicket;
