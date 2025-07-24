
export interface Profile {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  role: 'admin' | 'corretor' | 'assistente';
  ativo: boolean;
  created_at: string;
  updated_at: string;
  birthday_message_template?: string;
  onboarding_completed?: boolean;
}
