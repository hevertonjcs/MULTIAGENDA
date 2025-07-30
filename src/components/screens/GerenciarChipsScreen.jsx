import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, PlusCircle, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const GerenciarChipsScreen = ({ onNavigate, pageVariants, pageTransition }) => {
  const [chips, setChips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChip, setEditingChip] = useState(null);
  const [chipData, setChipData] = useState({
    identificacao: '',
    numero_chip: '',
    vendedor_atual: '',
    ultimo_vendedor: '',
    status: 'Livre',
    data_ativacao: '',
    data_ultima_recarga: '',
    observacao: ''
  });
  const { toast } = useToast();

  const statusOptions = ['Em uso', 'Livre', 'Bloqueado', 'Indisponivel', 'Perdido', 'Sem recarga', 'ADM'];
  const statusColors = {
    'Em uso': 'bg-green-100 text-green-800 border-green-300',
    'Livre': 'bg-blue-100 text-blue-800 border-blue-300',
    'Bloqueado': 'bg-red-100 text-red-800 border-red-300',
    'Indisponivel': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Perdido': 'bg-orange-100 text-orange-800 border-orange-300',
    'Sem recarga': 'bg-purple-100 text-purple-800 border-purple-300',
    'ADM': 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const fetchChips = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('chips_contato').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: "Erro ao buscar chips", description: error.message, variant: "destructive" });
    } else {
      setChips(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchChips();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setChipData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value) => {
    setChipData(prev => ({ ...prev, status: value }));
  };

  const resetForm = () => {
    setEditingChip(null);
    setChipData({
      identificacao: '',
      numero_chip: '',
      vendedor_atual: '',
      ultimo_vendedor: '',
      status: 'Livre',
      data_ativacao: '',
      data_ultima_recarga: '',
      observacao: ''
    });
  };

  const handleOpenDialog = (chip = null) => {
    if (chip) {
      setEditingChip(chip);
      setChipData({
        identificacao: chip.identificacao || '',
        numero_chip: chip.numero_chip || '',
        vendedor_atual: chip.vendedor_atual || '',
        ultimo_vendedor: chip.ultimo_vendedor || '',
        status: chip.status || 'Livre',
        data_ativacao: chip.data_ativacao || '',
        data_ultima_recarga: chip.data_ultima_recarga || '',
        observacao: chip.observacao || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
        ...chipData,
        data_ativacao: chipData.data_ativacao || null,
        data_ultima_recarga: chipData.data_ultima_recarga || null,
    };

    if (editingChip) {
      const { error } = await supabase.from('chips_contato').update(dataToSubmit).eq('id', editingChip.id);
      if (error) {
        toast({ title: "Erro ao atualizar chip", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Chip atualizado com sucesso!" });
        fetchChips();
        setIsDialogOpen(false);
      }
    } else {
      const { error } = await supabase.from('chips_contato').insert([dataToSubmit]);
      if (error) {
        toast({ title: "Erro ao criar chip", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Chip criado com sucesso!" });
        fetchChips();
        setIsDialogOpen(false);
      }
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('chips_contato').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao excluir chip", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Chip excluído com sucesso!" });
      fetchChips();
    }
  };

  return (
    <motion.div
      key="gerenciarChips"
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
              onClick={() => onNavigate('adminDashboard')}
              variant="outline"
              size="icon"
              className="mr-4 secondary-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-text-primary">Chips para Contatos</h1>
              <p className="text-brand-text-secondary text-sm sm:text-base">Gerencie os chips da sua equipe.</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="primary-button">
                <PlusCircle className="w-4 h-4 mr-2" />
                Novo Chip
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-brand-card text-brand-text-primary">
              <DialogHeader>
                <DialogTitle>{editingChip ? 'Editar Chip' : 'Novo Chip'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="identificacao" className="form-label">Identificação</Label>
                    <Input id="identificacao" value={chipData.identificacao} onChange={handleInputChange} required className="form-input"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_chip" className="form-label">Número do Chip</Label>
                    <Input id="numero_chip" value={chipData.numero_chip} onChange={handleInputChange} required className="form-input"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendedor_atual" className="form-label">Vendedor Atual</Label>
                    <Input id="vendedor_atual" value={chipData.vendedor_atual} onChange={handleInputChange} className="form-input"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ultimo_vendedor" className="form-label">Último Vendedor</Label>
                    <Input id="ultimo_vendedor" value={chipData.ultimo_vendedor} onChange={handleInputChange} className="form-input"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="form-label">Status</Label>
                  <Select onValueChange={handleStatusChange} defaultValue={chipData.status}>
                    <SelectTrigger className="select-trigger-styled">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent className="select-content-styled">
                      {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_ativacao" className="form-label">Data de Ativação</Label>
                    <Input id="data_ativacao" type="date" value={chipData.data_ativacao} onChange={handleInputChange} className="form-input"/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_ultima_recarga" className="form-label">Data da Última Recarga</Label>
                    <Input id="data_ultima_recarga" type="date" value={chipData.data_ultima_recarga} onChange={handleInputChange} className="form-input"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacao" className="form-label">Observação</Label>
                  <Textarea id="observacao" value={chipData.observacao} onChange={handleInputChange} className="form-input"/>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary" className="secondary-button">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" className="primary-button">{editingChip ? 'Salvar Alterações' : 'Criar Chip'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-brand-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {isLoading ? (
                <p className="text-center p-8 text-brand-text-secondary">Carregando chips...</p>
              ) : chips.length === 0 ? (
                <p className="text-center p-8 text-brand-text-secondary">Nenhum chip cadastrado.</p>
              ) : (
                <table className="w-full text-sm text-left text-brand-text-primary">
                  <thead className="text-xs text-brand-text-secondary uppercase bg-brand-input-bg">
                    <tr>
                      <th scope="col" className="px-6 py-3">Identificação</th>
                      <th scope="col" className="px-6 py-3">Número</th>
                      <th scope="col" className="px-6 py-3">Vendedor Atual</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chips.map(chip => (
                      <tr key={chip.id} className="border-b border-brand-input-border hover:bg-brand-input-bg/50">
                        <td className="px-6 py-4 font-medium">{chip.identificacao}</td>
                        <td className="px-6 py-4">{chip.numero_chip}</td>
                        <td className="px-6 py-4">{chip.vendedor_atual || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[chip.status] || statusColors['ADM']}`}>
                            {chip.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 icon-button">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="select-content-styled">
                              <DropdownMenuItem onClick={() => handleOpenDialog(chip)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(chip.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default GerenciarChipsScreen;