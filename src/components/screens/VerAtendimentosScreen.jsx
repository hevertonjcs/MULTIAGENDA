import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Trash2, Edit3, CalendarCheck, UserCheck, FilterX, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VerAtendimentosScreen = ({ onNavigate, atendimentos: initialAtendimentos, onEdit, onDelete, pageVariants, pageTransition }) => {
  const [atendimentos, setAtendimentos] = useState(initialAtendimentos);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('all_vendedores');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    setAtendimentos(initialAtendimentos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, [initialAtendimentos]);

  const vendedores = useMemo(() => {
    const uniqueVendedores = new Set(atendimentos.map(at => at.vendedor).filter(Boolean));
    return Array.from(uniqueVendedores);
  }, [atendimentos]);
  
  const filteredAtendimentos = useMemo(() => {
    return atendimentos.filter(at => {
      const searchMatch = searchTerm === '' ||
        at.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        at.vendedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        at.consultor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (at.bem_interesse && at.bem_interesse.toLowerCase().includes(searchTerm.toLowerCase()));

      const dateMatch = filterDate === '' || at.data_visita === filterDate;
      
      const vendedorMatch = filterVendedor === 'all_vendedores' || at.vendedor === filterVendedor;

      let periodMatch = true;
      if (filterPeriod !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const atendimentoDate = new Date(at.data_visita + 'T00:00:00');

        if (filterPeriod === 'lastWeek') {
          const lastWeekStart = new Date(today);
          lastWeekStart.setDate(today.getDate() - 7);
          periodMatch = atendimentoDate >= lastWeekStart && atendimentoDate < today;
        } else if (filterPeriod === 'nextWeek') {
          // Para atendimentos, "próxima semana" pode não fazer tanto sentido, mas mantendo a lógica se necessário.
          const nextWeekEnd = new Date(today);
          nextWeekEnd.setDate(today.getDate() + 8); 
          periodMatch = atendimentoDate >= today && atendimentoDate < nextWeekEnd;
        }
      }
      return searchMatch && dateMatch && vendedorMatch && periodMatch;
    });
  }, [atendimentos, searchTerm, filterDate, filterVendedor, filterPeriod]);

  const handleDelete = (id) => {
    onDelete(id);
  };
  
  const handleEdit = (atendimento) => {
    onEdit(atendimento);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterVendedor('all_vendedores');
    setFilterPeriod('all');
    toast({ title: "Filtros limpos!" });
  };

  return (
    <motion.div
      key="verAtendimentos"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="w-full"
    >
      <div className="screen-card-container">
        <div className="screen-header justify-between">
          <div className="flex items-center">
            <Button 
              onClick={() => onNavigate('adminDashboard')}
              variant="outline"
              size="icon"
              className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <ListChecks className="w-6 h-6 sm:w-7 sm:h-7 text-brand-icon mr-2 sm:mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Atendimentos</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Visualize e gerencie os atendimentos.</p>
            </div>
          </div>
          <div className="relative w-full sm:w-auto sm:max-w-xs mt-3 sm:mt-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <Input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-full text-sm"
            />
          </div>
        </div>

        <div className="screen-content-area">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-brand-input-bg/50 rounded-lg">
            <div>
              <Label htmlFor="filterDateAt" className="form-label text-xs">Data da Visita</Label>
              <Input 
                type="date" 
                id="filterDateAt" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="form-input text-sm"
              />
            </div>
            <div>
              <Label htmlFor="filterVendedorAt" className="form-label text-xs">Vendedor</Label>
              <Select value={filterVendedor} onValueChange={setFilterVendedor}>
                <SelectTrigger id="filterVendedorAt" className="select-trigger-styled text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="select-content-styled">
                  <SelectItem value="all_vendedores">Todos</SelectItem>
                  {vendedores.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterPeriodAt" className="form-label text-xs">Período</Label>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger id="filterPeriodAt" className="select-trigger-styled text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="select-content-styled">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="lastWeek">Última Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="secondary-button w-full text-sm">
                <FilterX className="w-3.5 h-3.5 mr-1.5"/> Limpar
              </Button>
            </div>
          </div>
        
          {filteredAtendimentos.length === 0 ? (
            <p className="text-center text-brand-text-secondary text-sm sm:text-base py-8">Nenhum atendimento encontrado.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredAtendimentos.map((at) => (
                <motion.div
                  key={at.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Card className="bg-brand-card border-brand-input-border hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 pt-3 px-3 sm:pb-3 sm:pt-4 sm:px-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start">
                        <div className="mb-1.5 sm:mb-0">
                          <CardTitle className="text-base sm:text-lg text-brand-text-primary">{at.cliente}</CardTitle>
                          <p className="text-xs text-brand-text-secondary flex items-center">
                            <CalendarCheck className="w-3 h-3 mr-1 shrink-0"/> 
                            Visitado em: {new Date(at.data_visita + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-brand-text-secondary flex items-center mt-0.5">
                            <UserCheck className="w-3 h-3 mr-1 shrink-0"/> 
                            Vendedor: {at.vendedor} (Consultor: {at.consultor})
                          </p>
                        </div>
                        <div className="flex space-x-1.5 self-start sm:self-center">
                          <Button variant="outline" size="icon" className="icon-button edit-button-outline h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleEdit(at)}>
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="icon-button destructive-button-outline h-7 w-7 sm:h-8 sm:w-8" onClick={() => handleDelete(at.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-brand-text-secondary space-y-1 px-3 pb-3 sm:px-4 sm:pb-4 text-xs">
                      <p><strong className="text-brand-text-primary/80">Horário:</strong> {at.horario_entrada} - {at.horario_saida}</p>
                      <p><strong className="text-brand-text-primary/80">Finalidade:</strong> {at.finalidade}</p>
                      {at.bem_interesse && <p><strong className="text-brand-text-primary/80">Interesse:</strong> {at.bem_interesse}</p>}
                      {at.contato && <p><strong className="text-brand-text-primary/80">Contato:</strong> {at.contato}</p>}
                      {at.valor_entrada && <p><strong className="text-brand-text-primary/80">Entrada:</strong> {at.valor_entrada}</p>}
                      {at.observacao && <p className="truncate"><strong className="text-brand-text-primary/80">Obs:</strong> {at.observacao}</p>}
                      <p className="text-xs text-brand-text-secondary/70 pt-0.5">ID: {at.id.toString().substring(0,8)}... - {new Date(at.timestamp).toLocaleDateString('pt-BR')}</p>
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

export default VerAtendimentosScreen;