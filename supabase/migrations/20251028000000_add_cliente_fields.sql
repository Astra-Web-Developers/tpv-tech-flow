-- Add new fields to clientes table
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS persona_contacto TEXT,
ADD COLUMN IF NOT EXISTS nombre_fiscal TEXT,
ADD COLUMN IF NOT EXISTS nombre_encargado TEXT,
ADD COLUMN IF NOT EXISTS telefono_encargado TEXT;

-- Add comments to describe the new columns
COMMENT ON COLUMN clientes.logo_url IS 'URL del logo de la empresa';
COMMENT ON COLUMN clientes.persona_contacto IS 'Nombre de la persona de contacto principal';
COMMENT ON COLUMN clientes.nombre_fiscal IS 'Razón social o nombre fiscal de la empresa';
COMMENT ON COLUMN clientes.nombre_encargado IS 'Nombre del encargado o responsable';
COMMENT ON COLUMN clientes.telefono_encargado IS 'Teléfono del encargado';
