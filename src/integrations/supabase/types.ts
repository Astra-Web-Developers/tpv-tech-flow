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
      asignaciones_furgonetas: {
        Row: {
          created_at: string
          furgoneta_id: string
          hora_fin: string | null
          hora_inicio: string
          id: string
          motivo: string | null
          tecnico_id: string
        }
        Insert: {
          created_at?: string
          furgoneta_id: string
          hora_fin?: string | null
          hora_inicio?: string
          id?: string
          motivo?: string | null
          tecnico_id: string
        }
        Update: {
          created_at?: string
          furgoneta_id?: string
          hora_fin?: string | null
          hora_inicio?: string
          id?: string
          motivo?: string | null
          tecnico_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asignaciones_furgonetas_furgoneta_id_fkey"
            columns: ["furgoneta_id"]
            isOneToOne: false
            referencedRelation: "furgonetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asignaciones_furgonetas_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ausencias: {
        Row: {
          aprobado: boolean | null
          created_at: string
          fecha_fin: string
          fecha_inicio: string
          id: string
          motivo: string | null
          tecnico_id: string
          tipo: string
        }
        Insert: {
          aprobado?: boolean | null
          created_at?: string
          fecha_fin: string
          fecha_inicio: string
          id?: string
          motivo?: string | null
          tecnico_id: string
          tipo: string
        }
        Update: {
          aprobado?: boolean | null
          created_at?: string
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          motivo?: string | null
          tecnico_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          activo: boolean
          aviso_cobrar_antes: string | null
          aviso_moroso: boolean | null
          cif: string | null
          codigo_postal: string | null
          created_at: string
          created_by: string | null
          direccion: string | null
          email: string | null
          epigrafe: string | null
          fecha_alta_cliente: string | null
          fecha_alta_contrato: string | null
          fecha_caducidad_contrato: string | null
          id: string
          informacion_destacada: string | null
          logo_url: string | null
          motivo_inactivacion: string | null
          nombre: string
          nombre_asesoria: string | null
          nombre_encargado: string | null
          nombre_fiscal: string | null
          notas: string | null
          notas_adicionales: string | null
          notas_especiales: string | null
          persona_contacto: string | null
          persona_contacto_asesoria: string | null
          poblacion: string | null
          provincia: string | null
          r_iva: string | null
          selector_fiscal: string | null
          telefono: string | null
          telefono_asesoria: string | null
          telefono_encargado: string | null
          tiene_contrato_mantenimiento: boolean | null
          tipo_contrato: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          aviso_cobrar_antes?: string | null
          aviso_moroso?: boolean | null
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          epigrafe?: string | null
          fecha_alta_cliente?: string | null
          fecha_alta_contrato?: string | null
          fecha_caducidad_contrato?: string | null
          id?: string
          informacion_destacada?: string | null
          logo_url?: string | null
          motivo_inactivacion?: string | null
          nombre: string
          nombre_asesoria?: string | null
          nombre_encargado?: string | null
          nombre_fiscal?: string | null
          notas?: string | null
          notas_adicionales?: string | null
          notas_especiales?: string | null
          persona_contacto?: string | null
          persona_contacto_asesoria?: string | null
          poblacion?: string | null
          provincia?: string | null
          r_iva?: string | null
          selector_fiscal?: string | null
          telefono?: string | null
          telefono_asesoria?: string | null
          telefono_encargado?: string | null
          tiene_contrato_mantenimiento?: boolean | null
          tipo_contrato?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          aviso_cobrar_antes?: string | null
          aviso_moroso?: boolean | null
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          epigrafe?: string | null
          fecha_alta_cliente?: string | null
          fecha_alta_contrato?: string | null
          fecha_caducidad_contrato?: string | null
          id?: string
          informacion_destacada?: string | null
          logo_url?: string | null
          motivo_inactivacion?: string | null
          nombre?: string
          nombre_asesoria?: string | null
          nombre_encargado?: string | null
          nombre_fiscal?: string | null
          notas?: string | null
          notas_adicionales?: string | null
          notas_especiales?: string | null
          persona_contacto?: string | null
          persona_contacto_asesoria?: string | null
          poblacion?: string | null
          provincia?: string | null
          r_iva?: string | null
          selector_fiscal?: string | null
          telefono?: string | null
          telefono_asesoria?: string | null
          telefono_encargado?: string | null
          tiene_contrato_mantenimiento?: boolean | null
          tipo_contrato?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clientes_etiquetas: {
        Row: {
          cliente_id: string
          created_at: string
          etiqueta_id: string
          id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          etiqueta_id: string
          id?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          etiqueta_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_etiquetas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_etiquetas_etiqueta_id_fkey"
            columns: ["etiqueta_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion: {
        Row: {
          clave: string
          descripcion: string | null
          id: string
          updated_at: string
          valor: string | null
        }
        Insert: {
          clave: string
          descripcion?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Update: {
          clave?: string
          descripcion?: string | null
          id?: string
          updated_at?: string
          valor?: string | null
        }
        Relationships: []
      }
      contratos_mantenimiento: {
        Row: {
          activo: boolean | null
          cliente_id: string
          created_at: string
          fecha_alta: string
          fecha_caducidad: string
          id: string
          notas: string | null
          tipo: string
        }
        Insert: {
          activo?: boolean | null
          cliente_id: string
          created_at?: string
          fecha_alta: string
          fecha_caducidad: string
          id?: string
          notas?: string | null
          tipo: string
        }
        Update: {
          activo?: boolean | null
          cliente_id?: string
          created_at?: string
          fecha_alta?: string
          fecha_caducidad?: string
          id?: string
          notas?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contratos_mantenimiento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      conversaciones: {
        Row: {
          created_at: string
          created_by: string | null
          es_grupo: boolean | null
          id: string
          nombre: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          es_grupo?: boolean | null
          id?: string
          nombre?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          es_grupo?: boolean | null
          id?: string
          nombre?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversaciones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          carpeta: string | null
          cliente_id: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          id: string
          nombre: string
          tipo: string
          url: string
          version: number | null
        }
        Insert: {
          carpeta?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          tipo: string
          url: string
          version?: number | null
        }
        Update: {
          carpeta?: string | null
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          tipo?: string
          url?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipos: {
        Row: {
          activo: boolean
          c_inteligente: string | null
          cliente_id: string
          contraseñas: string | null
          created_at: string
          fecha_instalacion: string | null
          garantia_fin: string | null
          garantia_inicio: string | null
          id: string
          impresora: string | null
          instalacion: string | null
          marca: string | null
          modelo: string | null
          notas: string | null
          numero_serie: string | null
          numero_serie_bdp: string | null
          numero_serie_cashlogy: string | null
          numero_serie_impresora: string | null
          numero_serie_store_manager: string | null
          numero_serie_wind: string | null
          pendrive_c_seg: string | null
          ram: string | null
          software: string | null
          tbai: string | null
          tipo: string
          tpv: string | null
          updated_at: string
          v: string | null
          wind: string | null
        }
        Insert: {
          activo?: boolean
          c_inteligente?: string | null
          cliente_id: string
          contraseñas?: string | null
          created_at?: string
          fecha_instalacion?: string | null
          garantia_fin?: string | null
          garantia_inicio?: string | null
          id?: string
          impresora?: string | null
          instalacion?: string | null
          marca?: string | null
          modelo?: string | null
          notas?: string | null
          numero_serie?: string | null
          numero_serie_bdp?: string | null
          numero_serie_cashlogy?: string | null
          numero_serie_impresora?: string | null
          numero_serie_store_manager?: string | null
          numero_serie_wind?: string | null
          pendrive_c_seg?: string | null
          ram?: string | null
          software?: string | null
          tbai?: string | null
          tipo: string
          tpv?: string | null
          updated_at?: string
          v?: string | null
          wind?: string | null
        }
        Update: {
          activo?: boolean
          c_inteligente?: string | null
          cliente_id?: string
          contraseñas?: string | null
          created_at?: string
          fecha_instalacion?: string | null
          garantia_fin?: string | null
          garantia_inicio?: string | null
          id?: string
          impresora?: string | null
          instalacion?: string | null
          marca?: string | null
          modelo?: string | null
          notas?: string | null
          numero_serie?: string | null
          numero_serie_bdp?: string | null
          numero_serie_cashlogy?: string | null
          numero_serie_impresora?: string | null
          numero_serie_store_manager?: string | null
          numero_serie_wind?: string | null
          pendrive_c_seg?: string | null
          ram?: string | null
          software?: string | null
          tbai?: string | null
          tipo?: string
          tpv?: string | null
          updated_at?: string
          v?: string | null
          wind?: string | null
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
      equipos_sat: {
        Row: {
          created_at: string
          estado: string | null
          fecha_devolucion: string | null
          fecha_entrada: string | null
          id: string
          marca: string | null
          modelo: string | null
          motivo: string | null
          notas: string | null
          numero_licencia: string | null
          numero_serie: string | null
          programa: string | null
          sistema_operativo: string | null
          sql_version: string | null
          tecnico_id: string | null
          tipo: string
          tipo_billetero: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          estado?: string | null
          fecha_devolucion?: string | null
          fecha_entrada?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          motivo?: string | null
          notas?: string | null
          numero_licencia?: string | null
          numero_serie?: string | null
          programa?: string | null
          sistema_operativo?: string | null
          sql_version?: string | null
          tecnico_id?: string | null
          tipo: string
          tipo_billetero?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          estado?: string | null
          fecha_devolucion?: string | null
          fecha_entrada?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          motivo?: string | null
          notas?: string | null
          numero_licencia?: string | null
          numero_serie?: string | null
          programa?: string | null
          sistema_operativo?: string | null
          sql_version?: string | null
          tecnico_id?: string | null
          tipo?: string
          tipo_billetero?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipos_sat_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      etiquetas: {
        Row: {
          color: string
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      fichajes: {
        Row: {
          created_at: string
          fecha_hora: string
          id: string
          notas: string | null
          tecnico_id: string
          tipo: string
        }
        Insert: {
          created_at?: string
          fecha_hora?: string
          id?: string
          notas?: string | null
          tecnico_id: string
          tipo: string
        }
        Update: {
          created_at?: string
          fecha_hora?: string
          id?: string
          notas?: string | null
          tecnico_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "fichajes_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      furgonetas: {
        Row: {
          anio: number | null
          created_at: string
          estado: string
          id: string
          marca: string
          matricula: string
          modelo: string
          notas: string | null
          proxima_itv: string | null
          ultima_itv: string | null
          updated_at: string
        }
        Insert: {
          anio?: number | null
          created_at?: string
          estado?: string
          id?: string
          marca: string
          matricula: string
          modelo: string
          notas?: string | null
          proxima_itv?: string | null
          ultima_itv?: string | null
          updated_at?: string
        }
        Update: {
          anio?: number | null
          created_at?: string
          estado?: string
          id?: string
          marca?: string
          matricula?: string
          modelo?: string
          notas?: string | null
          proxima_itv?: string | null
          ultima_itv?: string | null
          updated_at?: string
        }
        Relationships: []
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
      incidencias_equipos: {
        Row: {
          coste_reparacion: number | null
          created_at: string
          dentro_garantia: boolean | null
          equipo_id: string
          fecha: string
          id: string
          incidencia: string
          solucion: string | null
          updated_at: string
        }
        Insert: {
          coste_reparacion?: number | null
          created_at?: string
          dentro_garantia?: boolean | null
          equipo_id: string
          fecha?: string
          id?: string
          incidencia: string
          solucion?: string | null
          updated_at?: string
        }
        Update: {
          coste_reparacion?: number | null
          created_at?: string
          dentro_garantia?: boolean | null
          equipo_id?: string
          fecha?: string
          id?: string
          incidencia?: string
          solucion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidencias_equipos_equipo_id_fkey"
            columns: ["equipo_id"]
            isOneToOne: false
            referencedRelation: "equipos"
            referencedColumns: ["id"]
          },
        ]
      }
      mantenimientos_furgonetas: {
        Row: {
          costo: number | null
          created_at: string
          descripcion: string
          fecha: string
          furgoneta_id: string
          id: string
          taller: string | null
        }
        Insert: {
          costo?: number | null
          created_at?: string
          descripcion: string
          fecha: string
          furgoneta_id: string
          id?: string
          taller?: string | null
        }
        Update: {
          costo?: number | null
          created_at?: string
          descripcion?: string
          fecha?: string
          furgoneta_id?: string
          id?: string
          taller?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mantenimientos_furgonetas_furgoneta_id_fkey"
            columns: ["furgoneta_id"]
            isOneToOne: false
            referencedRelation: "furgonetas"
            referencedColumns: ["id"]
          },
        ]
      }
      material_furgonetas: {
        Row: {
          created_at: string
          furgoneta_id: string
          id: string
          nombre: string
          verificado: boolean | null
        }
        Insert: {
          created_at?: string
          furgoneta_id: string
          id?: string
          nombre: string
          verificado?: boolean | null
        }
        Update: {
          created_at?: string
          furgoneta_id?: string
          id?: string
          nombre?: string
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "material_furgonetas_furgoneta_id_fkey"
            columns: ["furgoneta_id"]
            isOneToOne: false
            referencedRelation: "furgonetas"
            referencedColumns: ["id"]
          },
        ]
      }
      material_personal: {
        Row: {
          created_at: string
          fecha_verificacion: string | null
          id: string
          nombre: string
          tecnico_id: string
          verificado: boolean | null
        }
        Insert: {
          created_at?: string
          fecha_verificacion?: string | null
          id?: string
          nombre: string
          tecnico_id: string
          verificado?: boolean | null
        }
        Update: {
          created_at?: string
          fecha_verificacion?: string | null
          id?: string
          nombre?: string
          tecnico_id?: string
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "material_personal_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      mensajes: {
        Row: {
          archivo_nombre: string | null
          archivo_url: string | null
          contenido: string
          conversacion_id: string
          created_at: string
          id: string
          leido: boolean | null
          usuario_id: string
        }
        Insert: {
          archivo_nombre?: string | null
          archivo_url?: string | null
          contenido: string
          conversacion_id: string
          created_at?: string
          id?: string
          leido?: boolean | null
          usuario_id: string
        }
        Update: {
          archivo_nombre?: string | null
          archivo_url?: string | null
          contenido?: string
          conversacion_id?: string
          created_at?: string
          id?: string
          leido?: boolean | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensajes_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensajes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movimientos_stock: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          motivo: string | null
          stock_id: string
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          motivo?: string | null
          stock_id: string
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          motivo?: string | null
          stock_id?: string
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_stock_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_stock_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string
          id: string
          leida: boolean | null
          link: string | null
          mensaje: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leida?: boolean | null
          link?: string | null
          mensaje: string
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leida?: boolean | null
          link?: string | null
          mensaje?: string
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      participantes_conversacion: {
        Row: {
          conversacion_id: string
          created_at: string
          id: string
          ultimo_leido: string | null
          usuario_id: string
        }
        Insert: {
          conversacion_id: string
          created_at?: string
          id?: string
          ultimo_leido?: string | null
          usuario_id: string
        }
        Update: {
          conversacion_id?: string
          created_at?: string
          id?: string
          ultimo_leido?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_conversacion_conversacion_id_fkey"
            columns: ["conversacion_id"]
            isOneToOne: false
            referencedRelation: "conversaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_conversacion_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      productos_ventas: {
        Row: {
          cantidad: number
          created_at: string
          descripcion: string
          id: string
          precio_unitario: number
          total: number
          venta_id: string
        }
        Insert: {
          cantidad?: number
          created_at?: string
          descripcion: string
          id?: string
          precio_unitario: number
          total: number
          venta_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          descripcion?: string
          id?: string
          precio_unitario?: number
          total?: number
          venta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_ventas_venta_id_fkey"
            columns: ["venta_id"]
            isOneToOne: false
            referencedRelation: "ventas"
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
      proveedores: {
        Row: {
          activo: boolean | null
          cif: string | null
          codigo_postal: string | null
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          notas: string | null
          persona_contacto: string | null
          poblacion: string | null
          provincia: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean | null
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          notas?: string | null
          persona_contacto?: string | null
          poblacion?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean | null
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          persona_contacto?: string | null
          poblacion?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          activo: boolean | null
          cantidad: number
          categoria: string | null
          created_at: string
          descripcion: string | null
          id: string
          nivel_minimo: number | null
          nombre: string
          notas: string | null
          precio_unitario: number | null
          proveedor_id: string | null
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean | null
          cantidad?: number
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nivel_minimo?: number | null
          nombre: string
          notas?: string | null
          precio_unitario?: number | null
          proveedor_id?: string | null
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean | null
          cantidad?: number
          categoria?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nivel_minimo?: number | null
          nombre?: string
          notas?: string | null
          precio_unitario?: number | null
          proveedor_id?: string | null
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          cliente_id: string | null
          created_by: string | null
          descripcion: string | null
          estado: string
          fecha_creacion: string
          fecha_finalizacion: string | null
          fecha_firma: string | null
          firma_cliente: string | null
          id: string
          motivo_eliminacion: string | null
          numero: number
          prioridad: string
          solucion: string | null
          tecnico_cierre_id: string | null
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
          fecha_firma?: string | null
          firma_cliente?: string | null
          id?: string
          motivo_eliminacion?: string | null
          numero?: number
          prioridad?: string
          solucion?: string | null
          tecnico_cierre_id?: string | null
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
          fecha_firma?: string | null
          firma_cliente?: string | null
          id?: string
          motivo_eliminacion?: string | null
          numero?: number
          prioridad?: string
          solucion?: string | null
          tecnico_cierre_id?: string | null
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
          {
            foreignKeyName: "tickets_tecnico_cierre_id_fkey"
            columns: ["tecnico_cierre_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_etiquetas: {
        Row: {
          created_at: string
          etiqueta_id: string
          id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          etiqueta_id: string
          id?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          etiqueta_id?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_etiquetas_etiqueta_id_fkey"
            columns: ["etiqueta_id"]
            isOneToOne: false
            referencedRelation: "etiquetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_etiquetas_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
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
      ventas: {
        Row: {
          cliente_id: string | null
          created_at: string
          created_by: string | null
          descuento: number | null
          email: string | null
          estado: string
          fecha: string
          fecha_entrega: string | null
          id: string
          iva: number | null
          metodo_pago: string | null
          motivo_denegacion: string | null
          notas: string | null
          numero: number
          seguimiento: string | null
          subtotal: number | null
          tecnico_id: string | null
          telefono_contacto: string | null
          total: number | null
          updated_at: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          descuento?: number | null
          email?: string | null
          estado?: string
          fecha: string
          fecha_entrega?: string | null
          id?: string
          iva?: number | null
          metodo_pago?: string | null
          motivo_denegacion?: string | null
          notas?: string | null
          numero?: number
          seguimiento?: string | null
          subtotal?: number | null
          tecnico_id?: string | null
          telefono_contacto?: string | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          descuento?: number | null
          email?: string | null
          estado?: string
          fecha?: string
          fecha_entrega?: string | null
          id?: string
          iva?: number | null
          metodo_pago?: string | null
          motivo_denegacion?: string | null
          notas?: string | null
          numero?: number
          seguimiento?: string | null
          subtotal?: number | null
          tecnico_id?: string | null
          telefono_contacto?: string | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ventas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_tecnico_id_fkey"
            columns: ["tecnico_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
