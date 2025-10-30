import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DialogoCerrarTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  onTicketCerrado: () => void;
}

export const DialogoCerrarTicket = ({
  open,
  onOpenChange,
  ticketId,
  onTicketCerrado,
}: DialogoCerrarTicketProps) => {
  const [tecnicoId, setTecnicoId] = useState("");
  const [solucion, setSolucion] = useState("");
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar técnicos al abrir el diálogo
  const cargarTecnicos = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, nombre, apellidos")
      .eq("activo", true);
    
    setTecnicos(data || []);
  };

  const handleCerrar = async () => {
    if (!tecnicoId || !solucion.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("tickets")
        .update({
          estado: "finalizado",
          tecnico_cierre_id: tecnicoId,
          solucion: solucion,
          fecha_finalizacion: new Date().toISOString(),
        })
        .eq("id", ticketId);

      if (error) throw error;

      toast.success("Ticket cerrado exitosamente");
      onTicketCerrado();
      onOpenChange(false);
      setSolucion("");
      setTecnicoId("");
    } catch (error) {
      console.error("Error al cerrar ticket:", error);
      toast.error("Error al cerrar el ticket");
    } finally {
      setLoading(false);
    }
  };

  // Cargar técnicos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarTecnicos();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cerrar Ticket</DialogTitle>
          <DialogDescription>
            Completa la información necesaria para cerrar el ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tecnico">Técnico que cierra *</Label>
            <Select value={tecnicoId} onValueChange={setTecnicoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un técnico" />
              </SelectTrigger>
              <SelectContent>
                {tecnicos.map((tecnico) => (
                  <SelectItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre} {tecnico.apellidos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solucion">Solución aplicada *</Label>
            <Textarea
              id="solucion"
              placeholder="Describe la solución aplicada al problema..."
              value={solucion}
              onChange={(e) => setSolucion(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCerrar} disabled={loading}>
            {loading ? "Cerrando..." : "Cerrar Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
