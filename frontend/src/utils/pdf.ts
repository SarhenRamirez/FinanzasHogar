import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Producto } from '../types';

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export function generarPDFInventario(productos: Producto[], total: number) {
  const doc = new jsPDF();
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 220, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22); doc.setFont('helvetica', 'bold');
  doc.text('FinanzasHogar - Inventario', 14, 18);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CO', { dateStyle: 'full' })}`, 14, 28);
  doc.setTextColor(0, 0, 0);

  const categorias = ['granos', 'verdura', 'proteina', 'aseo'];
  let startY = 45;

  for (const cat of categorias) {
    const items = productos.filter(p => p.categoria === cat);
    if (items.length === 0) continue;
    doc.setFontSize(13); doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 102, 241);
    doc.text(cat.toUpperCase(), 14, startY);
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: startY + 3,
      head: [['Producto', 'Cantidad', 'Unidad', 'Precio Unit.', 'Subtotal']],
      body: items.map(p => [p.nombre, p.cantidad, p.unidad, formatCOP(p.precio), formatCOP(p.precio * p.cantidad)]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 240, 255] },
      margin: { left: 14, right: 14 },
    });
    startY = (doc as any).lastAutoTable.finalY + 10;
  }

  doc.setFillColor(99, 102, 241);
  doc.rect(14, startY, 182, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('TOTAL INVENTARIO:', 18, startY + 8);
  doc.text(formatCOP(total), 150, startY + 8);
  doc.save(`inventario-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generarPDFAgotados(productos: Producto[], totalReposicion: number) {
  const doc = new jsPDF();
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 0, 220, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18); doc.setFont('helvetica', 'bold');
  doc.text('FinanzasHogar - Productos Agotados', 14, 18);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO', { dateStyle: 'full' })}`, 14, 28);
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 45,
    head: [['Producto', 'Categoría', 'Cantidad actual', 'Mínimo', 'Precio Unit.']],
    body: productos.map(p => [p.nombre, p.categoria.toUpperCase(), p.cantidad, p.cantidad_minima, formatCOP(p.precio)]),
    foot: [['', '', '', 'Total a reponer:', formatCOP(totalReposicion)]],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  });
  doc.save(`agotados-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generarPDFGastos(
  gastos: { descripcion: string; categoria: string; monto: number; fecha: string }[],
  total: number, mes: string, anio: number
) {
  const doc = new jsPDF();
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, 220, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('FinanzasHogar - Reporte de Gastos', 14, 18);
  doc.setFontSize(11); doc.setFont('helvetica', 'normal');
  doc.text(`${mes} ${anio}`, 14, 28);
  doc.setTextColor(0, 0, 0);
  autoTable(doc, {
    startY: 45,
    head: [['Descripción', 'Categoría', 'Fecha', 'Monto']],
    body: gastos.map(g => [g.descripcion, g.categoria.toUpperCase(), new Date(g.fecha).toLocaleDateString('es-CO'), formatCOP(Number(g.monto))]),
    foot: [['', '', 'Total:', formatCOP(total)]],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    footStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    margin: { left: 14, right: 14 },
  });
  doc.save(`gastos-${mes.toLowerCase()}-${anio}.pdf`);
}