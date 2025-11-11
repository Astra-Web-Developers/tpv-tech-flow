-- Crear tabla de etiquetas para tickets (separada de clientes)
CREATE TABLE IF NOT EXISTS etiquetas_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de etiquetas para clientes (separada de tickets)
CREATE TABLE IF NOT EXISTS etiquetas_clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migrar datos existentes de etiquetas a etiquetas_tickets
INSERT INTO etiquetas_tickets (id, nombre, color, created_at)
SELECT id, nombre, color, created_at
FROM etiquetas;

-- Actualizar la tabla de relación tickets_etiquetas para que apunte a etiquetas_tickets
-- Primero, eliminar la constraint existente si existe
ALTER TABLE tickets_etiquetas DROP CONSTRAINT IF EXISTS tickets_etiquetas_etiqueta_id_fkey;

-- Agregar nueva constraint que apunta a etiquetas_tickets
ALTER TABLE tickets_etiquetas
  ADD CONSTRAINT tickets_etiquetas_etiqueta_id_fkey
  FOREIGN KEY (etiqueta_id)
  REFERENCES etiquetas_tickets(id)
  ON DELETE CASCADE;

-- Crear tabla de relación para clientes_etiquetas si no existe
CREATE TABLE IF NOT EXISTS clientes_etiquetas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  etiqueta_id UUID NOT NULL REFERENCES etiquetas_clientes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(cliente_id, etiqueta_id)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_etiquetas_tickets_nombre ON etiquetas_tickets(nombre);
CREATE INDEX IF NOT EXISTS idx_etiquetas_clientes_nombre ON etiquetas_clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_etiquetas_cliente_id ON clientes_etiquetas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_etiquetas_etiqueta_id ON clientes_etiquetas(etiqueta_id);

-- Enable RLS
ALTER TABLE etiquetas_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiquetas_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_etiquetas ENABLE ROW LEVEL SECURITY;

-- RLS Policies para etiquetas_tickets
CREATE POLICY "Authenticated users can view ticket tags"
  ON etiquetas_tickets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert ticket tags"
  ON etiquetas_tickets FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ticket tags"
  ON etiquetas_tickets FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ticket tags"
  ON etiquetas_tickets FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies para etiquetas_clientes
CREATE POLICY "Authenticated users can view client tags"
  ON etiquetas_clientes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert client tags"
  ON etiquetas_clientes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update client tags"
  ON etiquetas_clientes FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete client tags"
  ON etiquetas_clientes FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies para clientes_etiquetas
CREATE POLICY "Authenticated users can view client-tag relations"
  ON clientes_etiquetas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert client-tag relations"
  ON clientes_etiquetas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete client-tag relations"
  ON clientes_etiquetas FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON etiquetas_tickets TO authenticated;
GRANT ALL ON etiquetas_clientes TO authenticated;
GRANT ALL ON clientes_etiquetas TO authenticated;

-- Comentar: NO eliminar la tabla etiquetas todavía para mantener compatibilidad
-- Se puede eliminar manualmente más tarde si es necesario
-- DROP TABLE IF EXISTS etiquetas;
