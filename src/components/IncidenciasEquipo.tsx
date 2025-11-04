import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Wrench } from "lucide-react";
import { toast } from "sonner";

interface Incidencia {
  id: string;
  fecha: string;
  incidencia: string;
  solucion: string | null;
  dentro_garantia: boolean;
  coste_reparacion: number | null;
}

interface IncidenciasEquipoProps {
  equipoId: string;
}

export function IncidenciasEquipo({ equipoId }: IncidenciasEquipoProps) {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [nuevaIncidencia, setNuevaIncidencia] = useState({
    fecha: new Date().toISOString().split("T")[0],
    incidencia: "",
    solucion: "",
    dentro_garantia: false,
    coste_reparacion: "",
  });

  useEffect(() => {
    loadIncidencias();
  }, [equipoId]);

  const loadIncidencias = async () => {
    try {
      const { data, error } = await supabase
        .from("incidencias_equipos")
        .select("*")
        .eq("equipo_id", equipoId)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setIncidencias(data || []);
    } catch (error: any) {
      console.error("Error cargando incidencias:", error);
    }
  };

  const agregarIncidencia = async () => {
    if (!nuevaIncidencia.incidencia.trim()) {
      toast.error("La descripción de la incidencia es obligatoria");
      return;
    }

    try {
      const { error } = await supabase.from("incidencias_equipos").insert([
        {
          equipo_id: equipoId,
          fecha: nuevaIncidencia.fecha,
          incidencia: nuevaIncidencia.incidencia,
          solucion: nuevaIncidencia.solucion || null,
          dentro_garantia: nuevaIncidencia.dentro_garantia,
          coste_reparacion: nuevaIncidencia.coste_reparacion
            ? parseFloat(nuevaIncidencia.coste_reparacion)
            : null,
        },
      ]);

      if (error) throw error;

      toast.success("Incidencia registrada");
      setNuevaIncidencia({
        fecha: new Date().toISOString().split("T")[0],
        incidencia: "",
        solucion: "",
        dentro_garantia: false,
        coste_reparacion: "",
      });
      setDialogOpen(false);
      loadIncidencias();
    } catch (error: any) {
      console.error("Error agregando incidencia:", error);
      toast.error(error.message || "Error al agregar incidencia");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Incidencias del Equipo
        </h4>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Incidencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Incidencia</DialogTitle>
              <DialogDescription>
                Añade una nueva incidencia del equipo
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={nuevaIncidencia.fecha}
                  onChange={(e) =>
                    setNuevaIncidencia({ ...nuevaIncidencia, fecha: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Incidencia</Label>
                <Textarea
                  value={nuevaIncidencia.incidencia}
                  onChange={(e) =>
                    setNuevaIncidencia({
                      ...nuevaIncidencia,
                      incidencia: e.target.value,
                    })
                  }
                  placeholder="Describe la incidencia..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Solución</Label>
                <Textarea
                  value={nuevaIncidencia.solucion}
                  onChange={(e) =>
                    setNuevaIncidencia({ ...nuevaIncidencia, solucion: e.target.value })
                  }
                  placeholder="Describe la solución aplicada..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="dentro-garantia"
                  checked={nuevaIncidencia.dentro_garantia}
                  onCheckedChange={(checked) =>
                    setNuevaIncidencia({
                      ...nuevaIncidencia,
                      dentro_garantia: checked,
                    })
                  }
                />
                <Label htmlFor="dentro-garantia">Dentro de garantía</Label>
              </div>

              <div className="space-y-2">
                <Label>Coste de reparación (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={nuevaIncidencia.coste_reparacion}
                  onChange={(e) =>
                    setNuevaIncidencia({
                      ...nuevaIncidencia,
                      coste_reparacion: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <Button onClick={agregarIncidencia} className="w-full">
                Registrar Incidencia
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {incidencias.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay incidencias registradas
        </p>
      ) : (
        <div className="space-y-3">
          {incidencias.map((incidencia) => (
            <div
              key={incidencia.id}
              className="p-3 border rounded-lg space-y-2 bg-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {new Date(incidencia.fecha).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {incidencia.dentro_garantia && (
                    <Badge variant="secondary" className="text-xs">
                      En Garantía
                    </Badge>
                  )}
                  {incidencia.coste_reparacion !== null && (
                    <Badge variant="outline" className="text-xs">
                      {incidencia.coste_reparacion.toFixed(2)} €
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">Incidencia:</span>{" "}
                  {incidencia.incidencia}
                </p>
                {incidencia.solucion && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Solución:</span>{" "}
                    {incidencia.solucion}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
