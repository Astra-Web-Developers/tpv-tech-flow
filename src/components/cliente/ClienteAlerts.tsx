import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  estado: string;
  fecha_creacion: string;
}

interface ClienteAlertsProps {
  clienteActivo: boolean;
  motivoInactivacion: string | null;
  ticketsAbiertos: Ticket[];
  clienteId: string;
}

export const ClienteAlerts = ({
  clienteActivo,
  motivoInactivacion,
  ticketsAbiertos,
  clienteId,
}: ClienteAlertsProps) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Alerta Cliente Archivado */}
      {!clienteActivo && (
        <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 dark:text-orange-100">Cliente Archivado</p>
                <p className="text-sm text-orange-700 dark:text-orange-200">
                  Este cliente está inactivo. Puedes reactivarlo usando el botón en la parte superior.
                </p>
                {motivoInactivacion && (
                  <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900 rounded border border-orange-300 dark:border-orange-700">
                    <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">Motivo de inactivación:</p>
                    <p className="text-sm text-orange-800 dark:text-orange-200">{motivoInactivacion}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tickets Abiertos */}
      {ticketsAbiertos.length > 0 && (
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Tickets Abiertos ({ticketsAbiertos.length})</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/tickets/nuevo?cliente=${clienteId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ticket
              </Button>
            </div>
            <div className="space-y-2">
              {ticketsAbiertos.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-white border-2 border-blue-300 rounded-lg hover:shadow-md cursor-pointer transition-all"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">
                      #{ticket.numero} - {ticket.titulo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Creado: {new Date(ticket.fecha_creacion).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className="bg-blue-600">ACTIVO</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
