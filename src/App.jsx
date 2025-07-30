import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import LoginScreen from '@/components/screens/LoginScreen.jsx';
import MenuScreen from '@/components/screens/MenuScreen.jsx';
import VendedorMenuScreen from '@/components/screens/VendedorMenuScreen.jsx';
import AgendarVisitaScreen from '@/components/screens/AgendarVisitaScreen.jsx';
import RegistrarAtendimentoScreen from '@/components/screens/RegistrarAtendimentoScreen.jsx';
import AdminDashboardScreen from '@/components/screens/AdminDashboardScreen.jsx';
import VerAgendamentosScreen from '@/components/screens/VerAgendamentosScreen.jsx';
import VerAtendimentosScreen from '@/components/screens/VerAtendimentosScreen.jsx';
import GerenciarUsuariosScreen from '@/components/screens/GerenciarUsuariosScreen.jsx';
import GerarRelatorioScreen from '@/components/screens/GerarRelatorioScreen.jsx';
import ChatScreen from '@/components/screens/ChatScreen.jsx';
import AgendarRetornoScreen from '@/components/screens/AgendarRetornoScreen.jsx';
import VerRetornosScreen from '@/components/screens/VerRetornosScreen.jsx';
import GerenciarChipsScreen from '@/components/screens/GerenciarChipsScreen.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const { toast } = useToast();

  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [editingAtendimento, setEditingAtendimento] = useState(null);
  const [editingRetorno, setEditingRetorno] = useState(null);

  const [agendamentos, setAgendamentos] = useState([]);
  const [atendimentos, setAtendimentos] = useState([]);
  const [retornos, setRetornos] = useState([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  const fetchAgendamentos = useCallback(async () => {
    const { data, error } = await supabase.from('agendamentos').select('*').order('data', { ascending: false }).order('horario', { ascending: false });
    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({ title: "Erro ao carregar agendamentos", description: error.message, variant: "destructive" });
    } else {
      setAgendamentos(data || []);
    }
  }, [toast]);

  const fetchAtendimentos = useCallback(async () => {
    const { data, error } = await supabase.from('atendimentos').select('*').order('timestamp', { ascending: false });
    if (error) {
      console.error('Erro ao buscar atendimentos:', error);
      toast({ title: "Erro ao carregar atendimentos", description: error.message, variant: "destructive" });
    } else {
      setAtendimentos(data || []);
    }
  }, [toast]);

  const fetchRetornos = useCallback(async () => {
    const { data, error } = await supabase.from('retornos').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar retornos:', error);
      toast({ title: "Erro ao carregar retornos", description: error.message, variant: "destructive" });
    } else {
      setRetornos(data || []);
    }
  }, [toast]);

  const checkNewMessages = useCallback(async () => {
    if (!loggedInUser) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last message:', error);
      return;
    }

    if (data && data.length > 0) {
      const lastMessageTimestamp = new Date(data[0].created_at).getTime();
      const lastSeenTimestamp = localStorage.getItem(`lastSeenChat_${loggedInUser.id}`);
      
      if (!lastSeenTimestamp || lastMessageTimestamp > parseInt(lastSeenTimestamp, 10)) {
        setHasNewMessages(true);
      } else {
        setHasNewMessages(false);
      }
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (loggedInUser) {
      fetchAgendamentos();
      fetchAtendimentos();
      fetchRetornos();
      checkNewMessages();

      const channels = [
        supabase.channel('chat_messages_realtime_channel').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => checkNewMessages()).subscribe(),
        supabase.channel('agendamentos_realtime_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'agendamentos' }, () => fetchAgendamentos()).subscribe(),
        supabase.channel('retornos_realtime_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'retornos' }, () => fetchRetornos()).subscribe()
      ];

      return () => {
        channels.forEach(channel => supabase.removeChannel(channel));
      };
    }
  }, [loggedInUser, fetchAgendamentos, fetchAtendimentos, fetchRetornos, checkNewMessages]);

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    toast({
      title: `Bem-vindo(a), ${user.username}!`,
      description: "Login realizado com sucesso."
    });
    if (user.role === 'vendedor') {
      setCurrentScreen('vendedorMenu');
    } else {
      setCurrentScreen('menu');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentScreen('login');
    toast({ title: "Logout realizado com sucesso." });
  };


  const handleAgendamentoSubmit = async (novoAgendamento) => {
    if (editingAgendamento) {
      const { error } = await supabase
        .from('agendamentos')
        .update({ ...novoAgendamento, timestamp: new Date().toISOString() })
        .eq('id', editingAgendamento.id);
      if (error) {
        toast({ title: "Erro ao atualizar agendamento", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Agendamento atualizado!", description: "O agendamento foi atualizado com sucesso." });
        setEditingAgendamento(null);
      }
    } else {
      const agendamentoCompleto = {
        ...novoAgendamento,
        id: Date.now(),
        vendedor: loggedInUser.username,
        equipe: loggedInUser.equipe,
        timestamp: new Date().toISOString()
      };
      const { error } = await supabase.from('agendamentos').insert([agendamentoCompleto]);
      if (error) {
        toast({ title: "Erro ao criar agendamento", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Agendamento realizado!", description: "A visita foi agendada com sucesso." });
      }
    }
    setCurrentScreen(loggedInUser.role === 'vendedor' ? 'vendedorMenu' : 'menu');
  };

  const handleAtendimentoSubmit = async (novoAtendimento) => {
    if (editingAtendimento) {
      const { error } = await supabase
        .from('atendimentos')
        .update({ ...novoAtendimento, timestamp: new Date().toISOString() })
        .eq('id', editingAtendimento.id);
      if (error) {
        toast({ title: "Erro ao atualizar atendimento", description: error.message, variant: "destructive" });
      } else {
        setEditingAtendimento(null);
        toast({ title: "Atendimento atualizado!", description: "O atendimento foi atualizado com sucesso." });
      }
    } else {
      const atendimentoCompleto = {
        ...novoAtendimento,
        equipe: loggedInUser.equipe,
        timestamp: new Date().toISOString()
      };
      const { error } = await supabase.from('atendimentos').insert([atendimentoCompleto]);
      if (error) {
        toast({ title: "Erro ao registrar atendimento", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Atendimento registrado!", description: "O atendimento foi registrado com sucesso." });
      }
    }
    setCurrentScreen('menu');
  };

  const handleRetornoSubmit = async (novoRetorno) => {
    if (editingRetorno) {
      const { error } = await supabase
        .from('retornos')
        .update(novoRetorno)
        .eq('id', editingRetorno.id);
      if (error) {
        toast({ title: "Erro ao atualizar retorno", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Retorno atualizado!", description: "O agendamento de retorno foi atualizado." });
        setEditingRetorno(null);
        setCurrentScreen('verRetornos');
      }
    } else {
      const retornoCompleto = {
        ...novoRetorno,
        vendedor_solicitante: loggedInUser.username,
      };
      const { error } = await supabase.from('retornos').insert([retornoCompleto]);
      if (error) {
        toast({ title: "Erro ao agendar retorno", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Retorno agendado!", description: "A ligação de retorno foi agendada com sucesso." });
        setCurrentScreen(loggedInUser.role === 'vendedor' ? 'vendedorMenu' : 'menu');
      }
    }
  };

  const startEditAgendamento = (agendamentoParaEditar) => {
    setEditingAgendamento(agendamentoParaEditar);
    setCurrentScreen('agendar');
  };

  const startEditAtendimento = (atendimentoParaEditar) => {
    setEditingAtendimento(atendimentoParaEditar);
    setCurrentScreen('registrar');
  };

  const startEditRetorno = (retornoParaEditar) => {
    setEditingRetorno(retornoParaEditar);
    setCurrentScreen('agendarRetorno');
  };
  
  const deleteAgendamento = async (id) => {
    const { error } = await supabase.from('agendamentos').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao excluir agendamento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agendamento excluído!", description: "O agendamento foi excluído com sucesso." });
    }
  };

  const deleteAtendimento = async (id) => {
    const { error } = await supabase.from('atendimentos').delete().eq('id', id);
     if (error) {
      toast({ title: "Erro ao excluir atendimento", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Atendimento excluído!", description: "O atendimento foi excluído com sucesso." });
    }
  };

  const deleteRetorno = async (id) => {
    const { error } = await supabase.from('retornos').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao excluir retorno", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Retorno excluído!", description: "O agendamento de retorno foi excluído." });
    }
  };

  const handleNavigateToChat = () => {
    localStorage.setItem(`lastSeenChat_${loggedInUser.id}`, Date.now().toString());
    setHasNewMessages(false);
    setCurrentScreen('chat');
  };

  const renderScreen = () => {
    if (!loggedInUser) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} pageVariants={pageVariants} pageTransition={pageTransition} />;
    }

    const initialAgendamentoData = editingAgendamento || { data: '', horario: '', cliente: '', contato: '', bem_interesse: '', valor_entrada: '', informacao_adicional: '' };
    const initialAtendimentoData = editingAtendimento || { consultor: '', vendedor: '', data_visita: '', cliente: '', horario_entrada: '', horario_saida: '', finalidade: '', contato: '', bem_interesse: '', valor_entrada: '', observacao: ''};
    const initialRetornoData = editingRetorno || { nome_cliente: '', numero_contato: '', data_retorno: '', horario_retorno: '', supervisor_responsavel: '', detalhes: '', status: 'Pendente' };
    
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLoginSuccess={handleLoginSuccess} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'menu':
        return <MenuScreen userInfo={loggedInUser} onNavigate={setCurrentScreen} onLogout={handleLogout} pageVariants={pageVariants} pageTransition={pageTransition} onNavigateToChat={handleNavigateToChat} hasNewMessages={hasNewMessages} />;
      case 'vendedorMenu':
        return <VendedorMenuScreen userInfo={loggedInUser} onNavigate={setCurrentScreen} onLogout={handleLogout} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'agendar':
        return <AgendarVisitaScreen initialData={initialAgendamentoData} onSubmit={handleAgendamentoSubmit} onNavigate={(screen) => { setCurrentScreen(screen); if(screen !== 'agendar') setEditingAgendamento(null); }} pageVariants={pageVariants} pageTransition={pageTransition} isEditing={!!editingAgendamento} userInfo={loggedInUser} onLogout={handleLogout} />;
      case 'registrar':
        return <RegistrarAtendimentoScreen initialData={initialAtendimentoData} onSubmit={handleAtendimentoSubmit} onNavigate={(screen) => { setCurrentScreen(screen); if(screen !== 'registrar') setEditingAtendimento(null); }} pageVariants={pageVariants} pageTransition={pageTransition} isEditing={!!editingAtendimento} />;
      case 'adminDashboard':
        return <AdminDashboardScreen onNavigate={setCurrentScreen} onLogout={handleLogout} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'verAgendamentos':
        return <VerAgendamentosScreen onNavigate={setCurrentScreen} agendamentos={agendamentos} onEdit={startEditAgendamento} onDelete={deleteAgendamento} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'verAtendimentos':
        return <VerAtendimentosScreen onNavigate={setCurrentScreen} atendimentos={atendimentos} onEdit={startEditAtendimento} onDelete={deleteAtendimento} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'gerenciarUsuarios':
        return <GerenciarUsuariosScreen onNavigate={setCurrentScreen} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'gerarRelatorio':
        return <GerarRelatorioScreen onNavigate={setCurrentScreen} agendamentos={agendamentos} atendimentos={atendimentos} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'chat':
        return <ChatScreen onNavigate={setCurrentScreen} userInfo={loggedInUser} pageVariants={pageVariants} pageTransition={pageTransition} />;
      case 'agendarRetorno':
        return <AgendarRetornoScreen initialData={initialRetornoData} onSubmit={handleRetornoSubmit} onNavigate={(screen) => { setCurrentScreen(screen); if(screen !== 'agendarRetorno') setEditingRetorno(null); }} pageVariants={pageVariants} pageTransition={pageTransition} isEditing={!!editingRetorno} userInfo={loggedInUser} />;
      case 'verRetornos':
        return <VerRetornosScreen onNavigate={setCurrentScreen} retornos={retornos} onEdit={startEditRetorno} onDelete={deleteRetorno} pageVariants={pageVariants} pageTransition={pageTransition} userInfo={loggedInUser} />;
      case 'gerenciarChips':
        return <GerenciarChipsScreen onNavigate={setCurrentScreen} pageVariants={pageVariants} pageTransition={pageTransition} userInfo={loggedInUser}/>;
      default:
        return <LoginScreen onLoginSuccess={handleLoginSuccess} pageVariants={pageVariants} pageTransition={pageTransition} />;
    }
  };

  const CurrentScreenComponent = () => {
    const component = renderScreen();
    let title = "SYS AGENDAMENTO E VISITAS";
    let description = "SISTEMA INTEGRADO DE AGENDAMENTO E VISITAS DE CLIENTES";

    if (component && component.type && component.type.name) {
        switch (component.type.name) {
            case 'LoginScreen': title = "Login - Sistema de Agendamento"; break;
            case 'MenuScreen': title = "Menu Principal - Agendamento e Visitas"; break;
            case 'VendedorMenuScreen': title = "Menu do Vendedor - Ações Rápidas"; break;
            case 'AgendarVisitaScreen': title = editingAgendamento ? "Editar Agendamento" : "Agendar Nova Visita"; break;
            case 'RegistrarAtendimentoScreen': title = editingAtendimento ? "Editar Registro de Atendimento" : "Registrar Novo Atendimento"; break;
            case 'AdminDashboardScreen': title = "Painel Administrativo"; break;
            case 'VerAgendamentosScreen': title = "Visualizar Agendamentos"; break;
            case 'VerAtendimentosScreen': title = "Visualizar Atendimentos Registrados"; break;
            case 'GerenciarUsuariosScreen': title = "Gerenciar Usuários"; break;
            case 'GerarRelatorioScreen': title = "Gerar Relatório PDF"; break;
            case 'ChatScreen': title = "Chat Interno"; break;
            case 'AgendarRetornoScreen': title = editingRetorno ? "Editar Retorno" : "Agendar Retorno de Ligação"; break;
            case 'VerRetornosScreen': title = "Visualizar Retornos Agendados"; break;
            case 'GerenciarChipsScreen': title = "Gerenciar Chips de Contato"; break;
        }
    }
    
    return (
      <>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="icon" type="image/png" href="https://i.ibb.co/YTP2DFgh/favicon.png" />
        </Helmet>
        {component}
      </>
    );
  };

  return (
    <div className="min-h-screen w-full bg-brand-background p-2 sm:p-4 flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          <CurrentScreenComponent />
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}

export default App;