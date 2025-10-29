-- Agregar nuevos campos a la tabla equipos
ALTER TABLE public.equipos
ADD COLUMN tpv text,
ADD COLUMN wind text,
ADD COLUMN ram text,
ADD COLUMN impresora text,
ADD COLUMN software text,
ADD COLUMN v text,
ADD COLUMN tbai text,
ADD COLUMN c_inteligente text,
ADD COLUMN instalacion date,
ADD COLUMN pendrive_c_seg text;

-- Insertar opciones de configuración predeterminadas para los campos de equipos
INSERT INTO public.configuracion (clave, valor, descripcion) VALUES
('equipo_opciones_tpv', 'TPV Modelo A,TPV Modelo B,TPV Modelo C', 'Opciones disponibles para el campo TPV (separadas por comas)'),
('equipo_opciones_ram', '4GB,8GB,16GB,32GB', 'Opciones disponibles para RAM (separadas por comas)'),
('equipo_opciones_impresora', 'Epson TM-T20,Star TSP143,Citizen CT-S310', 'Opciones disponibles para Impresora (separadas por comas)'),
('equipo_opciones_software', 'Software v1.0,Software v2.0,Software v3.0', 'Opciones disponibles para Software (separadas por comas)'),
('equipo_opciones_wind', 'Windows 10,Windows 11,Linux', 'Opciones disponibles para Sistema Operativo (separadas por comas)'),
('equipo_opciones_tbai', 'Sí,No', 'Opciones disponibles para TBAI (separadas por comas)'),
('equipo_opciones_c_inteligente', 'Sí,No', 'Opciones disponibles para Caja Inteligente (separadas por comas)'),
('equipo_opciones_pendrive_c_seg', 'Sí,No', 'Opciones disponibles para Pendrive C.Seg (separadas por comas)')
ON CONFLICT (clave) DO NOTHING;