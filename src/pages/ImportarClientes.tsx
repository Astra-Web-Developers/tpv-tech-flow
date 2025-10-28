import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importarClientes } from "@/scripts/importClientes";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ImportarClientes() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: number } | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    setLoading(true);
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
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Importar Clientes</h1>
        <p className="text-muted-foreground mb-6">
          Esta herramienta importará los clientes desde el archivo Excel proporcionado.
          Se crearán los clientes y sus contratos de mantenimiento correspondientes.
        </p>

        <Button
          onClick={handleImport}
          disabled={loading}
          size="lg"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importando...
            </>
          ) : (
            "Iniciar Importación"
          )}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <p className="text-sm">
              ✅ Clientes importados: <strong>{result.imported}</strong>
            </p>
            <p className="text-sm">
              ❌ Errores: <strong>{result.errors}</strong>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
