import { useState } from 'react';
import { Download, Save, Send, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductRequestForm, TaskCard, PotSelectorModal } from '@/components/production-v2';
import { usePlannerStore } from '@/stores/plannerStore';
import { TASK_CONSTRAINTS, PRODUCT_COLORS } from '@/data/constants';
import type { ProductGrade } from '@/types';
import { cn } from '@/lib/utils';

function ShiftSummaryBar() {
  const shiftSummary = usePlannerStore(state => state.shiftSummary);
  const tasks = usePlannerStore(state => state.tasks);

  const passingTasks = tasks.filter(t => t.passesConstraints).length;
  const allPassing = passingTasks === tasks.length && tasks.length > 0;

  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-lg border',
      allPassing ? 'bg-green-50 border-green-200' :
      shiftSummary.isOverLimit ? 'bg-red-50 border-red-200' :
      tasks.length > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-slate-50'
    )}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Tasks:</span>
          <span className={cn(
            'font-semibold',
            shiftSummary.isOverLimit ? 'text-red-600' : ''
          )}>
            {shiftSummary.totalTasks}/{shiftSummary.maxTasks}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-300" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Pots:</span>
          <span className="font-semibold">
            {shiftSummary.totalPots}/{shiftSummary.maxPots}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-300" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Weight:</span>
          <span className="font-semibold">{shiftSummary.totalWeight} MT</span>
        </div>

        <div className="h-4 w-px bg-slate-300" />

        {/* Grade breakdown */}
        <div className="flex items-center gap-3">
          {(Object.entries(shiftSummary.tasksByGrade) as [ProductGrade, number][])
            .filter(([, count]) => count > 0)
            .map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-full', PRODUCT_COLORS[grade])} />
                <span className="text-xs text-slate-600">{count}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {tasks.length > 0 && (
          <div className={cn(
            'flex items-center gap-1 text-sm',
            allPassing ? 'text-green-600' : 'text-yellow-600'
          )}>
            {allPassing ? (
              <>
                <CheckCircle className="w-4 h-4" />
                All tasks pass
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                {passingTasks}/{tasks.length} passing
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskList() {
  const tasks = usePlannerStore(state => state.tasks);
  const setEditingTask = usePlannerStore(state => state.setEditingTask);
  const editingTaskId = usePlannerStore(state => state.editingTaskId);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <div className="text-lg font-medium mb-2">No tasks yet</div>
        <div className="text-sm">
          Enter product requests above and click "AI Auto-Fill Tasks"
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEditPots={() => setEditingTask(task.id)}
        />
      ))}

      {/* Pot Selector Modal */}
      {editingTaskId && (
        <PotSelectorModal
          open={!!editingTaskId}
          onClose={() => setEditingTask(null)}
          taskId={editingTaskId}
          productGrade={tasks.find(t => t.id === editingTaskId)?.productGrade || 'P1020'}
          selectedPotIds={tasks.find(t => t.id === editingTaskId)?.pots || []}
        />
      )}
    </div>
  );
}

function AddTaskButton() {
  const [selectedGrade, setSelectedGrade] = useState<ProductGrade | null>(null);
  const addTask = usePlannerStore(state => state.addTask);
  const tasks = usePlannerStore(state => state.tasks);

  const canAdd = tasks.length < TASK_CONSTRAINTS.maxTasksPerShift;

  const handleAdd = () => {
    if (selectedGrade) {
      addTask(selectedGrade);
      setSelectedGrade(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedGrade || ''}
        onValueChange={(v) => setSelectedGrade(v as ProductGrade)}
        disabled={!canAdd}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Select grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PFA-NT">PFA-NT</SelectItem>
          <SelectItem value="Wire Rod H-EC">Wire Rod</SelectItem>
          <SelectItem value="Billet">Billet</SelectItem>
          <SelectItem value="P1020">P1020</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        disabled={!selectedGrade || !canAdd}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Task
      </Button>
    </div>
  );
}

export function DailyTappingPlanner() {
  const date = usePlannerStore(state => state.date);
  const shift = usePlannerStore(state => state.shift);
  const setShift = usePlannerStore(state => state.setShift);
  const tasks = usePlannerStore(state => state.tasks);

  const dateStr = date.toLocaleDateString('en-MY', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const passingTasks = tasks.filter(t => t.passesConstraints).length;
  const canSubmit = tasks.length > 0 && passingTasks === tasks.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Tapping Planner"
        description="V2 - Task-based workflow"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Production', href: '/production' },
          { label: 'Tapping Planner' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button disabled={!canSubmit}>
              <Send className="w-4 h-4 mr-2" />
              Submit
            </Button>
          </div>
        }
      />

      {/* Date and Shift Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-lg font-medium">{dateStr}</div>
          <Tabs value={shift} onValueChange={(v) => setShift(v as 'AM' | 'PM')}>
            <TabsList>
              <TabsTrigger value="PM">PM Shift</TabsTrigger>
              <TabsTrigger value="AM">AM Shift</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Step 1: Product Requests */}
      <ProductRequestForm />

      {/* Step 2: Task Assignments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step 2: Task Assignments</CardTitle>
            <AddTaskButton />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ShiftSummaryBar />
          <TaskList />
        </CardContent>
      </Card>

      {/* Footer Summary */}
      <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            {tasks.length} Tasks | {tasks.reduce((sum, t) => sum + t.totalWeight, 0).toFixed(1)} MT
          </span>
          <span className="text-slate-500">|</span>
          <span className={cn(
            canSubmit ? 'text-green-600' : 'text-yellow-600'
          )}>
            Passing: {passingTasks}/{tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Save</Button>
          <Button disabled={!canSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
