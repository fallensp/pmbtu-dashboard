import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PotCell } from './PotCell';
import type { Pot, RiskLevel } from '@/types';
import { AREAS_BY_PHASE } from '@/data/constants';
import { cn } from '@/lib/utils';

interface PotHeatmapProps {
  pots: Pot[];
  phase: number;
  selectedAreas: string[];
  selectedRiskLevels: RiskLevel[];
  selectedPotId?: string | null;
  onPotClick: (pot: Pot) => void;
}

export function PotHeatmap({
  pots,
  phase,
  selectedAreas,
  selectedRiskLevels,
  selectedPotId,
  onPotClick,
}: PotHeatmapProps) {
  const areas = AREAS_BY_PHASE[phase] || [];

  const potsByArea = useMemo(() => {
    const grouped: Record<string, Pot[]> = {};
    areas.forEach(area => {
      grouped[area] = pots
        .filter(p => p.phase === phase && p.area === area)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [pots, phase, areas]);

  const filterPots = (areaPs: Pot[]) => {
    let filtered = areaPs;
    if (selectedRiskLevels.length > 0) {
      filtered = filtered.filter(p => selectedRiskLevels.includes(p.riskLevel));
    }
    return filtered;
  };

  const isAreaVisible = (area: string) => {
    return selectedAreas.length === 0 || selectedAreas.includes(area);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {areas.map(area => {
        const areaPots = potsByArea[area] || [];
        const filteredPots = filterPots(areaPots);
        const visible = isAreaVisible(area);

        if (!visible) return null;

        // Calculate area stats
        const criticalCount = areaPots.filter(p => p.riskLevel === 'critical').length;
        const highCount = areaPots.filter(p => p.riskLevel === 'high').length;
        const avgScore = Math.round(areaPots.reduce((sum, p) => sum + p.aiScore, 0) / areaPots.length);

        return (
          <Card
            key={area}
            className={cn(
              'transition-opacity',
              selectedAreas.length > 0 && !selectedAreas.includes(area) && 'opacity-40'
            )}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Area {area}</CardTitle>
                <div className="flex items-center gap-2 text-xs">
                  {criticalCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                      {criticalCount} critical
                    </span>
                  )}
                  {highCount > 0 && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                      {highCount} high
                    </span>
                  )}
                  <span className="text-slate-500">
                    Score: <span className={cn(
                      'font-medium',
                      avgScore >= 80 ? 'text-green-600' :
                      avgScore >= 60 ? 'text-yellow-600' :
                      avgScore >= 40 ? 'text-orange-600' : 'text-red-600'
                    )}>{avgScore}</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {areaPots.map(pot => {
                  const isFiltered = selectedRiskLevels.length > 0 && !selectedRiskLevels.includes(pot.riskLevel);
                  return (
                    <div
                      key={pot.id}
                      className={cn(
                        'transition-opacity',
                        isFiltered && 'opacity-20'
                      )}
                    >
                      <PotCell
                        pot={pot}
                        isSelected={pot.id === selectedPotId}
                        onClick={onPotClick}
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{areaPots.length} pots</span>
                {selectedRiskLevels.length > 0 && (
                  <span>{filteredPots.length} shown</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Legend component
export function HeatmapLegend() {
  const items = [
    { label: 'Critical', color: 'bg-red-500' },
    { label: 'High', color: 'bg-orange-500' },
    { label: 'Moderate', color: 'bg-yellow-500' },
    { label: 'Normal', color: 'bg-green-500' },
    { label: 'Shutdown', color: 'bg-gray-400' },
  ];

  return (
    <div className="flex items-center gap-4">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={cn('w-3 h-3 rounded-sm', item.color)} />
          <span className="text-xs text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
