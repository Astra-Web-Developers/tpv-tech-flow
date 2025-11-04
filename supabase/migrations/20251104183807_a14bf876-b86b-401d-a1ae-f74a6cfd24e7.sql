-- Añadir nuevos campos a la tabla equipos
ALTER TABLE equipos
ADD COLUMN IF NOT EXISTS numero_serie_bdp TEXT,
ADD COLUMN IF NOT EXISTS numero_serie_wind TEXT,
ADD COLUMN IF NOT EXISTS numero_serie_store_manager TEXT,
ADD COLUMN IF NOT EXISTS numero_serie_cashlogy TEXT,
ADD COLUMN IF NOT EXISTS numero_serie_impresora TEXT,
ADD COLUMN IF NOT EXISTS contraseñas TEXT,
ADD COLUMN IF NOT EXISTS garantia_inicio DATE,
ADD COLUMN IF NOT EXISTS garantia_fin DATE;

-- Crear tabla para incidencias de equipos
CREATE TABLE IF NOT EXISTS incidencias_equipos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  incidencia TEXT NOT NULL,
  solucion TEXT,
  dentro_garantia BOOLEAN DEFAULT false,
  coste_reparacion NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en incidencias_equipos
ALTER TABLE incidencias_equipos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para incidencias_equipos
CREATE POLICY "Los usuarios pueden ver incidencias de equipos"
  ON incidencias_equipos FOR SELECT
  USING (true);

CREATE POLICY "Los usuarios pueden crear incidencias de equipos"
  ON incidencias_equipos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar incidencias de equipos"
  ON incidencias_equipos FOR UPDATE
  USING (true);

CREATE POLICY "Solo admins pueden eliminar incidencias de equipos"
  ON incidencias_equipos FOR DELETE
  USING (is_admin(auth.uid()));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_incidencias_equipos_updated_at
  BEFORE UPDATE ON incidencias_equipos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();