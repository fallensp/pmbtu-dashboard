import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  className?: string;
}

const statusColors = {
  normal: 'border-l-green-500',
  warning: 'border-l-yellow-500',
  critical: 'border-l-red-500',
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColors = {
  up: 'text-red-500',
  down: 'text-green-500',
  neutral: 'text-gray-500',
};

export function MetricCard({
  title,
  value,
  unit,
  trend,
  trendValue,
  description,
  icon,
  status,
  className,
}: MetricCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <Card className={cn(
      'relative',
      status && `border-l-4 ${statusColors[status]}`,
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        {(trend || description) && (
          <div className="mt-1 flex items-center gap-2">
            {TrendIcon && trendValue && (
              <div className={cn('flex items-center gap-1 text-sm', trendColors[trend!])}>
                <TrendIcon className="h-4 w-4" />
                <span>{trendValue}</span>
              </div>
            )}
            {description && (
              <span className="text-sm text-gray-500">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
