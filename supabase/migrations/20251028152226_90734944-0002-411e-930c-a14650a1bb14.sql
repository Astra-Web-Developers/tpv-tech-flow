-- Agregar todas las columnas faltantes a la tabla clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS persona_contacto text,
ADD COLUMN IF NOT EXISTS nombre_fiscal text,
ADD COLUMN IF NOT EXISTS nombre_encargado text,
ADD COLUMN IF NOT EXISTS telefono_encargado text,
ADD COLUMN IF NOT EXISTS tiene_contrato_mantenimiento boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tipo_contrato text,
ADD COLUMN IF NOT EXISTS fecha_alta_contrato date,
ADD COLUMN IF NOT EXISTS fecha_caducidad_contrato date;