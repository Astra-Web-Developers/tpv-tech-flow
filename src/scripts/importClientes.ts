import { supabase } from "@/integrations/supabase/client";

// Datos completos del Excel extraídos del archivo
const clientesRawData = `
28-Jun-2024;"28-Jun-2025";"Maria Delrrosario Vega Ortiz";"Cafetería Caddy";"MANTENIMIENTO BDP BASICO"
27-Sep-2024;"27-Sep-2026";"Arantza Idoiaga Uribe";"Mediastop";"MANTENIMIENTO PREMIUM"
7-Oct-2024;"7-Oct-2025";"PESCADOS Y MARISCOS LARATXE, SL";"Pescadería Nagore";"MANTENIMIENTO PREMIUM"
7-Oct-2024;"7-Oct-2025";"Pescados y mariscos Laratxe, sl";"Pescadería (Nagore) - San Inazio";"MANTENIMIENTO PREMIUM"
10-Oct-2024;"10-Oct-2025";"MD CASTRO, SL";"BAR SUKARA  ";"MANTENIMIENTO CASHGUARD"
23-Oct-2024;"23-Oct-2025";"Hupa mistyk,sl";"Bar Mistyk";"MANTENIMIENTO ANUAL SICAX  BASICO"
25-Oct-2024;"31-Dic-2025";"Amamatita, sl";"Gallastegi Restaurante";"MANTENIMIENTO ANUAL REMOTO"
29-Oct-2024;"29-Oct-2025";"JOANA ACEBEDO PRIETO";"Estetica Bisabe";"MANTENIMIENTO PREMIUM"
30-Oct-2024;"30-Oct-2025";"Veronica Martinez Porras";"Bar Biderdi Berria";"MANTENIMIENTO ANUAL REMOTO"
30-Oct-2024;"30-Oct-2025";"Veronica Serrano Sanchez";"Cafetería Stand By (antiguo Arzabal)";"MANTENIMIENTO PREMIUM"
30-Oct-2024;"30-Oct-2025";"Santiago Robledo Luelmo";"Bazar Ugao";"MANTENIMIENTO ANUAL REMOTO"
30-Oct-2024;"30-Oct-2025";"LISBETHSI DEL CARMEN MONTILLA ARTIGAS";"M.J.DEGUSTACION";"MANTENIMIENTO BDP BASICO"
4-Nov-2024;"4-Nov-2025";"Jon Garcia Gonzalez";"Bar Bilbao Uribarri";"MANTENIMIENTO BDP BASICO"
4-Nov-2024;"4-Nov-2025";"Maria Angeles Paris Mahillo";"Paris";"MANTENIMIENTO BASICO"
4-Nov-2024;"4-Nov-2025";"Maria Pilar Carrillo Marquez";"Bar Ilargi";"MANTENIMIENTO BASICO"
4-Nov-2024;"4-Nov-2025";"Andres Rodriguez Tabares";"Kiosko El Caserío";"MANTENIMIENTO BASICO"
5-Nov-2024;"5-Nov-2025";"Noemi Moreno Muñoz";"Taberna Rubik";"MANTENIMIENTO BASICO"
5-Nov-2024;"5-Nov-2025";"Noraia Market SL ";"";"MANTENIMIENTO BASICO"
6-Nov-2024;"6-Nov-2025";"JOSE RAMON BERISTAIN CEREZO";"BERISTAIN ILUMINACION";"MANTENIMIENTO ANUAL REMOTO"
6-Nov-2024;"6-Nov-2025";"DRINK & FOOD CORNER, SL";"Zortzi Kafe";"MANTENIMIENTO PREMIUM"
8-Nov-2024;"8-Nov-2025";"TOMAS CUBERO MARCOS";"Bar Izarra";"MANTENIMIENTO PREMIUM"
8-Nov-2024;"8-Nov-2025";"Arnomendi Cafe, sl";"Arnomendi Cafe, sl";"MANTENIMIENTO PREMIUM"
11-Nov-2024;"11-Nov-2025";"Gatz Berria, sl";"Gatz";"MANTENIMIENTO PREMIUM"
11-Nov-2024;"11-Nov-2025";"Jose Antonio Martin Aranzo";"Dendareta";"MANTENIMIENTO BASICO"
11-Nov-2024;"11-Nov-2025";"VANESA JIMENEZ RODRIGUEZ";"Taberna Bengoa";"MANTENIMIENTO ANUAL SICAX  BASICO"
11-Nov-2024;"11-Nov-2025";"Restaurante Etxekoa, sl";"Taberna Etxekoa";"MANTENIMIENTO ANUAL SICAX  BASICO"
11-Nov-2024;"11-Nov-2025";"Ribera Zaharra, sl";"Cafetería La Ribera 1";"MANTENIMIENTO BDP BASICO"
12-Nov-2024;"12-Nov-2025";"Soraya Gonzalez Garrido";"Bar La Plaza";"MANTENIMIENTO ANUAL SICAX  BASICO"
13-Nov-2024;"13-Nov-2025";"Meltxorrena, sl";"Café Lorien";"MANTENIMIENTO BDP BASICO"
13-Nov-2024;"13-Nov-2025";"HIRUSTALDEGROPUSERVICIE, SL";"CAFETERIA ELORRIAGA";"MANTENIMIENTO PREMIUM"
14-Nov-2024;"14-Nov-2025";"ALAMBIQUE BILBAO S.L.";"Cafetería Alambique";"MANTENIMIENTO PREMIUM"
14-Nov-2024;"14-Nov-2025";"Iciar Perez Ugarte";"Bazar San Jose  ***LOCAL CERRADO***";"MANTENIMIENTO BASICO"
14-Nov-2024;"14-Nov-2025";"Iñigo Lopez Oca";"Café Araba";"MANTENIMIENTO BASICO"
14-Nov-2024;"14-Nov-2025";"JADO BEITIA, SL";"Ramona";"MANTENIMIENTO BDP BASICO"
14-Nov-2024;"14-Nov-2025";"DAMAJUANA BERRIA SL";"DAMAJUANA BERRIA";"MANTENIMIENTO BDP BASICO"
15-Nov-2024;"15-Nov-2025";"Alfredo Lumbreras Fernandez de Valderrama";"Leize Taberna";"MANTENIMIENTO CASHGUARD"
15-Nov-2024;"15-Nov-2025";"Alfredo Lumbreras Fernandez de Valderrama";"Leize Taberna";"MANTENIMIENTO BASICO"
15-Nov-2024;"15-Nov-2025";"Judith Hernandez de Cos";"Memento";"MANTENIMIENTO ANUAL REMOTO"
19-Nov-2024;"19-Nov-2025";"Xabier Ortega Martin";"Kili Berria";"MANTENIMIENTO BASICO"
19-Nov-2024;"19-Nov-2025";"Xabier Ortega Martin";"Kili Berria";"MANTENIMIENTO CASHGUARD"
19-Nov-2024;"19-Nov-2025";"Villazon 2021, SL";"Tahona Uribe -Barandiarán";"MANTENIMIENTO PREMIUM"
19-Nov-2024;"19-Nov-2025";"Villazon 2021, SL";"Tahona Uribe - Santutxu";"MANTENIMIENTO PREMIUM"
19-Nov-2024;"19-Nov-2025";"OSCAR MACHACA HUANCA";"TAHONA URIBE";"MANTENIMIENTO PREMIUM"
19-Nov-2024;"19-Nov-2025";"Tahona Trinidad 2022, sl";"Tahona Uribe - Astrabudua";"MANTENIMIENTO PREMIUM"
20-Nov-2024;"20-Nov-2025";"Joseba Perez Rodriguez";"Cervecera Coliseo";"MANTENIMIENTO PREMIUM"
21-Nov-2024;"21-Nov-2025";"Mari Carmen Casales Espinosa";"Peluquería Adats";"MANTENIMIENTO BASICO"
22-Nov-2024;"22-Nov-2025";"ESTHER RAMOS ALONSO";"BAR JOTAELE";"MANTENIMIENTO ANUAL SICAX  BASICO"
22-Nov-2024;"22-Nov-2025";"Eva Maria Gomez Calero";"Café Bar El Pozo";"MANTENIMIENTO BASICO"
22-Nov-2024;"22-Nov-2025";"Ileapaindegia Bikote, sl";"Peluquería Duo";"MANTENIMIENTO BDP BASICO"
25-Nov-2024;"25-Nov-2025";"IDOIA BARAÑANO BARBARA";"PELUQUERIA IB";"MANTENIMIENTO ANUAL SICAX  BASICO"
26-Nov-2024;"26-Nov-2025";"Nueva Carbonería, sl - Corto Maltes";"Corto Maltes";"MANTENIMIENTO PREMIUM"
26-Nov-2024;"26-Nov-2025";"Galevelua, sl";"Pub Galeon";"MANTENIMIENTO ANUAL SICAX  BASICO"
27-Nov-2024;"27-Nov-2025";"Ogien Artean, sl";"Ogien Artean, sl";"MANTENIMIENTO BDP BASICO"
28-Nov-2024;"28-Nov-2025";"Nueva Carbonería, SL";"La Carbonería";"MANTENIMIENTO PREMIUM"
28-Nov-2024;"28-Nov-2025";"Manuel Iturregui Legarreta";"Residence";"MANTENIMIENTO BDP BASICO"
28-Nov-2024;"28-Nov-2025";"Asador Arraiz, sl";"Asador Monte Arraiz";"MANTENIMIENTO BDP BASICO"
28-Nov-2024;"28-Nov-2025";"Catxondeo, SL";"Bluesville";"MANTENIMIENTO ANUAL SICAX  BASICO"
29-Nov-2024;"29-Nov-2025";"Juan Jose Cano Lavin";"Panadería Lavin";"MANTENIMIENTO PREMIUM"
3-Dic-2024;"3-Dic-2025";"Baccar Baracca, sl";"Sikera Bar Restaurante";"MANTENIMIENTO BDP BASICO"
3-Dic-2024;"3-Dic-2025";"Plaza Barandiaran, sl";"BAR LA CEPA";"MANTENIMIENTO PREMIUM"
3-Dic-2024;"3-Dic-2025";"AMPUERO ETXEA SL";"RESTAURANTE OYARZABAL";"MANTENIMIENTO ANUAL SICAX  BASICO"
5-Dic-2024;"5-Dic-2025";"Imes Centro de Estética Elkarte Txikia";"Imes Estética";"MANTENIMIENTO PREMIUM"
5-Dic-2024;"5-Dic-2025";"SUSANA MEZO MENOYO-AMAIA URRUTIA MAYOR, SC";"Sensaline";"MANTENIMIENTO ANUAL SICAX  BASICO"
6-Dic-2024;"6-Dic-2025";"Jose Cruz Rodrigo Camacho";"Venta de pan a domicilio (Artziniega)";"MANTENIMIENTO BASICO"
7-Dic-2024;"7-Dic-2025";"Deustubatzoki s.l.";"Batzoki Deusto ";"MANTENIMIENTO PREMIUM"
10-Dic-2024;"10-Dic-2025";"PEDRO MONTERO PELUQUEROS, SL";"PEDRO MONTERO PELUQUEROS";"MANTENIMIENTO BDP BASICO"
10-Dic-2024;"10-Dic-2025";"Begoña Salaberri Ibargutxi";"Biltegi Algorta";"MANTENIMIENTO ANUAL SICAX  BASICO"
10-Dic-2024;"10-Dic-2025";"Carlos Atxa Pajares";"Biltegi Romo";"MANTENIMIENTO ANUAL SICAX  BASICO"
11-Dic-2024;"11-Dic-2025";"Bar Gure Toki, sl";"Bar Gure Toki";"MANTENIMIENTO PREMIUM"
11-Dic-2024;"11-Dic-2025";"RICARDO FERNANDEZ LASA";"BAR EL VIVERO";"MANTENIMIENTO ANUAL SICAX  BASICO"
12-Dic-2024;"12-Dic-2025";"Jennsen & Vicsan Hosteleros, sl";"RESTAURANTE GABIÑA";"MANTENIMIENTO BDP BASICO"
12-Dic-2024;"12-Dic-2025";"JUANA BEATRIZ JALLASA CHOQUE";"FORTY FIVE - BAR CAFE";"MANTENIMIENTO CASHGUARD"
13-Dic-2024;"13-Dic-2025";"MONICA CABEZUDO GONZALEZ";"DEGUSTACIÓN ARKUPE";"MANTENIMIENTO ANUAL SICAX  BASICO"
16-Dic-2024;"16-Dic-2025";"Devon´s S.Coop";"Devon's Tavern";"MANTENIMIENTO CASHGUARD"
17-Dic-2024;"17-Dic-2025";"Aitor Alonso Gonzalez-Lidia Cuietos Viñas, CB";"Bar Etxerre";"MANTENIMIENTO ANUAL SICAX  BASICO"
20-Dic-2024;"20-Dic-2025";"Hotel Los Tamarises, sl";"Hotel Los Tamarises, sl";"MANTENIMIENTO IZARRA"
20-Dic-2024;"20-Dic-2025";"Jexa 2012, sl";"Txapela Taberna";"MANTENIMIENTO BDP BASICO"
20-Dic-2024;"20-Dic-2025";"Maydom hostelería, sl";"Bar Chevas";"MANTENIMIENTO BDP BASICO"
20-Dic-2024;"20-Dic-2025";"Mari Auxilliadora Molina Hernandez";"Ixua";"MANTENIMIENTO ANUAL SICAX  BASICO"
23-Dic-2024;"23-Dic-2025";"Monsif Chahani";"Peluquería Bizkaia";"MANTENIMIENTO ANUAL SICAX  BASICO"
23-Dic-2024;"23-Dic-2025";"FOTOCOPISTERIA ESCUZA, SL";"FOTOCOPIAS ESCUZA";"MANTENIMIENTO ANUAL SICAX  BASICO"
24-Dic-2024;"24-Dic-2025";"ASIER MIRANDA ALLUE-MAIDER CASAS GRAÑA, CB";"BAR SALOU";"MANTENIMIENTO ANUAL SICAX  BASICO"
26-Dic-2024;"26-Dic-2025";"RESVILON SL";"RESVILON";"MANTENIMIENTO BDP BASICO"
27-Dic-2024;"27-Dic-2025";"INVERSIONES PUNTO FIJO SL";"Cafetería Castarroyo";"MANTENIMIENTO BDP BASICO"
27-Dic-2024;"27-Dic-2025";"Alicia Fernandez Bilbao";"Kukulu";"MANTENIMIENTO BDP BASICO"
27-Dic-2024;"27-Dic-2025";"ZARVAJE SCOOP PEQ";"LA GRANADINA";"MANTENIMIENTO ANUAL SICAX  BASICO"
27-Dic-2024;"27-Dic-2025";"Itu partners,sl";"Shelter";"MANTENIMIENTO ANUAL SICAX  BASICO"
27-Dic-2024;"27-Dic-2025";"Pizza Parlor, sl";"La Foca Nicanora";"MANTENIMIENTO PREMIUM"
27-Dic-2024;"27-Dic-2025";"JAQUELINE MARIELA DE LA CRUZ ARIAS";"BLANCO TABERNA";"MANTENIMIENTO ANUAL SICAX  BASICO"
27-Dic-2024;"27-Dic-2025";"JESUS MARIA VALIENTE OLAIZOLA";"LANDABURU";"MANTENIMIENTO ANUAL SICAX  BASICO"
27-Dic-2024;"27-Dic-2025";"MARIA N. BRAVO BOMBIN";"GOIKAR";"MANTENIMIENTO ANUAL SICAX  BASICO"
27-Dic-2024;"27-Dic-2025";"Boimba Indautxu Hosteleros, sl";"Cafetería Bahía";"MANTENIMIENTO ANUAL REMOTO"
30-Dic-2024;"30-Dic-2025";"Iramai Arrola, slu";"Regi Jatetxea";"MANTENIMIENTO PREMIUM"
30-Dic-2024;"30-Dic-2025";"Beraia Asociados Hosteleros, sl";"Beraia Restaurante (Berzosa)";"MANTENIMIENTO BDP BASICO"
30-Dic-2024;"30-Dic-2025";"Distrito 2 Hosteleros, SLU";"Bar Uribarri";"MANTENIMIENTO BDP BASICO"
30-Dic-2024;"30-Dic-2025";"Comidas Comerciales, sl";"Chops - Zubiarte";"MANTENIMIENTO BDP BASICO"
30-Dic-2024;"30-Dic-2025";"Comidas Donostiarras 2019, sl";"Chops - Vitoria";"MANTENIMIENTO BDP BASICO"
30-Dic-2024;"30-Dic-2025";"RODICA MANEA  ****HAN CERRADO****";"IKETZA";"MANTENIMIENTO ANUAL SICAX  BASICO"
31-Dic-2024;"31-Dic-2025";"Urtzi Ruiz Meñaka";"Txiringito San Pelaio";"MANTENIMIENTO ANUAL SICAX  BASICO"
31-Dic-2024;"31-Dic-2025";"K-Ris Pasteles, sl";"La Cotorra Muda";"MANTENIMIENTO PREMIUM"
31-Dic-2024;"31-Dic-2025";"Crisder Biok, sl";"Cafetería Jk";"MANTENIMIENTO ANUAL REMOTO"
31-Dic-2024;"30-Jun-2025";"Bihotz Alai, sl";"Restaurante Aspaldiko";"MANTENIMIENTO ANUAL REMOTO"
31-Dic-2024;"30-Jun-2025";"Bihotz Alai, SL";"Sidreria Loiu";"MANTENIMIENTO BDP BASICO"
31-Dic-2024;"31-Dic-2025";"DFG-AJA-LRM, CB";"Palacio Larrea";"MANTENIMIENTO PREMIUM"
31-Dic-2024;"31-Dic-2025";"Manuel Seguin Simon";"Zurea Berria";"MANTENIMIENTO PREMIUM"
31-Dic-2024;"30-Jun-2025";"Manuel Seguin Simon";"Zurea Berria";"MANTENIMIENTO CASHLOGY"
31-Dic-2024;"31-Dic-2025";"Kerren Asador, sl";"Kerren";"MANTENIMIENTO CASHGUARD"
31-Dic-2024;"31-Dic-2025";"Kerren Asador, sl";"Kerren";"MANTENIMIENTO BDP BASICO"
31-Dic-2024;"31-Dic-2025";"I.Artetxe y E.Uzkanga, CB";"Denda Barri Areatza";"MANTENIMIENTO BDP BASICO"
`.trim();

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

export async function importarClientes() {
  const lines = clientesRawData.split('\n');
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
