import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, Calendar, AlertTriangle } from "lucide-react";

interface Contrato {
  id: string;
  tipo: string;
  fecha_alta: string;
  fecha_caducidad: string;
  activo: boolean;
  notas: string | null;
}

interface ContratosSectionProps {
  contratos: Contrato[];
}

export const ContratosSection = ({ contratos }: ContratosSectionProps) => {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle>Contratos de Mantenimiento</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {contratos.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No hay contratos registrados</p>
        ) : (
          <div className="space-y-3">
            {contratos.map((contrato) => {
              const fechaCaducidad = new Date(contrato.fecha_caducidad);
              const hoy = new Date();
              const diasRestantes = Math.ceil((fechaCaducidad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              const estaPorVencer = diasRestantes <= 30 && diasRestantes > 0;
              const estaVencido = diasRestantes <= 0;

              return (
                <div
                  key={contrato.id}
                  className={`p-4 border-2 rounded-lg ${
                    estaVencido
                      ? "border-red-300 bg-red-50"
                      : estaPorVencer
                        ? "border-orange-300 bg-orange-50"
                        : "border-green-300 bg-green-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{contrato.tipo}</p>
                      {contrato.notas && <p className="text-sm text-muted-foreground mt-1">{contrato.notas}</p>}
                    </div>
                    <Badge variant={contrato.activo ? "default" : "secondary"}>
                      {contrato.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Inicio</p>
                        <p className="font-medium">{new Date(contrato.fecha_alta).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Vencimiento</p>
                        <p
                          className={`font-medium ${
                            estaVencido ? "text-red-600" : estaPorVencer ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {fechaCaducidad.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {(estaPorVencer || estaVencido) && (
                    <div
                      className={`mt-3 flex items-center gap-2 px-3 py-2 rounded ${
                        estaVencido ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {estaVencido
                          ? `Vencido hace ${Math.abs(diasRestantes)} días`
                          : `Vence en ${diasRestantes} días`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
