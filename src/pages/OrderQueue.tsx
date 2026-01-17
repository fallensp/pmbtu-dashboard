import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockOrders } from '@/data/mock';
import type { ShiftType } from '@/types';
import { cn } from '@/lib/utils';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const gradeColors: Record<string, string> = {
  'PFA-NT': 'bg-purple-100 text-purple-700 border-purple-200',
  'Wire Rod H-EC': 'bg-blue-100 text-blue-700 border-blue-200',
  'Billet': 'bg-green-100 text-green-700 border-green-200',
  'P1020': 'bg-gray-100 text-gray-700 border-gray-200',
};

export function OrderQueue() {
  const [selectedShift, setSelectedShift] = useState<ShiftType>('PM');

  const totalTarget = mockOrders.reduce((sum, o) => sum + o.targetQuantity, 0);
  const totalFulfilled = mockOrders.reduce((sum, o) => sum + o.fulfilledQuantity, 0);
  const overallProgress = (totalFulfilled / totalTarget) * 100;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Order Queue"
        description="Manage production orders for tapping"
        actions={
          <Button asChild>
            <Link to="/production/arrangement">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Arrangement
            </Link>
          </Button>
        }
      />

      {/* Shift Selector */}
      <div className="flex items-center gap-4">
        <Clock className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Shift:</span>
        <Tabs
          value={selectedShift}
          onValueChange={(v) => setSelectedShift(v as ShiftType)}
        >
          <TabsList>
            <TabsTrigger value="PM">Tonight (PM)</TabsTrigger>
            <TabsTrigger value="AM">Tomorrow (AM)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {totalFulfilled.toFixed(1)} / {totalTarget.toFixed(1)} MT
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <p className="mt-2 text-xs text-gray-500">
            {overallProgress.toFixed(1)}% of target fulfilled
          </p>
        </CardContent>
      </Card>

      {/* Order Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockOrders.map((order) => {
          const progress = (order.fulfilledQuantity / order.targetQuantity) * 100;
          const crucibleProgress = (order.cruciblesFulfilled / order.cruciblesRequired) * 100;

          return (
            <Card
              key={order.id}
              className={cn(
                'relative overflow-hidden',
                order.priority === 'high' && 'ring-2 ring-orange-300'
              )}
            >
              {order.priority === 'high' && (
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-bl">
                  Priority
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={cn('font-medium', gradeColors[order.productGrade])}>
                    {order.productGrade}
                  </Badge>
                  {order.status === 'fulfilled' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : order.status === 'partial' ? (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Weight Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Weight</span>
                      <span className="font-medium">
                        {order.fulfilledQuantity} / {order.targetQuantity} MT
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Crucible Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Crucibles</span>
                      <span className="font-medium">
                        {order.cruciblesFulfilled} / {order.cruciblesRequired}
                      </span>
                    </div>
                    <Progress value={crucibleProgress} className="h-2" />
                  </div>

                  <div className="text-xs text-gray-500">
                    Due: {new Date(order.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Order Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Details</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Product Grade</TableHead>
              <TableHead>Target (MT)</TableHead>
              <TableHead>Fulfilled (MT)</TableHead>
              <TableHead>Crucibles</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <Badge className={cn(gradeColors[order.productGrade])}>
                    {order.productGrade}
                  </Badge>
                </TableCell>
                <TableCell>{order.targetQuantity}</TableCell>
                <TableCell>{order.fulfilledQuantity}</TableCell>
                <TableCell>
                  {order.cruciblesFulfilled} / {order.cruciblesRequired}
                </TableCell>
                <TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {order.priority === 'high' ? (
                    <Badge variant="destructive">High</Badge>
                  ) : (
                    <Badge variant="secondary">Normal</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === 'fulfilled'
                        ? 'default'
                        : order.status === 'partial'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={cn(
                      order.status === 'fulfilled' && 'bg-green-500',
                      order.status === 'partial' && 'bg-yellow-500 text-black'
                    )}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
