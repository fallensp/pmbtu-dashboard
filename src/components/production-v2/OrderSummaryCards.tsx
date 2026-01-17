import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Order } from '@/types';
import { cn } from '@/lib/utils';

interface OrderSummaryCardsProps {
  orders: Order[];
}

const gradeStyles: Record<string, { bg: string; text: string; border: string }> = {
  'PFA-NT': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Wire Rod H-EC': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Billet': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'P1020': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

export function OrderSummaryCards({ orders }: OrderSummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {orders.map((order) => {
        const style = gradeStyles[order.productGrade] || gradeStyles['P1020'];
        const progress = (order.cruciblesFulfilled / order.cruciblesRequired) * 100;

        return (
          <Card
            key={order.id}
            className={cn('border-2', style.border, style.bg)}
          >
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className={cn('font-semibold text-sm', style.text)}>
                  {order.productGrade}
                </span>
                {order.priority === 'high' && (
                  <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                    Priority
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold">{order.cruciblesFulfilled}</span>
                <span className="text-gray-500">/ {order.cruciblesRequired}</span>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">
                {order.fulfilledQuantity.toFixed(1)} / {order.targetQuantity} MT
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
