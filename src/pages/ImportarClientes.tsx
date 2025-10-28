import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importarClientes, borrarTodosLosClientes } from "@/scripts/importClientes";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ImportarClientes() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: number; erroresDetalle?: string[] } | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar TODOS los clientes y sus contratos? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    try {
      const success = await borrarTodosLosClientes();
      if (success) {
        toast({
          title: "Clientes borrados",
          description: "Todos los clientes y contratos han sido eliminados exitosamente.",
        });
        setResult(null);
      } else {
        toast({
          title: "Error",
          description: "Hubo un error al borrar los clientes",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al borrar los clientes",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await importarClientes();
      setResult(res);
      toast({
        title: "Importación completada",
        description: `${res.imported} clientes importados con éxito. ${res.errors} errores.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error durante la importación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Importar Clientes desde Excel</h1>
        
        <Alert className="mb-6">
          <AlertDescription>
            Esta herramienta importará los clientes desde el archivo Excel (cm_SERVISA.xlsx).
            Se crearán los clientes y sus contratos de mantenimiento correspondientes.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              onClick={handleDelete}
              disabled={deleting || loading}
              variant="destructive"
              className="flex-1"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Borrando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Borrar Todos los Clientes
                </>
              )}
            </Button>

            <Button
              onClick={handleImport}
              disabled={loading || deleting}
              size="lg"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Clientes
                </>
              )}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Paso 1:</strong> Borra todos los clientes existentes (opcional)</p>
            <p><strong>Paso 2:</strong> Importa los clientes del Excel</p>
          </div>
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Resultado de la Importación:</h3>
              <p className="text-sm">
                ✅ Clientes importados: <strong className="text-green-600">{result.imported}</strong>
              </p>
              <p className="text-sm">
                ❌ Errores: <strong className="text-red-600">{result.errors}</strong>
              </p>
            </div>

            {result.erroresDetalle && result.erroresDetalle.length > 0 && (
              <div className="p-4 bg-destructive/10 rounded-lg max-h-64 overflow-y-auto">
                <h4 className="font-semibold mb-2 text-destructive">Detalles de errores:</h4>
                <ul className="text-xs space-y-1">
                  {result.erroresDetalle.slice(0, 20).map((error, i) => (
                    <li key={i} className="text-muted-foreground">• {error}</li>
                  ))}
                  {result.erroresDetalle.length > 20 && (
                    <li className="text-muted-foreground">... y {result.erroresDetalle.length - 20} errores más</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
