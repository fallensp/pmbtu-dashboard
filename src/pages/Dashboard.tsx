import { Link } from 'react-router-dom';
import {
  Flame,
  AlertTriangle,
  Package,
  TrendingUp,
  ArrowRight,
  Activity,
  Beaker,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiskGauge, MetricCard, StatusBadge } from '@/components/shared';
import { mockDashboardSummary, getActiveAlerts, getCriticalAlerts } from '@/data/mock';
import { RISK_COLORS } from '@/data/constants';

export function Dashboard() {
  const summary = mockDashboardSummary;
  const activeAlerts = getActiveAlerts().slice(0, 5);
  const criticalAlerts = getCriticalAlerts();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        description="PMBTU AI Operations Overview"
        actions={
          <Button asChild>
            <Link to="/pot-health">
              View Potline <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Overall Health</CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <RiskGauge score={summary.healthScore} size="md" />
          </CardContent>
        </Card>

        <MetricCard
          title="Today's Output"
          value={summary.todayOutput}
          unit="MT"
          icon={<Beaker className="h-4 w-4" />}
          trend="up"
          trendValue="+5.2%"
          description="vs yesterday"
        />

        <MetricCard
          title="Crucibles Completed"
          value={summary.todayCrucibles}
          unit="/ 20"
          icon={<Package className="h-4 w-4" />}
          description={`${Math.round((summary.todayCrucibles / 20) * 100)}% of target`}
        />

        <MetricCard
          title="Fulfillment Rate"
          value={summary.fulfillmentRate}
          unit="%"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
          trendValue="+2.1%"
          description="this shift"
        />
      </div>

      {/* Risk Distribution & Alerts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Risk Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Pot Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Critical', count: summary.criticalCount, color: RISK_COLORS.critical },
                { label: 'High', count: summary.highCount, color: RISK_COLORS.high },
                { label: 'Moderate', count: summary.moderateCount, color: RISK_COLORS.moderate },
                { label: 'Normal', count: summary.normalCount, color: RISK_COLORS.normal },
                { label: 'Shutdown', count: summary.shutdownCount, color: RISK_COLORS.shutdown },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div
                    className="mx-auto w-16 h-16 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.count}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div
                  className="transition-all"
                  style={{
                    width: `${(summary.criticalCount / 900) * 100}%`,
                    backgroundColor: RISK_COLORS.critical,
                  }}
                />
                <div
                  className="transition-all"
                  style={{
                    width: `${(summary.highCount / 900) * 100}%`,
                    backgroundColor: RISK_COLORS.high,
                  }}
                />
                <div
                  className="transition-all"
                  style={{
                    width: `${(summary.moderateCount / 900) * 100}%`,
                    backgroundColor: RISK_COLORS.moderate,
                  }}
                />
                <div
                  className="transition-all"
                  style={{
                    width: `${(summary.normalCount / 900) * 100}%`,
                    backgroundColor: RISK_COLORS.normal,
                  }}
                />
                <div
                  className="transition-all"
                  style={{
                    width: `${(summary.shutdownCount / 900) * 100}%`,
                    backgroundColor: RISK_COLORS.shutdown,
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                {summary.criticalCount + summary.highCount + summary.moderateCount + summary.normalCount + summary.shutdownCount} total pots across 3 phases
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Alerts
            </CardTitle>
            <Link
              to="/pot-health/alerts"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No active alerts
                </p>
              ) : (
                activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <StatusBadge status={alert.severity} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pot {alert.potId} • {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/pot-health">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-orange-100">
                <Flame className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pot Health</h3>
                <p className="text-sm text-gray-500">
                  {criticalAlerts.length} critical pots require attention
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/production">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Production Planning</h3>
                <p className="text-sm text-gray-500">
                  4 orders pending for tonight's shift
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/production/schedule">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-green-100">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Schedule</h3>
                <p className="text-sm text-gray-500">
                  View weekly tapping schedule
                </p>
              </div>
              <ArrowRight className="ml-auto h-5 w-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
