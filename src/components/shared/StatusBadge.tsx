import type { RiskLevel, AlertSeverity, AlertStatus, OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RiskLevel | AlertSeverity | AlertStatus | OrderStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Risk Levels
  critical: { label: 'Critical', className: 'bg-red-500 text-white border-red-500' },
  high: { label: 'High', className: 'bg-orange-500 text-white border-orange-500' },
  moderate: { label: 'Moderate', className: 'bg-yellow-500 text-slate-900 border-yellow-500' },
  normal: { label: 'Normal', className: 'bg-green-500 text-white border-green-500' },
  shutdown: { label: 'Shutdown', className: 'bg-gray-400 text-white border-gray-400' },

  // Alert Status
  active: { label: 'Active', className: 'bg-red-100 text-red-700 border-red-200' },
  acknowledged: { label: 'Acknowledged', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700 border-green-200' },

  // Order Status
  pending: { label: 'Pending', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
  partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },

  // Schedule Status
  planned: { label: 'Planned', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-500 border-slate-200' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-700 border-green-200' },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1',
};

export function StatusBadge({ status, size = 'md', showDot = false }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        sizeClasses[size],
        config.className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            status === 'critical' || status === 'active' ? 'bg-red-200' :
            status === 'high' || status === 'acknowledged' ? 'bg-orange-200' :
            status === 'moderate' || status === 'in_progress' ? 'bg-yellow-200' :
            'bg-current opacity-50'
          )}
        />
      )}
      {config.label}
    </span>
  );
}
