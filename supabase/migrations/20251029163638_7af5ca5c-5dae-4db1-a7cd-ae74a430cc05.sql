-- Crear tabla de etiquetas
CREATE TABLE public.etiquetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de relación clientes-etiquetas
CREATE TABLE public.clientes_etiquetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES public.etiquetas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, etiqueta_id)
);

-- Habilitar RLS
ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_etiquetas ENABLE ROW LEVEL SECURITY;

-- Políticas para etiquetas
CREATE POLICY "Los usuarios pueden ver etiquetas"
  ON public.etiquetas FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear etiquetas"
  ON public.etiquetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Solo admins pueden actualizar etiquetas"
  ON public.etiquetas FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden eliminar etiquetas"
  ON public.etiquetas FOR DELETE
  USING (is_admin(auth.uid()));

-- Políticas para clientes_etiquetas
CREATE POLICY "Los usuarios pueden ver relaciones cliente-etiqueta"
  ON public.clientes_etiquetas FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear relaciones cliente-etiqueta"
  ON public.clientes_etiquetas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Los usuarios pueden eliminar relaciones cliente-etiqueta"
  ON public.clientes_etiquetas FOR DELETE
  USING (true);

-- Índices para mejor rendimiento
CREATE INDEX idx_clientes_etiquetas_cliente ON public.clientes_etiquetas(cliente_id);
CREATE INDEX idx_clientes_etiquetas_etiqueta ON public.clientes_etiquetas(etiqueta_id);