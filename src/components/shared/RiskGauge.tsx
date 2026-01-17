import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  score: number;  // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 80, height: 48, strokeWidth: 8, fontSize: 'text-lg' },
  md: { width: 120, height: 72, strokeWidth: 10, fontSize: 'text-2xl' },
  lg: { width: 160, height: 96, strokeWidth: 12, fontSize: 'text-3xl' },
};

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Healthy';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'At Risk';
  return 'Critical';
}

export function RiskGauge({ score, size = 'md', showLabel = true, className }: RiskGaugeProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-500"
        />
        {/* Score text */}
        <text
          x={config.width / 2}
          y={config.height - 8}
          textAnchor="middle"
          className={cn('font-bold fill-gray-900', config.fontSize)}
          style={{ fontSize: size === 'sm' ? '1rem' : size === 'md' ? '1.5rem' : '2rem' }}
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span
          className="mt-1 text-sm font-medium"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
