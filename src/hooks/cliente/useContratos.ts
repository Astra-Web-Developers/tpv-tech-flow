import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contrato, NuevoContrato } from "@/types/cliente";

export const useContratos = (clienteId: string | undefined) => {
  const [contratos, setContratos] = useState<Contrato[]>([]);

  const loadContratos = async () => {
    try {
      const { data, error } = await supabase
        .from("contratos_mantenimiento")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("fecha_alta", { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (error) {
      console.error("Error cargando contratos:", error);
    }
  };

  const guardarContrato = async (
    nuevoContrato: NuevoContrato,
    contratoEditando: Contrato | null
  ) => {
    if (!nuevoContrato.tipo || !nuevoContrato.fecha_alta || !nuevoContrato.fecha_caducidad) {
      toast.error("Completa todos los campos obligatorios");
      return false;
    }

    try {
      if (contratoEditando) {
        // Actualizar contrato existente
        const { error } = await supabase
          .from("contratos_mantenimiento")
          .update({
            tipo: nuevoContrato.tipo,
            fecha_alta: nuevoContrato.fecha_alta,
            fecha_caducidad: nuevoContrato.fecha_caducidad,
            notas: nuevoContrato.notas,
          })
          .eq("id", contratoEditando.id);

        if (error) throw error;
        toast.success("Contrato actualizado");
      } else {
        // Crear nuevo contrato
        const { error } = await supabase.from("contratos_mantenimiento").insert([
          {
            cliente_id: clienteId,
            tipo: nuevoContrato.tipo,
            fecha_alta: nuevoContrato.fecha_alta,
            fecha_caducidad: nuevoContrato.fecha_caducidad,
            notas: nuevoContrato.notas,
            activo: true,
          },
        ]);

        if (error) throw error;
        toast.success("Contrato agregado");
      }

      await loadContratos();
      return true;
    } catch (error: any) {
      console.error("Error guardando contrato:", error);
      toast.error(error.message || "Error al guardar contrato");
      return false;
    }
  };

  const eliminarContrato = async (contratoId: string) => {
    if (!confirm("¿Estás seguro de eliminar este contrato?")) return false;

    try {
      const { error } = await supabase
        .from("contratos_mantenimiento")
        .update({ activo: false })
        .eq("id", contratoId);

      if (error) throw error;
      toast.success("Contrato eliminado");
      await loadContratos();
      return true;
    } catch (error: any) {
      console.error("Error eliminando contrato:", error);
      toast.error(error.message || "Error al eliminar contrato");
      return false;
    }
  };

  return {
    contratos,
    loadContratos,
    guardarContrato,
    eliminarContrato,
  };
};
