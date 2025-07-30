import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { processDataForReports } from '@/lib/reportUtils';
import { generatePDF } from '@/lib/pdfGenerator';

const GerarRelatorioScreen = ({ onNavigate, agendamentos, atendimentos, pageVariants, pageTransition }) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    dataType: 'agendamentos',
    period: 'last7days',
    filterType: 'equipe',
    filterValue: 'all',
    customDateStart: '',
    customDateEnd: '',
  });

  const availableEquipes = useMemo(() => {
    const dataToUse = filters.dataType === 'agendamentos' ? agendamentos : atendimentos;
    return Array.from(new Set(dataToUse.map(item => item.equipe).filter(Boolean)));
  }, [agendamentos, atendimentos, filters.dataType]);
  
  const handleGeneratePdf = () => {
    if (filters.period === 'custom' && (!filters.customDateStart || !filters.customDateEnd)) {
      toast({
        title: "Período inválido",
        description: "Por favor, selecione as datas de início e fim para o período personalizado.",
        variant: "destructive",
      });
      return;
    }
    
    const dataToUse = filters.dataType === 'agendamentos' ? agendamentos : atendimentos;
    const reportData = processDataForReports(dataToUse, {
        ...filters,
        filterType: 'equipe', // Garante que a lógica de filtro de equipe seja usada
    });

    if (reportData.list.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não foram encontrados registros com os filtros selecionados.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Gerando PDF...",
      description: "Seu relatório está sendo preparado e o download começará em breve.",
    });

    generatePDF(reportData, filters);
  };

  return (
    <motion.div
      key="gerarRelatorio"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="screen-card-container">
        <div className="screen-header justify-between">
          <div className="flex items-center">
            <Button onClick={() => onNavigate('adminDashboard')} variant="outline" size="icon" className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-brand-icon mr-2 sm:mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Gerar Relatório PDF</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Selecione os filtros para o seu relatório.</p>
            </div>
          </div>
        </div>

        <CardContent className="screen-content-area space-y-6">
            <div className="p-4 bg-brand-input-bg/50 rounded-lg space-y-4">
              <h2 className="text-lg font-semibold text-brand-text-primary flex items-center"><Filter className="w-5 h-5 mr-2 text-brand-primary" /> Filtros do Relatório</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Dado</Label>
                   <Select value={filters.dataType} onValueChange={(val) => setFilters(prev => ({...prev, dataType: val, filterValue: 'all'}))}>
                    <SelectTrigger className="select-trigger-styled"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendamentos">Agendamentos</SelectItem>
                      <SelectItem value="atendimentos">Atendimentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label>Equipe</Label>
                   <Select value={filters.filterValue} onValueChange={(val) => setFilters(prev => ({...prev, filterValue: val}))}>
                    <SelectTrigger className="select-trigger-styled"><SelectValue placeholder="Todas as Equipes" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Equipes</SelectItem>
                      {availableEquipes.map(eq => <SelectItem key={eq} value={eq}>{eq}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div>
                <Label>Período</Label>
                <Select value={filters.period} onValueChange={(val) => setFilters(prev => ({...prev, period: val}))}>
                  <SelectTrigger className="select-trigger-styled"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="custom">Período Específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filters.period === 'custom' && (
                <motion.div initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customDateStart">Data de Início</Label>
                    <Input type="date" id="customDateStart" value={filters.customDateStart} onChange={(e) => setFilters(prev => ({...prev, customDateStart: e.target.value}))} className="form-input"/>
                  </div>
                  <div>
                    <Label htmlFor="customDateEnd">Data de Fim</Label>
                    <Input type="date" id="customDateEnd" value={filters.customDateEnd} onChange={(e) => setFilters(prev => ({...prev, customDateEnd: e.target.value}))} className="form-input"/>
                  </div>
                </motion.div>
              )}
            </div>
          
            <Button onClick={handleGeneratePdf} className="w-full primary-button text-base py-6">
              <Download className="w-5 h-5 mr-3" />
              Gerar e Baixar PDF
            </Button>
        </CardContent>
      </div>
    </motion.div>
  );
};

export default GerarRelatorioScreen;