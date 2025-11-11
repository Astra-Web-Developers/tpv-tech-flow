import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DialogInactivacionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  motivoInactivacion: string;
  setMotivoInactivacion: (motivo: string) => void;
  onConfirmar: () => void;
}

export const DialogInactivacion = ({
  open,
  onOpenChange,
  motivoInactivacion,
  setMotivoInactivacion,
  onConfirmar,
}: DialogInactivacionProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archivar Cliente</DialogTitle>
          <DialogDescription>
            Por favor, indica el motivo por el cual estás archivando este cliente. Esta información se mostrará junto con el cliente inactivo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo de Inactivación</Label>
            <Textarea
              value={motivoInactivacion}
              onChange={(e) => setMotivoInactivacion(e.target.value)}
              placeholder="Ej: Cliente solicitó baja del servicio, incumplimiento de pagos, cierre del negocio, etc."
              rows={4}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onOpenChange(false);
                setMotivoInactivacion("");
              }}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirmar}
              variant="destructive"
              className="flex-1"
            >
              Archivar Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
