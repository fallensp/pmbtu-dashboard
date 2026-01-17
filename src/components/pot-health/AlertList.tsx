import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User, ChevronDown, Check, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Alert } from '@/types';
import { cn } from '@/lib/utils';
import { ALERT_TYPE_LABELS } from '@/data/constants';

interface AlertListProps {
  alerts: Alert[];
  onAcknowledge?: (alertIds: string[]) => void;
  onResolve?: (alertIds: string[]) => void;
}

export function AlertList({ alerts, onAcknowledge, onResolve }: AlertListProps) {
  const navigate = useNavigate();
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const toggleSelect = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const selectAll = () => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map(a => a.id)));
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      return new Date(date).toLocaleDateString('en-MY', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }

    return `${minutes}m ago`;
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
        <p className="text-lg font-medium text-slate-700">No alerts found</p>
        <p className="text-sm text-slate-500">All systems operating normally</p>
      </div>
    );
  }

  return (
    <div>
      {/* Bulk Actions */}
      {selectedAlerts.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedAlerts.size} alert(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge?.(Array.from(selectedAlerts))}
            >
              Acknowledge
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve?.(Array.from(selectedAlerts))}
            >
              Resolve
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Checkbox
          checked={selectedAlerts.size === alerts.length && alerts.length > 0}
          onCheckedChange={selectAll}
        />
        <span className="text-sm text-slate-500">
          {alerts.length} alert(s)
        </span>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={cn(
              'border rounded-lg transition-all',
              selectedAlerts.has(alert.id) && 'border-blue-300 bg-blue-50',
              alert.severity === 'critical' && alert.status === 'active' && 'border-red-200',
              expandedAlert === alert.id && 'shadow-md'
            )}
          >
            <div className="flex items-start gap-3 p-3">
              <Checkbox
                checked={selectedAlerts.has(alert.id)}
                onCheckedChange={() => toggleSelect(alert.id)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {severityIcon(alert.severity)}
                    <span className="font-medium text-slate-900 truncate">
                      {alert.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={alert.severity} size="sm" />
                    <StatusBadge status={alert.status} size="sm" />
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                  {alert.description}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(alert.createdAt)}
                  </span>
                  {alert.assignee && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {alert.assignee}
                    </span>
                  )}
                  <span className="text-blue-500">
                    {ALERT_TYPE_LABELS[alert.type] || alert.type}
                  </span>
                </div>

                {/* Expanded Content */}
                {expandedAlert === alert.id && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/pot-health/pot/${alert.potId}`)}
                      >
                        View Pot Details
                      </Button>
                      {alert.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAcknowledge?.([alert.id])}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onResolve?.([alert.id])}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => setExpandedAlert(
                  expandedAlert === alert.id ? null : alert.id
                )}
              >
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    expandedAlert === alert.id && 'rotate-180'
                  )}
                />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
