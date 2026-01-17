import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TrendDataPoint } from '@/types';
import { CHART_COLORS, RISK_THRESHOLDS } from '@/data/constants';
import { cn } from '@/lib/utils';

interface TrendChartProps {
  data: TrendDataPoint[];
  metrics: ('fe' | 'si' | 'temp' | 'voltage')[];
  height?: number;
  showThresholds?: boolean;
  className?: string;
}

const metricConfig = {
  fe: { color: CHART_COLORS.fe, label: 'Fe (%)', threshold: RISK_THRESHOLDS.fe.critical },
  si: { color: CHART_COLORS.si, label: 'Si (%)', threshold: RISK_THRESHOLDS.si.critical },
  temp: { color: CHART_COLORS.temp, label: 'Temp (°C)', threshold: null },
  voltage: { color: CHART_COLORS.voltage, label: 'Voltage (V)', threshold: null },
};

export function TrendChart({
  data,
  metrics,
  height = 200,
  showThresholds = true,
  className,
}: TrendChartProps) {
  // Format date for display
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />

          {/* Threshold reference lines */}
          {showThresholds && metrics.includes('fe') && (
            <ReferenceLine
              y={RISK_THRESHOLDS.fe.critical}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{ value: 'Fe Critical', fontSize: 10, fill: '#ef4444' }}
            />
          )}
          {showThresholds && metrics.includes('si') && (
            <ReferenceLine
              y={RISK_THRESHOLDS.si.critical}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              label={{ value: 'Si Critical', fontSize: 10, fill: '#3b82f6' }}
            />
          )}

          {/* Data lines */}
          {metrics.map((metric) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={metricConfig[metric].color}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
              name={metricConfig[metric].label}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {metrics.map((metric) => (
          <div key={metric} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metricConfig[metric].color }}
            />
            <span className="text-xs text-gray-600">{metricConfig[metric].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
