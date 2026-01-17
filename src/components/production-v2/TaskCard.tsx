import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from 'lucide-react';
import { usePlannerStore } from '@/stores/plannerStore';
import { TASK_CONSTRAINTS, PRODUCT_COLORS, PRODUCT_CONSTRAINTS } from '@/data/constants';
import type { TaskV2 } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: TaskV2;
  onEditPots: () => void;
}

export function TaskCard({ task, onEditPots }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const removeTask = usePlannerStore(state => state.removeTask);

  const colorClass = PRODUCT_COLORS[task.productGrade];
  const constraints = PRODUCT_CONSTRAINTS[task.productGrade];

  const potCount = task.pots.length;

  const statusIcon = task.passesConstraints ? (
    <CheckCircle className="w-5 h-5 text-green-500" />
  ) : potCount < TASK_CONSTRAINTS.potsPerTask ? (
    <AlertCircle className="w-5 h-5 text-yellow-500" />
  ) : (
    <XCircle className="w-5 h-5 text-red-500" />
  );

  const statusText = task.passesConstraints
    ? 'Pass'
    : potCount < TASK_CONSTRAINTS.potsPerTask
    ? `Need ${TASK_CONSTRAINTS.potsPerTask - potCount} more`
    : 'Constraints Failed';

  return (
    <Card className={cn(
      'transition-all',
      task.passesConstraints ? 'border-green-200' :
      potCount < TASK_CONSTRAINTS.potsPerTask ? 'border-yellow-200' : 'border-red-200'
    )}>
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Task ID */}
            <span className="font-mono text-sm font-medium text-slate-600">
              {task.id}
            </span>

            {/* Product Grade Badge */}
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2 h-4 rounded-full', colorClass)} />
              <span className="text-sm font-medium">{task.productGrade}</span>
            </div>

            {/* Pot Count */}
            <span className="text-sm text-slate-500">
              {potCount}/{TASK_CONSTRAINTS.potsPerTask} pots
            </span>

            {/* Weight */}
            <span className="text-sm font-medium">
              {task.totalWeight.toFixed(1)} MT
            </span>

            {/* Status */}
            <div className="flex items-center gap-1">
              {statusIcon}
              <span className={cn(
                'text-sm',
                task.passesConstraints ? 'text-green-600' :
                potCount < TASK_CONSTRAINTS.potsPerTask ? 'text-yellow-600' : 'text-red-600'
              )}>
                {statusText}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditPots}
              className="h-8"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Pots
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTask(task.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {/* Chemistry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <FlaskConical className="w-4 h-4" />
                  Blended Chemistry
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Fe</div>
                    <div className={cn(
                      'font-medium',
                      task.blendedFe > constraints.maxFe ? 'text-red-600' : 'text-green-600'
                    )}>
                      {task.blendedFe.toFixed(4)}%
                    </div>
                    <div className="text-xs text-slate-400">
                      max {constraints.maxFe}%
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <div className="text-xs text-slate-500">Si</div>
                    <div className={cn(
                      'font-medium',
                      task.blendedSi > constraints.maxSi ? 'text-red-600' : 'text-green-600'
                    )}>
                      {task.blendedSi.toFixed(4)}%
                    </div>
                    <div className="text-xs text-slate-400">
                      max {constraints.maxSi}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Pot List */}
              <div className="space-y-1">
                <div className="text-sm text-slate-600">Selected Pots</div>
                <div className="flex flex-wrap gap-1">
                  {task.potDetails.length === 0 ? (
                    <span className="text-sm text-slate-400 italic">No pots selected</span>
                  ) : (
                    task.potDetails.map(pot => (
                      <span
                        key={pot.potId}
                        className="px-2 py-1 text-xs bg-slate-100 rounded font-mono"
                        title={`Fe: ${pot.fe.toFixed(3)}%, Si: ${pot.si.toFixed(3)}%, AI: ${pot.aiScore}`}
                      >
                        {pot.potId.split('-').slice(1).join('-')}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Constraint Messages */}
            {task.constraintMessages.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm text-slate-600">Constraint Issues</div>
                <div className="space-y-1">
                  {task.constraintMessages.map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="w-4 h-4 flex-shrink-0" />
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
