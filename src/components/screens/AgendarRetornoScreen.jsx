import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PhoneForwarded, Save, User, Phone, Calendar, Clock, UserCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const AgendarRetornoScreen = ({ initialData, onSubmit, onNavigate, pageVariants, pageTransition, isEditing, userInfo }) => {
  const [formData, setFormData] = useState(initialData);
  const [supervisores, setSupervisores] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(initialData);
    const fetchSupervisores = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .in('role', ['supervisor', 'admin']);
      
      if (error) {
        toast({ title: "Erro ao buscar supervisores", description: error.message, variant: "destructive" });
      } else {
        setSupervisores(data.map(s => s.username));
      }
    };
    fetchSupervisores();
  }, [initialData, toast]);

  const handleNavigateBack = () => {
    if (isEditing) {
      onNavigate('verRetornos');
    } else if (userInfo.role === 'vendedor') {
      onNavigate('vendedorMenu');
    } else {
      onNavigate('menu');
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome_cliente || !formData.numero_contato || !formData.data_retorno || !formData.horario_retorno || !formData.supervisor_responsavel) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos marcados com *", variant: "destructive" });
      return;
    }
    onSubmit(formData);
    if (!isEditing) {
      setFormData(initialData);
    }
  };

  const statusOptions = ['Pendente', 'Em contato', 'Atendimento feito', 'Não atendeu', 'Bloqueador de chamadas', 'Ainda possui duvidas', 'Agendado'];

  return (
    <motion.div
      key="agendarRetorno"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="screen-card-container">
        <div className="screen-header">
          <Button 
            onClick={handleNavigateBack}
            variant="outline"
            size="icon"
            className="mr-4 secondary-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <PhoneForwarded className="w-7 h-7 text-brand-icon mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-brand-text-primary">{isEditing ? 'Editar Retorno' : 'Agendar Retorno'}</h1>
            <p className="text-sm text-brand-text-secondary">Preencha os detalhes para a ligação de retorno.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="screen-content-area space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nome_cliente" className="form-label flex items-center mb-2"><User className="w-4 h-4 mr-2"/>Nome do Cliente *</Label>
              <Input id="nome_cliente" value={formData.nome_cliente} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <Label htmlFor="numero_contato" className="form-label flex items-center mb-2"><Phone className="w-4 h-4 mr-2"/>Número de Contato *</Label>
              <Input id="numero_contato" value={formData.numero_contato} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <Label htmlFor="data_retorno" className="form-label flex items-center mb-2"><Calendar className="w-4 h-4 mr-2"/>Data do Retorno *</Label>
              <Input type="date" id="data_retorno" value={formData.data_retorno} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <Label htmlFor="horario_retorno" className="form-label flex items-center mb-2"><Clock className="w-4 h-4 mr-2"/>Horário do Retorno *</Label>
              <Input type="time" id="horario_retorno" value={formData.horario_retorno} onChange={handleChange} className="form-input" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="supervisor_responsavel" className="form-label flex items-center mb-2"><UserCheck className="w-4 h-4 mr-2"/>Supervisor Responsável *</Label>
              <Select value={formData.supervisor_responsavel} onValueChange={(value) => handleSelectChange('supervisor_responsavel', value)} required>
                <SelectTrigger className="select-trigger-styled">
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent className="select-content-styled">
                  {supervisores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {isEditing && (
              <div className="md:col-span-2">
                <Label htmlFor="status" className="form-label flex items-center mb-2"><Info className="w-4 h-4 mr-2"/>Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} required>
                  <SelectTrigger className="select-trigger-styled">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="select-content-styled">
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="md:col-span-2">
              <Label htmlFor="detalhes" className="form-label flex items-center mb-2"><Info className="w-4 h-4 mr-2"/>Detalhes Adicionais</Label>
              <Textarea id="detalhes" value={formData.detalhes} onChange={handleChange} className="form-input" rows={4} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="primary-button">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? 'Salvar Alterações' : 'Agendar Retorno'}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AgendarRetornoScreen;