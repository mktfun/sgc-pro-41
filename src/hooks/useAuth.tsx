import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ensureDefaultTransactionTypes } from '@/services/transactionTypeService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nomeCompleto: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
  if (!error) return 'Erro desconhecido';
  
  // Map common Supabase errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Por favor, confirme seu email antes de fazer login',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Invalid email': 'Email inválido',
    'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos',
  };

  return errorMessages[error.message] || 'Erro no sistema. Tente novamente.';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Log only non-sensitive info in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth event:', event);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Setup inicial apenas para novos logins
        if (event === 'SIGNED_IN' && session?.user) {
          ensureDefaultTransactionTypes(session.user.id).catch(error => {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error ensuring default transaction types:', error);
            }
          });
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const friendlyMessage = getErrorMessage(error);
        toast.error(friendlyMessage);
        return { error: new Error(friendlyMessage) };
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        return { error: null };
      }

      const defaultError = 'Erro desconhecido no login';
      toast.error(defaultError);
      return { error: new Error(defaultError) };
    } catch (error) {
      const friendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      toast.error(friendlyMessage);
      return { error: new Error(friendlyMessage) };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nomeCompleto: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome_completo: nomeCompleto,
          },
        },
      });

      if (error) {
        const friendlyMessage = getErrorMessage(error);
        toast.error(friendlyMessage);
        return { error: new Error(friendlyMessage) };
      }

      if (data.user) {
        toast.success('Cadastro realizado! Verifique seu email para confirmar a conta.');
        return { error: null };
      }

      const defaultError = 'Erro desconhecido no cadastro';
      toast.error(defaultError);
      return { error: new Error(defaultError) };
    } catch (error) {
      const friendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      toast.error(friendlyMessage);
      return { error: new Error(friendlyMessage) };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Erro ao fazer logout. Tente novamente.');
        return;
      }
      
      toast.success('Logout realizado com sucesso!');
      // Force page reload para garantir limpeza completa
      window.location.href = '/auth';
    } catch (error) {
      toast.error('Erro de conexão ao fazer logout.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        const friendlyMessage = getErrorMessage(error);
        toast.error(friendlyMessage);
        return { error: new Error(friendlyMessage) };
      }

      toast.success('Email de recuperação enviado!');
      return { error: null };
    } catch (error) {
      const friendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      toast.error(friendlyMessage);
      return { error: new Error(friendlyMessage) };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
