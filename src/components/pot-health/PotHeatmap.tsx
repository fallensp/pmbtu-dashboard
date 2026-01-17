import { useMemo } from 'react';
import { PotCell } from './PotCell';
import type { Pot, RiskLevel } from '@/types';
import { PHASE_AREAS } from '@/data/constants';
import { cn } from '@/lib/utils';

interface PotHeatmapProps {
  pots: Pot[];
  selectedPhase: 1 | 2 | 3;
  selectedAreas: string[];
  selectedRiskLevels: RiskLevel[];
  onPotClick?: (pot: Pot) => void;
  selectedPotId?: string;
}

export function PotHeatmap({
  pots,
  selectedPhase,
  selectedAreas,
  selectedRiskLevels,
  onPotClick,
  selectedPotId,
}: PotHeatmapProps) {
  // Filter pots by phase
  const phasePots = useMemo(() => {
    return pots.filter((p) => p.phase === selectedPhase);
  }, [pots, selectedPhase]);

  // Group pots by area
  const potsByArea = useMemo(() => {
    const areas = PHASE_AREAS[selectedPhase];
    const grouped: Record<string, Pot[]> = {};

    areas.forEach((area) => {
      grouped[area] = phasePots
        .filter((p) => p.area === area)
        .sort((a, b) => a.position - b.position);
    });

    return grouped;
  }, [phasePots, selectedPhase]);

  // Check if a pot should be highlighted
  const isPotVisible = (pot: Pot) => {
    if (selectedAreas.length > 0 && !selectedAreas.includes(pot.area)) {
      return false;
    }
    if (!selectedRiskLevels.includes(pot.riskLevel)) {
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      {Object.entries(potsByArea).map(([area, areaPots]) => {
        const isAreaSelected = selectedAreas.length === 0 || selectedAreas.includes(area);

        return (
          <div
            key={area}
            className={cn(
              'p-3 rounded-lg border transition-opacity',
              isAreaSelected ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-50'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">{area}</h3>
              <span className="text-xs text-gray-500">
                {areaPots.filter(isPotVisible).length} / {areaPots.length} pots
              </span>
            </div>

            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}>
              {areaPots.map((pot) => (
                <div
                  key={pot.id}
                  className={cn(
                    'transition-opacity',
                    !isPotVisible(pot) && 'opacity-20'
                  )}
                >
                  <PotCell
                    pot={pot}
                    onClick={isPotVisible(pot) ? onPotClick : undefined}
                    isSelected={pot.id === selectedPotId}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
