import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, PlusCircle, Edit, Trash2, Save, X, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GerenciarUsuariosScreen = ({ onNavigate, pageVariants, pageTransition }) => {
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'vendedor', equipe: '' });
  const { toast } = useToast();

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('username');
    if (error) {
      toast({ title: 'Erro ao buscar usuários', variant: 'destructive' });
    } else {
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  
  const handleRoleChange = (value) => {
    const newFormData = { ...formData, role: value };
    if (value !== 'vendedor') {
        // Keep equipe if it exists, otherwise set to empty string
        newFormData.equipe = formData.equipe || '';
    }
    setFormData(newFormData);
  };

  const openFormForCreate = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'vendedor', equipe: '' });
    setIsFormOpen(true);
  };

  const openFormForEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role, equipe: user.equipe || '' });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
        username: formData.username,
        role: formData.role,
        equipe: formData.equipe || null,
    };

    if (formData.password) {
        dataToSubmit.password = formData.password;
    }

    if (editingUser) {
      // Update
      const { error } = await supabase.from('users').update(dataToSubmit).eq('id', editingUser.id);
      if (error) {
        toast({ title: 'Erro ao atualizar usuário', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Usuário atualizado com sucesso!' });
        closeForm();
        fetchUsers();
      }
    } else {
      // Create
      const { error } = await supabase.from('users').insert([dataToSubmit]);
      if (error) {
        toast({ title: 'Erro ao criar usuário', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Usuário criado com sucesso!' });
        closeForm();
        fetchUsers();
      }
    }
  };

  const handleDelete = async (userId) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      toast({ title: 'Erro ao deletar usuário', variant: 'destructive' });
    } else {
      toast({ title: 'Usuário deletado!' });
      fetchUsers();
    }
  };

  return (
    <motion.div
      key="gerenciarUsuarios"
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
            <UserCog className="w-6 h-6 sm:w-7 sm:h-7 text-brand-icon mr-2 sm:mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Gerenciar Usuários</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Crie, edite e remova usuários.</p>
            </div>
          </div>
          {!isFormOpen && (
            <Button onClick={openFormForCreate} className="primary-button">
              <PlusCircle className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          )}
        </div>

        <CardContent className="screen-content-area">
          {isFormOpen ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="bg-brand-card border-brand-input-border">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                    <Button variant="ghost" size="icon" onClick={closeForm}>
                      <X className="w-5 h-5" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="username">Usuário</Label>
                      <Input id="username" value={formData.username} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password">Senha {editingUser && '(Deixe em branco para não alterar)'}</Label>
                      <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required={!editingUser} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="role">Função</Label>
                      <Select onValueChange={handleRoleChange} value={formData.role}>
                        <SelectTrigger className="select-trigger-styled">
                            <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="equipe">Equipe</Label>
                      <Input id="equipe" value={formData.equipe} onChange={handleInputChange} placeholder="Opcional para Admins/Supervisores" />
                    </div>
                    <Button type="submit" className="w-full primary-button"><Save className="w-4 h-4 mr-2" /> Salvar</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <Card key={user.id} className="bg-brand-card border-brand-input-border p-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-brand-text-primary">{user.username}</p>
                    <p className="text-sm text-brand-text-secondary">{user.role} {user.equipe && `(${user.equipe})`}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="icon" className="icon-button edit-button-outline" onClick={() => openFormForEdit(user)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" className="icon-button destructive-button-outline" onClick={() => handleDelete(user.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </div>
    </motion.div>
  );
};

export default GerenciarUsuariosScreen;