import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Trash2, AlertTriangle } from 'lucide-react';
import { usePlannerStore, getTotalTasksNeeded } from '@/stores/plannerStore';
import { TASK_CONSTRAINTS, PRODUCT_COLORS, PRODUCT_GRADE_INFO } from '@/data/constants';
import type { ProductRequest } from '@/types';
import { cn } from '@/lib/utils';

function ProductCard({ request }: { request: ProductRequest }) {
  const setProductRequest = usePlannerStore(state => state.setProductRequest);
  const colorClass = PRODUCT_COLORS[request.productGrade];
  const info = PRODUCT_GRADE_INFO[request.productGrade];

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn('w-3 h-3 rounded-full', colorClass)} />
        <span className="font-medium text-slate-800">{info.shortLabel}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={10}
            value={request.targetMT || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductRequest(
              request.productGrade,
              Math.max(0, parseInt(e.target.value) || 0)
            )}
            className="w-20 text-center font-medium"
            placeholder="0"
          />
          <span className="text-sm text-slate-600">MT</span>
        </div>

        {request.targetMT > 0 && (
          <div className="text-xs text-slate-500">
            ~{request.tasksNeeded} task{request.tasksNeeded !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductRequestForm() {
  const productRequests = usePlannerStore(state => state.productRequests);
  const aiAutoFillAll = usePlannerStore(state => state.aiAutoFillAll);
  const clearAllRequests = usePlannerStore(state => state.clearAllRequests);

  const totalMT = productRequests.reduce((sum, r) => sum + r.targetMT, 0);
  const totalTasksNeeded = getTotalTasksNeeded(productRequests);
  const isOverLimit = totalTasksNeeded > TASK_CONSTRAINTS.maxTasksPerShift;

  const hasRequests = totalMT > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Step 1: Define Daily Product Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Input Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {productRequests.map(request => (
            <ProductCard key={request.id} request={request} />
          ))}
        </div>

        {/* Summary */}
        <div className={cn(
          'flex items-center justify-between p-3 rounded-lg',
          isOverLimit ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'
        )}>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600">
              Total: <span className="font-semibold text-slate-800">{totalMT} MT</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className={cn(
              isOverLimit ? 'text-yellow-700' : 'text-slate-600'
            )}>
              {totalTasksNeeded} tasks needed
            </span>
            {isOverLimit && (
              <>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  Exceeds {TASK_CONSTRAINTS.maxTasksPerShift} max
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={aiAutoFillAll}
            disabled={!hasRequests}
            className="flex-1"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Auto-Fill Tasks
          </Button>
          <Button
            variant="outline"
            onClick={clearAllRequests}
            disabled={!hasRequests}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
