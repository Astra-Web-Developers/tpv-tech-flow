import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

// Función para procesar el archivo Excel
export function procesarArchivoExcel(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a CSV primero para procesar más fácil
        const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: ';' });
        const lines = csv.split('\n').filter(line => line.trim());
        
        resolve(lines);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error leyendo el archivo'));
    };
    
    reader.readAsBinaryString(file);
  });
}

function parseDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    const day = parts[0];
    const monthMap: { [key: string]: string } = {
      'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
    };
    const month = monthMap[parts[1]] || parts[1];
    const year = parts[2];
    
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return dateStr;
  }
}

export async function borrarTodosLosClientes(onProgress?: (current: number, total: number, message: string) => void) {
  try {
    // Primero obtener todos los IDs de contratos
    const { data: contratos, error: errorGetContratos } = await supabase
      .from('contratos_mantenimiento')
      .select('id');

    if (errorGetContratos) {
      console.error('Error obteniendo contratos:', errorGetContratos);
      return false;
    }

    // Luego obtener todos los IDs de clientes
    const { data: clientes, error: errorGetClientes } = await supabase
      .from('clientes')
      .select('id');

    if (errorGetClientes) {
      console.error('Error obteniendo clientes:', errorGetClientes);
      return false;
    }

    const totalContratos = contratos?.length || 0;
    const totalClientes = clientes?.length || 0;
    const totalItems = totalContratos + totalClientes;
    let currentItem = 0;

    // Borrar contratos uno por uno (más lento pero más confiable)
    if (contratos && contratos.length > 0) {
      for (const contrato of contratos) {
        const { error } = await supabase
          .from('contratos_mantenimiento')
          .delete()
          .eq('id', contrato.id);

        if (error) {
          console.error('Error borrando contrato:', contrato.id, error);
        }

        currentItem++;
        onProgress?.(currentItem, totalItems, `Borrando contratos (${currentItem}/${totalContratos})...`);
      }
    }

    // Borrar clientes uno por uno
    if (clientes && clientes.length > 0) {
      let clientesBorrados = 0;
      for (const cliente of clientes) {
        const { error } = await supabase
          .from('clientes')
          .delete()
          .eq('id', cliente.id);

        if (error) {
          console.error('Error borrando cliente:', cliente.id, error);
        }

        clientesBorrados++;
        currentItem++;
        onProgress?.(currentItem, totalItems, `Borrando clientes (${clientesBorrados}/${totalClientes})...`);
      }
    }

    console.log(`Borrados ${totalContratos} contratos y ${totalClientes} clientes`);
    return true;
  } catch (error) {
    console.error('Error general borrando:', error);
    return false;
  }
}

export async function importarClientes(lineasExcel?: string[]) {
  if (!lineasExcel || lineasExcel.length === 0) {
    throw new Error('No hay datos para importar. Por favor carga un archivo Excel.');
  }

  const lines = lineasExcel;
  let imported = 0;
  let errors = 0;
  const erroresDetalle: string[] = [];

  // Saltar la primera línea si es el encabezado
  const startIndex = lines[0]?.toLowerCase().includes('nombre') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      // Separar por tabulación o punto y coma, removiendo comillas
      const separator = line.includes('\t') ? '\t' : ';';
      const parts = line.split(separator).map(p => p.replace(/"/g, '').trim());

      // Formato esperado: ID, Nombre (persona), Negocio, Tipo de Servicio, [Columna 5 opcional]
      if (parts.length < 4) {
        console.log('Formato incorrecto:', line);
        errors++;
        erroresDetalle.push(`Formato incorrecto (línea ${i + 1}): Faltan columnas`);
        continue;
      }

      const id = parts[0]; // ID no se usa pero lo parseamos
      const nombrePersona = parts[1];
      const nombreNegocio = parts[2];
      const tipoServicio = parts[3];

      // Usar el nombre del negocio como nombre del cliente, o el nombre de la persona si no hay negocio
      const clienteNombre = nombreNegocio || nombrePersona;

      if (!clienteNombre) {
        errors++;
        erroresDetalle.push(`Sin nombre de cliente (línea ${i + 1})`);
        continue;
      }

      // Buscar si ya existe el cliente
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id')
        .eq('nombre', clienteNombre)
        .maybeSingle();

      let clienteId;

      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        // Crear nuevo cliente
        const { data: nuevoCliente, error: errorCliente } = await supabase
          .from('clientes')
          .insert({
            nombre: clienteNombre,
            notas: nombrePersona !== clienteNombre ? `Titular: ${nombrePersona}` : null
          })
          .select()
          .single();

        if (errorCliente) {
          console.error('Error creando cliente:', errorCliente);
          errors++;
          erroresDetalle.push(`Error creando ${clienteNombre}: ${errorCliente.message}`);
          continue;
        }

        clienteId = nuevoCliente.id;
      }

      // Calcular fechas para el contrato de mantenimiento
      const fechaAlta = new Date().toISOString().split('T')[0]; // Fecha actual
      let fechaCaducidad = new Date();

      // Determinar la fecha de caducidad según el tipo de servicio
      if (tipoServicio.toUpperCase().includes('TRIMESTRAL')) {
        fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 3);
      } else if (tipoServicio.toUpperCase().includes('SEMESTRAL')) {
        fechaCaducidad.setMonth(fechaCaducidad.getMonth() + 6);
      } else if (tipoServicio.toUpperCase().includes('ANUAL')) {
        fechaCaducidad.setFullYear(fechaCaducidad.getFullYear() + 1);
      } else {
        // Por defecto, 1 año
        fechaCaducidad.setFullYear(fechaCaducidad.getFullYear() + 1);
      }

      // Insertar contrato de mantenimiento
      const { error: errorContrato } = await supabase
        .from('contratos_mantenimiento')
        .insert({
          cliente_id: clienteId,
          tipo: tipoServicio,
          fecha_alta: fechaAlta,
          fecha_caducidad: fechaCaducidad.toISOString().split('T')[0],
          activo: true
        });

      if (errorContrato) {
        console.error('Error creando contrato:', errorContrato);
        errors++;
        erroresDetalle.push(`Error creando contrato para ${clienteNombre}: ${errorContrato.message}`);
        continue;
      }

      imported++;
      console.log(`✓ Importado: ${clienteNombre}`);
    } catch (error) {
      console.error('Error procesando línea:', error);
      errors++;
      erroresDetalle.push(`Error línea ${i + 1}: ${error}`);
    }
  }

  return { imported, errors, erroresDetalle };
}
