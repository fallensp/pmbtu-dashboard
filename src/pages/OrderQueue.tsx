import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Package, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getOrders } from '@/data/generators';
import { PRODUCT_CONSTRAINTS, PRODUCT_COLORS } from '@/data/constants';
import type { Order, ProductGrade } from '@/types';
import { cn } from '@/lib/utils';

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const fulfillmentPct = (order.fulfilled / order.quantity) * 100;
  const constraints = PRODUCT_CONSTRAINTS[order.grade];
  const colorClass = PRODUCT_COLORS[order.grade];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        order.priority === 'high' && 'border-l-4 border-l-red-500'
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', colorClass)}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">{order.grade}</h3>
                {order.priority === 'high' && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                    High Priority
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">Order #{order.id}</p>
            </div>
          </div>
          <StatusBadge status={order.status} size="sm" />
        </div>

        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Fulfilled</span>
              <span className="font-medium">
                {order.fulfilled} / {order.quantity} MT
              </span>
            </div>
            <Progress value={fulfillmentPct} className="h-2" />
          </div>

          {/* Constraints */}
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Max Fe:</span>
              <span className="font-medium text-slate-700">{constraints.maxFe}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Max Si:</span>
              <span className="font-medium text-slate-700">{constraints.maxSi}%</span>
            </div>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>
                Due: {new Date(order.dueDate).toLocaleDateString('en-MY', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => navigate('/production/select-pots')}
            >
              Select Pots <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GradeSummary({ grade, orders }: { grade: ProductGrade; orders: Order[] }) {
  const gradeOrders = orders.filter(o => o.grade === grade);
  const totalRequired = gradeOrders.reduce((sum, o) => sum + o.quantity, 0);
  const totalFulfilled = gradeOrders.reduce((sum, o) => sum + o.fulfilled, 0);
  const fulfillmentPct = totalRequired > 0 ? (totalFulfilled / totalRequired) * 100 : 0;
  const colorClass = PRODUCT_COLORS[grade];

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('w-3 h-8 rounded-full', colorClass)} />
          <div>
            <h4 className="font-medium text-slate-900">{grade}</h4>
            <p className="text-xs text-slate-500">{gradeOrders.length} orders</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">{Math.round(fulfillmentPct)}%</span>
          </div>
          <Progress value={fulfillmentPct} className="h-2" />
          <p className="text-xs text-slate-500">
            {totalFulfilled.toFixed(1)} / {totalRequired.toFixed(1)} MT
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderQueue() {
  const navigate = useNavigate();
  const orders = useMemo(() => getOrders(), []);

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const grades: ProductGrade[] = ['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Queue"
        description="Manage production orders and fulfillment"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Production' },
        ]}
        actions={
          <Button onClick={() => navigate('/production/arrangement')}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Tapping Arrangement
          </Button>
        }
      />

      {/* Grade Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {grades.map(grade => (
          <GradeSummary key={grade} grade={grade} orders={orders} />
        ))}
      </div>

      {/* Shift Selector */}
      <Tabs defaultValue="tonight">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="tonight">Tonight (PM)</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow (AM)</TabsTrigger>
            <TabsTrigger value="all">All Pending</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-slate-600">
                {completedOrders.length} orders completed today
              </span>
            </div>
          </div>
        </div>

        <TabsContent value="tonight" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders
              .filter(o => {
                const dueDate = new Date(o.dueDate);
                const today = new Date();
                return dueDate.toDateString() === today.toDateString() ||
                       (dueDate > today && dueDate.getTime() - today.getTime() < 24 * 60 * 60 * 1000);
              })
              .map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="tomorrow" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders
              .filter(o => {
                const dueDate = new Date(o.dueDate);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                return dueDate.toDateString() === tomorrow.toDateString();
              })
              .map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedOrders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-6 rounded-full', PRODUCT_COLORS[order.grade])} />
                    <div>
                      <span className="font-medium text-slate-900">{order.grade}</span>
                      <span className="text-slate-400 mx-2">·</span>
                      <span className="text-sm text-slate-500">{order.quantity} MT</span>
                    </div>
                  </div>
                  <StatusBadge status="completed" size="sm" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
