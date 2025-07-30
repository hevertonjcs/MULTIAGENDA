import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const RegistrarAtendimentoScreen = ({ initialData, onSubmit, onNavigate, pageVariants, pageTransition, isEditing }) => {
  const [atendimento, setAtendimento] = useState(initialData);
  const { toast } = useToast();

  useEffect(() => {
    setAtendimento(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!atendimento.consultor || !atendimento.vendedor || !atendimento.data_visita || 
        !atendimento.cliente || !atendimento.horario_entrada || !atendimento.horario_saida || 
        !atendimento.finalidade || !atendimento.contato) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    onSubmit(atendimento);
  };

  return (
    <motion.div
      key="registrar"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="screen-card-container">
        <div className="screen-header">
          <Button 
            onClick={() => onNavigate(isEditing ? 'verAtendimentos' : 'menu')}
            variant="outline"
            size="icon"
            className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-brand-icon mr-2 sm:mr-3" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">{isEditing ? 'Editar Atendimento' : 'Registrar Atendimento'}</h1>
            {!isEditing && <p className="text-xs sm:text-sm text-brand-text-secondary">Registre os dados do atendimento realizado</p>}
          </div>
        </div>

        <CardContent className="screen-content-area">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <Label htmlFor="consultor" className="form-label">Nome do Consultor *</Label>
                <Input
                  id="consultor"
                  value={atendimento.consultor || ''}
                  onChange={(e) => setAtendimento({...atendimento, consultor: e.target.value})}
                  className="form-input"
                  placeholder="Nome do consultor"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="vendedorAtendimento" className="form-label">Nome do Vendedor que Atendeu *</Label>
                <Input
                  id="vendedorAtendimento"
                  value={atendimento.vendedor || ''}
                  onChange={(e) => setAtendimento({...atendimento, vendedor: e.target.value})}
                  className="form-input"
                  placeholder="Nome do vendedor"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <Label htmlFor="dataVisita" className="form-label">Data da Visita *</Label>
                <Input
                  id="dataVisita"
                  type="date"
                  value={atendimento.data_visita || ''}
                  onChange={(e) => setAtendimento({...atendimento, data_visita: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="clienteAtendimento" className="form-label">Nome do Cliente *</Label>
                <Input
                  id="clienteAtendimento"
                  value={atendimento.cliente || ''}
                  onChange={(e) => setAtendimento({...atendimento, cliente: e.target.value})}
                  className="form-input"
                  placeholder="Nome do cliente atendido"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <Label htmlFor="horarioEntrada" className="form-label">Horário de Entrada *</Label>
                <Input
                  id="horarioEntrada"
                  type="time"
                  value={atendimento.horario_entrada || ''}
                  onChange={(e) => setAtendimento({...atendimento, horario_entrada: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="horarioSaida" className="form-label">Horário de Saída *</Label>
                <Input
                  id="horarioSaida"
                  type="time"
                  value={atendimento.horario_saida || ''}
                  onChange={(e) => setAtendimento({...atendimento, horario_saida: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <Label htmlFor="finalidade" className="form-label">Finalidade *</Label>
                <Input
                  id="finalidade"
                  value={atendimento.finalidade || ''}
                  onChange={(e) => setAtendimento({...atendimento, finalidade: e.target.value})}
                  className="form-input"
                  placeholder="Finalidade do atendimento"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="contatoAtendimento" className="form-label">Contato *</Label>
                <Input
                  id="contatoAtendimento"
                  value={atendimento.contato || ''}
                  onChange={(e) => setAtendimento({...atendimento, contato: e.target.value})}
                  className="form-input"
                  placeholder="Telefone ou email"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1">
                <Label htmlFor="bemInteresseAtendimento" className="form-label">Bem de Interesse</Label>
                <Input
                  id="bemInteresseAtendimento"
                  value={atendimento.bem_interesse || ''}
                  onChange={(e) => setAtendimento({...atendimento, bem_interesse: e.target.value})}
                  className="form-input"
                  placeholder="Imóvel ou produto de interesse"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="valorEntradaAtendimento" className="form-label">Valor de Entrada</Label>
                <Input
                  id="valorEntradaAtendimento"
                  value={atendimento.valor_entrada || ''}
                  onChange={(e) => setAtendimento({...atendimento, valor_entrada: e.target.value})}
                  className="form-input"
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="observacao" className="form-label">Observação</Label>
              <Textarea
                id="observacao"
                value={atendimento.observacao || ''}
                onChange={(e) => setAtendimento({...atendimento, observacao: e.target.value})}
                className="form-input"
                placeholder="Observações sobre o atendimento"
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full primary-button font-semibold py-3"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar Alterações' : 'Registrar Atendimento'}
            </Button>
          </form>
        </CardContent>
      </div>
    </motion.div>
  );
};

export default RegistrarAtendimentoScreen;