import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  Shield, 
  Calendar, 
  DollarSign, 
  RefreshCw, 
  AlertTriangle, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
  isCollapsed?: boolean;
}

function SidebarItem({ icon: Icon, label, to, isCollapsed }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  const content = (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
        "hover:bg-white/10 hover:backdrop-blur-sm",
        isActive && "bg-white/20 backdrop-blur-sm shadow-lg border border-white/20",
        isCollapsed && "justify-center px-2"
      )}
    >
      <Icon className={cn(
        "h-5 w-5 transition-colors",
        isActive ? "text-white" : "text-white/70 group-hover:text-white"
      )} />
      {!isCollapsed && (
        <span className={cn(
          "font-medium transition-colors",
          isActive ? "text-white" : "text-white/70 group-hover:text-white"
        )}>
          {label}
        </span>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

export function GlassSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full z-40 transition-all duration-300",
      "bg-gradient-to-b from-blue-600/90 to-purple-700/90",
      "backdrop-blur-xl border-r border-white/20",
      "shadow-2xl",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">SGC Pro</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white/70 hover:text-white hover:bg-white/10 p-1 h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        <SidebarItem icon={Home} label="Dashboard" to="/dashboard" isCollapsed={isCollapsed} />
        <SidebarItem icon={Users} label="Clientes" to="/dashboard/clients" isCollapsed={isCollapsed} />
        <SidebarItem icon={Shield} label="Apólices" to="/dashboard/policies" isCollapsed={isCollapsed} />
        <SidebarItem icon={Calendar} label="Agendamentos" to="/dashboard/appointments" isCollapsed={isCollapsed} />
        <SidebarItem icon={DollarSign} label="Faturamento" to="/dashboard/faturamento" isCollapsed={isCollapsed} />
        <SidebarItem icon={RefreshCw} label="Renovações" to="/dashboard/renovacoes" isCollapsed={isCollapsed} />
        <SidebarItem icon={AlertTriangle} label="Sinistros" to="/dashboard/sinistros" isCollapsed={isCollapsed} />
        <SidebarItem icon={ClipboardList} label="Tarefas" to="/dashboard/tasks" isCollapsed={isCollapsed} />
        <SidebarItem icon={BarChart3} label="Relatórios" to="/dashboard/reports" isCollapsed={isCollapsed} />
        <SidebarItem icon={FileSpreadsheet} label="Sincronização Sheets" to="/dashboard/sheets-sync" isCollapsed={isCollapsed} />
      </nav>

      {/* Settings at bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="border-t border-white/20 pt-4">
          <SidebarItem icon={Settings} label="Configurações" to="/dashboard/settings" isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
}
