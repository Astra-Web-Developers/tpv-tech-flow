-- Función para actualizar el tiempo total del ticket
CREATE OR REPLACE FUNCTION public.actualizar_tiempo_total_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calcular el tiempo total sumando todas las duraciones del historial
  UPDATE tickets
  SET tiempo_total_minutos = (
    SELECT COALESCE(SUM(duracion_minutos), 0)
    FROM historial_tiempo
    WHERE ticket_id = COALESCE(NEW.ticket_id, OLD.ticket_id)
      AND fin IS NOT NULL
  )
  WHERE id = COALESCE(NEW.ticket_id, OLD.ticket_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Crear trigger para INSERT y UPDATE en historial_tiempo
DROP TRIGGER IF EXISTS trigger_actualizar_tiempo_total ON public.historial_tiempo;
CREATE TRIGGER trigger_actualizar_tiempo_total
  AFTER INSERT OR UPDATE OR DELETE ON public.historial_tiempo
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_tiempo_total_ticket();