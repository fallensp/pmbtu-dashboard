import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard, SummaryCard } from '@/components/shared/MetricCard';
import { HealthScoreCard } from '@/components/shared/RiskGauge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getPots, getActiveAlerts, getOrders } from '@/data/generators';
import {
  Activity,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  Truck,
  ChevronRight,
  Beaker,
} from 'lucide-react';
import type { HealthSummary, ProductionSummary } from '@/types';

function getHealthSummary(): HealthSummary {
  const pots = getPots();
  return {
    total: pots.length,
    critical: pots.filter(p => p.riskLevel === 'critical').length,
    high: pots.filter(p => p.riskLevel === 'high').length,
    moderate: pots.filter(p => p.riskLevel === 'moderate').length,
    normal: pots.filter(p => p.riskLevel === 'normal').length,
    shutdown: pots.filter(p => p.riskLevel === 'shutdown').length,
    overallScore: Math.round(pots.reduce((sum, p) => sum + p.aiScore, 0) / pots.length),
  };
}

function getProductionSummary(): ProductionSummary {
  const orders = getOrders();
  const inProgress = orders.filter(o => o.status === 'in_progress');
  const totalFulfilled = inProgress.reduce((sum, o) => sum + o.fulfilled, 0);
  const totalRequired = inProgress.reduce((sum, o) => sum + o.quantity, 0);

  return {
    todayOutput: 285.4,
    targetOutput: 320,
    cruciblesCompleted: 24,
    cruciblesPlanned: 32,
    ordersInProgress: inProgress.length,
    fulfillmentRate: totalRequired > 0 ? (totalFulfilled / totalRequired) * 100 : 0,
  };
}

export function Dashboard() {
  const navigate = useNavigate();
  const health = getHealthSummary();
  const production = getProductionSummary();
  const alerts = getActiveAlerts();
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of pot health and production status"
      />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Pots"
          value={health.total - health.shutdown}
          icon={<Activity className="w-5 h-5 text-blue-600" />}
          trend={{ value: 0.5, direction: 'up', label: 'from yesterday' }}
        />
        <MetricCard
          title="Active Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          status={criticalAlerts.length > 0 ? 'critical' : 'normal'}
          onClick={() => navigate('/pot-health/alerts')}
        />
        <MetricCard
          title="Today's Output"
          value={production.todayOutput}
          unit="MT"
          icon={<Truck className="w-5 h-5 text-green-600" />}
          trend={{
            value: ((production.todayOutput / production.targetOutput) * 100 - 100),
            direction: production.todayOutput >= production.targetOutput ? 'up' : 'down',
            label: 'vs target'
          }}
        />
        <MetricCard
          title="Fulfillment Rate"
          value={Math.round(production.fulfillmentRate)}
          unit="%"
          icon={<Package className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pot Health Summary</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/pot-health')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <SummaryCard
                title="Critical"
                count={health.critical}
                color="red"
                onClick={() => navigate('/pot-health?risk=critical')}
              />
              <SummaryCard
                title="High Risk"
                count={health.high}
                color="orange"
                onClick={() => navigate('/pot-health?risk=high')}
              />
              <SummaryCard
                title="Moderate"
                count={health.moderate}
                color="yellow"
                onClick={() => navigate('/pot-health?risk=moderate')}
              />
              <SummaryCard
                title="Normal"
                count={health.normal}
                color="green"
                onClick={() => navigate('/pot-health?risk=normal')}
              />
              <SummaryCard
                title="Shutdown"
                count={health.shutdown}
                color="gray"
              />
            </div>

            {/* Phase Breakdown */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[1, 2, 3].map(phase => {
                const phasePots = getPots().filter(p => p.phase === phase);
                const phaseScore = Math.round(
                  phasePots.reduce((sum, p) => sum + p.aiScore, 0) / phasePots.length
                );
                const phaseCritical = phasePots.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;

                return (
                  <div
                    key={phase}
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => navigate(`/pot-health?phase=${phase}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-700">Phase {phase}</span>
                      {phaseCritical > 0 && (
                        <span className="text-xs text-red-500 font-medium">
                          {phaseCritical} at risk
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${phaseScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600">{phaseScore}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{phasePots.length} pots</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Overall Health Score */}
        <HealthScoreCard
          score={health.overallScore}
          title="Overall Health Score"
          subtitle={`${health.total} pots monitored`}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Critical Alerts
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/pot-health/alerts')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {criticalAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">No critical alerts</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                    onClick={() => navigate(`/pot-health/pot/${alert.potId}`)}
                  >
                    <div className="w-2 h-2 mt-2 bg-red-500 rounded-full animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{alert.title}</p>
                      <p className="text-sm text-slate-600 truncate">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={alert.severity} size="sm" />
                        <span className="text-xs text-slate-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(alert.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Production Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-blue-500" />
                Production Overview
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/production')}>
                View Orders <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-600">Daily Progress</span>
                  <span className="text-sm font-medium">
                    {production.cruciblesCompleted}/{production.cruciblesPlanned} crucibles
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${(production.cruciblesCompleted / production.cruciblesPlanned) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-3">
                {['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'].map(grade => {
                  const orders = getOrders().filter(o => o.grade === grade && o.status === 'in_progress');
                  const total = orders.reduce((sum, o) => sum + o.quantity, 0);
                  const fulfilled = orders.reduce((sum, o) => sum + o.fulfilled, 0);

                  return (
                    <div key={grade} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500">{grade}</span>
                        <span className="text-xs text-slate-400">{fulfilled}/{total} MT</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: total > 0 ? `${(fulfilled / total) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/production/arrangement')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Tapping Arrangement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
