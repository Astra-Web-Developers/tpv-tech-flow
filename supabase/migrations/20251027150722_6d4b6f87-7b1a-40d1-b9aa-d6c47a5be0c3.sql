-- Crear enum para roles de usuario
CREATE TYPE public.app_role AS ENUM ('admin', 'tecnico', 'comercial', 'proveedor');

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función de seguridad para verificar roles (evita recursión RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Función para verificar si es admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  telefono TEXT,
  foto_url TEXT,
  especialidades TEXT[],
  activo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Tabla de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  cif TEXT,
  telefono TEXT,
  email TEXT,
  direccion TEXT,
  codigo_postal TEXT,
  poblacion TEXT,
  provincia TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla de equipos de clientes
CREATE TABLE public.equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL, -- TPV, Cash Guard, Balanza, Impresora, etc.
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  fecha_instalacion DATE,
  notas TEXT,
  activo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.equipos ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON public.equipos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla de tickets
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero SERIAL UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'eliminado')),
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  fecha_creacion TIMESTAMPTZ DEFAULT now() NOT NULL,
  fecha_finalizacion TIMESTAMPTZ,
  tiempo_total_minutos INTEGER DEFAULT 0 NOT NULL,
  motivo_eliminacion TEXT,
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabla de asignación de técnicos a tickets
CREATE TABLE public.tickets_tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  tecnico_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asignado_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (ticket_id, tecnico_id)
);

ALTER TABLE public.tickets_tecnicos ENABLE ROW LEVEL SECURITY;

-- Tabla de materiales usados en tickets
CREATE TABLE public.materiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;

-- Tabla de historial de tiempo trabajado
CREATE TABLE public.historial_tiempo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  tecnico_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inicio TIMESTAMPTZ NOT NULL,
  fin TIMESTAMPTZ,
  duracion_minutos INTEGER,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.historial_tiempo ENABLE ROW LEVEL SECURITY;

-- Trigger para calcular duración automáticamente
CREATE OR REPLACE FUNCTION public.calcular_duracion_tiempo()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.fin IS NOT NULL AND NEW.inicio IS NOT NULL THEN
    NEW.duracion_minutos = EXTRACT(EPOCH FROM (NEW.fin - NEW.inicio)) / 60;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_time_duration
  BEFORE INSERT OR UPDATE ON public.historial_tiempo
  FOR EACH ROW EXECUTE FUNCTION public.calcular_duracion_tiempo();

-- Políticas RLS para user_roles (solo admins pueden gestionar)
CREATE POLICY "Los usuarios pueden ver sus propios roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Solo admins pueden insertar roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden actualizar roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden eliminar roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para profiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Solo admins pueden eliminar perfiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para clientes
CREATE POLICY "Los usuarios autenticados pueden ver clientes"
  ON public.clientes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden crear clientes"
  ON public.clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar clientes"
  ON public.clientes FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Solo admins pueden eliminar clientes"
  ON public.clientes FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para equipos
CREATE POLICY "Los usuarios autenticados pueden ver equipos"
  ON public.equipos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden gestionar equipos"
  ON public.equipos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para tickets
CREATE POLICY "Los técnicos ven solo sus tickets asignados"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'comercial') OR
    EXISTS (
      SELECT 1 FROM public.tickets_tecnicos
      WHERE ticket_id = tickets.id AND tecnico_id = auth.uid()
    )
  );

CREATE POLICY "Los usuarios pueden crear tickets"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Los técnicos pueden actualizar sus tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tickets_tecnicos
      WHERE ticket_id = tickets.id AND tecnico_id = auth.uid()
    )
  );

CREATE POLICY "Solo admins pueden eliminar tickets"
  ON public.tickets FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Políticas RLS para tickets_tecnicos
CREATE POLICY "Los usuarios pueden ver asignaciones"
  ON public.tickets_tecnicos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Los usuarios pueden gestionar asignaciones"
  ON public.tickets_tecnicos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas RLS para materiales
CREATE POLICY "Los técnicos pueden ver materiales de sus tickets"
  ON public.materiales FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tickets_tecnicos tt
      WHERE tt.ticket_id = materiales.ticket_id AND tt.tecnico_id = auth.uid()
    )
  );

CREATE POLICY "Los técnicos pueden gestionar materiales"
  ON public.materiales FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets_tecnicos tt
      WHERE tt.ticket_id = materiales.ticket_id AND tt.tecnico_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets_tecnicos tt
      WHERE tt.ticket_id = materiales.ticket_id AND tt.tecnico_id = auth.uid()
    )
  );

-- Políticas RLS para historial_tiempo
CREATE POLICY "Los técnicos pueden ver su historial"
  ON public.historial_tiempo FOR SELECT
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR
    tecnico_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tickets_tecnicos tt
      WHERE tt.ticket_id = historial_tiempo.ticket_id AND tt.tecnico_id = auth.uid()
    )
  );

CREATE POLICY "Los técnicos pueden crear su historial"
  ON public.historial_tiempo FOR INSERT
  TO authenticated
  WITH CHECK (tecnico_id = auth.uid());

CREATE POLICY "Los técnicos pueden actualizar su historial"
  ON public.historial_tiempo FOR UPDATE
  TO authenticated
  USING (tecnico_id = auth.uid());

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_tickets_cliente ON public.tickets(cliente_id);
CREATE INDEX idx_tickets_estado ON public.tickets(estado);
CREATE INDEX idx_tickets_fecha ON public.tickets(fecha_creacion DESC);
CREATE INDEX idx_tickets_tecnicos_ticket ON public.tickets_tecnicos(ticket_id);
CREATE INDEX idx_tickets_tecnicos_tecnico ON public.tickets_tecnicos(tecnico_id);
CREATE INDEX idx_materiales_ticket ON public.materiales(ticket_id);
CREATE INDEX idx_historial_tiempo_ticket ON public.historial_tiempo(ticket_id);
CREATE INDEX idx_historial_tiempo_tecnico ON public.historial_tiempo(tecnico_id);
CREATE INDEX idx_equipos_cliente ON public.equipos(cliente_id);