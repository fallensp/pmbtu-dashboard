import { Badge } from '@/components/ui/badge';
import type { RiskLevel, AlertSeverity, AlertStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RiskLevel | AlertSeverity | AlertStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const riskVariants: Record<RiskLevel, string> = {
  critical: 'bg-red-500 text-white hover:bg-red-500',
  high: 'bg-orange-500 text-white hover:bg-orange-500',
  moderate: 'bg-yellow-500 text-black hover:bg-yellow-500',
  normal: 'bg-green-500 text-white hover:bg-green-500',
  shutdown: 'bg-gray-400 text-white hover:bg-gray-400',
};

const alertStatusVariants: Record<AlertStatus, string> = {
  new: 'bg-blue-500 text-white hover:bg-blue-500',
  acknowledged: 'bg-orange-500 text-white hover:bg-orange-500',
  in_progress: 'bg-yellow-500 text-black hover:bg-yellow-500',
  resolved: 'bg-green-500 text-white hover:bg-green-500',
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const variant = riskVariants[status as RiskLevel] || alertStatusVariants[status as AlertStatus];
  const label = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');

  return (
    <Badge
      className={cn(
        'font-medium',
        variant || 'bg-gray-500 text-white',
        sizeClasses[size],
        className
      )}
    >
      {label}
    </Badge>
  );
}
