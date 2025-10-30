-- Agregar campos para cierre de tickets
ALTER TABLE tickets
ADD COLUMN IF NOT EXISTS tecnico_cierre_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS solucion text,
ADD COLUMN IF NOT EXISTS firma_cliente text,
ADD COLUMN IF NOT EXISTS fecha_firma timestamp with time zone;