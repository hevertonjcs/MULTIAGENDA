import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Trash2, Edit3, CalendarDays, User, FilterX, ListFilter, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatPhone = (numero) => {
  if (!numero) return "";
  const clean = numero.replace(/\D/g, "");
  if (clean.startsWith("55")) return clean;
  if (clean.length === 11) return `55${clean}`;
  return `55${clean}`;
};

const openWhatsapp = (numero, dataAgendamento, horaAgendamento) => {
  const telefone = formatPhone(numero);
  const dataFormatada = new Date(dataAgendamento).toLocaleDateString("pt-BR").slice(0, 5);
  const horaFormatada = horaAgendamento.split(":")[0];
  const msg = `Olá, Vi aqui no sistema que você possui uma visita agendada conosco para a data ${dataFormatada} e por volta das ${horaFormatada} horas.`;
  const link = `https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`;
  window.open(link, "_blank");
};

const VerAgendamentosScreen = ({ onNavigate, agendamentos: initialAgendamentos, onEdit, onDelete, pageVariants, pageTransition }) => {
  const [agendamentos, setAgendamentos] = useState(initialAgendamentos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('all_vendedores');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    setAgendamentos(initialAgendamentos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, [initialAgendamentos]);

  const vendedores = useMemo(() => {
    const uniqueVendedores = new Set(agendamentos.map(ag => ag.vendedor).filter(Boolean));
    return Array.from(uniqueVendedores);
  }, [agendamentos]);

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(ag => {
      const searchMatch = searchTerm === '' ||
        ag.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ag.vendedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ag.bem_interesse && ag.bem_interesse.toLowerCase().includes(searchTerm.toLowerCase()));

      const dateMatch = filterDate === '' || ag.data === filterDate;
      const vendedorMatch = filterVendedor === 'all_vendedores' || ag.vendedor === filterVendedor;

      let periodMatch = true;
      if (filterPeriod !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const agendDate = new Date(ag.data + 'T00:00:00');
        if (filterPeriod === 'lastWeek') {
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - 7);
          periodMatch = agendDate >= lastWeekStart && agendDate < today;
        } else if (filterPeriod === 'nextWeek') {
          const nextWeekEnd = new Date(today);
          nextWeekEnd.setDate(today.getDate() + 8);
          periodMatch = agendDate >= today && agendDate < nextWeekEnd;
        }
      }

      return searchMatch && dateMatch && vendedorMatch && periodMatch;
    });
  }, [agendamentos, searchTerm, filterDate, filterVendedor, filterPeriod]);

  const handleDelete = (id) => {
    onDelete(id);
  };

  const handleEdit = (agendamento) => {
    onEdit(agendamento);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterVendedor('all_vendedores');
    setFilterPeriod('all');
    toast({ title: "Filtros limpos!" });
  };

  return (
    <motion.div key="verAgendamentos" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="w-full">
      <div className="screen-card-container">
        <div className="screen-header justify-between">
          <div className="flex items-center">
            <Button onClick={() => onNavigate('adminDashboard')} variant="outline" size="icon" className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <ListFilter className="w-6 h-6 sm:w-7 h-7 text-brand-icon mr-2 sm:mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Agendamentos</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Visualize e gerencie os agendamentos.</p>
            </div>
          </div>
          <div className="relative w-full sm:w-auto sm:max-w-xs mt-3 sm:mt-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <Input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input pl-10 w-full text-sm" />
          </div>
        </div>

        <div className="screen-content-area">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-brand-input-bg/50 rounded-lg">
            <div>
              <Label htmlFor="filterDate" className="form-label text-xs">Data</Label>
              <Input type="date" id="filterDate" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="form-input text-sm" />
            </div>
            <div>
              <Label htmlFor="filterVendedor" className="form-label text-xs">Vendedor</Label>
              <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                <SelectTrigger id="filterVendedor" className="select-trigger-styled text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="select-content-styled">
                  <SelectItem value="all_vendedores">Todos</SelectItem>
                  {vendedores.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterPeriod" className="form-label text-xs">Período</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger id="filterPeriod" className="select-trigger-styled text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="select-content-styled">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="lastWeek">Última Semana</SelectItem>
                  <SelectItem value="nextWeek">Próxima Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="secondary-button w-full text-sm">
                <FilterX className="w-3.5 h-3.5 mr-1.5" /> Limpar
              </Button>
            </div>
          </div>

          {filteredAgendamentos.length === 0 ? (
            <p className="text-center text-brand-text-secondary text-sm sm:text-base py-8">Nenhum agendamento encontrado.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAgendamentos.map((ag) => (
                <motion.div key={ag.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} layout>
                  <Card className="bg-brand-card border-brand-input-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-3 px-3 sm:pb-3 sm:pt-4 sm:px-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="mb-1.5 sm:mb-0">
                          <CardTitle className="text-base sm:text-lg text-brand-text-primary">{ag.cliente}</CardTitle>
                          <p className="text-xs text-brand-text-secondary flex items-center">
                            <CalendarDays className="w-3 h-3 mr-1 shrink-0" />
                            {new Date(ag.data + 'T' + ag.horario).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-brand-text-secondary flex items-center mt-0.5">
                            <User className="w-3 h-3 mr-1 shrink-0" />
                            Vendedor: {ag.vendedor}
                          </p>
                        </div>
                        <div className="flex space-x-1.5 self-start sm:self-center">
                          <Button variant="outline" size="icon" className="icon-button edit-button-outline h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleEdit(ag)}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="icon-button destructive-button-outline h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDelete(ag.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="icon-button whatsapp-button-outline h-7 w-7 sm:h-8 sm:w-8" onClick={() => openWhatsapp(ag.contato || ag.telefone, ag.data, ag.horario)}>
                            <MessageCircle className="w-3.5 h-3.5 text-green-600" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-brand-text-secondary space-y-1 px-3 pb-3 sm:px-4 sm:pb-4 text-xs">
                      {ag.bem_interesse && <p><strong className="text-brand-text-primary/80">Interesse:</strong> {ag.bem_interesse}</p>}
                      {ag.contato && <p><strong className="text-brand-text-primary/80">Contato:</strong> {ag.contato}</p>}
                      {ag.valor_entrada && <p><strong className="text-brand-text-primary/80">Entrada:</strong> {ag.valor_entrada}</p>}
                      {ag.informacao_adicional && <p className="truncate"><strong className="text-brand-text-primary/80">Obs:</strong> {ag.informacao_adicional}</p>}
                      <p className="text-xs text-brand-text-secondary/70 pt-0.5">ID: {ag.id.toString().substring(0, 8)}... - {new Date(ag.timestamp).toLocaleDateString('pt-BR')}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VerAgendamentosScreen;
