-- Agregar campos de avisos a la tabla clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS aviso_moroso BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS aviso_cobrar_antes TEXT;

-- Comentarios para documentar los campos
COMMENT ON COLUMN clientes.aviso_moroso IS 'Indica si el cliente tiene marcado el aviso de moroso';
COMMENT ON COLUMN clientes.aviso_cobrar_antes IS 'Texto libre para avisos como "cobrar antes de trabajar"';