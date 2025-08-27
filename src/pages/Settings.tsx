import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redireciona para a nova estrutura de configurações de forma segura
export default function Settings() {
  const navigate = useNavigate();

  useEffect(() => {
    // Use navigate instead of Navigate component to avoid render loops
    navigate('/dashboard/settings/profile', { replace: true });
  }, [navigate]);

  // Return a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400">Redirecionando...</p>
      </div>
    </div>
  );
}
