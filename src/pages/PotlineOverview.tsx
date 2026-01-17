import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SummaryCard } from '@/components/shared/MetricCard';
import { PotHeatmap, HeatmapLegend } from '@/components/pot-health/PotHeatmap';
import { PotDetailPanel } from '@/components/pot-health/PotDetailPanel';
import { getPots } from '@/data/generators';
import { AREAS_BY_PHASE } from '@/data/constants';
import type { Pot, RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

export function PotlineOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPhase = searchParams.get('phase') ? Number(searchParams.get('phase')) : 1;
  const initialRisk = searchParams.get('risk') as RiskLevel | null;

  const [selectedPhase, setSelectedPhase] = useState<number>(initialPhase);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>(
    initialRisk ? [initialRisk] : []
  );
  const [selectedPot, setSelectedPot] = useState<Pot | null>(null);

  const allPots = useMemo(() => getPots(), []);

  const phasePots = useMemo(
    () => allPots.filter(p => p.phase === selectedPhase),
    [allPots, selectedPhase]
  );

  const summary = useMemo(() => ({
    critical: phasePots.filter(p => p.riskLevel === 'critical').length,
    high: phasePots.filter(p => p.riskLevel === 'high').length,
    moderate: phasePots.filter(p => p.riskLevel === 'moderate').length,
    normal: phasePots.filter(p => p.riskLevel === 'normal').length,
    shutdown: phasePots.filter(p => p.riskLevel === 'shutdown').length,
  }), [phasePots]);

  const areas = AREAS_BY_PHASE[selectedPhase] || [];

  const toggleArea = (area: string) => {
    setSelectedAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleRiskLevel = (level: RiskLevel) => {
    setSelectedRiskLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handlePotClick = (pot: Pot) => {
    setSelectedPot(pot);
  };

  const handlePhaseChange = (phase: string) => {
    setSelectedPhase(Number(phase));
    setSelectedAreas([]);
    setSearchParams({ phase });
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setSelectedRiskLevels([]);
  };

  const hasFilters = selectedAreas.length > 0 || selectedRiskLevels.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Potline Overview"
        description="Real-time monitoring of pot health across all phases"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Pot Health' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Phase Selector */}
      <div className="flex items-center justify-between">
        <Tabs value={String(selectedPhase)} onValueChange={handlePhaseChange}>
          <TabsList>
            <TabsTrigger value="1">Phase 1</TabsTrigger>
            <TabsTrigger value="2">Phase 2</TabsTrigger>
            <TabsTrigger value="3">Phase 3</TabsTrigger>
          </TabsList>
        </Tabs>

        <HeatmapLegend />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard
          title="Critical"
          count={summary.critical}
          color="red"
          onClick={() => toggleRiskLevel('critical')}
        />
        <SummaryCard
          title="High Risk"
          count={summary.high}
          color="orange"
          onClick={() => toggleRiskLevel('high')}
        />
        <SummaryCard
          title="Moderate"
          count={summary.moderate}
          color="yellow"
          onClick={() => toggleRiskLevel('moderate')}
        />
        <SummaryCard
          title="Normal"
          count={summary.normal}
          color="green"
          onClick={() => toggleRiskLevel('normal')}
        />
        <SummaryCard
          title="Shutdown"
          count={summary.shutdown}
          color="gray"
          onClick={() => toggleRiskLevel('shutdown')}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="w-4 h-4" />
          <span>Filter by:</span>
        </div>

        {/* Area Filter Chips */}
        <div className="flex flex-wrap gap-1">
          {areas.map(area => (
            <button
              key={area}
              onClick={() => toggleArea(area)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                selectedAreas.includes(area)
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {area}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-300" />

        {/* Risk Level Filter Chips */}
        <div className="flex flex-wrap gap-1">
          {(['critical', 'high', 'moderate', 'normal'] as RiskLevel[]).map(level => (
            <button
              key={level}
              onClick={() => toggleRiskLevel(level)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize',
                selectedRiskLevels.includes(level)
                  ? level === 'critical' ? 'bg-red-500 text-white' :
                    level === 'high' ? 'bg-orange-500 text-white' :
                    level === 'moderate' ? 'bg-yellow-500 text-slate-900' :
                    'bg-green-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {level}
            </button>
          ))}
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Heatmap */}
      <PotHeatmap
        pots={allPots}
        phase={selectedPhase}
        selectedAreas={selectedAreas}
        selectedRiskLevels={selectedRiskLevels}
        selectedPotId={selectedPot?.id}
        onPotClick={handlePotClick}
      />

      {/* Pot Detail Panel */}
      {selectedPot && (
        <PotDetailPanel
          pot={selectedPot}
          onClose={() => setSelectedPot(null)}
        />
      )}
    </div>
  );
}
