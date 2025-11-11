import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, FileDown, Send, CheckCircle2 } from "lucide-react";
import { Ticket } from "@/types/cliente";
import { exportarHistorial, enviarHistorialEmail } from "@/utils/cliente/exportUtils";

interface TicketsHistorialProps {
  historialCompleto: Ticket[];
  ticketsAbiertos: Ticket[];
  nombreCliente: string;
  clienteId?: string;
}

export const TicketsHistorial = ({
  historialCompleto,
  ticketsAbiertos,
  nombreCliente,
  clienteId,
}: TicketsHistorialProps) => {
  const navigate = useNavigate();
  const [showAllTickets, setShowAllTickets] = useState(false);

  const handleExportar = () => {
    exportarHistorial(historialCompleto, ticketsAbiertos, nombreCliente, clienteId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle>Historial Completo de Tickets</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportar}>
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button size="sm" variant="outline" onClick={enviarHistorialEmail}>
              <Send className="h-4 w-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {historialCompleto.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay tickets registrados</p>
        ) : (
          <>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(showAllTickets ? historialCompleto : historialCompleto.slice(0, 10)).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      #{ticket.numero} - {ticket.titulo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.estado === "activo" ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Finalizado
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {historialCompleto.length > 10 && (
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => setShowAllTickets(!showAllTickets)}>
                  {showAllTickets ? "Mostrar menos" : `Mostrar todos (${historialCompleto.length})`}
                </Button>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{ticketsAbiertos.length}</p>
                  <p className="text-sm text-muted-foreground">Abiertos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {historialCompleto.filter((t) => t.estado === "finalizado").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Finalizados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{historialCompleto.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
