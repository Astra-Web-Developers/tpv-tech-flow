-- Función para asignar rol por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Asignar rol 'tecnico' por defecto a todos los nuevos usuarios
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'tecnico')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Crear trigger para asignar rol automáticamente cuando se crea un perfil
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Asignar rol de admin al usuario terrenomomo@gmail.com si existe
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar el usuario con email terrenomomo@gmail.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'terrenomomo@gmail.com';

  -- Si el usuario existe, asignarle el rol de admin
  IF admin_user_id IS NOT NULL THEN
    -- Primero, eliminar cualquier rol existente para evitar duplicados
    DELETE FROM public.user_roles WHERE user_id = admin_user_id;

    -- Asignar rol de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Rol de administrador asignado a terrenomomo@gmail.com';
  ELSE
    RAISE NOTICE 'Usuario terrenomomo@gmail.com no encontrado. El rol de admin se asignará automáticamente cuando se registre.';
  END IF;
END $$;

-- Crear una función para asignar admin específicamente a terrenomomo@gmail.com
-- Esta función se ejecutará incluso si el usuario se registra después
CREATE OR REPLACE FUNCTION public.check_and_assign_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si el email es terrenomomo@gmail.com, eliminar el rol por defecto y asignar admin
  IF NEW.email = 'terrenomomo@gmail.com' THEN
    -- Eliminar rol tecnico si existe
    DELETE FROM public.user_roles
    WHERE user_id = NEW.id AND role = 'tecnico';

    -- Asignar rol admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Crear trigger para verificar y asignar admin automáticamente
CREATE TRIGGER on_profile_created_check_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_and_assign_admin();
