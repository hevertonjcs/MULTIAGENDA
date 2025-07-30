import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Trash2, Edit3, PhoneIncoming, User, FilterX, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const VerRetornosScreen = ({ onNavigate, retornos, onEdit, onDelete, pageVariants, pageTransition, userInfo }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  const statusOptions = ['Pendente', 'Em contato', 'Atendimento feito', 'Não atendeu', 'Bloqueador de chamadas', 'Ainda possui duvidas', 'Agendado'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Atendimento feito': return 'border-l-4 border-green-500';
      case 'Agendado': return 'border-l-4 border-blue-500';
      case 'Não atendeu': return 'border-l-4 border-red-500';
      case 'Bloqueador de chamadas': return 'border-l-4 border-red-700';
      case 'Em contato': return 'border-l-4 border-yellow-500';
      case 'Ainda possui duvidas': return 'border-l-4 border-orange-500';
      default: return 'border-l-4 border-gray-400';
    }
  };

  const filteredRetornos = useMemo(() => {
    return retornos.filter(r => {
      const searchMatch = searchTerm === '' ||
        r.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.vendedor_solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.supervisor_responsavel?.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = filterStatus === 'all' || r.status === filterStatus;
      
      return searchMatch && statusMatch;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [retornos, searchTerm, filterStatus]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    toast({ title: "Filtros limpos!" });
  };
  
  const handleBackNavigation = () => {
    if (userInfo?.role === 'vendedor') {
      onNavigate('vendedorMenu');
    } else {
      onNavigate('adminDashboard');
    }
  };


  return (
    <motion.div
      key="verRetornos"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="screen-card-container">
        <div className="screen-header justify-between">
          <div className="flex items-center">
            <Button 
              onClick={handleBackNavigation}
              variant="outline"
              size="icon"
              className="mr-4 secondary-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">Retornos Agendados</h1>
              <p className="text-brand-text-secondary text-sm sm:text-base">Gerencie as ligações de retorno.</p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:max-w-xs mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <Input 
                type="text"
                placeholder="Buscar por cliente, vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>
          </div>
        </div>
        
        <div className="screen-content-area">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="filterStatus" className="form-label mb-2 block">Filtrar por Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="filterStatus" className="select-trigger-styled">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="select-content-styled">
                  <SelectItem value="all">Todos</SelectItem>
                  {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full secondary-button">
                <FilterX className="w-4 h-4 mr-2"/> Limpar Filtros
              </Button>
            </div>
          </div>

          {filteredRetornos.length === 0 ? (
            <p className="text-center text-brand-text-secondary py-10">Nenhum retorno encontrado.</p>
          ) : (
            <div className="space-y-4">
              {filteredRetornos.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <Card className={`bg-brand-input-bg/50 hover:bg-brand-input-bg transition-colors duration-200 ${getStatusColor(r.status)}`}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-brand-text-primary">{r.nome_cliente}</CardTitle>
                          <p className="text-sm font-semibold text-brand-text-primary">{r.status}</p>
                          <div className="text-xs text-brand-text-secondary mt-2 space-y-1">
                            <p className="flex items-center"><Calendar className="w-3 h-3 mr-2 shrink-0"/> {new Date(r.data_retorno + 'T00:00:00').toLocaleDateString('pt-BR')} às {r.horario_retorno}</p>
                            <p className="flex items-center"><User className="w-3 h-3 mr-2 shrink-0"/> Resp: {r.supervisor_responsavel} (por: {r.vendedor_solicitante})</p>
                            <p className="flex items-center"><PhoneIncoming className="w-3 h-3 mr-2 shrink-0"/> {r.numero_contato}</p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 icon-button edit-button-outline" onClick={() => onEdit(r)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 icon-button destructive-button-outline" onClick={() => onDelete(r.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {r.detalhes && 
                      <CardContent className="px-4 pb-4 pt-0">
                        <p className="text-xs text-brand-text-secondary bg-brand-card p-2 rounded-md"><strong className="text-brand-text-primary">Detalhes:</strong> {r.detalhes}</p>
                      </CardContent>
                    }
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

export default VerRetornosScreen;