import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { logExport } from "@/lib/auditLog";
import { Ticket } from "@/types/cliente";

export const exportarHistorial = async (
  historialCompleto: Ticket[],
  ticketsAbiertos: Ticket[],
  nombreCliente: string,
  clienteId?: string
) => {
  try {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text(`Historial de Tickets - ${nombreCliente}`, 14, 15);

    // Fecha del reporte
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    // Preparar datos para la tabla
    const tableData = historialCompleto.map((t) => [
      `#${t.numero}`,
      t.titulo,
      t.estado === 'activo' ? 'Activo' : 'Finalizado',
      new Date(t.fecha_creacion).toLocaleDateString(),
    ]);

    // Crear tabla
    autoTable(doc, {
      startY: 28,
      head: [["Número", "Título", "Estado", "Fecha Creación"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
      },
    });

    // Resumen al final
    const finalY = (doc as any).lastAutoTable.finalY || 28;
    doc.setFontSize(12);
    doc.text("Resumen", 14, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Total de tickets: ${historialCompleto.length}`, 14, finalY + 17);
    doc.text(`Tickets abiertos: ${ticketsAbiertos.length}`, 14, finalY + 24);
    doc.text(`Tickets finalizados: ${historialCompleto.filter((t) => t.estado === "finalizado").length}`, 14, finalY + 31);

    // Agregar logo en la parte inferior derecha
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      const reader = new FileReader();

      await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();
          const logoWidth = 30;
          const logoHeight = 15;
          const margin = 10;

          // Posicionar en la parte inferior derecha
          const x = pageWidth - logoWidth - margin;
          const y = pageHeight - logoHeight - margin;

          doc.addImage(base64data, 'PNG', x, y, logoWidth, logoHeight);
          resolve(null);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (logoError) {
      console.error("Error cargando logo:", logoError);
      // Continuar sin logo si hay error
    }

    // Guardar PDF
    doc.save(`historial-tickets-${nombreCliente.toLowerCase().replace(/\s+/g, '-')}.pdf`);

    // Registrar exportación en auditoría
    if (clienteId) {
      await logExport("tickets", `Exportación PDF de historial completo de tickets del cliente ${nombreCliente}`);
    }

    toast.success("Historial exportado en PDF");
  } catch (error) {
    console.error("Error exportando PDF:", error);
    toast.error("Error al exportar el historial");
  }
};

export const descargarLogo = async (logoUrl: string, nombreCliente: string) => {
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const extension = logoUrl.split('.').pop()?.split('?')[0] || 'png';
    a.download = `logo-${nombreCliente.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Logo descargado");
  } catch (error) {
    console.error("Error descargando logo:", error);
    toast.error("Error al descargar el logo");
  }
};

export const enviarHistorialEmail = async () => {
  // Aquí implementarías el envío por email
  toast.info("Función de envío por email próximamente");
};
