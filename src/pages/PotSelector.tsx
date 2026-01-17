import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Filter, Plus, X, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getPots } from '@/data/generators';
import { PRODUCT_CONSTRAINTS } from '@/data/constants';
import type { ProductGrade } from '@/types';
import { cn } from '@/lib/utils';

export function PotSelector() {
  const navigate = useNavigate();
  const [selectedPots, setSelectedPots] = useState<Set<string>>(new Set());
  const [targetGrade, setTargetGrade] = useState<ProductGrade>('PFA-NT');
  const [feRange, setFeRange] = useState({ min: 0, max: 0.075 });
  const [siRange, setSiRange] = useState({ min: 0, max: 0.05 });
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);

  const allPots = useMemo(() => getPots(), []);

  const constraints = PRODUCT_CONSTRAINTS[targetGrade];

  // Filter pots based on criteria
  const eligiblePots = useMemo(() => {
    return allPots.filter(pot => {
      if (pot.riskLevel === 'shutdown' || pot.riskLevel === 'critical') return false;
      if (showOnlyEligible) {
        return pot.metrics.fe <= constraints.maxFe && pot.metrics.si <= constraints.maxSi;
      }
      return pot.metrics.fe >= feRange.min && pot.metrics.fe <= feRange.max &&
             pot.metrics.si >= siRange.min && pot.metrics.si <= siRange.max;
    }).sort((a, b) => a.metrics.fe - b.metrics.fe);
  }, [allPots, targetGrade, feRange, siRange, showOnlyEligible, constraints]);

  // Calculate blended chemistry
  const blendedChemistry = useMemo(() => {
    if (selectedPots.size === 0) return { fe: 0, si: 0 };

    const selected = allPots.filter(p => selectedPots.has(p.id));
    return {
      fe: selected.reduce((sum, p) => sum + p.metrics.fe, 0) / selected.length,
      si: selected.reduce((sum, p) => sum + p.metrics.si, 0) / selected.length,
    };
  }, [allPots, selectedPots]);

  // Check if blend meets constraints
  const meetsConstraints = blendedChemistry.fe <= constraints.maxFe &&
                          blendedChemistry.si <= constraints.maxSi;

  const togglePot = (potId: string) => {
    const newSelected = new Set(selectedPots);
    if (newSelected.has(potId)) {
      newSelected.delete(potId);
    } else {
      newSelected.add(potId);
    }
    setSelectedPots(newSelected);
  };

  const selectAll = () => {
    if (selectedPots.size === eligiblePots.length) {
      setSelectedPots(new Set());
    } else {
      setSelectedPots(new Set(eligiblePots.map(p => p.id)));
    }
  };

  const handleGradeChange = (grade: ProductGrade) => {
    setTargetGrade(grade);
    const newConstraints = PRODUCT_CONSTRAINTS[grade];
    setFeRange({ min: 0, max: newConstraints.maxFe });
    setSiRange({ min: 0, max: newConstraints.maxSi });
    setSelectedPots(new Set());
  };

  // Get AI recommended pots
  const recommendedPots = useMemo(() => {
    return eligiblePots
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 6);
  }, [eligiblePots]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pot Selection"
        description="Select pots for crucible assignment"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Production', href: '/production' },
          { label: 'Pot Selection' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button disabled={selectedPots.size === 0 || !meetsConstraints}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Crucible ({selectedPots.size})
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Target Grade */}
            <div>
              <label className="text-xs text-slate-500 block mb-2">Target Grade</label>
              <div className="space-y-1">
                {(['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'] as ProductGrade[]).map(grade => (
                  <button
                    key={grade}
                    onClick={() => handleGradeChange(grade)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm rounded transition-colors',
                      targetGrade === grade
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-slate-100'
                    )}
                  >
                    <div className="flex justify-between">
                      <span>{grade}</span>
                      <span className="text-xs text-slate-400">
                        Fe≤{PRODUCT_CONSTRAINTS[grade].maxFe}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fe Range */}
            <div>
              <label className="text-xs text-slate-500 block mb-2">
                Fe Range (Max: {constraints.maxFe}%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={constraints.maxFe}
                  value={feRange.min}
                  onChange={(e) => setFeRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={constraints.maxFe}
                  value={feRange.max}
                  onChange={(e) => setFeRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>

            {/* Si Range */}
            <div>
              <label className="text-xs text-slate-500 block mb-2">
                Si Range (Max: {constraints.maxSi}%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={constraints.maxSi}
                  value={siRange.min}
                  onChange={(e) => setSiRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={constraints.maxSi}
                  value={siRange.max}
                  onChange={(e) => setSiRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={showOnlyEligible}
                onCheckedChange={(checked) => setShowOnlyEligible(!!checked)}
              />
              <span className="text-sm text-slate-600">Show only eligible pots</span>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* AI Recommendations */}
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                AI Recommended Pots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recommendedPots.map(pot => (
                  <button
                    key={pot.id}
                    onClick={() => togglePot(pot.id)}
                    className={cn(
                      'px-3 py-1.5 text-xs rounded border transition-colors',
                      selectedPots.has(pot.id)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-blue-200 hover:bg-blue-100'
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {selectedPots.has(pot.id) && <CheckCircle className="w-3 h-3" />}
                      <span>{pot.id.split('-').slice(2).join('-')}</span>
                      <span className="text-blue-300">|</span>
                      <span>Fe: {pot.metrics.fe.toFixed(3)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pot Table */}
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedPots.size === eligiblePots.length && eligiblePots.length > 0}
                  onCheckedChange={selectAll}
                />
                <span className="text-sm text-slate-600">
                  {eligiblePots.length} eligible pots
                </span>
              </div>
              <span className="text-sm text-slate-500">
                {selectedPots.size} selected
              </span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b">
                  <tr>
                    <th className="px-4 py-2 text-left"></th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Pot ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Fe (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Si (%)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">AI Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {eligiblePots.map(pot => (
                    <tr
                      key={pot.id}
                      className={cn(
                        'hover:bg-slate-50 cursor-pointer',
                        selectedPots.has(pot.id) && 'bg-blue-50'
                      )}
                      onClick={() => togglePot(pot.id)}
                    >
                      <td className="px-4 py-2">
                        <Checkbox
                          checked={selectedPots.has(pot.id)}
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => togglePot(pot.id)}
                        />
                      </td>
                      <td className="px-4 py-2 font-medium text-sm">{pot.id}</td>
                      <td className={cn(
                        'px-4 py-2 text-sm',
                        pot.metrics.fe > constraints.maxFe ? 'text-red-600' : 'text-green-600'
                      )}>
                        {pot.metrics.fe.toFixed(4)}
                      </td>
                      <td className={cn(
                        'px-4 py-2 text-sm',
                        pot.metrics.si > constraints.maxSi ? 'text-red-600' : 'text-green-600'
                      )}>
                        {pot.metrics.si.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-sm">{pot.aiScore.toFixed(1)}</td>
                      <td className="px-4 py-2">
                        <StatusBadge status={pot.riskLevel} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Selection Summary */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Selection Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Pots */}
            <div>
              <label className="text-xs text-slate-500 block mb-2">
                Selected Pots ({selectedPots.size})
              </label>
              {selectedPots.size === 0 ? (
                <p className="text-sm text-slate-400">No pots selected</p>
              ) : (
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {Array.from(selectedPots).map(potId => (
                    <span
                      key={potId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {potId.split('-').slice(2).join('-')}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePot(potId);
                        }}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Blended Chemistry */}
            <div className="pt-4 border-t">
              <label className="text-xs text-slate-500 block mb-2">
                Blended Chemistry
              </label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Fe</span>
                  <span className={cn(
                    'text-sm font-medium',
                    blendedChemistry.fe > constraints.maxFe ? 'text-red-600' : 'text-green-600'
                  )}>
                    {blendedChemistry.fe.toFixed(4)}%
                    <span className="text-slate-400 font-normal ml-1">
                      / {constraints.maxFe}%
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Si</span>
                  <span className={cn(
                    'text-sm font-medium',
                    blendedChemistry.si > constraints.maxSi ? 'text-red-600' : 'text-green-600'
                  )}>
                    {blendedChemistry.si.toFixed(4)}%
                    <span className="text-slate-400 font-normal ml-1">
                      / {constraints.maxSi}%
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Constraint Status */}
            <div className={cn(
              'p-3 rounded-lg',
              meetsConstraints ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            )}>
              <div className="flex items-center gap-2 text-sm font-medium">
                {meetsConstraints ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {meetsConstraints
                  ? `Meets ${targetGrade} requirements`
                  : `Does not meet ${targetGrade} requirements`
                }
              </div>
            </div>

            <Button
              className="w-full"
              disabled={selectedPots.size === 0 || !meetsConstraints}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Crucible
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
