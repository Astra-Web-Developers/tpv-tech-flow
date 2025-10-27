-- Crear secuencia primero
CREATE SEQUENCE ventas_numero_seq START 1;

-- Crear tabla de furgonetas
CREATE TABLE public.furgonetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  anio INTEGER,
  ultima_itv DATE,
  proxima_itv DATE,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'asignada', 'en_mantenimiento')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de asignaciones de furgonetas
CREATE TABLE public.asignaciones_furgonetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  furgoneta_id UUID NOT NULL REFERENCES public.furgonetas(id) ON DELETE CASCADE,
  tecnico_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  motivo TEXT,
  hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  hora_fin TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de mantenimientos de furgonetas
CREATE TABLE public.mantenimientos_furgonetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  furgoneta_id UUID NOT NULL REFERENCES public.furgonetas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  taller TEXT,
  descripcion TEXT NOT NULL,
  costo NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de material de furgonetas
CREATE TABLE public.material_furgonetas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  furgoneta_id UUID NOT NULL REFERENCES public.furgonetas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de ventas/referencias
CREATE TABLE public.ventas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL DEFAULT nextval('ventas_numero_seq'::regclass),
  cliente_id UUID REFERENCES public.clientes(id),
  tecnico_id UUID REFERENCES public.profiles(id),
  telefono_contacto TEXT,
  email TEXT,
  fecha DATE NOT NULL,
  fecha_entrega DATE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completada', 'cancelada')),
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'bizum', 'transferencia')),
  subtotal NUMERIC(10, 2) DEFAULT 0,
  iva NUMERIC(10, 2) DEFAULT 0,
  descuento NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) DEFAULT 0,
  notas TEXT,
  seguimiento TEXT DEFAULT 'contactado' CHECK (seguimiento IN ('contactado', 'entregado_presupuesto', 'visita', 'aprobado', 'denegado', 'cerrado')),
  motivo_denegacion TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de productos/servicios de ventas
CREATE TABLE public.productos_ventas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id UUID NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de equipos SAT
CREATE TABLE public.equipos_sat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('tpv', 'cash_guard', 'balanza', 'impresora')),
  marca TEXT,
  modelo TEXT,
  numero_serie TEXT,
  tecnico_id UUID REFERENCES public.profiles(id),
  fecha_entrada DATE,
  motivo TEXT,
  notas TEXT,
  sistema_operativo TEXT,
  sql_version TEXT,
  programa TEXT,
  numero_licencia TEXT,
  tipo_billetero TEXT,
  version TEXT,
  estado TEXT DEFAULT 'en_sat' CHECK (estado IN ('en_sat', 'devuelto')),
  fecha_devolucion DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de proveedores
CREATE TABLE public.proveedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  cif TEXT,
  direccion TEXT,
  codigo_postal TEXT,
  poblacion TEXT,
  provincia TEXT,
  telefono TEXT,
  email TEXT,
  persona_contacto TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de stock
CREATE TABLE public.stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  cantidad INTEGER NOT NULL DEFAULT 0,
  nivel_minimo INTEGER DEFAULT 0,
  precio_unitario NUMERIC(10, 2),
  proveedor_id UUID REFERENCES public.proveedores(id),
  ubicacion TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de movimientos de stock
CREATE TABLE public.movimientos_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID NOT NULL REFERENCES public.stock(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  cantidad INTEGER NOT NULL,
  motivo TEXT,
  usuario_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de conversaciones de chat
CREATE TABLE public.conversaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  es_grupo BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de participantes en conversaciones
CREATE TABLE public.participantes_conversacion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ultimo_leido TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(conversacion_id, usuario_id)
);

-- Crear tabla de mensajes
CREATE TABLE public.mensajes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id),
  contenido TEXT NOT NULL,
  archivo_url TEXT,
  archivo_nombre TEXT,
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de fichajes
CREATE TABLE public.fichajes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id UUID NOT NULL REFERENCES public.profiles(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida')),
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de ausencias
CREATE TABLE public.ausencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id UUID NOT NULL REFERENCES public.profiles(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('vacaciones', 'baja', 'permiso')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  motivo TEXT,
  aprobado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de material personal
CREATE TABLE public.material_personal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id UUID NOT NULL REFERENCES public.profiles(id),
  nombre TEXT NOT NULL,
  verificado BOOLEAN DEFAULT false,
  fecha_verificacion DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de contratos de mantenimiento
CREATE TABLE public.contratos_mantenimiento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  fecha_alta DATE NOT NULL,
  fecha_caducidad DATE NOT NULL,
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de documentos
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('protocolo', 'manual', 'cliente')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  carpeta TEXT,
  url TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de configuración
CREATE TABLE public.configuracion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clave TEXT NOT NULL UNIQUE,
  valor TEXT,
  descripcion TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar configuración inicial
INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
('logo_url', '', 'URL del logo de la empresa'),
('nombre_empresa', 'SERVISA', 'Nombre de la empresa'),
('email_notificaciones', 'jesus.carbajo@servisa.biz', 'Email para notificaciones');

-- Habilitar RLS
ALTER TABLE public.furgonetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones_furgonetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mantenimientos_furgonetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_furgonetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos_ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos_sat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_conversacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ausencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- RLS Políticas
CREATE POLICY "Solo admins pueden gestionar furgonetas" ON public.furgonetas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Técnicos pueden ver furgonetas" ON public.furgonetas FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden gestionar asignaciones" ON public.asignaciones_furgonetas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Técnicos pueden ver sus asignaciones" ON public.asignaciones_furgonetas FOR SELECT USING (tecnico_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Solo admins pueden gestionar mantenimientos" ON public.mantenimientos_furgonetas FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Solo admins pueden gestionar material furgonetas" ON public.material_furgonetas FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Técnicos ven solo sus ventas" ON public.ventas FOR SELECT USING (tecnico_id = auth.uid() OR is_admin(auth.uid()) OR has_role(auth.uid(), 'comercial'::app_role));
CREATE POLICY "Los usuarios pueden crear ventas" ON public.ventas FOR INSERT WITH CHECK (true);
CREATE POLICY "Técnicos pueden actualizar sus ventas" ON public.ventas FOR UPDATE USING (tecnico_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Solo admins pueden eliminar ventas" ON public.ventas FOR DELETE USING (is_admin(auth.uid()));
CREATE POLICY "Los usuarios pueden ver productos de ventas" ON public.productos_ventas FOR SELECT USING (EXISTS (SELECT 1 FROM ventas WHERE ventas.id = productos_ventas.venta_id AND (ventas.tecnico_id = auth.uid() OR is_admin(auth.uid()))));
CREATE POLICY "Los usuarios pueden gestionar productos de ventas" ON public.productos_ventas FOR ALL USING (true);

CREATE POLICY "Los usuarios pueden ver equipos SAT" ON public.equipos_sat FOR SELECT USING (true);
CREATE POLICY "Los usuarios pueden gestionar equipos SAT" ON public.equipos_sat FOR ALL USING (true);

CREATE POLICY "Solo admins pueden gestionar proveedores" ON public.proveedores FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Solo admins pueden ver proveedores" ON public.proveedores FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Los usuarios pueden ver stock" ON public.stock FOR SELECT USING (true);
CREATE POLICY "Solo admins pueden gestionar stock" ON public.stock FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Los usuarios pueden ver movimientos" ON public.movimientos_stock FOR SELECT USING (true);
CREATE POLICY "Los usuarios pueden crear movimientos" ON public.movimientos_stock FOR INSERT WITH CHECK (true);

CREATE POLICY "Los usuarios pueden ver sus conversaciones" ON public.conversaciones FOR SELECT USING (EXISTS (SELECT 1 FROM participantes_conversacion WHERE participantes_conversacion.conversacion_id = conversaciones.id AND participantes_conversacion.usuario_id = auth.uid()));
CREATE POLICY "Los usuarios pueden crear conversaciones" ON public.conversaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Los usuarios pueden actualizar sus conversaciones" ON public.conversaciones FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Los usuarios pueden ver participantes" ON public.participantes_conversacion FOR SELECT USING (usuario_id = auth.uid() OR EXISTS (SELECT 1 FROM participantes_conversacion pc WHERE pc.conversacion_id = participantes_conversacion.conversacion_id AND pc.usuario_id = auth.uid()));
CREATE POLICY "Los usuarios pueden gestionar participantes" ON public.participantes_conversacion FOR ALL USING (true);
CREATE POLICY "Los usuarios pueden ver mensajes de sus conversaciones" ON public.mensajes FOR SELECT USING (EXISTS (SELECT 1 FROM participantes_conversacion WHERE participantes_conversacion.conversacion_id = mensajes.conversacion_id AND participantes_conversacion.usuario_id = auth.uid()));
CREATE POLICY "Los usuarios pueden crear mensajes" ON public.mensajes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM participantes_conversacion WHERE participantes_conversacion.conversacion_id = mensajes.conversacion_id AND participantes_conversacion.usuario_id = auth.uid()));

CREATE POLICY "Técnicos pueden ver sus fichajes" ON public.fichajes FOR SELECT USING (tecnico_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Técnicos pueden crear fichajes" ON public.fichajes FOR INSERT WITH CHECK (tecnico_id = auth.uid());
CREATE POLICY "Solo admins pueden modificar fichajes" ON public.fichajes FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Técnicos pueden ver sus ausencias" ON public.ausencias FOR SELECT USING (tecnico_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Técnicos pueden crear ausencias" ON public.ausencias FOR INSERT WITH CHECK (tecnico_id = auth.uid());
CREATE POLICY "Solo admins pueden aprobar ausencias" ON public.ausencias FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Técnicos pueden ver su material" ON public.material_personal FOR SELECT USING (tecnico_id = auth.uid() OR is_admin(auth.uid()));
CREATE POLICY "Técnicos pueden gestionar su material" ON public.material_personal FOR ALL USING (tecnico_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Los usuarios pueden ver contratos" ON public.contratos_mantenimiento FOR SELECT USING (true);
CREATE POLICY "Los usuarios pueden gestionar contratos" ON public.contratos_mantenimiento FOR ALL USING (true);

CREATE POLICY "Los usuarios pueden ver documentos" ON public.documentos FOR SELECT USING (true);
CREATE POLICY "Los usuarios pueden crear documentos" ON public.documentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Solo admins pueden eliminar documentos" ON public.documentos FOR DELETE USING (is_admin(auth.uid()));

CREATE POLICY "Solo admins pueden gestionar configuración" ON public.configuracion FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Todos pueden ver configuración" ON public.configuracion FOR SELECT USING (true);

-- Triggers
CREATE TRIGGER update_furgonetas_updated_at BEFORE UPDATE ON public.furgonetas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON public.ventas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipos_sat_updated_at BEFORE UPDATE ON public.equipos_sat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON public.stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversaciones_updated_at BEFORE UPDATE ON public.conversaciones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();