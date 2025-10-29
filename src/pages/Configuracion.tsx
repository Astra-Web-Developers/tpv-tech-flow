import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

const EQUIPO_CONFIG_KEYS = [
  { key: "equipo_opciones_tpv", label: "Opciones TPV" },
  { key: "equipo_opciones_ram", label: "Opciones RAM" },
  { key: "equipo_opciones_impresora", label: "Opciones Impresora" },
  { key: "equipo_opciones_software", label: "Opciones Software" },
  { key: "equipo_opciones_wind", label: "Opciones Sistema Operativo" },
  { key: "equipo_opciones_tbai", label: "Opciones TBAI" },
  { key: "equipo_opciones_c_inteligente", label: "Opciones Caja Inteligente" },
  { key: "equipo_opciones_pendrive_c_seg", label: "Opciones Pendrive C.Seg" },
];

export default function Configuracion() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("configuracion")
        .select("*")
        .in("clave", EQUIPO_CONFIG_KEYS.map(k => k.key));

      if (error) throw error;

      const configMap: Record<string, string> = {};
      data?.forEach((config) => {
        configMap[config.clave] = config.valor || "";
      });
      setConfigs(configMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const { key } of EQUIPO_CONFIG_KEYS) {
        const { error } = await supabase
          .from("configuracion")
          .upsert({
            clave: key,
            valor: configs[key] || "",
            descripcion: EQUIPO_CONFIG_KEYS.find(k => k.key === key)?.label || "",
          }, {
            onConflict: "clave",
          });

        if (error) throw error;
      }

      toast({
        title: "Éxito",
        description: "Configuraciones guardadas correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración de Equipos</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las opciones disponibles para los campos de equipos. Separa las opciones con comas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opciones de Campos</CardTitle>
          <CardDescription>
            Define las opciones que aparecerán en los desplegables al agregar o editar equipos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {EQUIPO_CONFIG_KEYS.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={configs[key] || ""}
                onChange={(e) => setConfigs({ ...configs, [key]: e.target.value })}
                placeholder="Opción1,Opción2,Opción3"
              />
              <p className="text-xs text-muted-foreground">
                Separa las opciones con comas. Ejemplo: 4GB,8GB,16GB
              </p>
            </div>
          ))}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
