-- Eliminar políticas restrictivas problemáticas
DROP POLICY IF EXISTS "Los usuarios pueden crear tickets" ON public.tickets;
DROP POLICY IF EXISTS "Los técnicos ven solo sus tickets asignados" ON public.tickets;
DROP POLICY IF EXISTS "Los técnicos pueden actualizar sus tickets" ON public.tickets;
DROP POLICY IF EXISTS "Solo admins pueden eliminar tickets" ON public.tickets;

-- Crear políticas PERMISSIVE correctas para tickets
CREATE POLICY "Los usuarios autenticados pueden crear tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Los técnicos ven tickets asignados o todos si son admin"
ON public.tickets
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR has_role(auth.uid(), 'comercial'::app_role)
  OR EXISTS (
    SELECT 1 FROM tickets_tecnicos
    WHERE ticket_id = tickets.id 
    AND tecnico_id = auth.uid()
  )
);

CREATE POLICY "Los técnicos pueden actualizar tickets asignados o todos si son admin"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM tickets_tecnicos
    WHERE ticket_id = tickets.id 
    AND tecnico_id = auth.uid()
  )
);

CREATE POLICY "Solo admins pueden eliminar tickets"
ON public.tickets
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));