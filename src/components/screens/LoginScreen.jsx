import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, LogIn, User, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const LoginScreen = ({ onLoginSuccess, pageVariants, pageTransition }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o usuário e a senha.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username);

      if (error) {
        throw error;
      }

      const user = users.find(u => u.password === password);

      if (user) {
        onLoginSuccess(user);
      } else {
        toast({
          title: "Login falhou",
          description: "Usuário ou senha inválidos. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no Login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="login"
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
            <Building2 className="w-16 h-16 mx-auto text-brand-primary mb-4" />
          </motion.div>
          
          <CardTitle className="text-brand-text-primary text-2xl sm:text-3xl font-bold">
            Sistema de Agendamento
          </CardTitle>
          <p className="text-brand-text-secondary text-sm sm:text-base">
            Faça login para continuar
          </p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left relative">
              <Label htmlFor="username" className="form-label">Usuário</Label>
               <User className="absolute left-3 top-[2.3rem] transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input pl-10"
                placeholder="Digite seu usuário"
                required
              />
            </div>
            
            <div className="space-y-1 text-left relative">
              <Label htmlFor="password" className="form-label">Senha</Label>
              <KeyRound className="absolute left-3 top-[2.3rem] transform -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input pl-10"
                placeholder="Digite sua senha"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full primary-button font-semibold py-3"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LoginScreen;