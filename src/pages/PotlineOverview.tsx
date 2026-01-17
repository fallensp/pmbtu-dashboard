import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PotHeatmap, PotDetailPanel } from '@/components/pot-health';
import { mockPots, getPhaseSummary, getActiveAlerts } from '@/data/mock';
import { useFilterStore } from '@/stores/filterStore';
import { RISK_COLORS, PHASE_AREAS } from '@/data/constants';
import type { Pot, RiskLevel } from '@/types';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function PotlineOverview() {
  const [selectedPhase, setSelectedPhase] = useState<1 | 2 | 3>(1);
  const [selectedPot, setSelectedPot] = useState<Pot | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const {
    areas: selectedAreas,
    riskLevels: selectedRiskLevels,
    toggleArea,
    toggleRiskLevel,
    resetFilters,
  } = useFilterStore();

  const phaseSummary = useMemo(() => getPhaseSummary(selectedPhase), [selectedPhase]);
  const activeAlerts = useMemo(() => getActiveAlerts().slice(0, 5), []);

  const handlePotClick = (pot: Pot) => {
    setSelectedPot(pot);
    setIsPanelOpen(true);
  };

  const riskFilters: { level: RiskLevel; label: string; count: number }[] = [
    { level: 'critical', label: 'Critical', count: phaseSummary.critical },
    { level: 'high', label: 'High', count: phaseSummary.high },
    { level: 'moderate', label: 'Moderate', count: phaseSummary.moderate },
    { level: 'normal', label: 'Normal', count: phaseSummary.normal },
    { level: 'shutdown', label: 'Shutdown', count: phaseSummary.shutdown },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Potline Overview"
        description={`Phase ${selectedPhase} • ${phaseSummary.total} pots`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pot-health/alerts">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Alerts
              </Link>
            </Button>
          </div>
        }
      />

      {/* Phase Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Phase:</span>
        <Tabs
          value={String(selectedPhase)}
          onValueChange={(v) => setSelectedPhase(Number(v) as 1 | 2 | 3)}
        >
          <TabsList>
            <TabsTrigger value="1">Phase 1</TabsTrigger>
            <TabsTrigger value="2">Phase 2</TabsTrigger>
            <TabsTrigger value="3">Phase 3</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Area Filters */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Areas:</span>
                  <div className="flex gap-1">
                    {PHASE_AREAS[selectedPhase].map((area) => (
                      <Button
                        key={area}
                        variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleArea(area)}
                        className="h-7 px-2"
                      >
                        {area}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="h-6 w-px bg-gray-200" />

                {/* Risk Level Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Risk:</span>
                  <div className="flex gap-1">
                    {riskFilters.map(({ level, count }) => (
                      <Button
                        key={level}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRiskLevel(level)}
                        className={cn(
                          'h-7 px-2 gap-1',
                          selectedRiskLevels.includes(level) && 'ring-2 ring-offset-1',
                        )}
                        style={{
                          borderColor: RISK_COLORS[level],
                          color: selectedRiskLevels.includes(level) ? RISK_COLORS[level] : undefined,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: RISK_COLORS[level] }}
                        />
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-3">
            {riskFilters.map(({ level, label, count }) => (
              <Card
                key={level}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedRiskLevels.includes(level) && selectedRiskLevels.length === 1
                    ? 'ring-2 ring-offset-1'
                    : ''
                )}
                style={{
                  borderTopWidth: 3,
                  borderTopColor: RISK_COLORS[level],
                }}
                onClick={() => {
                  // Toggle to show only this risk level
                  if (selectedRiskLevels.length === 1 && selectedRiskLevels[0] === level) {
                    // Reset to all
                    resetFilters();
                  } else {
                    useFilterStore.getState().setRiskLevels([level]);
                  }
                }}
              >
                <CardContent className="py-3 text-center">
                  <p className="text-2xl font-bold" style={{ color: RISK_COLORS[level] }}>
                    {count}
                  </p>
                  <p className="text-xs text-gray-600">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Heatmap */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pot Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <PotHeatmap
                pots={mockPots}
                selectedPhase={selectedPhase}
                selectedAreas={selectedAreas}
                selectedRiskLevels={selectedRiskLevels}
                onPotClick={handlePotClick}
                selectedPotId={selectedPot?.id}
              />

              {/* Legend */}
              <div className="mt-4 flex justify-center gap-4">
                {riskFilters.map(({ level, label }) => (
                  <div key={level} className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: RISK_COLORS[level] }}
                    />
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Active Alerts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Active Alerts
                </CardTitle>
                <Badge variant="destructive">{activeAlerts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    const pot = mockPots.find((p) => p.id === alert.potId);
                    if (pot) handlePotClick(pot);
                  }}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: RISK_COLORS[alert.severity as RiskLevel] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pot {alert.potId}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                <Link to="/pot-health/alerts">View All Alerts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pot Detail Panel */}
      <PotDetailPanel
        pot={selectedPot}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
