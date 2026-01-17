import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveAlerts } from '@/data/generators';

export function Topbar() {
  const activeAlerts = getActiveAlerts();
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pots, alerts, orders..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {criticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {criticalCount}
            </span>
          )}
        </Button>

        {/* User Menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-medium text-slate-900">John Lee</div>
            <div className="text-xs text-slate-500">Shift Supervisor</div>
          </div>
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </header>
  );
}
