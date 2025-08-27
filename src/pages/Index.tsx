import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
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
  Zap,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: FileText,
      title: "Gestão de Apólices",
      description: "Controle completo com renovações automáticas, alertas personalizados e histórico detalhado.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "CRM Avançado",
      description: "Base de dados unificada com perfil completo dos clientes e interações registradas.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Calendar,
      title: "Agendamentos Smart",
      description: "Sistema inteligente com lembretes automáticos e sincronização com calendário.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Analytics em Tempo Real",
      description: "Dashboards intuitivos com insights sobre performance e oportunidades.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Gestão completa de comissões, pagamentos e projeções de receita.",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Criptografia bancária, backup automático e conformidade com LGPD.",
      color: "from-red-500 to-red-600"
    }
  ];

  const stats = [
    { icon: TrendingUp, number: "40%", label: "Aumento na Produtividade", color: "text-green-400" },
    { icon: Clock, number: "60%", label: "Redução de Tempo", color: "text-blue-400" },
    { icon: Award, number: "95%", label: "Satisfação dos Clientes", color: "text-purple-400" },
    { icon: Zap, number: "24/7", label: "Suporte Especializado", color: "text-yellow-400" }
  ];

  const benefits = [
    "Interface intuitiva e fácil de usar",
    "Automatização de processos repetitivos",
    "Relatórios executivos detalhados",
    "Integração com sistemas existentes",
    "Atualizações automáticas e gratuitas",
    "Treinamento e suporte incluídos"
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SGC Pro</h1>
              <p className="text-sm text-white/60">Sistema de Gestão de Corretor</p>
            </div>
          </div>
          
          <Link to="/auth">
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              Fazer Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Framer Motion */}
      <div className="relative">
        <HeroGeometric
          badge="SGC Pro"
          title1="Transforme Sua"
          title2="Corretora de Seguros"
        />
        
        {/* CTA Buttons positioned over the hero */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Começar Gratuitamente
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg transition-all duration-300"
            >
              Ver Demonstração
            </Button>
          </div>
          
          <p className="text-white/60 text-center mt-4">
            A plataforma mais completa para gestão de corretoras de seguros
          </p>
        </div>
      </div>

      {/* Trust Section */}
      <section className="relative py-12 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 text-slate-300">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-lg font-medium">4.9/5 Avaliação</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-lg font-medium">1000+ Corretores Ativos</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-lg font-medium">100% Seguro e Confiável</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Funcionalidades Avançadas
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tudo que você precisa em
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                uma única plataforma
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Descubra como nossa tecnologia pode revolucionar a gestão da sua corretora
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-2xl bg-slate-700/30 backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50 transition-all duration-500 hover:scale-105"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Resultados que Impressionam
            </h2>
            <p className="text-xl text-slate-300">
              Veja o impacto real que fazemos no dia a dia dos nossos clientes
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex p-4 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-600/20 border border-green-600/30 text-green-300 text-sm font-medium mb-6">
                <Check className="w-4 h-4 mr-2" />
                Vantagens Exclusivas
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Por que escolher o
                <span className="block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  SGC Pro?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Desenvolvido especificamente para corretores brasileiros, 
                com funcionalidades que realmente fazem a diferença.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-green-600/20 border border-green-600/30 group-hover:bg-green-600/30 transition-colors">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <span className="text-slate-300 group-hover:text-white transition-colors">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
              <div className="relative p-8 rounded-3xl bg-slate-700/50 backdrop-blur-sm border border-slate-600/50">
                <div className="text-center">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-8">
                    Transformação Garantida
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-slate-600/50">
                      <div className="text-3xl font-bold text-blue-400 mb-2">40%</div>
                      <div className="text-slate-300 text-sm">Mais Vendas</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-600/50">
                      <div className="text-3xl font-bold text-green-400 mb-2">60%</div>
                      <div className="text-slate-300 text-sm">Menos Tempo</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-600/50">
                      <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
                      <div className="text-slate-300 text-sm">Satisfação</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-600/50">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
                      <div className="text-slate-300 text-sm">Suporte</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-300 text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            Oferta Limitada
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Revolucionar?
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Junte-se a centenas de corretores que já transformaram seus negócios. 
            Setup em minutos, resultados em dias.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
              >
                Começar Agora - Grátis
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-12 py-4 text-lg transition-all duration-300"
            >
              Agendar Demonstração
            </Button>
          </div>
          
          <p className="text-slate-400 text-sm mt-8">
            ✓ Sem compromisso  ✓ Configuração em 5 minutos  ✓ Suporte completo incluído
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-slate-900 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SGC Pro</span>
          </div>
          <p className="text-slate-400">
            © 2024 SGC Pro. Todos os direitos reservados. Desenvolvido com ❤️ para corretores brasileiros.
          </p>
        </div>
      </footer>
    </div>
  );
}
