-- Create storage bucket for client logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-logos',
  'client-logos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
);

-- Allow authenticated users to upload logos
CREATE POLICY "Usuarios autenticados pueden subir logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos');

-- Allow authenticated users to update their uploaded logos
CREATE POLICY "Usuarios autenticados pueden actualizar logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-logos');

-- Allow everyone to view logos (public bucket)
CREATE POLICY "Todos pueden ver logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'client-logos');

-- Allow authenticated users to delete logos
CREATE POLICY "Usuarios autenticados pueden eliminar logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-logos');