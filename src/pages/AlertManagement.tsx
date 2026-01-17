import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/shared';
import { mockAlerts } from '@/data/mock';
import type { AlertSeverity, AlertStatus } from '@/types';
import {
  Search,
  CheckCircle,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export function AlertManagement() {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter((alert) => {
      if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      if (phaseFilter !== 'all' && String(alert.potPhase) !== phaseFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          alert.title.toLowerCase().includes(query) ||
          alert.potId.toLowerCase().includes(query) ||
          alert.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [severityFilter, statusFilter, phaseFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedAlerts.size === paginatedAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(paginatedAlerts.map((a) => a.id)));
    }
  };

  const toggleSelectAlert = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  // Summary counts
  const summaryCounts = useMemo(() => ({
    total: mockAlerts.length,
    critical: mockAlerts.filter((a) => a.severity === 'critical').length,
    high: mockAlerts.filter((a) => a.severity === 'high').length,
    moderate: mockAlerts.filter((a) => a.severity === 'moderate').length,
    new: mockAlerts.filter((a) => a.status === 'new').length,
    inProgress: mockAlerts.filter((a) => a.status === 'in_progress').length,
    resolved: mockAlerts.filter((a) => a.status === 'resolved').length,
  }), []);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Alert Management"
        description={`${summaryCounts.total} total alerts • ${summaryCounts.new} new`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="py-4">
            <p className="text-2xl font-bold text-red-600">{summaryCounts.critical}</p>
            <p className="text-sm text-gray-600">Critical</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="py-4">
            <p className="text-2xl font-bold text-orange-600">{summaryCounts.high}</p>
            <p className="text-sm text-gray-600">High</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="py-4">
            <p className="text-2xl font-bold text-blue-600">{summaryCounts.new}</p>
            <p className="text-sm text-gray-600">New</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="py-4">
            <p className="text-2xl font-bold text-green-600">{summaryCounts.resolved}</p>
            <p className="text-sm text-gray-600">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="h-6 w-px bg-gray-200" />

            {/* Severity Filter */}
            <Select
              value={severityFilter}
              onValueChange={(v) => setSeverityFilter(v as AlertSeverity | 'all')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as AlertStatus | 'all')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            {/* Phase Filter */}
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Phases</SelectItem>
                <SelectItem value="1">Phase 1</SelectItem>
                <SelectItem value="2">Phase 2</SelectItem>
                <SelectItem value="3">Phase 3</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            {/* Bulk Actions */}
            {selectedAlerts.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedAlerts.size} selected
                </span>
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Assign
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    paginatedAlerts.length > 0 &&
                    selectedAlerts.size === paginatedAlerts.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Alert</TableHead>
              <TableHead>Pot</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No alerts found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedAlerts.map((alert) => (
                <TableRow key={alert.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedAlerts.has(alert.id)}
                      onCheckedChange={() => toggleSelectAlert(alert.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {alert.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{alert.potId}</p>
                      <p className="text-xs text-gray-500">
                        Phase {alert.potPhase} • {alert.potArea}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={alert.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={alert.status} />
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {alert.assignedTo || (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAlerts.length)} of{' '}
              {filteredAlerts.length} alerts
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
