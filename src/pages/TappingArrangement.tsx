import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockCrucibleAssignments } from '@/data/mock';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Plus,
  Download,
  Printer,
  Edit,
} from 'lucide-react';

const gradeColors: Record<string, string> = {
  'PFA-NT': 'bg-purple-100 text-purple-700',
  'Wire Rod H-EC': 'bg-blue-100 text-blue-700',
  'Billet': 'bg-green-100 text-green-700',
  'P1020': 'bg-gray-100 text-gray-700',
};

export function TappingArrangement() {
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Group by section
  const sections = [1, 2, 3, 4, 5];
  const filteredAssignments =
    selectedSection === 'all'
      ? mockCrucibleAssignments
      : mockCrucibleAssignments.filter((a) => a.section === Number(selectedSection));

  // Stats
  const totalCrucibles = mockCrucibleAssignments.length;
  const constraintsMet = mockCrucibleAssignments.filter((a) => a.constraintsMet).length;
  const totalWeight = mockCrucibleAssignments.reduce((sum, a) => sum + a.totalWeight, 0);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Tapping Arrangement"
        description="AI-optimized pot assignments for crucible filling"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button asChild>
              <Link to="/production/select-pots">
                <Plus className="h-4 w-4 mr-2" />
                Manual Override
              </Link>
            </Button>
          </div>
        }
      />

      {/* Optimization Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">AI Optimization Complete</h3>
              <p className="text-sm text-green-700">
                {constraintsMet}/{totalCrucibles} crucibles meet all constraints •{' '}
                {totalWeight.toFixed(1)} MT total
              </p>
            </div>
            <div className="flex-1" />
            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
              <Sparkles className="h-4 w-4 mr-2" />
              Re-optimize
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section Tabs */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList>
          <TabsTrigger value="all">All Sections</TabsTrigger>
          {sections.map((s) => (
            <TabsTrigger key={s} value={String(s)}>
              Section {s}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {/* Arrangement Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crucible</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Pots</TableHead>
                  <TableHead>Total Weight</TableHead>
                  <TableHead>Blended Fe</TableHead>
                  <TableHead>Blended Si</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No assignments for this section
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id} className="group">
                      <TableCell className="font-medium">{assignment.id}</TableCell>
                      <TableCell>
                        <Badge className={cn(gradeColors[assignment.productGrade])}>
                          {assignment.productGrade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {assignment.pots.slice(0, 3).map((potId) => (
                            <Badge key={potId} variant="outline" className="text-xs">
                              {potId}
                            </Badge>
                          ))}
                          {assignment.pots.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{assignment.pots.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{assignment.totalWeight.toFixed(2)} MT</TableCell>
                      <TableCell
                        className={cn(
                          assignment.blendedFe > 0.075 ? 'text-red-600 font-medium' : ''
                        )}
                      >
                        {assignment.blendedFe.toFixed(4)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          assignment.blendedSi > 0.05 ? 'text-red-600 font-medium' : ''
                        )}
                      >
                        {assignment.blendedSi.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {assignment.route}
                      </TableCell>
                      <TableCell>
                        {assignment.constraintsMet ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Pass</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-sm">Fail</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100"
                          asChild
                        >
                          <Link to="/production/select-pots">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </Tabs>

      {/* Constraint Validation Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Constraint Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Weight Limits', description: '2-6 pots, max 10.5 MT', pass: true },
              { label: 'Fe Constraints', description: 'Within grade limits', pass: constraintsMet === totalCrucibles },
              { label: 'Si Constraints', description: 'Within grade limits', pass: constraintsMet === totalCrucibles },
              { label: 'Special Products', description: 'Max 4 per section', pass: true },
            ].map((constraint) => (
              <div
                key={constraint.label}
                className={cn(
                  'p-3 rounded-lg border',
                  constraint.pass
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                )}
              >
                <div className="flex items-center gap-2">
                  {constraint.pass ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="font-medium text-sm">{constraint.label}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{constraint.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
