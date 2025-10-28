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

export async function borrarTodosLosClientes() {
  // Primero borrar contratos de mantenimiento
  const { error: errorContratos } = await supabase
    .from('contratos_mantenimiento')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (errorContratos) {
    console.error('Error borrando contratos:', errorContratos);
  }

  // Luego borrar clientes
  const { error: errorClientes } = await supabase
    .from('clientes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (errorClientes) {
    console.error('Error borrando clientes:', errorClientes);
    return false;
  }

  return true;
}

export async function importarClientes(lineasExcel?: string[]) {
  if (!lineasExcel || lineasExcel.length === 0) {
    throw new Error('No hay datos para importar. Por favor carga un archivo Excel.');
  }
  
  const lines = lineasExcel;
  let imported = 0;
  let errors = 0;
  const erroresDetalle: string[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      // Separar por punto y coma, removiendo comillas
      const parts = line.split(';').map(p => p.replace(/"/g, '').trim());
      
      if (parts.length < 5) {
        console.log('Formato incorrecto:', line);
        errors++;
        erroresDetalle.push(`Formato incorrecto: ${line.substring(0, 50)}...`);
        continue;
      }

      const fechaAlta = parseDate(parts[0]);
      const fechaCaducidad = parseDate(parts[1]);
      const nombrePersona = parts[2];
      const nombreNegocio = parts[3];
      const tipoContrato = parts[4];

      // Usar el nombre del negocio como nombre del cliente, o el nombre de la persona si no hay negocio
      const clienteNombre = nombreNegocio || nombrePersona;

      if (!clienteNombre) {
        errors++;
        erroresDetalle.push(`Sin nombre de cliente: ${line.substring(0, 50)}...`);
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

      // Insertar contrato de mantenimiento
      const { error: errorContrato } = await supabase
        .from('contratos_mantenimiento')
        .insert({
          cliente_id: clienteId,
          tipo: tipoContrato,
          fecha_alta: fechaAlta,
          fecha_caducidad: fechaCaducidad,
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
      erroresDetalle.push(`Error: ${error}`);
    }
  }

  return { imported, errors, erroresDetalle };
}
