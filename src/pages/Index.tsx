import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { AppCard } from '@/components/ui/app-card';
import { 
  FileText, 
  Shield, 
  Users, 
  BarChart3, 
  Calendar, 
  CreditCard,
  ChevronRight,
  Check,
  Star,
  Building2,
  Globe,
  Zap
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: FileText,
      title: "Gestão de Apólices",
      description: "Controle completo de todas as apólices com renovações automáticas e alertas personalizados."
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Base de dados unificada com histórico completo e acompanhamento personalizado."
    },
    {
      icon: Calendar,
      title: "Agendamentos",
      description: "Sistema inteligente de agendamentos com lembretes automáticos e sincronização."
    },
    {
      icon: BarChart3,
      title: "Relatórios Avançados",
      description: "Analytics em tempo real com insights detalhados sobre seu negócio."
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Gestão completa de comissões, pagamentos e fluxo de caixa."
    },
    {
      icon: Shield,
      title: "Segurança Premium",
      description: "Proteção de dados com criptografia avançada e backup automático."
    }
  ];

  const benefits = [
    "Aumento de 40% na produtividade",
    "Redução de 60% no tempo de processos",
    "Controle total das renovações",
    "Relatórios executivos automáticos",
    "Suporte técnico especializado",
    "Atualizações constantes"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Ccircle cx=\"7\" cy=\"7\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SGC Pro</h1>
              <p className="text-sm text-white/60">Sistema de Gestão de Corretor</p>
            </div>
          </div>
          
          <Link to="/auth">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              Fazer Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
              O Sistema Mais
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {" "}Completo{" "}
              </span>
              para Corretores
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Transforme sua corretora com nossa plataforma all-in-one. 
              Gestão inteligente, resultados extraordinários.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  Começar Agora
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 text-lg"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>4.9/5 Avaliação</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>1000+ Corretores</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>100% Seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-white mb-4">
              Tudo que sua corretora precisa
            </h3>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Ferramentas poderosas integradas em uma única plataforma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AppCard key={index} className="p-6 hover:scale-105 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AppCard>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Resultados que transformam seu negócio
              </h3>
              <p className="text-white/70 text-lg mb-8">
                Nossos clientes experimentam crescimento significativo e maior eficiência operacional.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <GlassCard className="p-8">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-white/10 mb-4">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-white text-sm font-medium">Resultados Comprovados</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-400 mb-2">40%</div>
                    <div className="text-white/70 text-sm">Aumento na Produtividade</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400 mb-2">60%</div>
                    <div className="text-white/70 text-sm">Redução de Tempo</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                    <div className="text-white/70 text-sm">Taxa de Satisfação</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-400 mb-2">24/7</div>
                    <div className="text-white/70 text-sm">Suporte Técnico</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <AppCard className="p-12 text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <h3 className="text-3xl font-bold text-white mb-4">
              Pronto para revolucionar sua corretora?
            </h3>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de corretores que já transformaram seus negócios com o SGC Pro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  Começar Gratuitamente
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-white/50 text-sm mt-4">
              Sem compromisso • Configuração em minutos • Suporte completo
            </p>
          </AppCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <span className="text-white font-semibold">SGC Pro</span>
            </div>
            
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <span>© 2024 SGC Pro. Todos os direitos reservados.</span>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Brasil</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
