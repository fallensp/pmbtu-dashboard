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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PotV2, ProductGrade, PotAssignment } from '@/types';
import { GRADE_CONSTRAINTS } from '@/data/constants';
import { cn } from '@/lib/utils';
import { Search, Sparkles } from 'lucide-react';

interface PotSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGrade: ProductGrade;
  availablePots: PotV2[];
  selectedPotIds: string[];
  onConfirm: (pots: PotAssignment[]) => void;
}

export function PotSelectorModal({
  isOpen,
  onClose,
  targetGrade,
  availablePots,
  selectedPotIds,
  onConfirm,
}: PotSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPots, setSelectedPots] = useState<Set<string>>(new Set(selectedPotIds));
  const [feMax, setFeMax] = useState(GRADE_CONSTRAINTS[targetGrade].maxFe);
  const [siMax, setSiMax] = useState(GRADE_CONSTRAINTS[targetGrade].maxSi);

  const constraints = GRADE_CONSTRAINTS[targetGrade];

  // Filter available pots
  const filteredPots = useMemo(() => {
    return availablePots
      .filter((pot) => {
        if (pot.metrics.fe > feMax || pot.metrics.si > siMax) return false;
        if (searchQuery) {
          return pot.id.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => b.aiScore - a.aiScore);
  }, [availablePots, feMax, siMax, searchQuery]);

  // AI recommended pots
  const aiRecommended = useMemo(() => {
    return filteredPots
      .filter((p) => p.metrics.fe <= constraints.maxFe && p.metrics.si <= constraints.maxSi)
      .slice(0, 5);
  }, [filteredPots, constraints]);

  const togglePot = (potId: string) => {
    const newSelected = new Set(selectedPots);
    if (newSelected.has(potId)) {
      newSelected.delete(potId);
    } else if (newSelected.size < 6) {
      newSelected.add(potId);
    }
    setSelectedPots(newSelected);
  };

  const handleConfirm = () => {
    const assignments: PotAssignment[] = availablePots
      .filter((p) => selectedPots.has(p.id))
      .map((p) => ({
        potId: p.id,
        potName: p.id,
        fe: p.metrics.fe,
        si: p.metrics.si,
        vn: p.metrics.vn,
        cr: p.metrics.cr,
        ni: p.metrics.ni,
        weight: p.weight,
      }));
    onConfirm(assignments);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Pots for {targetGrade}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Filters */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search pot ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-32">
              <Label>Max Fe (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={feMax}
                onChange={(e) => setFeMax(Number(e.target.value))}
              />
            </div>
            <div className="w-32">
              <Label>Max Si (%)</Label>
              <Input
                type="number"
                step="0.001"
                value={siMax}
                onChange={(e) => setSiMax(Number(e.target.value))}
              />
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommended.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">AI Recommendations</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiRecommended.map((pot) => (
                  <Button
                    key={pot.id}
                    variant={selectedPots.has(pot.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => togglePot(pot.id)}
                    className="text-xs"
                  >
                    {pot.id}
                    <Badge variant="secondary" className="ml-1">
                      {pot.aiScore}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Pot Table */}
          <ScrollArea className="h-[300px] border rounded-lg">
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
                {filteredPots.slice(0, 50).map((pot) => {
                  const isRecommended = aiRecommended.some((r) => r.id === pot.id);
                  const isSelected = selectedPots.has(pot.id);

                  return (
                    <TableRow
                      key={pot.id}
                      className={cn(
                        'cursor-pointer',
                        isSelected && 'bg-blue-50',
                        isRecommended && !isSelected && 'bg-yellow-50'
                      )}
                      onClick={() => togglePot(pot.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => togglePot(pot.id)}
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

          {/* Selection Summary */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {filteredPots.length} pots available
            </span>
            <span className="font-medium">
              {selectedPots.size}/6 selected
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedPots.size === 0}>
            Add {selectedPots.size} Pots
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
