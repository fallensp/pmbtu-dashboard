import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CrucibleV2 } from '@/types';
import { GRADE_CONSTRAINTS } from '@/data/constants';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface CrucibleCardProps {
  crucible: CrucibleV2;
  onAddPot: () => void;
  onAutoFill: () => void;
  onRemove: () => void;
  onRemovePot: (potId: string) => void;
}

const gradeColors: Record<string, string> = {
  'PFA-NT': 'bg-purple-100 text-purple-700 border-purple-200',
  'Wire Rod H-EC': 'bg-blue-100 text-blue-700 border-blue-200',
  'Billet': 'bg-green-100 text-green-700 border-green-200',
  'P1020': 'bg-gray-100 text-gray-700 border-gray-200',
};

export function CrucibleCard({
  crucible,
  onAddPot,
  onAutoFill,
  onRemove,
  onRemovePot,
}: CrucibleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const constraints = GRADE_CONSTRAINTS[crucible.targetGrade];

  return (
    <Card className={cn(
      'transition-all',
      crucible.constraintsMet ? 'border-green-200' : 'border-red-200'
    )}>
      <CardHeader
        className="py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-semibold">{crucible.id}</span>
            <Badge className={cn(gradeColors[crucible.targetGrade])}>
              {crucible.targetGrade}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500">Weight:</span>
              <span
                className={cn(
                  'ml-1 font-medium',
                  crucible.totalWeight > 10.5 ? 'text-red-600' : 'text-gray-900'
                )}
              >
                {crucible.totalWeight} / 10.5 MT
              </span>
            </div>

            {crucible.constraintsMet ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Pass</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Fail</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Pot Table */}
          {crucible.pots.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pot</TableHead>
                  <TableHead>Fe (%)</TableHead>
                  <TableHead>Si (%)</TableHead>
                  <TableHead>VN</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead>NI</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crucible.pots.map((pot) => (
                  <TableRow key={pot.potId} className="group">
                    <TableCell className="font-medium">{pot.potName}</TableCell>
                    <TableCell
                      className={cn(
                        pot.fe > constraints.maxFe && 'text-red-600 font-medium'
                      )}
                    >
                      {pot.fe.toFixed(4)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        pot.si > constraints.maxSi && 'text-red-600 font-medium'
                      )}
                    >
                      {pot.si.toFixed(4)}
                    </TableCell>
                    <TableCell>{pot.vn.toFixed(4)}</TableCell>
                    <TableCell>{pot.cr.toFixed(4)}</TableCell>
                    <TableCell>{pot.ni.toFixed(4)}</TableCell>
                    <TableCell>{pot.weight} MT</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePot(pot.potId);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Blended Row */}
                <TableRow className="bg-gray-50 font-medium">
                  <TableCell>Blended</TableCell>
                  <TableCell
                    className={cn(
                      crucible.blendedFe > constraints.maxFe && 'text-red-600'
                    )}
                  >
                    {crucible.blendedFe.toFixed(4)}
                    {crucible.blendedFe <= constraints.maxFe ? (
                      <CheckCircle2 className="inline h-3 w-3 ml-1 text-green-600" />
                    ) : (
                      <XCircle className="inline h-3 w-3 ml-1 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      crucible.blendedSi > constraints.maxSi && 'text-red-600'
                    )}
                  >
                    {crucible.blendedSi.toFixed(4)}
                    {crucible.blendedSi <= constraints.maxSi ? (
                      <CheckCircle2 className="inline h-3 w-3 ml-1 text-green-600" />
                    ) : (
                      <XCircle className="inline h-3 w-3 ml-1 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell>{crucible.blendedVn.toFixed(4)}</TableCell>
                  <TableCell>{crucible.blendedCr.toFixed(4)}</TableCell>
                  <TableCell>{crucible.blendedNi.toFixed(4)}</TableCell>
                  <TableCell>{crucible.totalWeight} MT</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No pots assigned yet
            </div>
          )}

          {/* Constraint Violations */}
          {crucible.constraintViolations.length > 0 && (
            <div className="mt-3 p-2 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-red-700 mb-1">Violations:</p>
              <ul className="text-xs text-red-600">
                {crucible.constraintViolations.map((v, i) => (
                  <li key={i}>• {v}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPot();
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Pot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAutoFill();
                }}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Auto-Fill
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
