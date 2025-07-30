import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ListChecks, UserCog, BarChart3, LogOut, Phone, PhoneForwarded, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboardScreen = ({ onNavigate, onLogout, pageVariants, pageTransition }) => {
  const adminOptions = [
    { id: 'verAgendamentos', label: 'Ver Agendamentos', icon: ListChecks, action: () => onNavigate('verAgendamentos') },
    { id: 'verAtendimentos', label: 'Ver Atendimentos', icon: UserCog, action: () => onNavigate('verAtendimentos') },
    { id: 'verRetornos', label: 'Ver Retornos', icon: PhoneForwarded, action: () => onNavigate('verRetornos') },
    { id: 'gerenciarChips', label: 'Chips para Contatos', icon: Phone, action: () => onNavigate('gerenciarChips') },
    { id: 'gerenciarUsuarios', label: 'Gerenciar Usuários', icon: ShieldCheck, action: () => onNavigate('gerenciarUsuarios') },
    { id: 'gerarRelatorio', label: 'Análise e Relatórios', icon: BarChart3, action: () => onNavigate('gerarRelatorio') },
  ];

  return (
    <motion.div
      key="adminDashboard"
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
              onClick={() => onNavigate('menu')}
              variant="outline"
              size="icon"
              className="mr-3 sm:mr-4 secondary-button w-9 h-9 sm:w-10 sm:h-10"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text-primary">Painel Administrativo</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Gerenciamento completo do sistema.</p>
            </div>
          </div>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="destructive-button-outline text-sm"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sair
          </Button>
        </div>

        <CardContent className="screen-content-area">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {adminOptions.map(option => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card 
                  className="bg-brand-input-bg border-brand-input-border cursor-pointer h-full hover:shadow-md transition-shadow"
                  onClick={option.action}
                >
                  <CardContent className="p-6 text-center">
                    <option.icon className="w-12 h-12 mx-auto text-brand-primary mb-3" />
                    <h3 className="text-lg font-semibold text-brand-text-primary mb-1">{option.label}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </div>
    </motion.div>
  );
};

export default AdminDashboardScreen;