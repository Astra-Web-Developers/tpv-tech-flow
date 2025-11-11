import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Ticket } from "@/types/cliente";

export const useTickets = (clienteId: string | undefined) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsAbiertos, setTicketsAbiertos] = useState<Ticket[]>([]);
  const [historialCompleto, setHistorialCompleto] = useState<Ticket[]>([]);

  const loadTickets = async () => {
    try {
      // Cargar tickets abiertos
      const { data: abiertos, error: errorAbiertos } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", clienteId)
        .eq("estado", "activo")
        .order("fecha_creacion", { ascending: false });

      if (errorAbiertos) throw errorAbiertos;
      setTicketsAbiertos(abiertos || []);

      // Cargar historial completo
      const { data: completo, error: errorCompleto } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", clienteId)
        .order("fecha_creacion", { ascending: false });

      if (errorCompleto) throw errorCompleto;
      setHistorialCompleto(completo || []);

      // Cargar tickets recientes para la sección existente
      const { data, error } = await supabase
        .from("tickets")
        .select("id, numero, titulo, estado, fecha_creacion")
        .eq("cliente_id", clienteId)
        .order("fecha_creacion", { ascending: false })
        .limit(5);

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    }
  };

  return {
    tickets,
    ticketsAbiertos,
    historialCompleto,
    loadTickets,
  };
};
