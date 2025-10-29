import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, X, Tag } from "lucide-react";
import { toast } from "sonner";

interface Etiqueta {
  id: string;
  nombre: string;
  color: string;
}

interface EtiquetasManagerProps {
  clienteId: string;
  onUpdate?: () => void;
}

const COLORES_PREDEFINIDOS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export const EtiquetasManager = ({ clienteId, onUpdate }: EtiquetasManagerProps) => {
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState<Etiqueta[]>([]);
  const [etiquetasCliente, setEtiquetasCliente] = useState<Etiqueta[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState({ nombre: "", color: COLORES_PREDEFINIDOS[0] });

  useEffect(() => {
    loadEtiquetas();
    loadEtiquetasCliente();
  }, [clienteId]);

  const loadEtiquetas = async () => {
    try {
      const { data, error } = await supabase
        .from("etiquetas")
        .select("*")
        .order("nombre");

      if (error) throw error;
      setEtiquetasDisponibles(data || []);
    } catch (error: any) {
      console.error("Error cargando etiquetas:", error);
    }
  };

  const loadEtiquetasCliente = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes_etiquetas")
        .select("etiqueta_id, etiquetas(id, nombre, color)")
        .eq("cliente_id", clienteId);

      if (error) throw error;
      
      const etiquetas = data?.map((item: any) => item.etiquetas).filter(Boolean) || [];
      setEtiquetasCliente(etiquetas);
    } catch (error: any) {
      console.error("Error cargando etiquetas del cliente:", error);
    }
  };

  const crearEtiqueta = async () => {
    if (!nuevaEtiqueta.nombre.trim()) {
      toast.error("El nombre de la etiqueta es requerido");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("etiquetas")
        .insert([{ nombre: nuevaEtiqueta.nombre.trim(), color: nuevaEtiqueta.color }])
        .select()
        .single();

      if (error) throw error;

      toast.success("Etiqueta creada");
      setNuevaEtiqueta({ nombre: "", color: COLORES_PREDEFINIDOS[0] });
      loadEtiquetas();
      
      // Agregar automáticamente al cliente
      if (data) {
        await agregarEtiqueta(data.id);
      }
    } catch (error: any) {
      console.error("Error creando etiqueta:", error);
      toast.error(error.message || "Error al crear etiqueta");
    }
  };

  const agregarEtiqueta = async (etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from("clientes_etiquetas")
        .insert([{ cliente_id: clienteId, etiqueta_id: etiquetaId }]);

      if (error) throw error;

      toast.success("Etiqueta agregada");
      loadEtiquetasCliente();
      onUpdate?.();
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Esta etiqueta ya está agregada");
      } else {
        console.error("Error agregando etiqueta:", error);
        toast.error("Error al agregar etiqueta");
      }
    }
  };

  const eliminarEtiqueta = async (etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from("clientes_etiquetas")
        .delete()
        .eq("cliente_id", clienteId)
        .eq("etiqueta_id", etiquetaId);

      if (error) throw error;

      toast.success("Etiqueta eliminada");
      loadEtiquetasCliente();
      onUpdate?.();
    } catch (error: any) {
      console.error("Error eliminando etiqueta:", error);
      toast.error("Error al eliminar etiqueta");
    }
  };

  const etiquetasNoAgregadas = etiquetasDisponibles.filter(
    (etiqueta) => !etiquetasCliente.some((e) => e.id === etiqueta.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Etiquetas</Label>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestionar Etiquetas</DialogTitle>
              <DialogDescription>Agrega etiquetas existentes o crea nuevas</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Crear Nueva Etiqueta</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de la etiqueta"
                    value={nuevaEtiqueta.nombre}
                    onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, nombre: e.target.value })}
                  />
                  <select
                    value={nuevaEtiqueta.color}
                    onChange={(e) => setNuevaEtiqueta({ ...nuevaEtiqueta, color: e.target.value })}
                    className="w-20 h-10 rounded-md border"
                    style={{ backgroundColor: nuevaEtiqueta.color }}
                  >
                    {COLORES_PREDEFINIDOS.map((color) => (
                      <option key={color} value={color} style={{ backgroundColor: color }}>
                        &nbsp;
                      </option>
                    ))}
                  </select>
                  <Button onClick={crearEtiqueta}>Crear</Button>
                </div>
              </div>

              {etiquetasNoAgregadas.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Etiquetas Disponibles</Label>
                  <div className="flex flex-wrap gap-2">
                    {etiquetasNoAgregadas.map((etiqueta) => (
                      <Badge
                        key={etiqueta.id}
                        style={{ backgroundColor: etiqueta.color }}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => agregarEtiqueta(etiqueta.id)}
                      >
                        {etiqueta.nombre}
                        <Plus className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {etiquetasCliente.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay etiquetas asignadas</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {etiquetasCliente.map((etiqueta) => (
            <Badge key={etiqueta.id} style={{ backgroundColor: etiqueta.color }} className="pr-1">
              {etiqueta.nombre}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1 hover:bg-transparent"
                onClick={() => eliminarEtiqueta(etiqueta.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
