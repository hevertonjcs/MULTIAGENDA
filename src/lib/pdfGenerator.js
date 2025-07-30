import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (data, filters) => {
  const doc = new jsPDF();
  const { list } = data;
  const { dataType, period, customDateStart, customDateEnd } = filters;
  
  const title = `Relatório de ${dataType === 'agendamentos' ? 'Agendamentos' : 'Atendimentos'}`;
  let periodStr = '';
  switch(period) {
    case 'last7days': periodStr = 'Últimos 7 dias'; break;
    case 'custom': periodStr = `De ${new Date(customDateStart + 'T00:00:00').toLocaleDateString('pt-BR')} a ${new Date(customDateEnd + 'T00:00:00').toLocaleDateString('pt-BR')}`; break;
    default: periodStr = 'Todos';
  }

  // Title
  doc.setFontSize(18);
  doc.setTextColor('#045A3A');
  doc.text(title, 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Período: ${periodStr}`, 14, 30);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);

  let head, body;

  if (dataType === 'agendamentos') {
    head = [['Data', 'Cliente', 'Contato', 'Vendedor', 'Equipe', 'Entrada (R$)']];
    body = list.map(item => [
      new Date(item.data + 'T' + item.horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      item.cliente || '-',
      item.contato || '-',
      item.vendedor || '-',
      item.equipe || '-',
      parseFloat(item.valor_entrada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, style: 'decimal' })
    ]);
  } else {
    head = [['Data Visita', 'Cliente', 'Vendedor', 'Consultor', 'Finalidade']];
    body = list.map(item => [
      new Date(item.data_visita + 'T00:00:00').toLocaleDateString('pt-BR'),
      item.cliente,
      item.vendedor,
      item.consultor,
      item.finalidade
    ]);
  }

  doc.autoTable({
    startY: 45,
    head: head,
    body: body,
    theme: 'grid',
    headStyles: { fillColor: '#08A064' },
    styles: { fontSize: 8 },
    columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
    }
  });

  doc.save(`relatorio_${dataType}_${new Date().toISOString().slice(0,10)}.pdf`);
};