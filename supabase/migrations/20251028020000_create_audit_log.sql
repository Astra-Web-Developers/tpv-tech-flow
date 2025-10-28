-- Crear tabla de auditoría para registrar todas las acciones en el sistema
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_record_id ON audit_log(record_id);

-- Habilitar RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas: Los usuarios pueden ver sus propias acciones y los admins pueden ver todo
CREATE POLICY "Users can view their own audit logs"
  ON audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
  ON audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Solo el sistema puede insertar registros de auditoría
CREATE POLICY "System can insert audit logs"
  ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE audit_log IS 'Registro de auditoría de todas las acciones realizadas en el sistema';
COMMENT ON COLUMN audit_log.action IS 'Tipo de acción: INSERT, UPDATE, DELETE, VIEW, EXPORT, etc.';
COMMENT ON COLUMN audit_log.table_name IS 'Nombre de la tabla afectada';
COMMENT ON COLUMN audit_log.record_id IS 'ID del registro afectado';
COMMENT ON COLUMN audit_log.old_data IS 'Datos anteriores (para UPDATE y DELETE)';
COMMENT ON COLUMN audit_log.new_data IS 'Datos nuevos (para INSERT y UPDATE)';
