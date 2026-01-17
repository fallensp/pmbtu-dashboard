import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function RiskGauge({ score, size = 'md', showLabel = true, className }: RiskGaugeProps) {
  const sizeConfig = {
    sm: { width: 80, height: 50, strokeWidth: 6, fontSize: 14 },
    md: { width: 120, height: 70, strokeWidth: 8, fontSize: 20 },
    lg: { width: 160, height: 90, strokeWidth: 10, fontSize: 26 },
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#eab308'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getLabel = (score: number): RiskLevel => {
    if (score >= 80) return 'normal';
    if (score >= 60) return 'moderate';
    if (score >= 40) return 'high';
    return 'critical';
  };

  const color = getColor(score);
  const label = getLabel(score);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height + 10}`}
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.height} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.height}`}
          fill="none"
          stroke="#e2e8f0"
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
          style={{
            transition: 'stroke-dasharray 0.5s ease-in-out',
          }}
        />
        {/* Score text */}
        <text
          x={config.width / 2}
          y={config.height - 5}
          textAnchor="middle"
          fill={color}
          fontSize={config.fontSize}
          fontWeight="bold"
        >
          {Math.round(score)}
        </text>
      </svg>
      {showLabel && (
        <span
          className="text-xs font-medium capitalize mt-1"
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  value,
  max,
  size = 60,
  strokeWidth = 6,
  color = '#3b82f6',
  label,
  showPercentage = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
          }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        {showPercentage && (
          <span className="text-sm font-bold" style={{ color }}>
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      {label && <span className="text-xs text-slate-500 mt-1">{label}</span>}
    </div>
  );
}

interface HealthScoreCardProps {
  score: number;
  title?: string;
  subtitle?: string;
}

export function HealthScoreCard({ score, title = 'Overall Health', subtitle }: HealthScoreCardProps) {
  const getColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' };
    if (score >= 60) return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' };
    if (score >= 40) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600' };
  };

  const colors = getColor(score);

  return (
    <div className={cn('rounded-lg border-2 p-6 text-center', colors.bg, colors.border)}>
      <RiskGauge score={score} size="lg" />
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
