-- Actualizar política de SELECT para que los usuarios puedan ver tickets que crearon
DROP POLICY IF EXISTS "Los técnicos ven tickets asignados o todos si son admin" ON tickets;

CREATE POLICY "Los usuarios ven sus tickets creados, asignados o todos si son admin"
ON tickets
FOR SELECT
USING (
  auth.uid() = created_by OR
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'comercial') OR 
  EXISTS (
    SELECT 1 
    FROM tickets_tecnicos 
    WHERE tickets_tecnicos.ticket_id = tickets.id 
    AND tickets_tecnicos.tecnico_id = auth.uid()
  )
);

-- Actualizar política de UPDATE para que los creadores también puedan actualizar
DROP POLICY IF EXISTS "Los técnicos pueden actualizar tickets asignados o todos si so" ON tickets;

CREATE POLICY "Los usuarios pueden actualizar sus tickets o asignados"
ON tickets
FOR UPDATE
USING (
  auth.uid() = created_by OR
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 
    FROM tickets_tecnicos 
    WHERE tickets_tecnicos.ticket_id = tickets.id 
    AND tickets_tecnicos.tecnico_id = auth.uid()
  )
);