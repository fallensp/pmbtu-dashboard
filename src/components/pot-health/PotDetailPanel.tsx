import { X, Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { RiskGauge } from '@/components/shared/RiskGauge';
import { TrendChart } from '@/components/shared/TrendChart';
import type { Pot } from '@/types';
import { THRESHOLDS } from '@/data/constants';
import { cn } from '@/lib/utils';
import { getAlertsByPot } from '@/data/generators';

interface PotDetailPanelProps {
  pot: Pot;
  onClose: () => void;
}

function MetricRow({
  label,
  value,
  unit,
  threshold,
  status,
}: {
  label: string;
  value: number;
  unit: string;
  threshold?: { warning: number; critical: number };
  status?: 'normal' | 'warning' | 'critical';
}) {
  const computedStatus = status || (
    threshold
      ? value >= threshold.critical ? 'critical'
        : value >= threshold.warning ? 'warning'
        : 'normal'
      : 'normal'
  );

  const statusColors = {
    normal: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    critical: 'text-red-600 bg-red-50',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-sm font-medium px-2 py-0.5 rounded',
          statusColors[computedStatus]
        )}>
          {typeof value === 'number' ? value.toFixed(label === 'Fe' || label === 'Si' ? 4 : 1) : value}{unit}
        </span>
        {threshold && (
          <span className="text-xs text-slate-400">
            / {threshold.critical}{unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function PotDetailPanel({ pot, onClose }: PotDetailPanelProps) {
  const alerts = getAlertsByPot(pot.id);
  const activeAlerts = alerts.filter(a => a.status === 'active');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // AI Analysis based on pot metrics
  const getAIAnalysis = () => {
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (pot.metrics.fe >= THRESHOLDS.fe.critical) {
      issues.push('Iron content critically high');
      recommendations.push('Immediate cathode inspection required');
    } else if (pot.metrics.fe >= THRESHOLDS.fe.moderate) {
      issues.push('Iron content elevated');
      recommendations.push('Schedule cathode inspection within 48 hours');
    }

    if (pot.metrics.si >= THRESHOLDS.si.critical) {
      issues.push('Silicon content critically high');
      recommendations.push('Check for anode contamination');
    } else if (pot.metrics.si >= THRESHOLDS.si.moderate) {
      issues.push('Silicon content elevated');
      recommendations.push('Monitor Si trend closely');
    }

    if (pot.metrics.feSlope > 0.005) {
      issues.push('Fe trending upward rapidly');
      recommendations.push('Consider early tapping to prevent grade downgrade');
    }

    if (pot.metrics.aeFrequency > 1) {
      issues.push('Elevated anode effect frequency');
      recommendations.push('Review alumina feeding system');
    }

    if (issues.length === 0) {
      return {
        status: 'healthy',
        summary: 'Pot operating within normal parameters',
        issues: [],
        recommendations: ['Continue standard monitoring schedule'],
      };
    }

    return {
      status: pot.riskLevel,
      summary: `${issues.length} issue(s) detected requiring attention`,
      issues,
      recommendations,
    };
  };

  const analysis = getAIAnalysis();

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold">Pot {pot.id}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={pot.riskLevel} size="sm" />
              <span className="text-xs text-slate-500">Phase {pot.phase} / {pot.area}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Risk Score */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">AI Health Score</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Based on Fe, Si, temperature, and trends
                  </p>
                </div>
                <RiskGauge score={pot.aiScore} size="md" />
              </div>
            </CardContent>
          </Card>

          {/* Pot Info */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Pot Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Age: {pot.age} days</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Start: {formatDate(pot.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span>Last Tap: {formatDate(pot.lastTapDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <AlertTriangle className="w-4 h-4 text-slate-400" />
                  <span>{activeAlerts.length} active alerts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Metrics */}
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Current Metrics</h3>
              <MetricRow
                label="Fe"
                value={pot.metrics.fe}
                unit="%"
                threshold={{ warning: THRESHOLDS.fe.moderate, critical: THRESHOLDS.fe.critical }}
              />
              <MetricRow
                label="Si"
                value={pot.metrics.si}
                unit="%"
                threshold={{ warning: THRESHOLDS.si.moderate, critical: THRESHOLDS.si.critical }}
              />
              <MetricRow
                label="Temperature"
                value={pot.metrics.temperature}
                unit="°C"
                status={
                  pot.metrics.temperature > THRESHOLDS.temperature.critical_high ||
                  pot.metrics.temperature < THRESHOLDS.temperature.critical_low
                    ? 'critical'
                    : pot.metrics.temperature > THRESHOLDS.temperature.normal_high ||
                      pot.metrics.temperature < THRESHOLDS.temperature.normal_low
                    ? 'warning'
                    : 'normal'
                }
              />
              <MetricRow
                label="Voltage"
                value={pot.metrics.voltage}
                unit="V"
                status="normal"
              />
              <MetricRow
                label="Molar Ratio"
                value={pot.metrics.molarRatio}
                unit=""
                status={
                  pot.metrics.molarRatio > THRESHOLDS.molarRatio.critical_high ||
                  pot.metrics.molarRatio < THRESHOLDS.molarRatio.critical_low
                    ? 'critical'
                    : 'normal'
                }
              />
              <MetricRow
                label="AE Frequency"
                value={pot.metrics.aeFrequency}
                unit="/day"
                threshold={{ warning: THRESHOLDS.aeFrequency.moderate, critical: THRESHOLDS.aeFrequency.critical }}
              />
            </CardContent>
          </Card>

          {/* Trends */}
          <Tabs defaultValue="fe">
            <TabsList className="w-full">
              <TabsTrigger value="fe" className="flex-1">Fe</TabsTrigger>
              <TabsTrigger value="si" className="flex-1">Si</TabsTrigger>
              <TabsTrigger value="temp" className="flex-1">Temp</TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">AI Score</TabsTrigger>
            </TabsList>
            <TabsContent value="fe">
              <TrendChart
                data={pot.trends}
                metric="fe"
                title="Iron Content Trend"
                height={160}
              />
            </TabsContent>
            <TabsContent value="si">
              <TrendChart
                data={pot.trends}
                metric="si"
                title="Silicon Content Trend"
                height={160}
              />
            </TabsContent>
            <TabsContent value="temp">
              <TrendChart
                data={pot.trends}
                metric="temperature"
                title="Temperature Trend"
                height={160}
              />
            </TabsContent>
            <TabsContent value="ai">
              <TrendChart
                data={pot.trends}
                metric="aiScore"
                title="AI Score Trend"
                showThreshold={false}
                height={160}
              />
            </TabsContent>
          </Tabs>

          {/* AI Analysis */}
          <Card className={cn(
            analysis.status === 'critical' ? 'border-red-200 bg-red-50' :
            analysis.status === 'high' ? 'border-orange-200 bg-orange-50' :
            analysis.status === 'moderate' ? 'border-yellow-200 bg-yellow-50' :
            'border-green-200 bg-green-50'
          )}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  analysis.status === 'healthy' ? 'bg-green-100' : 'bg-white'
                )}>
                  {analysis.status === 'healthy' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Info className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-slate-900">AI Analysis</h3>
                  <p className="text-sm text-slate-600 mt-1">{analysis.summary}</p>

                  {analysis.issues.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">Issues Detected:</p>
                      <ul className="text-sm text-slate-700 space-y-1">
                        {analysis.issues.map((issue, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Recommendations:</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-slate-50">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Schedule Maintenance
          </Button>
          <Button className="flex-1">
            Add to Tapping
          </Button>
        </div>
      </div>
    </div>
  );
}
