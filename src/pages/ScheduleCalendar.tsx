import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockSchedule } from '@/data/mock';
import type { ScheduleStatus, ShiftType } from '@/types';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Pencil,
} from 'lucide-react';

const statusIcons: Record<ScheduleStatus, React.ComponentType<{ className?: string }>> = {
  complete: CheckCircle2,
  in_progress: PlayCircle,
  planned: Calendar,
  draft: Pencil,
};

const statusLabels: Record<ScheduleStatus, string> = {
  complete: 'Complete',
  in_progress: 'In Progress',
  planned: 'Planned',
  draft: 'Draft',
};

const statusColorClasses: Record<ScheduleStatus, string> = {
  complete: 'text-green-500',
  in_progress: 'text-blue-500',
  planned: 'text-orange-500',
  draft: 'text-gray-500',
};

export function ScheduleCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [weekOffset]);

  // Get schedule entries for each date
  const getEntriesForDate = (date: Date, shift: ShiftType) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockSchedule.find(
      (s) => s.date === dateStr && s.shift === shift
    );
  };

  const formatDateHeader = (date: Date) => {
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateNum = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, dateNum, month };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    const weekSchedule = weekDates.flatMap((date) => {
      const am = getEntriesForDate(date, 'AM');
      const pm = getEntriesForDate(date, 'PM');
      return [am, pm].filter(Boolean);
    });

    return {
      complete: weekSchedule.filter((s) => s?.status === 'complete').length,
      inProgress: weekSchedule.filter((s) => s?.status === 'in_progress').length,
      planned: weekSchedule.filter((s) => s?.status === 'planned').length,
      draft: weekSchedule.filter((s) => s?.status === 'draft').length,
      totalOutput: weekSchedule.reduce((sum, s) => sum + (s?.totalOutput || 0), 0),
    };
  }, [weekDates]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Schedule Calendar"
        description="Weekly tapping schedule overview"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setWeekOffset((w) => w - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous Week
            </Button>
            <Button variant="outline" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
            <Button variant="outline" onClick={() => setWeekOffset((w) => w + 1)}>
              Next Week
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summaryStats.complete}</p>
              <p className="text-sm text-gray-500">Complete</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <PlayCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summaryStats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summaryStats.planned}</p>
              <p className="text-sm text-gray-500">Planned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Pencil className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summaryStats.draft}</p>
              <p className="text-sm text-gray-500">Draft</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summaryStats.totalOutput.toFixed(0)}</p>
              <p className="text-sm text-gray-500">Total MT</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 border-r bg-gray-50">
              <span className="text-sm font-medium text-gray-500">Shift</span>
            </div>
            {weekDates.map((date) => {
              const { day, dateNum, month } = formatDateHeader(date);
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'p-4 text-center border-r last:border-r-0',
                    isToday(date) && 'bg-blue-50'
                  )}
                >
                  <p className="text-sm text-gray-500">{day}</p>
                  <p
                    className={cn(
                      'text-lg font-bold',
                      isToday(date) ? 'text-blue-600' : 'text-gray-900'
                    )}
                  >
                    {dateNum}
                  </p>
                  <p className="text-xs text-gray-400">{month}</p>
                </div>
              );
            })}
          </div>

          {/* AM Row */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 border-r bg-gray-50 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">AM</span>
            </div>
            {weekDates.map((date) => {
              const entry = getEntriesForDate(date, 'AM');
              const StatusIcon = entry ? statusIcons[entry.status] : null;

              return (
                <div
                  key={`${date.toISOString()}-AM`}
                  className={cn(
                    'p-3 border-r last:border-r-0 min-h-[100px]',
                    isToday(date) && 'bg-blue-50/50'
                  )}
                >
                  {entry ? (
                    <div
                      className={cn(
                        'h-full rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity',
                        entry.status === 'complete' && 'bg-green-100',
                        entry.status === 'in_progress' && 'bg-blue-100',
                        entry.status === 'planned' && 'bg-orange-100',
                        entry.status === 'draft' && 'bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {StatusIcon && (
                          <StatusIcon
                            className={cn("h-4 w-4", statusColorClasses[entry.status])}
                          />
                        )}
                        <span className="text-xs font-medium">
                          {statusLabels[entry.status]}
                        </span>
                      </div>
                      <p className="text-sm font-bold">
                        {entry.completedCrucibles}/{entry.totalCrucibles}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.totalOutput} MT
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300">
                      <span className="text-xs">No schedule</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PM Row */}
          <div className="grid grid-cols-8">
            <div className="p-4 border-r bg-gray-50 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium">PM</span>
            </div>
            {weekDates.map((date) => {
              const entry = getEntriesForDate(date, 'PM');
              const StatusIcon = entry ? statusIcons[entry.status] : null;

              return (
                <div
                  key={`${date.toISOString()}-PM`}
                  className={cn(
                    'p-3 border-r last:border-r-0 min-h-[100px]',
                    isToday(date) && 'bg-blue-50/50'
                  )}
                >
                  {entry ? (
                    <div
                      className={cn(
                        'h-full rounded-lg p-2 cursor-pointer hover:opacity-80 transition-opacity',
                        entry.status === 'complete' && 'bg-green-100',
                        entry.status === 'in_progress' && 'bg-blue-100',
                        entry.status === 'planned' && 'bg-orange-100',
                        entry.status === 'draft' && 'bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {StatusIcon && (
                          <StatusIcon
                            className={cn("h-4 w-4", statusColorClasses[entry.status])}
                          />
                        )}
                        <span className="text-xs font-medium">
                          {statusLabels[entry.status]}
                        </span>
                      </div>
                      <p className="text-sm font-bold">
                        {entry.completedCrucibles}/{entry.totalCrucibles}
                      </p>
                      <p className="text-xs text-gray-500">
                        {entry.totalOutput} MT
                      </p>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300">
                      <span className="text-xs">No schedule</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        {Object.entries(statusLabels).map(([status, label]) => {
          const Icon = statusIcons[status as ScheduleStatus];
          return (
            <div key={status} className="flex items-center gap-2">
              <Icon
                className={cn("h-4 w-4", statusColorClasses[status as ScheduleStatus])}
              />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
