import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Equipo, NuevoEquipo } from "@/types/cliente";

export const useEquipos = (clienteId: string | undefined) => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoConfigs, setEquipoConfigs] = useState<Record<string, string[]>>({});

  const loadEquipos = async () => {
    try {
      const { data, error } = await supabase
        .from("equipos")
        .select("*")
        .eq("cliente_id", clienteId)
        .eq("activo", true)
        .order("fecha_instalacion", { ascending: false });

      if (error) throw error;
      setEquipos(data || []);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    }
  };

  const loadEquipoConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("configuracion")
        .select("clave, valor")
        .like("clave", "equipo_opciones_%");

      if (error) throw error;

      const configs: Record<string, string[]> = {};
      data?.forEach((config) => {
        const key = config.clave.replace("equipo_opciones_", "");
        configs[key] = config.valor ? config.valor.split(",").map(v => v.trim()) : [];
      });
      setEquipoConfigs(configs);
    } catch (error) {
      console.error("Error cargando configuración de equipos:", error);
    }
  };

  const agregarEquipo = async (nuevoEquipo: NuevoEquipo) => {
    try {
      const { error } = await supabase.from("equipos").insert([
        {
          cliente_id: clienteId,
          ...nuevoEquipo,
          fecha_instalacion: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success("Equipo agregado");
      await loadEquipos();
      return true;
    } catch (error: any) {
      console.error("Error agregando equipo:", error);
      toast.error(error.message || "Error al agregar equipo");
      return false;
    }
  };

  return {
    equipos,
    equipoConfigs,
    loadEquipos,
    loadEquipoConfigs,
    agregarEquipo,
  };
};
