
import { AppCard } from '@/components/ui/app-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DateRange } from 'react-day-picker';
import { ChartInsight } from './ChartInsight';
import { PieChart as PieChartIcon } from 'lucide-react';

interface BranchDistributionData {
  ramo: string;
  total: number;
}

interface BranchDistributionChartProps {
  data: BranchDistributionData[];
  dateRange?: DateRange;
  insight: string;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4'  // cyan-500
];

export function BranchDistributionChart({ data, dateRange, insight }: BranchDistributionChartProps) {
  // Calcular total para porcentagens
  const total = data.reduce((sum, item) => sum + item.total, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostrar labels para fatias menores que 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Tooltip customizado com melhor contraste
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-gray-900/95 backdrop-blur-sm p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-white">{data.payload.ramo}</p>
          <p className="text-sm text-gray-200">
            <span className="font-medium">{data.value}</span> apólices ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Legenda customizada com melhor legibilidade
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = total > 0 ? ((entry.payload.total / total) * 100).toFixed(0) : 0;
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-white/90 font-medium">
                {entry.payload.ramo} - {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Distribuição de Apólices por Ramo
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="total"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity duration-200"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartInsight icon={PieChartIcon} text={insight} />
    </AppCard>
  );
}
