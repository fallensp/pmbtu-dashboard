import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { Pot, RiskLevel } from '@/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface PotCellProps {
  pot: Pot;
  isSelected?: boolean;
  onClick?: (pot: Pot) => void;
  size?: 'sm' | 'md' | 'lg';
}

const riskColors: Record<RiskLevel, string> = {
  critical: 'bg-red-500 hover:bg-red-600',
  high: 'bg-orange-500 hover:bg-orange-600',
  moderate: 'bg-yellow-500 hover:bg-yellow-600',
  normal: 'bg-green-500 hover:bg-green-600',
  shutdown: 'bg-gray-400 hover:bg-gray-500',
};

const sizeClasses = {
  sm: 'w-4 h-4 text-[8px]',
  md: 'w-6 h-6 text-[10px]',
  lg: 'w-8 h-8 text-xs',
};

export const PotCell = memo(function PotCell({
  pot,
  isSelected,
  onClick,
  size = 'sm',
}: PotCellProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onClick?.(pot)}
            className={cn(
              'rounded-sm transition-all cursor-pointer flex items-center justify-center font-medium text-white',
              riskColors[pot.riskLevel],
              sizeClasses[size],
              isSelected && 'ring-2 ring-blue-600 ring-offset-1',
              pot.riskLevel === 'shutdown' && 'cursor-not-allowed opacity-60'
            )}
            disabled={pot.riskLevel === 'shutdown'}
          >
            {size === 'lg' && pot.position}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">Pot {pot.id}</div>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">AI Score:</span>
                <span className={cn(
                  'font-medium',
                  pot.aiScore >= 80 ? 'text-green-500' :
                  pot.aiScore >= 60 ? 'text-yellow-500' :
                  pot.aiScore >= 40 ? 'text-orange-500' : 'text-red-500'
                )}>
                  {pot.aiScore.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Fe:</span>
                <span className={cn(
                  'font-medium',
                  pot.metrics.fe >= 0.18 ? 'text-red-500' :
                  pot.metrics.fe >= 0.10 ? 'text-yellow-500' : 'text-green-500'
                )}>
                  {pot.metrics.fe.toFixed(4)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Si:</span>
                <span className={cn(
                  'font-medium',
                  pot.metrics.si >= 0.07 ? 'text-red-500' :
                  pot.metrics.si >= 0.05 ? 'text-yellow-500' : 'text-green-500'
                )}>
                  {pot.metrics.si.toFixed(4)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Temp:</span>
                <span>{pot.metrics.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Age:</span>
                <span>{pot.age} days</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
