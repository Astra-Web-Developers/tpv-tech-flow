import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, MessageCircle, Download } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { Card } from "@/components/ui/card";

interface DialogoFirmaTicketProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
  cliente: any;
}

export const DialogoFirmaTicket = ({
  open,
  onOpenChange,
  ticket,
  cliente,
}: DialogoFirmaTicketProps) => {
  const [loading, setLoading] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const sigCanvas = useRef<any>(null);

  const limpiarFirma = () => {
    sigCanvas.current?.clear();
  };

  const habilitarEdicion = () => {
    setModoEdicion(true);
    // Limpiar el canvas para permitir una nueva firma
    setTimeout(() => {
      sigCanvas.current?.clear();
    }, 100);
  };

  // Resetear el modo de edición cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setModoEdicion(false);
    }
  }, [open]);

  const guardarFirma = async () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Por favor firma antes de guardar");
      return;
    }

    setLoading(true);
    try {
      const firmaDataUrl = sigCanvas.current?.toDataURL();

      const { error } = await supabase
        .from("tickets")
        .update({
          firma_cliente: firmaDataUrl,
          fecha_firma: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      if (error) throw error;

      toast.success("Firma guardada correctamente");
      setModoEdicion(false);
      onOpenChange(false);
      // Recargar la página para mostrar la firma actualizada
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar firma:", error);
      toast.error("Error al guardar la firma");
    } finally {
      setLoading(false);
    }
  };

  const enviarPorWhatsApp = () => {
    if (!cliente?.telefono) {
      toast.error("El cliente no tiene un número de teléfono registrado");
      return;
    }

    const mensaje = `
Ticket #${ticket.numero} - ${ticket.titulo}

Estado: Finalizado
Solución: ${ticket.solucion || "Sin especificar"}

Gracias por su confianza.
    `.trim();

    const url = `https://wa.me/${cliente.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    toast.success("Abriendo WhatsApp...");
  };

  const enviarPorEmail = () => {
    if (!cliente?.email) {
      toast.error("El cliente no tiene un email registrado");
      return;
    }

    const asunto = `Ticket #${ticket.numero} - Finalizado`;
    const cuerpo = `
Estimado/a cliente,

Le informamos que el ticket #${ticket.numero} - ${ticket.titulo} ha sido finalizado.

Solución aplicada:
${ticket.solucion || "Sin especificar"}

Gracias por su confianza.

Saludos cordiales.
    `.trim();

    window.location.href = `mailto:${cliente.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    toast.success("Abriendo cliente de correo...");
  };

  const descargarResumen = () => {
    const contenido = `
RESUMEN DE TICKET
==================

Número: #${ticket.numero}
Título: ${ticket.titulo}
Estado: Finalizado
Fecha de cierre: ${ticket.fecha_finalizacion ? new Date(ticket.fecha_finalizacion).toLocaleString() : "N/A"}

Cliente: ${cliente?.nombre || "Sin cliente"}
${cliente?.email ? `Email: ${cliente.email}` : ""}
${cliente?.telefono ? `Teléfono: ${cliente.telefono}` : ""}

SOLUCIÓN APLICADA
==================
${ticket.solucion || "Sin especificar"}

Firmado electrónicamente el: ${ticket.fecha_firma ? new Date(ticket.fecha_firma).toLocaleString() : "Pendiente de firma"}
    `.trim();

    const blob = new Blob([contenido], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.numero}-resumen.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resumen descargado");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Firma del Cliente</DialogTitle>
          <DialogDescription>
            El cliente puede firmar el ticket y enviarlo por WhatsApp o Email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del ticket */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Ticket:</span>
                <span>#{ticket.numero} - {ticket.titulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Cliente:</span>
                <span>{cliente?.nombre || "Sin cliente"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Estado:</span>
                <span className="text-green-600 font-semibold">Finalizado</span>
              </div>
            </div>
          </Card>

          {/* Solución */}
          {ticket.solucion && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Solución aplicada:</h4>
              <Card className="p-4 bg-muted/30">
                <p className="text-sm whitespace-pre-wrap">{ticket.solucion}</p>
              </Card>
            </div>
          )}

          {/* Canvas de firma o firma guardada */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Firma del cliente:</h4>
              {(!ticket.firma_cliente || modoEdicion) && (
                <Button variant="outline" size="sm" onClick={limpiarFirma}>
                  Limpiar
                </Button>
              )}
            </div>
            <Card className="p-2 bg-white">
              {ticket.firma_cliente && !modoEdicion ? (
                <div className="relative w-full">
                  <img
                    src={ticket.firma_cliente}
                    alt="Firma del cliente"
                    className="w-full h-[200px] object-contain border border-border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={habilitarEdicion}
                    className="mt-2 w-full"
                  >
                    Editar Firma
                  </Button>
                </div>
              ) : (
                <SignatureCanvas
                  ref={sigCanvas}
                  canvasProps={{
                    className: "w-full h-[200px] border border-border rounded",
                  }}
                  backgroundColor="white"
                />
              )}
            </Card>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            {(!ticket.firma_cliente || modoEdicion) && (
              <Button onClick={guardarFirma} disabled={loading} className="w-full">
                {loading ? "Guardando..." : "Guardar Firma"}
              </Button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={enviarPorWhatsApp} disabled={!cliente?.telefono}>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={enviarPorEmail} disabled={!cliente?.email}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" onClick={descargarResumen}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
