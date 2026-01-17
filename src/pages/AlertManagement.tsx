import { useState, useMemo } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertList } from '@/components/pot-health/AlertList';
import { SummaryCard } from '@/components/shared/MetricCard';
import { getAlerts } from '@/data/generators';
import type { AlertSeverity, AlertStatus } from '@/types';
import { cn } from '@/lib/utils';

export function AlertManagement() {
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity[]>([]);
  const [phaseFilter, setPhaseFilter] = useState<number | null>(null);

  const allAlerts = useMemo(() => getAlerts(), []);

  const filteredAlerts = useMemo(() => {
    let filtered = allAlerts;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (severityFilter.length > 0) {
      filtered = filtered.filter(a => severityFilter.includes(a.severity));
    }

    if (phaseFilter) {
      filtered = filtered.filter(a => {
        const potPhase = parseInt(a.potId.split('-')[0]);
        return potPhase === phaseFilter;
      });
    }

    return filtered;
  }, [allAlerts, statusFilter, severityFilter, phaseFilter]);

  const summary = useMemo(() => ({
    total: allAlerts.length,
    active: allAlerts.filter(a => a.status === 'active').length,
    acknowledged: allAlerts.filter(a => a.status === 'acknowledged').length,
    resolved: allAlerts.filter(a => a.status === 'resolved').length,
    critical: allAlerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
    high: allAlerts.filter(a => a.severity === 'high' && a.status === 'active').length,
  }), [allAlerts]);

  const toggleSeverity = (severity: AlertSeverity) => {
    setSeverityFilter(prev =>
      prev.includes(severity)
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const handleAcknowledge = (alertIds: string[]) => {
    console.log('Acknowledging alerts:', alertIds);
    // In a real app, this would update the alert status
  };

  const handleResolve = (alertIds: string[]) => {
    console.log('Resolving alerts:', alertIds);
    // In a real app, this would update the alert status
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Management"
        description="Monitor and manage pot health alerts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Pot Health', href: '/pot-health' },
          { label: 'Alerts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          title="Active Alerts"
          count={summary.active}
          subtitle={`${summary.critical} critical`}
          color="red"
          onClick={() => setStatusFilter('active')}
        />
        <SummaryCard
          title="Acknowledged"
          count={summary.acknowledged}
          color="yellow"
          onClick={() => setStatusFilter('acknowledged')}
        />
        <SummaryCard
          title="Resolved"
          count={summary.resolved}
          color="green"
          onClick={() => setStatusFilter('resolved')}
        />
        <SummaryCard
          title="Total"
          count={summary.total}
          color="blue"
          onClick={() => setStatusFilter('all')}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Status</label>
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <TabsList className="h-8">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                  <TabsTrigger value="acknowledged" className="text-xs">Acknowledged</TabsTrigger>
                  <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Severity</label>
              <div className="flex gap-1">
                {(['critical', 'high', 'moderate'] as AlertSeverity[]).map(severity => (
                  <button
                    key={severity}
                    onClick={() => toggleSeverity(severity)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded transition-colors capitalize',
                      severityFilter.includes(severity)
                        ? severity === 'critical' ? 'bg-red-500 text-white' :
                          severity === 'high' ? 'bg-orange-500 text-white' :
                          'bg-yellow-500 text-slate-900'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {severity}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase Filter */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Phase</label>
              <div className="flex gap-1">
                {[null, 1, 2, 3].map(phase => (
                  <button
                    key={phase ?? 'all'}
                    onClick={() => setPhaseFilter(phase)}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded transition-colors',
                      phaseFilter === phase
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {phase ?? 'All'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(statusFilter !== 'all' || severityFilter.length > 0 || phaseFilter !== null) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSeverityFilter([]);
                  setPhaseFilter(null);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card>
        <CardContent className="pt-4">
          <AlertList
            alerts={filteredAlerts}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        </CardContent>
      </Card>
    </div>
  );
}
