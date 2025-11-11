export interface Cliente {
  id: string;
  nombre: string;
  cif: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  poblacion: string | null;
  provincia: string | null;
  codigo_postal: string | null;
  notas: string | null;
  nombre_fiscal: string | null;
  persona_contacto: string | null;
  nombre_encargado: string | null;
  telefono_encargado: string | null;
  selector_fiscal: string | null;
  informacion_destacada: string | null;
  notas_especiales: string | null;
  notas_adicionales: string | null;
  nombre_asesoria: string | null;
  telefono_asesoria: string | null;
  persona_contacto_asesoria: string | null;
  r_iva: string | null;
  epigrafe: string | null;
  activo: boolean;
  fecha_alta_cliente: string | null;
  logo_url: string | null;
  tiene_contrato_mantenimiento: boolean;
  tipo_contrato: string | null;
  fecha_alta_contrato: string | null;
  fecha_caducidad_contrato: string | null;
  motivo_inactivacion: string | null;
  aviso_moroso: boolean;
  aviso_cobrar_antes: string | null;
}

export interface Equipo {
  id: string;
  tipo: string;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  fecha_instalacion: string | null;
}

export interface Ticket {
  id: string;
  numero: number;
  titulo: string;
  estado: string;
  fecha_creacion: string;
}

export interface Contrato {
  id: string;
  tipo: string;
  fecha_alta: string;
  fecha_caducidad: string;
  activo: boolean;
  notas: string | null;
}

export interface NuevoEquipo {
  tipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  numero_serie_bdp: string;
  numero_serie_wind: string;
  numero_serie_store_manager: string;
  numero_serie_cashlogy: string;
  numero_serie_impresora: string;
  contraseñas: string;
  tpv: string;
  wind: string;
  ram: string;
  impresora: string;
  software: string;
  v: string;
  tbai: string;
  c_inteligente: string;
  instalacion: string;
  pendrive_c_seg: string;
  garantia_inicio: string;
  garantia_fin: string;
}

export interface NuevoContrato {
  tipo: string;
  fecha_alta: string;
  fecha_caducidad: string;
  notas: string;
}
