import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importarClientes, borrarTodosLosClientes, procesarArchivoExcel } from "@/scripts/importClientes";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function ImportarClientes() {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [lineasProcesadas, setLineasProcesadas] = useState<string[] | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: number; erroresDetalle?: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Archivo no válido",
        description: "Por favor selecciona un archivo Excel (.xlsx o .xls)",
        variant: "destructive",
      });
      return;
    }

    setArchivo(file);
    setResult(null);

    try {
      const lineas = await procesarArchivoExcel(file);
      setLineasProcesadas(lineas);
      toast({
        title: "Archivo cargado",
        description: `Se encontraron ${lineas.length} registros en el archivo.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo Excel",
        variant: "destructive",
      });
      setArchivo(null);
      setLineasProcesadas(null);
    }
  };

  const handleImport = async () => {
    if (!lineasProcesadas || lineasProcesadas.length === 0) {
      toast({
        title: "Error",
        description: "Por favor carga primero un archivo Excel",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await importarClientes(lineasProcesadas);
      setResult(res);
      toast({
        title: "Importación completada",
        description: `${res.imported} clientes importados con éxito. ${res.errors} errores.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error durante la importación",
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
            Sube tu archivo Excel con los datos de clientes y contratos de mantenimiento.
            El formato esperado: Fecha Alta; Fecha Caducidad; Nombre Persona; Nombre Negocio; Tipo Contrato
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Selector de archivo */}
          <div className="p-4 border-2 border-dashed rounded-lg">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer py-4"
            >
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {archivo ? archivo.name : "Click para seleccionar archivo Excel"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lineasProcesadas 
                  ? `${lineasProcesadas.length} registros encontrados` 
                  : "Formatos aceptados: .xlsx, .xls"}
              </p>
            </label>
          </div>

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
              disabled={loading || deleting || !lineasProcesadas}
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
            <p><strong>Paso 1:</strong> Carga tu archivo Excel (.xlsx o .xls)</p>
            <p><strong>Paso 2:</strong> Opcionalmente, borra todos los clientes existentes</p>
            <p><strong>Paso 3:</strong> Haz click en "Importar Clientes"</p>
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
