-- Crear tabla de relación entre tickets y etiquetas
CREATE TABLE IF NOT EXISTS public.tickets_etiquetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES public.etiquetas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id, etiqueta_id)
);

-- Habilitar RLS
ALTER TABLE public.tickets_etiquetas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Los usuarios pueden ver etiquetas de tickets"
  ON public.tickets_etiquetas
  FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear etiquetas de tickets"
  ON public.tickets_etiquetas
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Los usuarios pueden eliminar etiquetas de tickets"
  ON public.tickets_etiquetas
  FOR DELETE
  USING (true);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_tickets_etiquetas_ticket_id ON public.tickets_etiquetas(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_etiquetas_etiqueta_id ON public.tickets_etiquetas(etiqueta_id);