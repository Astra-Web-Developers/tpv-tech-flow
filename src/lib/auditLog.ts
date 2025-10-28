import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "LOGIN"
  | "LOGOUT"
  | "DOWNLOAD"
  | "UPLOAD";

interface AuditLogParams {
  action: AuditAction;
  tableName: string;
  recordId?: string;
  oldData?: any;
  newData?: any;
  description?: string;
}

/**
 * Registra una acción en el log de auditoría
 * @param params - Parámetros de la acción a registrar
 */
export async function logAuditAction(params: AuditLogParams): Promise<void> {
  try {
    // Obtener información del usuario actual
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.warn("No hay usuario autenticado para registrar en auditoría");
      return;
    }

    // Obtener información adicional del perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("nombre, apellidos")
      .eq("id", user.id)
      .single();

    const userName = profile
      ? `${profile.nombre || ""} ${profile.apellidos || ""}`.trim()
      : user.email;

    // Registrar en el log de auditoría
    const { error } = await supabase.from("audit_log").insert({
      user_id: user.id,
      user_email: user.email,
      user_name: userName || user.email,
      action: params.action,
      table_name: params.tableName,
      record_id: params.recordId,
      old_data: params.oldData ? JSON.stringify(params.oldData) : null,
      new_data: params.newData ? JSON.stringify(params.newData) : null,
      ip_address: null, // Se podría obtener del servidor
      user_agent: navigator.userAgent,
    });

    if (error) {
      console.error("Error registrando en auditoría:", error);
    }
  } catch (error) {
    console.error("Error en logAuditAction:", error);
  }
}

/**
 * Helper para registrar creación de registros
 */
export async function logCreate(
  tableName: string,
  recordId: string,
  data: any
): Promise<void> {
  await logAuditAction({
    action: "CREATE",
    tableName,
    recordId,
    newData: data,
  });
}

/**
 * Helper para registrar actualizaciones
 */
export async function logUpdate(
  tableName: string,
  recordId: string,
  oldData: any,
  newData: any
): Promise<void> {
  await logAuditAction({
    action: "UPDATE",
    tableName,
    recordId,
    oldData,
    newData,
  });
}

/**
 * Helper para registrar eliminaciones
 */
export async function logDelete(
  tableName: string,
  recordId: string,
  data: any
): Promise<void> {
  await logAuditAction({
    action: "DELETE",
    tableName,
    recordId,
    oldData: data,
  });
}

/**
 * Helper para registrar visualizaciones de datos sensibles
 */
export async function logView(tableName: string, recordId: string): Promise<void> {
  await logAuditAction({
    action: "VIEW",
    tableName,
    recordId,
  });
}

/**
 * Helper para registrar exportaciones
 */
export async function logExport(
  tableName: string,
  description?: string
): Promise<void> {
  await logAuditAction({
    action: "EXPORT",
    tableName,
    description,
  });
}
