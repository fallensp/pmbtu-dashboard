import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getSchedule } from '@/data/generators';
import type { ScheduleShift, ShiftStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<ShiftStatus, string> = {
  completed: 'bg-green-100 border-green-200 text-green-800',
  in_progress: 'bg-blue-100 border-blue-200 text-blue-800',
  planned: 'bg-slate-100 border-slate-200 text-slate-800',
  draft: 'bg-gray-50 border-gray-100 text-gray-500',
};

const statusDot: Record<ShiftStatus, string> = {
  completed: 'bg-green-500',
  in_progress: 'bg-blue-500 animate-pulse',
  planned: 'bg-slate-400',
  draft: 'bg-gray-300',
};

function ShiftCell({ shift, onClick }: { shift: ScheduleShift; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-2 rounded-lg border text-left transition-all hover:shadow-md',
        statusColors[shift.status]
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium">{shift.shift}</span>
        <div className={cn('w-2 h-2 rounded-full', statusDot[shift.status])} />
      </div>
      <div className="text-lg font-bold">{shift.totalOutput}</div>
      <div className="text-xs opacity-70">{shift.crucibleCount} crucibles</div>
    </button>
  );
}

export function Schedule() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);

  const schedule = useMemo(() => getSchedule(), []);

  // Get current week's dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [weekOffset]);

  const getShiftForDate = (date: Date, shiftType: 'AM' | 'PM'): ScheduleShift | undefined => {
    return schedule.find(s =>
      new Date(s.date).toDateString() === date.toDateString() && s.shift === shiftType
    );
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    return `${start.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString();

  const handleShiftClick = (shift: ScheduleShift | undefined) => {
    if (shift) {
      navigate('/production/arrangement');
    }
  };

  // Calculate week summary
  const weekSummary = useMemo(() => {
    const weekShifts = weekDates.flatMap(date => [
      getShiftForDate(date, 'AM'),
      getShiftForDate(date, 'PM')
    ]).filter(Boolean) as ScheduleShift[];

    return {
      totalOutput: weekShifts.reduce((sum, s) => sum + s.totalOutput, 0),
      totalCrucibles: weekShifts.reduce((sum, s) => sum + s.crucibleCount, 0),
      completed: weekShifts.filter(s => s.status === 'completed').length,
      planned: weekShifts.filter(s => s.status === 'planned' || s.status === 'draft').length,
    };
  }, [weekDates, schedule]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Schedule"
        description="Weekly tapping schedule overview"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Production', href: '/production' },
          { label: 'Schedule' },
        ]}
      />

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-slate-900">{formatWeekRange()}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setWeekOffset(prev => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWeekOffset(0)}
            >
              Today
            </Button>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          {[
            { status: 'completed' as const, label: 'Completed' },
            { status: 'in_progress' as const, label: 'In Progress' },
            { status: 'planned' as const, label: 'Planned' },
            { status: 'draft' as const, label: 'Draft' },
          ].map(item => (
            <div key={item.status} className="flex items-center gap-1.5">
              <div className={cn('w-2.5 h-2.5 rounded-full', statusDot[item.status])} />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Week Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-slate-500">Weekly Output</div>
            <div className="text-2xl font-bold mt-1">{weekSummary.totalOutput.toFixed(1)} MT</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-slate-500">Total Crucibles</div>
            <div className="text-2xl font-bold mt-1">{weekSummary.totalCrucibles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-slate-500">Shifts Completed</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{weekSummary.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-sm text-slate-500">Shifts Planned</div>
            <div className="text-2xl font-bold mt-1 text-blue-600">{weekSummary.planned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-7 gap-4">
            {/* Day Headers */}
            {weekDates.map(date => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'text-center pb-3 border-b',
                    isToday(date) && 'text-blue-600'
                  )}
                >
                  <div className="text-xs text-slate-500">
                    {dayNames[date.getDay()]}
                  </div>
                  <div className={cn(
                    'text-lg font-bold',
                    isToday(date) && 'bg-blue-600 text-white w-8 h-8 rounded-full mx-auto flex items-center justify-center'
                  )}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}

            {/* AM Shifts */}
            {weekDates.map(date => {
              const shift = getShiftForDate(date, 'AM');
              return (
                <div key={`${date.toISOString()}-AM`} className="pt-2">
                  {shift ? (
                    <ShiftCell
                      shift={shift}
                      onClick={() => handleShiftClick(shift)}
                    />
                  ) : (
                    <div className="p-2 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      AM
                    </div>
                  )}
                </div>
              );
            })}

            {/* PM Shifts */}
            {weekDates.map(date => {
              const shift = getShiftForDate(date, 'PM');
              return (
                <div key={`${date.toISOString()}-PM`} className="pt-2">
                  {shift ? (
                    <ShiftCell
                      shift={shift}
                      onClick={() => handleShiftClick(shift)}
                    />
                  ) : (
                    <div className="p-2 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400">
                      PM
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Detail */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-4">Today's Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            {['AM', 'PM'].map(shiftType => {
              const shift = getShiftForDate(new Date(), shiftType as 'AM' | 'PM');
              return (
                <div
                  key={shiftType}
                  className={cn(
                    'p-4 rounded-lg border',
                    shift ? statusColors[shift.status] : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{shiftType} Shift</span>
                    {shift && <StatusBadge status={shift.status} size="sm" />}
                  </div>
                  {shift ? (
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">{shift.totalOutput} MT</div>
                      <div className="text-sm opacity-70">{shift.crucibleCount} crucibles planned</div>
                      <Button
                        className="mt-3 w-full"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/production/arrangement')}
                      >
                        View Arrangement
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">No shift scheduled</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
