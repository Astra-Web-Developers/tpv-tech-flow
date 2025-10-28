-- Agregar columnas faltantes a la tabla clientes
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS fecha_alta_cliente date,
ADD COLUMN IF NOT EXISTS selector_fiscal text,
ADD COLUMN IF NOT EXISTS informacion_destacada text,
ADD COLUMN IF NOT EXISTS notas_especiales text,
ADD COLUMN IF NOT EXISTS notas_adicionales text,
ADD COLUMN IF NOT EXISTS nombre_asesoria text,
ADD COLUMN IF NOT EXISTS telefono_asesoria text,
ADD COLUMN IF NOT EXISTS persona_contacto_asesoria text,
ADD COLUMN IF NOT EXISTS r_iva text,
ADD COLUMN IF NOT EXISTS epigrafe text;