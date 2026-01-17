import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, X } from 'lucide-react';
import { usePlannerStore, getEligiblePotsForGrade } from '@/stores/plannerStore';
import { TASK_CONSTRAINTS, PRODUCT_COLORS, PRODUCT_CONSTRAINTS } from '@/data/constants';
import type { ProductGrade } from '@/types';
import { cn } from '@/lib/utils';

interface PotSelectorModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  productGrade: ProductGrade;
  selectedPotIds: string[];
}

export function PotSelectorModal({
  open,
  onClose,
  taskId,
  productGrade,
  selectedPotIds,
}: PotSelectorModalProps) {
  const setTaskPots = usePlannerStore(state => state.setTaskPots);
  const tasks = usePlannerStore(state => state.tasks);

  const [localSelection, setLocalSelection] = useState<string[]>(selectedPotIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [feRange, setFeRange] = useState<[number, number]>([0, PRODUCT_CONSTRAINTS[productGrade].maxFe]);
  const [siRange, setSiRange] = useState<[number, number]>([0, PRODUCT_CONSTRAINTS[productGrade].maxSi]);

  // Get pots already used in other tasks
  const usedPotIds = useMemo(() => {
    const used = new Set<string>();
    tasks.forEach(task => {
      if (task.id !== taskId) {
        task.pots.forEach(id => used.add(id));
      }
    });
    return used;
  }, [tasks, taskId]);

  // Get eligible pots for this grade
  const eligiblePots = useMemo(() => {
    return getEligiblePotsForGrade(productGrade, Array.from(usedPotIds));
  }, [productGrade, usedPotIds]);

  // Filter pots based on search and ranges
  const filteredPots = useMemo(() => {
    return eligiblePots.filter(pot => {
      // Search filter
      if (searchQuery && !pot.id.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Fe range filter
      if (pot.metrics.fe < feRange[0] || pot.metrics.fe > feRange[1]) {
        return false;
      }

      // Si range filter
      if (pot.metrics.si < siRange[0] || pot.metrics.si > siRange[1]) {
        return false;
      }

      return true;
    });
  }, [eligiblePots, searchQuery, feRange, siRange]);

  // Calculate blended chemistry for current selection
  const blendedStats = useMemo(() => {
    if (localSelection.length === 0) {
      return { fe: 0, si: 0, weight: 0 };
    }

    const selectedPots = eligiblePots.filter(p => localSelection.includes(p.id));
    const avgFe = selectedPots.reduce((sum, p) => sum + p.metrics.fe, 0) / selectedPots.length;
    const avgSi = selectedPots.reduce((sum, p) => sum + p.metrics.si, 0) / selectedPots.length;
    const weight = selectedPots.length * TASK_CONSTRAINTS.avgWeightPerPot;

    return {
      fe: Number(avgFe.toFixed(4)),
      si: Number(avgSi.toFixed(4)),
      weight: Number(weight.toFixed(1)),
    };
  }, [localSelection, eligiblePots]);

  const constraints = PRODUCT_CONSTRAINTS[productGrade];
  const feOk = blendedStats.fe <= constraints.maxFe;
  const siOk = blendedStats.si <= constraints.maxSi;
  const countOk = localSelection.length === TASK_CONSTRAINTS.potsPerTask;

  const togglePot = (potId: string) => {
    setLocalSelection(prev => {
      if (prev.includes(potId)) {
        return prev.filter(id => id !== potId);
      }
      if (prev.length >= TASK_CONSTRAINTS.potsPerTask) {
        return prev;
      }
      return [...prev, potId];
    });
  };

  const handleAISelect = () => {
    const best = filteredPots.slice(0, TASK_CONSTRAINTS.potsPerTask).map(p => p.id);
    setLocalSelection(best);
  };

  const handleSave = () => {
    setTaskPots(taskId, localSelection);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelection(selectedPotIds);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', PRODUCT_COLORS[productGrade])} />
            Select Pots for {productGrade}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Pot List */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Filters */}
            <div className="space-y-3 pb-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search pot ID..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">
                    Fe Range (max {constraints.maxFe}%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step={0.01}
                      min={0}
                      max={constraints.maxFe}
                      value={feRange[1]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeRange([0, Number(e.target.value)])}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">
                    Si Range (max {constraints.maxSi}%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step={0.01}
                      min={0}
                      max={constraints.maxSi}
                      value={siRange[1]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSiRange([0, Number(e.target.value)])}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {filteredPots.length} eligible pots
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAISelect}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI Select Best {TASK_CONSTRAINTS.potsPerTask}
                </Button>
              </div>
            </div>

            {/* Pot Table */}
            <ScrollArea className="flex-1 mt-3">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-xs text-slate-500 border-b">
                    <th className="text-left py-2 pl-2 w-8"></th>
                    <th className="text-left py-2">Pot ID</th>
                    <th className="text-left py-2">Phase</th>
                    <th className="text-right py-2">Fe %</th>
                    <th className="text-right py-2">Si %</th>
                    <th className="text-right py-2 pr-2">AI Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPots.map(pot => {
                    const isSelected = localSelection.includes(pot.id);
                    const isDisabled = !isSelected && localSelection.length >= TASK_CONSTRAINTS.potsPerTask;

                    return (
                      <tr
                        key={pot.id}
                        className={cn(
                          'border-b cursor-pointer hover:bg-slate-50 transition-colors',
                          isSelected && 'bg-blue-50',
                          isDisabled && 'opacity-50 cursor-not-allowed'
                        )}
                        onClick={() => !isDisabled && togglePot(pot.id)}
                      >
                        <td className="py-2 pl-2">
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={() => togglePot(pot.id)}
                          />
                        </td>
                        <td className="py-2 font-mono text-sm">{pot.id}</td>
                        <td className="py-2 text-sm">Phase {pot.phase}</td>
                        <td className={cn(
                          'py-2 text-right text-sm',
                          pot.metrics.fe > constraints.maxFe * 0.9 ? 'text-yellow-600' : ''
                        )}>
                          {pot.metrics.fe.toFixed(4)}
                        </td>
                        <td className={cn(
                          'py-2 text-right text-sm',
                          pot.metrics.si > constraints.maxSi * 0.9 ? 'text-yellow-600' : ''
                        )}>
                          {pot.metrics.si.toFixed(4)}
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <Badge variant={pot.aiScore >= 80 ? 'default' : 'secondary'}>
                            {pot.aiScore.toFixed(0)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          {/* Selection Summary */}
          <div className="w-64 border-l pl-4 flex flex-col">
            <div className="font-medium text-sm mb-3">Selection Summary</div>

            {/* Selected Pots */}
            <div className="space-y-2 mb-4">
              <div className="text-xs text-slate-600">
                Selected ({localSelection.length}/{TASK_CONSTRAINTS.potsPerTask})
              </div>
              <div className="flex flex-wrap gap-1">
                {localSelection.length === 0 ? (
                  <span className="text-sm text-slate-400 italic">None selected</span>
                ) : (
                  localSelection.map(id => (
                    <div
                      key={id}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      <span className="font-mono">{id.split('-').slice(1).join('-')}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePot(id);
                        }}
                        className="hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Blended Stats */}
            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-600 font-medium">Blended Chemistry</div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fe:</span>
                  <span className={cn(
                    'font-medium',
                    feOk ? 'text-green-600' : 'text-red-600'
                  )}>
                    {blendedStats.fe.toFixed(4)}%
                    <span className="text-xs text-slate-400 ml-1">
                      (max {constraints.maxFe}%)
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Si:</span>
                  <span className={cn(
                    'font-medium',
                    siOk ? 'text-green-600' : 'text-red-600'
                  )}>
                    {blendedStats.si.toFixed(4)}%
                    <span className="text-xs text-slate-400 ml-1">
                      (max {constraints.maxSi}%)
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm">Weight:</span>
                  <span className="font-medium">
                    {blendedStats.weight} MT
                  </span>
                </div>
              </div>
            </div>

            {/* Validation */}
            <div className="mt-4 space-y-2">
              <div className={cn(
                'flex items-center gap-2 text-sm',
                countOk ? 'text-green-600' : 'text-yellow-600'
              )}>
                {countOk ? '✓' : '○'} {TASK_CONSTRAINTS.potsPerTask} pots required
              </div>
              <div className={cn(
                'flex items-center gap-2 text-sm',
                feOk ? 'text-green-600' : 'text-red-600'
              )}>
                {feOk ? '✓' : '✗'} Fe within limit
              </div>
              <div className={cn(
                'flex items-center gap-2 text-sm',
                siOk ? 'text-green-600' : 'text-red-600'
              )}>
                {siOk ? '✓' : '✗'} Si within limit
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
