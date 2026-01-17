import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge, RiskGauge, TrendChart, MetricCard } from '@/components/shared';
import type { Pot } from '@/types';
import { getAlertsByPotId } from '@/data/mock';
import { RISK_THRESHOLDS } from '@/data/constants';
import {
  Thermometer,
  Zap,
  Clock,
  Calendar,
  AlertTriangle,
  Brain,
} from 'lucide-react';

interface PotDetailPanelProps {
  pot: Pot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PotDetailPanel({ pot, isOpen, onClose }: PotDetailPanelProps) {
  const [trendPeriod, setTrendPeriod] = useState<'7' | '30' | '90'>('30');

  if (!pot) return null;

  const alerts = getAlertsByPotId(pot.id);
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');

  // Get metric status
  const getMetricStatus = (
    value: number,
    thresholds: { critical: number; moderate: number }
  ): 'normal' | 'warning' | 'critical' => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.moderate) return 'warning';
    return 'normal';
  };

  // Filter trend data based on period
  const getTrendData = () => {
    const days = parseInt(trendPeriod);
    return pot.trend.slice(-days);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl">Pot {pot.id}</SheetTitle>
            <StatusBadge status={pot.riskLevel} size="md" />
          </div>
          <SheetDescription>
            Phase {pot.phase} • {pot.area} • Position {pot.position}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 flex flex-col items-center">
                <RiskGauge score={pot.aiScore} size="lg" />
                <p className="mt-2 text-sm text-gray-500">AI Health Score</p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">{pot.startDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{pot.age} days</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last Tap:</span>
                <span className="font-medium">{pot.lastTapDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Active Alerts:</span>
                <span className="font-medium">{activeAlerts.length}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Key Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Iron (Fe)"
                value={pot.metrics.fe.toFixed(3)}
                unit="%"
                status={getMetricStatus(pot.metrics.fe, RISK_THRESHOLDS.fe)}
                description={`Threshold: ${RISK_THRESHOLDS.fe.critical}`}
              />
              <MetricCard
                title="Silicon (Si)"
                value={pot.metrics.si.toFixed(3)}
                unit="%"
                status={getMetricStatus(pot.metrics.si, RISK_THRESHOLDS.si)}
                description={`Threshold: ${RISK_THRESHOLDS.si.critical}`}
              />
              <MetricCard
                title="Temperature"
                value={pot.metrics.temp}
                unit="°C"
                icon={<Thermometer className="h-4 w-4" />}
                status={
                  pot.metrics.temp < RISK_THRESHOLDS.temp.min ||
                  pot.metrics.temp > RISK_THRESHOLDS.temp.max
                    ? 'warning'
                    : 'normal'
                }
                description={`Range: ${RISK_THRESHOLDS.temp.min}-${RISK_THRESHOLDS.temp.max}`}
              />
              <MetricCard
                title="Voltage"
                value={pot.metrics.voltage.toFixed(2)}
                unit="V"
                icon={<Zap className="h-4 w-4" />}
              />
            </div>
          </div>

          <Separator />

          {/* Trend Chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Trend Analysis</h3>
              <Tabs value={trendPeriod} onValueChange={(v) => setTrendPeriod(v as '7' | '30' | '90')}>
                <TabsList className="h-8">
                  <TabsTrigger value="7" className="text-xs px-2 h-6">7D</TabsTrigger>
                  <TabsTrigger value="30" className="text-xs px-2 h-6">30D</TabsTrigger>
                  <TabsTrigger value="90" className="text-xs px-2 h-6">90D</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <TrendChart
              data={getTrendData()}
              metrics={['fe', 'si']}
              height={180}
              showThresholds
            />
          </div>

          <Separator />

          {/* AI Analysis */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              {pot.riskLevel === 'critical' && (
                <p>
                  <strong className="text-red-600">Immediate attention required.</strong> Iron content
                  has exceeded the critical threshold. Recommend scheduling pot maintenance and
                  cathode inspection within the next 24 hours.
                </p>
              )}
              {pot.riskLevel === 'high' && (
                <p>
                  <strong className="text-orange-600">Elevated risk detected.</strong> Current metrics
                  are trending toward critical thresholds. Increase monitoring frequency and prepare
                  for potential intervention.
                </p>
              )}
              {pot.riskLevel === 'moderate' && (
                <p>
                  <strong className="text-yellow-600">Monitor closely.</strong> Metrics are within
                  moderate range. Continue standard monitoring and ensure bath chemistry is maintained.
                </p>
              )}
              {pot.riskLevel === 'normal' && (
                <p>
                  <strong className="text-green-600">Operating normally.</strong> All metrics are
                  within acceptable ranges. Continue standard operating procedures.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1">
              Schedule Maintenance
            </Button>
            <Button variant="outline" className="flex-1">
              Defer Action
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
