import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockPotsV2, getEligiblePotsForGrade } from '@/data/mock';
import { GRADE_CONSTRAINTS } from '@/data/constants';
import type { ProductGrade } from '@/types';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Filter,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';

export function PotSelector() {
  const [selectedGrade, setSelectedGrade] = useState<ProductGrade>('PFA-NT');
  const [feRange, setFeRange] = useState({ min: 0, max: 0.075 });
  const [siRange, setSiRange] = useState({ min: 0, max: 0.05 });
  const [selectedPots, setSelectedPots] = useState<Set<string>>(new Set());

  const constraints = GRADE_CONSTRAINTS[selectedGrade];

  // Get eligible pots based on filters
  const eligiblePots = useMemo(() => {
    return mockPotsV2.filter((pot) =>
      pot.status === 'active' &&
      pot.metrics.fe >= feRange.min &&
      pot.metrics.fe <= feRange.max &&
      pot.metrics.si >= siRange.min &&
      pot.metrics.si <= siRange.max
    ).sort((a, b) => b.aiScore - a.aiScore);
  }, [feRange, siRange]);

  // AI recommended pots
  const aiRecommended = useMemo(() => {
    return getEligiblePotsForGrade(selectedGrade).slice(0, 5);
  }, [selectedGrade]);

  // Calculate blended values for selected pots
  const blendedValues = useMemo(() => {
    const selected = mockPotsV2.filter((p) => selectedPots.has(p.id));
    if (selected.length === 0) return null;

    const totalWeight = selected.reduce((sum, p) => sum + p.weight, 0);
    const blendedFe = selected.reduce((sum, p) => sum + p.metrics.fe * p.weight, 0) / totalWeight;
    const blendedSi = selected.reduce((sum, p) => sum + p.metrics.si * p.weight, 0) / totalWeight;

    return {
      totalWeight: totalWeight.toFixed(2),
      blendedFe: blendedFe.toFixed(4),
      blendedSi: blendedSi.toFixed(4),
      fePasses: blendedFe <= constraints.maxFe,
      siPasses: blendedSi <= constraints.maxSi,
    };
  }, [selectedPots, constraints]);

  const togglePotSelection = (potId: string) => {
    const newSelected = new Set(selectedPots);
    if (newSelected.has(potId)) {
      newSelected.delete(potId);
    } else {
      if (newSelected.size < 6) {
        newSelected.add(potId);
      }
    }
    setSelectedPots(newSelected);
  };

  const handleGradeChange = (grade: ProductGrade) => {
    setSelectedGrade(grade);
    const newConstraints = GRADE_CONSTRAINTS[grade];
    setFeRange({ min: 0, max: newConstraints.maxFe });
    setSiRange({ min: 0, max: newConstraints.maxSi });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Pot Selection"
        description="Select pots for crucible assignment"
        actions={
          <Button variant="outline" asChild>
            <Link to="/production/arrangement">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Arrangement
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Filters Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grade Selector */}
              <div className="space-y-2">
                <Label>Target Grade</Label>
                <Select value={selectedGrade} onValueChange={(v) => handleGradeChange(v as ProductGrade)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PFA-NT">PFA-NT</SelectItem>
                    <SelectItem value="Wire Rod H-EC">Wire Rod H-EC</SelectItem>
                    <SelectItem value="Billet">Billet</SelectItem>
                    <SelectItem value="P1020">P1020</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fe Range */}
              <div className="space-y-2">
                <Label>Fe Range (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={feRange.min}
                    onChange={(e) => setFeRange({ ...feRange, min: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="number"
                    step="0.001"
                    value={feRange.max}
                    onChange={(e) => setFeRange({ ...feRange, max: Number(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <p className="text-xs text-gray-500">Max for grade: {constraints.maxFe}</p>
              </div>

              {/* Si Range */}
              <div className="space-y-2">
                <Label>Si Range (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    value={siRange.min}
                    onChange={(e) => setSiRange({ ...siRange, min: Number(e.target.value) })}
                    className="w-24"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="number"
                    step="0.001"
                    value={siRange.max}
                    onChange={(e) => setSiRange({ ...siRange, max: Number(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <p className="text-xs text-gray-500">Max for grade: {constraints.maxSi}</p>
              </div>

              <p className="text-sm text-gray-600">
                {eligiblePots.length} pots match filters
              </p>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 mb-3">
                Top pots for {selectedGrade} based on AI scoring:
              </p>
              <div className="space-y-2">
                {aiRecommended.map((pot) => (
                  <div
                    key={pot.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                      selectedPots.has(pot.id)
                        ? 'bg-blue-200'
                        : 'bg-white hover:bg-blue-100'
                    )}
                    onClick={() => togglePotSelection(pot.id)}
                  >
                    <div>
                      <span className="font-medium">{pot.id}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        Fe: {pot.metrics.fe.toFixed(3)} | Si: {pot.metrics.si.toFixed(3)}
                      </span>
                    </div>
                    <Badge variant="secondary">{pot.aiScore}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pot Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Eligible Pots</CardTitle>
              <span className="text-sm text-gray-500">
                {selectedPots.size}/6 selected
              </span>
            </div>
          </CardHeader>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Pot ID</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Fe (%)</TableHead>
                  <TableHead>Si (%)</TableHead>
                  <TableHead>Weight (MT)</TableHead>
                  <TableHead>Phase</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eligiblePots.slice(0, 50).map((pot) => {
                  const isRecommended = aiRecommended.some((r) => r.id === pot.id);
                  return (
                    <TableRow
                      key={pot.id}
                      className={cn(
                        'cursor-pointer',
                        selectedPots.has(pot.id) && 'bg-blue-50',
                        isRecommended && !selectedPots.has(pot.id) && 'bg-yellow-50'
                      )}
                      onClick={() => togglePotSelection(pot.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedPots.has(pot.id)}
                          onCheckedChange={() => togglePotSelection(pot.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {pot.id}
                        {isRecommended && (
                          <Badge className="ml-2 bg-yellow-500 text-xs">AI</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{pot.aiScore}</Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          pot.metrics.fe > constraints.maxFe && 'text-red-600'
                        )}
                      >
                        {pot.metrics.fe.toFixed(4)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          pot.metrics.si > constraints.maxSi && 'text-red-600'
                        )}
                      >
                        {pot.metrics.si.toFixed(4)}
                      </TableCell>
                      <TableCell>{pot.weight}</TableCell>
                      <TableCell>Phase {pot.phase}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>

      {/* Selection Summary */}
      {selectedPots.size > 0 && (
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-sm text-gray-500">Selected Pots:</span>
                  <span className="ml-2 font-medium">{selectedPots.size}/6</span>
                </div>
                {blendedValues && (
                  <>
                    <div>
                      <span className="text-sm text-gray-500">Total Weight:</span>
                      <span className="ml-2 font-medium">{blendedValues.totalWeight} MT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Blended Fe:</span>
                      <span
                        className={cn(
                          'font-medium',
                          blendedValues.fePasses ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {blendedValues.blendedFe}
                      </span>
                      {blendedValues.fePasses ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500">Blended Si:</span>
                      <span
                        className={cn(
                          'font-medium',
                          blendedValues.siPasses ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {blendedValues.blendedSi}
                      </span>
                      {blendedValues.siPasses ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setSelectedPots(new Set())}>
                  Clear Selection
                </Button>
                <Button
                  disabled={
                    selectedPots.size < 2 ||
                    (blendedValues ? (!blendedValues.fePasses || !blendedValues.siPasses) : false)
                  }
                >
                  Confirm Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
