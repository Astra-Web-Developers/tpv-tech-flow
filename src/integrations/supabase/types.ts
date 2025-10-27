export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          activo: boolean
          cif: string | null
          codigo_postal: string | null
          created_at: string
          created_by: string | null
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          notas: string | null
          poblacion: string | null
          provincia: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          poblacion?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          poblacion?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      equipos: {
        Row: {
          activo: boolean
          cliente_id: string
          created_at: string
          fecha_instalacion: string | null
          id: string
          marca: string | null
          modelo: string | null
          notas: string | null
          numero_serie: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          cliente_id: string
          created_at?: string
          fecha_instalacion?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          notas?: string | null
          numero_serie?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          cliente_id?: string
          created_at?: string
          fecha_instalacion?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          notas?: string | null
          numero_serie?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_tiempo: {
        Row: {
          created_at: string
          duracion_minutos: number | null
          fin: string | null
          id: string
          inicio: string
          notas: string | null
          tecnico_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          duracion_minutos?: number | null
          fin?: string | null
          id?: string
          inicio: string
          notas?: string | null
          tecnico_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          duracion_minutos?: number | null
          fin?: string | null
          id?: string
          inicio?: string
          notas?: string | null
          tecnico_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_tiempo_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      materiales: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          nombre: string
          notas: string | null
          precio_unitario: number | null
          ticket_id: string
        }
        Insert: {
          cantidad?: number
          created_at?: string
          id?: string
          nombre: string
          notas?: string | null
          precio_unitario?: number | null
          ticket_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          nombre?: string
          notas?: string | null
          precio_unitario?: number | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiales_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean
          apellidos: string | null
          created_at: string
          email: string
          especialidades: string[] | null
          foto_url: string | null
          id: string
          nombre: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          apellidos?: string | null
          created_at?: string
          email: string
          especialidades?: string[] | null
          foto_url?: string | null
          id: string
          nombre: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          apellidos?: string | null
          created_at?: string
          email?: string
          especialidades?: string[] | null
          foto_url?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          cliente_id: string | null
          created_by: string | null
          descripcion: string | null
          estado: string
          fecha_creacion: string
          fecha_finalizacion: string | null
          id: string
          motivo_eliminacion: string | null
          numero: number
          prioridad: string
          tiempo_total_minutos: number
          titulo: string
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          fecha_creacion?: string
          fecha_finalizacion?: string | null
          id?: string
          motivo_eliminacion?: string | null
          numero?: number
          prioridad?: string
          tiempo_total_minutos?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_by?: string | null
          descripcion?: string | null
          estado?: string
          fecha_creacion?: string
          fecha_finalizacion?: string | null
          id?: string
          motivo_eliminacion?: string | null
          numero?: number
          prioridad?: string
          tiempo_total_minutos?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_tecnicos: {
        Row: {
          asignado_at: string
          id: string
          tecnico_id: string
          ticket_id: string
        }
        Insert: {
          asignado_at?: string
          id?: string
          tecnico_id: string
          ticket_id: string
        }
        Update: {
          asignado_at?: string
          id?: string
          tecnico_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_tecnicos_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "tecnico" | "comercial" | "proveedor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "tecnico", "comercial", "proveedor"],
    },
  },
} as const
