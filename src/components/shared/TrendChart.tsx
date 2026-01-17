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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { TrendData } from '@/types';
import { CHART_COLORS, THRESHOLDS } from '@/data/constants';

interface TrendChartProps {
  data: TrendData[];
  metric: 'fe' | 'si' | 'temperature' | 'voltage' | 'aiScore';
  title: string;
  showThreshold?: boolean;
  height?: number;
}

export function TrendChart({
  data,
  metric,
  title,
  showThreshold = true,
  height = 200,
}: TrendChartProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const filteredData = data.slice(
    period === '7d' ? -7 : period === '30d' ? -30 : 0
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-MY', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getThreshold = () => {
    if (!showThreshold) return null;
    switch (metric) {
      case 'fe':
        return { critical: THRESHOLDS.fe.critical, moderate: THRESHOLDS.fe.moderate };
      case 'si':
        return { critical: THRESHOLDS.si.critical, moderate: THRESHOLDS.si.moderate };
      case 'temperature':
        return { critical: THRESHOLDS.temperature.critical_high, moderate: THRESHOLDS.temperature.normal_high };
      default:
        return null;
    }
  };

  const threshold = getThreshold();

  const formatValue = (value: number) => {
    if (metric === 'fe' || metric === 'si') return value.toFixed(4);
    if (metric === 'temperature') return `${value.toFixed(1)}°C`;
    if (metric === 'voltage') return `${value.toFixed(3)}V`;
    return value.toFixed(1);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <TabsList className="h-8">
              <TabsTrigger value="7d" className="text-xs px-2">7D</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs px-2">30D</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs px-2">90D</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(v) => metric === 'fe' || metric === 'si' ? v.toFixed(2) : v}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [formatValue(value as number), title]}
              labelFormatter={(label) => formatDate(label as Date)}
            />
            {threshold && (
              <>
                <ReferenceLine
                  y={threshold.critical}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{ value: 'Critical', fontSize: 10, fill: '#ef4444' }}
                />
                <ReferenceLine
                  y={threshold.moderate}
                  stroke="#eab308"
                  strokeDasharray="3 3"
                  label={{ value: 'Moderate', fontSize: 10, fill: '#eab308' }}
                />
              </>
            )}
            <Line
              type="monotone"
              dataKey={metric}
              stroke={CHART_COLORS[metric]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MultiMetricChartProps {
  data: TrendData[];
  metrics: Array<'fe' | 'si' | 'temperature' | 'voltage' | 'aiScore'>;
  title: string;
  height?: number;
}

export function MultiMetricChart({ data, metrics, title, height = 200 }: MultiMetricChartProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-MY', {
      month: 'short',
      day: 'numeric',
    });
  };

  const metricLabels: Record<string, string> = {
    fe: 'Fe (%)',
    si: 'Si (%)',
    temperature: 'Temp (°C)',
    voltage: 'Voltage (V)',
    aiScore: 'AI Score',
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data.slice(-30)}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={CHART_COLORS[metric]}
                strokeWidth={2}
                dot={false}
                name={metricLabels[metric]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {metrics.map((metric) => (
            <div key={metric} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[metric] }}
              />
              <span className="text-slate-600">{metricLabels[metric]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
