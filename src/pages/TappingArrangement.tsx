import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Edit,
  Download,
  RefreshCw,
  Truck,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { generateTappingArrangement } from '@/data/generators';
import { PRODUCT_COLORS, CRUCIBLE_CONFIG } from '@/data/constants';
import type { TappingArrangement, Crucible } from '@/types';
import { cn } from '@/lib/utils';

function CrucibleRow({ crucible }: { crucible: Crucible }) {
  const navigate = useNavigate();
  const colorClass = PRODUCT_COLORS[crucible.targetGrade];

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-medium text-slate-900">{crucible.id}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {crucible.pots.slice(0, 4).map(potId => (
            <span
              key={potId}
              className="text-xs px-2 py-0.5 bg-slate-100 rounded cursor-pointer hover:bg-slate-200"
              onClick={() => navigate(`/pot-health/pot/${potId}`)}
            >
              {potId.split('-').slice(2).join('-')}
            </span>
          ))}
          {crucible.pots.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500">
              +{crucible.pots.length - 4}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-right font-medium">{crucible.totalWeight} MT</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-4 rounded-full', colorClass)} />
          <span className="text-sm">{crucible.targetGrade}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'text-sm font-medium',
          crucible.blendedFe > 0.10 ? 'text-red-600' :
          crucible.blendedFe > 0.075 ? 'text-yellow-600' : 'text-green-600'
        )}>
          {crucible.blendedFe.toFixed(4)}%
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'text-sm font-medium',
          crucible.blendedSi > 0.07 ? 'text-red-600' :
          crucible.blendedSi > 0.05 ? 'text-yellow-600' : 'text-green-600'
        )}>
          {crucible.blendedSi.toFixed(4)}%
        </span>
      </td>
      <td className="px-4 py-3 text-slate-500">{crucible.route}</td>
      <td className="px-4 py-3">
        <Button variant="ghost" size="sm" className="h-7">
          <Edit className="w-3 h-3" />
        </Button>
      </td>
    </tr>
  );
}

function ConstraintPanel({ constraints }: { constraints: TappingArrangement['constraints'] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Constraint Validation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {constraints.map((constraint, i) => (
            <div key={i} className="flex items-center gap-2">
              {constraint.passed ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                'text-sm',
                constraint.passed ? 'text-slate-600' : 'text-red-600'
              )}>
                {constraint.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TappingArrangementPage() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const today = new Date();
  const arrangement = useMemo(
    () => generateTappingArrangement('PM', today),
    []
  );

  const filteredCrucibles = useMemo(() => {
    if (selectedSection === 'all') return arrangement.crucibles;
    return arrangement.crucibles.filter(c => c.section === Number(selectedSection));
  }, [arrangement.crucibles, selectedSection]);

  const sectionSummary = useMemo(() => {
    const summary: Record<number, { count: number; weight: number }> = {};
    for (let i = 1; i <= CRUCIBLE_CONFIG.sections; i++) {
      const sectionCrucibles = arrangement.crucibles.filter(c => c.section === i);
      summary[i] = {
        count: sectionCrucibles.length,
        weight: sectionCrucibles.reduce((sum, c) => sum + c.totalWeight, 0),
      };
    }
    return summary;
  }, [arrangement.crucibles]);

  const totalWeight = arrangement.crucibles.reduce((sum, c) => sum + c.totalWeight, 0);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tapping Arrangement"
        description={`${arrangement.shift} Shift - ${today.toLocaleDateString('en-MY', { weekday: 'long', month: 'long', day: 'numeric' })}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Production', href: '/production' },
          { label: 'Tapping Arrangement' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isGenerating && 'animate-spin')} />
              Regenerate
            </Button>
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Approve Arrangement
            </Button>
          </div>
        }
      />

      {/* Status Banner */}
      <Card className={cn(
        'border-l-4',
        arrangement.status === 'approved' ? 'border-l-green-500 bg-green-50' :
        arrangement.status === 'draft' ? 'border-l-yellow-500 bg-yellow-50' :
        'border-l-blue-500 bg-blue-50'
      )}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={arrangement.status} />
                <span className="text-sm text-slate-600">
                  Optimization Score: <span className="font-semibold">{arrangement.optimizationScore}%</span>
                </span>
              </div>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Truck className="w-4 h-4" />
                <span>{arrangement.crucibles.length} crucibles</span>
                <span>·</span>
                <span>{totalWeight.toFixed(1)} MT total</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/production/select-pots')}
            >
              Manual Override <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-3">
          {/* Section Tabs */}
          <Tabs value={selectedSection} onValueChange={setSelectedSection}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Sections</TabsTrigger>
              {[1, 2, 3, 4, 5].map(section => (
                <TabsTrigger key={section} value={String(section)}>
                  S{section} ({sectionSummary[section]?.count || 0})
                </TabsTrigger>
              ))}
            </TabsList>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Crucible</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Pots</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Weight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Blended Fe</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Blended Si</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCrucibles.map((crucible) => (
                      <CrucibleRow key={crucible.id} crucible={crucible} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Row */}
              <div className="px-4 py-3 border-t bg-slate-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Showing {filteredCrucibles.length} crucibles
                  </span>
                  <span className="font-medium">
                    Total: {filteredCrucibles.reduce((sum, c) => sum + c.totalWeight, 0).toFixed(1)} MT
                  </span>
                </div>
              </div>
            </Card>
          </Tabs>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Constraints */}
          <ConstraintPanel constraints={arrangement.constraints} />

          {/* Section Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Section Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(section => (
                  <div
                    key={section}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span className="text-slate-600">Section {section}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">
                        {sectionSummary[section]?.count || 0} crucibles
                      </span>
                      <span className="font-medium">
                        {sectionSummary[section]?.weight.toFixed(1) || 0} MT
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grade Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'] as const).map(grade => {
                  const weight = filteredCrucibles
                    .filter(c => c.targetGrade === grade)
                    .reduce((sum, c) => sum + c.totalWeight, 0);

                  return (
                    <div key={grade} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-4 rounded-full', PRODUCT_COLORS[grade])} />
                        <span className="text-sm text-slate-600">{grade}</span>
                      </div>
                      <span className="text-sm font-medium">{weight.toFixed(1)} MT</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
