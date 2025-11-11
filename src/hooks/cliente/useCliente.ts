import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logView, logUpdate } from "@/lib/auditLog";
import { Cliente } from "@/types/cliente";

export const useCliente = (id: string | undefined) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const loadCliente = async () => {
    try {
      const { data, error } = await supabase.from("clientes").select("*").eq("id", id).single();

      if (error) throw error;
      setCliente(data);

      // Registrar visualización del cliente
      if (id) {
        await logView("clientes", id);
      }
    } catch (error) {
      console.error("Error cargando cliente:", error);
      toast.error("Error al cargar cliente");
    } finally {
      setLoading(false);
    }
  };

  const uploadLogoToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("client-logos").upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading logo:", uploadError);
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("client-logos").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadLogoToSupabase:", error);
      return null;
    }
  };

  const handleUpdate = async (updatedCliente: Cliente, logoFile: File | null) => {
    setUploadingLogo(true);

    try {
      let logoUrl = updatedCliente.logo_url;

      // Si hay un archivo de logo, subirlo primero
      if (logoFile) {
        const uploadedUrl = await uploadLogoToSupabase(logoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          toast.error("Error al subir el logo, pero continuaremos sin él");
        }
      }

      const finalCliente = {
        ...updatedCliente,
        logo_url: logoUrl,
      };

      const { error } = await supabase.from("clientes").update(finalCliente).eq("id", id);

      if (error) throw error;

      // Registrar actualización en auditoría
      if (id) {
        await logUpdate("clientes", id, {}, finalCliente);
      }

      toast.success("Cliente actualizado");
      await loadCliente();
      return true;
    } catch (error: any) {
      console.error("Error actualizando cliente:", error);
      toast.error(error.message || "Error al actualizar cliente");
      return false;
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleActivo = async (activo: boolean, motivoInactivacion?: string) => {
    try {
      const updateData: any = { activo };

      if (!activo && motivoInactivacion) {
        updateData.motivo_inactivacion = motivoInactivacion;
      } else if (activo) {
        updateData.motivo_inactivacion = null;
      }

      const { error } = await supabase
        .from("clientes")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success(activo ? "Cliente reactivado correctamente" : "Cliente archivado correctamente");
      await loadCliente();
      return true;
    } catch (error: any) {
      console.error("Error actualizando estado del cliente:", error);
      toast.error(error.message || "Error al actualizar cliente");
      return false;
    }
  };

  return {
    cliente,
    setCliente,
    loading,
    uploadingLogo,
    loadCliente,
    handleUpdate,
    toggleActivo,
  };
};
