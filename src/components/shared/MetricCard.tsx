import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  status = 'normal',
  className,
  onClick,
}: MetricCardProps) {
  const statusColors = {
    normal: 'border-slate-200',
    warning: 'border-yellow-400 bg-yellow-50',
    critical: 'border-red-400 bg-red-50',
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp :
    trend?.direction === 'down' ? TrendingDown : Minus;

  const trendColors = {
    up: 'text-red-500',
    down: 'text-green-500',
    neutral: 'text-slate-400',
  };

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        statusColors[status],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            {unit && <span className="text-sm text-slate-500">{unit}</span>}
          </div>
          {trend && (
            <div className={cn('mt-2 flex items-center gap-1 text-sm', trendColors[trend.direction])}>
              <TrendIcon className="w-4 h-4" />
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-slate-400">{trend.label}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'p-2 rounded-lg',
            status === 'normal' ? 'bg-slate-100' :
            status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface SummaryCardProps {
  title: string;
  count: number;
  subtitle?: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'gray' | 'blue';
  onClick?: () => void;
}

export function SummaryCard({ title, count, subtitle, color, onClick }: SummaryCardProps) {
  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
  };

  return (
    <Card
      className={cn(
        'p-4 transition-all hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-3 h-10 rounded-full', colorClasses[color])} />
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}
