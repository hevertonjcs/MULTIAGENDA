import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarPlus, ArrowLeft, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const AgendarVisitaScreen = ({ initialData, onSubmit, onNavigate, pageVariants, pageTransition, isEditing, userInfo, onLogout }) => {
  const [agendamento, setAgendamento] = useState(initialData);
  const { toast } = useToast();

  useEffect(() => {
    setAgendamento(initialData);
  }, [initialData]);

  const handleNavigateBack = () => {
    if (isEditing) {
      onNavigate('verAgendamentos');
    } else if (userInfo.role === 'vendedor') {
      onNavigate('vendedorMenu');
    } else {
      onNavigate('menu');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agendamento.data || !agendamento.horario || !agendamento.cliente || !agendamento.contato) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha Data, Horário, Cliente e Contato.",
        variant: "destructive"
      });
      return;
    }
    onSubmit(agendamento);
    if (!isEditing) {
      setAgendamento(initialData);
    }
  };

  return (
    <motion.div
      key="agendar"
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
              onClick={handleNavigateBack}
              variant="outline"
              size="icon"
              className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <CalendarPlus className="w-6 h-6 sm:w-7 sm:h-7 text-brand-icon mr-2 sm:mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">{isEditing ? 'Editar Agendamento' : 'Agendar Visita'}</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">
                {userInfo.role === 'vendedor' ? `Vendedor: ${userInfo.username}` : 'Preencha os dados para agendar.'}
              </p>
            </div>
          </div>
           {userInfo.role === 'vendedor' && (
             <Button 
                onClick={onLogout}
                variant="outline"
                className="destructive-button-outline text-sm"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sair
              </Button>
           )}
        </div>

        <CardContent className="screen-content-area">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <Label htmlFor="data" className="form-label">Data do Agendamento *</Label>
                <Input
                  id="data"
                  type="date"
                  value={agendamento.data}
                  onChange={(e) => setAgendamento({...agendamento, data: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="horario" className="form-label">Horário do Agendamento *</Label>
                <Input
                  id="horario"
                  type="time"
                  value={agendamento.horario}
                  onChange={(e) => setAgendamento({...agendamento, horario: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cliente" className="form-label">Nome do Cliente *</Label>
              <Input
                id="cliente"
                value={agendamento.cliente}
                onChange={(e) => setAgendamento({...agendamento, cliente: e.target.value})}
                className="form-input"
                placeholder="Digite o nome do Cliente."
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="contato" className="form-label">Contato *</Label>
              <Input
                id="contato"
                value={agendamento.contato}
                onChange={(e) => setAgendamento({...agendamento, contato: e.target.value})}
                className="form-input"
                placeholder="Digite o Numero de telefone do cliente..."
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="bemInteresse" className="form-label">Bem de Interesse</Label>
              <Input
                id="bemInteresse"
                value={agendamento.bem_interesse || ''}
                onChange={(e) => setAgendamento({...agendamento, bem_interesse: e.target.value})}
                className="form-input"
                placeholder="Digite o bem de interesse (opcional)"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="valorEntrada" className="form-label">Valor de Entrada</Label>
              <Input
                id="valorEntrada"
                value={agendamento.valor_entrada || ''}
                onChange={(e) => setAgendamento({...agendamento, valor_entrada: e.target.value})}
                className="form-input"
                placeholder="Digite o Valor de entrada (opcional)"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="informacaoAdicional" className="form-label">Informação Adicional</Label>
              <Textarea
                id="informacaoAdicional"
                value={agendamento.informacao_adicional || ''}
                onChange={(e) => setAgendamento({...agendamento, informacao_adicional: e.target.value})}
                className="form-input"
                placeholder="Observações ou informações extras"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full primary-button font-semibold py-3"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar Alterações' : 'Salvar Agendamento'}
            </Button>
          </form>
        </CardContent>
      </div>
    </motion.div>
  );
};

export default AgendarVisitaScreen;