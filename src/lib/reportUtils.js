export const processDataForReports = (data, filters) => {
  const { dataType, period, filterType, filterValue, customDateStart, customDateEnd } = filters;
  const isAgendamento = dataType === 'agendamentos';
  const dateField = isAgendamento ? 'data' : 'data_visita';

  const today = new Date();
  today.setHours(23, 59, 59, 999); 
  
  const filteredList = data.filter(item => {
    if (!item[dateField]) return false;
    const itemDate = new Date(item[dateField] + 'T00:00:00');
    
    let periodMatch = false;
    if (period === 'last7days') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      periodMatch = itemDate >= startDate && itemDate <= today;
    } else if (period === 'last30days') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      periodMatch = itemDate >= startDate && itemDate <= today;
    } else if (period === 'custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart + 'T00:00:00');
      const end = new Date(customDateEnd + 'T23:59:59');
      periodMatch = itemDate >= start && itemDate <= end;
    } else {
        periodMatch = true; 
    }

    let typeMatch = true;
    if (filterType !== 'none' && filterValue && filterValue !== 'all') {
      if (filterType === 'vendedor') typeMatch = item.vendedor === filterValue;
      if (filterType === 'equipe') typeMatch = item.equipe === filterValue;
    }

    return periodMatch && typeMatch;
  });

  const countBy = (arr, key) => arr.reduce((acc, item) => {
    const value = item[key] || 'N/A';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  const vendedorCounts = countBy(filteredList, 'vendedor');
  const equipeCounts = countBy(filteredList, 'equipe');

  const barChartData = Object.entries(vendedorCounts).map(([name, value]) => ({ name, value }));
  const pieChartData = Object.entries(equipeCounts).map(([name, value]) => ({ name, value }));

  return {
    list: filteredList,
    barChartData,
    pieChartData
  };
};