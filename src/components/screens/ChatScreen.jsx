import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Send, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
const ChatScreen = ({
  onNavigate,
  userInfo,
  pageVariants,
  pageTransition
}) => {
  const {
    toast
  } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const fetchMessages = async () => {
    const {
      data,
      error
    } = await supabase.from('chat_messages').select('*').order('created_at', {
      ascending: true
    });
    if (error) {
      toast({
        title: 'Erro ao buscar mensagens',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setMessages(data);
    }
  };
  useEffect(() => {
    fetchMessages();
    const channel = supabase.channel('chat_messages_channel').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'chat_messages'
    }, payload => {
      fetchMessages();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleSendMessage = async e => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    const {
      error
    } = await supabase.from('chat_messages').insert([{
      username: userInfo.username,
      role: userInfo.role,
      message_content: newMessage
    }]);
    if (error) {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setNewMessage('');
    }
  };
  const handleClearChat = async () => {
    const {
      error
    } = await supabase.from('chat_messages').delete().neq('id', 0); // Hack to delete all rows
    if (error) {
      toast({
        title: "Erro ao limpar o chat",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Chat limpo!",
        description: "Todas as mensagens foram excluídas."
      });
    }
  };
  const getRoleColor = role => {
    switch (role) {
      case 'admin':
        return 'text-red-500';
      case 'supervisor':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };
  return <motion.div key="chat" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
      <div className="screen-card-container flex flex-col max-h-[90vh]">
        <div className="screen-header justify-between">
          <div className="flex items-center">
            <Button onClick={() => onNavigate('menu')} variant="outline" size="icon" className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-brand-icon mr-2 sm:mr-3" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Chat Interno de Agendamentos</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Comunicação em tempo real.</p>
            </div>
          </div>
           {userInfo.role === 'admin' && <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpar Chat
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as mensagens do chat.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat}>Continuar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>}
        </div>

        <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-brand-input-bg/30 rounded-lg">
          <AnimatePresence>
            {messages.map(msg => <motion.div key={msg.id} layout initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }} className={`flex gap-3 ${msg.username === userInfo.username ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col ${msg.username === userInfo.username ? 'items-end' : 'items-start'}`}>
                  <Card className={`p-3 max-w-xs md:max-w-md ${msg.username === userInfo.username ? 'bg-brand-primary/20' : 'bg-brand-card'}`}>
                    <div className="flex items-center mb-1">
                      <span className={`font-bold text-sm ${getRoleColor(msg.role)}`}>{msg.username}</span>
                      {msg.role === 'admin' && <ShieldCheck className="w-4 h-4 ml-1.5 text-red-500" />}
                    </div>
                    <p className="text-brand-text-primary">{msg.message_content}</p>
                  </Card>
                  <span className="text-xs text-brand-text-secondary mt-1">
                    {new Date(msg.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
                  </span>
                </div>
              </motion.div>)}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>

        <form onSubmit={handleSendMessage} className="p-4 pt-2 mt-2">
          <div className="flex items-center space-x-2">
            <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." className="input-styled" />
            <Button type="submit" size="icon" className="primary-button flex-shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>;
};
export default ChatScreen;