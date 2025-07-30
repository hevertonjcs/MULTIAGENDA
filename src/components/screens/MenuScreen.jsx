import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, LogOut, UserCheck, ShieldCheck, MessageSquare, PhoneForwarded } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MenuScreen = ({ userInfo, onNavigate, onLogout, pageVariants, pageTransition, onNavigateToChat, hasNewMessages }) => {
  const isAdminOrSupervisor = userInfo.role === 'admin' || userInfo.role === 'supervisor';

  const menuOptions = [
    { id: 'agendar', label: 'Agendar Visita', description: 'Agende uma nova visita com cliente.', icon: Calendar, visible: true, action: () => onNavigate('agendar') },
    { id: 'agendarRetorno', label: 'Agendar Retorno', description: 'Agende uma ligação de retorno.', icon: PhoneForwarded, visible: true, action: () => onNavigate('agendarRetorno') },
    { id: 'registrar', label: 'Registrar Atendimento', description: 'Registre um atendimento realizado.', icon: UserCheck, visible: isAdminOrSupervisor, action: () => onNavigate('registrar') },
    { id: 'chat', label: 'Chat Interno', description: 'Comunicação da equipe.', icon: MessageSquare, visible: isAdminOrSupervisor, action: onNavigateToChat, notification: hasNewMessages },
    { id: 'adminDashboard', label: 'Área Administrativa', description: 'Gerenciamento completo do sistema.', icon: ShieldCheck, visible: isAdminOrSupervisor, action: () => onNavigate('adminDashboard') },
  ];

  return (
    <motion.div
      key="menu"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="text-center"
    >
      <Card className="screen-card-container">
        <CardHeader className="pt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Users className="w-16 h-16 mx-auto text-brand-primary mb-4" />
          </motion.div>
          <CardTitle className="text-brand-text-primary text-2xl sm:text-3xl font-bold">
            Olá, {userInfo.username}!
          </CardTitle>
          <p className="text-brand-text-secondary">Equipe: {userInfo.equipe}</p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {menuOptions.filter(opt => opt.visible).map(option => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative"
              >
                <Card 
                  className="bg-brand-input-bg border-brand-input-border cursor-pointer h-full hover:shadow-md transition-shadow"
                  onClick={option.action}
                >
                  <CardContent className="p-6 text-center">
                    <option.icon className="w-12 h-12 mx-auto text-brand-primary mb-3" />
                    <h3 className="text-lg font-semibold text-brand-text-primary mb-1">{option.label}</h3>
                    <p className="text-sm text-brand-text-secondary">{option.description}</p>
                  </CardContent>
                </Card>
                {option.notification && (
                  <motion.div 
                    className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-input-bg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <Button 
            onClick={onLogout}
            variant="outline"
            className="mt-6 sm:mt-8 destructive-button-outline"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MenuScreen;