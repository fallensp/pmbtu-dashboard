import { cn } from '@/lib/utils';
import type { Pot } from '@/types';
import { RISK_COLORS } from '@/data/constants';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PotCellProps {
  pot: Pot;
  onClick?: (pot: Pot) => void;
  isSelected?: boolean;
  size?: 'sm' | 'md';
}

export function PotCell({ pot, onClick, isSelected, size = 'sm' }: PotCellProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[8px]',
    md: 'w-8 h-8 text-xs',
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onClick?.(pot)}
            className={cn(
              'rounded transition-all duration-150 flex items-center justify-center font-medium',
              sizeClasses[size],
              isSelected && 'ring-2 ring-blue-500 ring-offset-1',
              onClick && 'hover:scale-110 cursor-pointer',
            )}
            style={{ backgroundColor: RISK_COLORS[pot.riskLevel] }}
          >
            <span className="text-white/90">{pot.position}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-2">
          <div className="text-xs space-y-1">
            <p className="font-semibold">Pot {pot.id}</p>
            <p>Fe: {pot.metrics.fe.toFixed(3)}%</p>
            <p>Si: {pot.metrics.si.toFixed(3)}%</p>
            <p>Temp: {pot.metrics.temp}°C</p>
            <p>AI Score: {pot.aiScore}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
