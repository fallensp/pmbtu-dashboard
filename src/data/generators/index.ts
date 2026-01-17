import type {
  Alert,
  AlertSeverity,
  AlertStatus,
  CrucibleAssignment,
  CrucibleV2,
  DashboardSummary,
  Order,
  Pot,
  PotAssignment,
  PotMetrics,
  PotV2,
  ProductGrade,
  RiskLevel,
  ScheduleEntry,
  ShiftType,
  TrendDataPoint,
  ExtendedMetrics,
} from '@/types';
import { PHASE_AREAS, POTS_PER_AREA, RISK_THRESHOLDS, GRADE_CONSTRAINTS } from '../constants';

// Seeded random number generator for consistent data
let seed = 12345;
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

function randomInRange(min: number, max: number): number {
  return min + seededRandom() * (max - min);
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(seededRandom() * array.length)];
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

// Determine risk level based on metrics
function calculateRiskLevel(metrics: PotMetrics): RiskLevel {
  const { fe, si, temp, molarRatio } = metrics;

  // Critical conditions
  if (fe >= RISK_THRESHOLDS.fe.critical || si >= RISK_THRESHOLDS.si.critical) {
    return 'critical';
  }

  // Temperature or molar ratio out of range
  if (temp < RISK_THRESHOLDS.temp.min || temp > RISK_THRESHOLDS.temp.max ||
      molarRatio < RISK_THRESHOLDS.molarRatio.min || molarRatio > RISK_THRESHOLDS.molarRatio.max) {
    return 'high';
  }

  // Moderate conditions
  if (fe >= RISK_THRESHOLDS.fe.moderate || si >= RISK_THRESHOLDS.si.moderate) {
    return 'moderate';
  }

  return 'normal';
}

// Calculate AI score (inverse of risk)
function calculateAiScore(riskLevel: RiskLevel): number {
  const baseScores: Record<RiskLevel, number> = {
    critical: 20,
    high: 40,
    moderate: 60,
    normal: 85,
    shutdown: 0,
  };

  const base = baseScores[riskLevel];
  const variation = randomInRange(-5, 10);
  return Math.min(100, Math.max(0, Math.round(base + variation)));
}

// Generate metrics based on target risk level
function generateMetrics(targetRisk: RiskLevel): PotMetrics {
  let fe: number, si: number, temp: number, voltage: number, molarRatio: number;

  switch (targetRisk) {
    case 'critical':
      fe = randomInRange(0.18, 0.25);
      si = randomInRange(0.065, 0.09);
      temp = randomChoice([randomInRange(950, 959), randomInRange(976, 985)]);
      voltage = randomInRange(4.2, 4.8);
      molarRatio = randomChoice([randomInRange(2.0, 2.19), randomInRange(2.81, 3.0)]);
      break;
    case 'high':
      fe = randomInRange(0.14, 0.179);
      si = randomInRange(0.055, 0.069);
      temp = randomChoice([randomInRange(958, 962), randomInRange(973, 977)]);
      voltage = randomInRange(4.1, 4.3);
      molarRatio = randomChoice([randomInRange(2.15, 2.25), randomInRange(2.75, 2.85)]);
      break;
    case 'moderate':
      fe = randomInRange(0.10, 0.139);
      si = randomInRange(0.05, 0.054);
      temp = randomInRange(963, 972);
      voltage = randomInRange(3.95, 4.1);
      molarRatio = randomInRange(2.3, 2.7);
      break;
    case 'shutdown':
      fe = 0;
      si = 0;
      temp = 0;
      voltage = 0;
      molarRatio = 0;
      break;
    default: // normal
      fe = randomInRange(0.03, 0.09);
      si = randomInRange(0.02, 0.049);
      temp = randomInRange(965, 970);
      voltage = randomInRange(3.9, 4.05);
      molarRatio = randomInRange(2.4, 2.6);
  }

  return {
    fe: Number(fe.toFixed(4)),
    si: Number(si.toFixed(4)),
    temp: Math.round(temp),
    voltage: Number(voltage.toFixed(2)),
    molarRatio: Number(molarRatio.toFixed(2)),
    aeFrequency: targetRisk === 'shutdown' ? 0 : randomInRange(0, targetRisk === 'critical' ? 3 : 1),
  };
}

// Generate extended metrics for V2
function generateExtendedMetrics(targetRisk: RiskLevel): ExtendedMetrics {
  const baseMetrics = generateMetrics(targetRisk);
  return {
    ...baseMetrics,
    vn: Number(randomInRange(0.0005, 0.003).toFixed(4)),
    cr: Number(randomInRange(0.0003, 0.002).toFixed(4)),
    ni: Number(randomInRange(0.0001, 0.001).toFixed(4)),
  };
}

// Generate trend data
function generateTrend(days: number, currentMetrics: PotMetrics): TrendDataPoint[] {
  const today = new Date();
  const trend: TrendDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = subtractDays(today, i);
    const variation = 1 + (i / days) * 0.2; // Earlier values slightly different

    trend.push({
      date: formatDate(date),
      fe: Number((currentMetrics.fe * variation * randomInRange(0.85, 1.15)).toFixed(4)),
      si: Number((currentMetrics.si * variation * randomInRange(0.85, 1.15)).toFixed(4)),
      temp: Math.round(currentMetrics.temp * randomInRange(0.98, 1.02)),
      voltage: Number((currentMetrics.voltage * randomInRange(0.95, 1.05)).toFixed(2)),
    });
  }

  // Ensure last point matches current metrics
  trend[trend.length - 1] = {
    date: formatDate(today),
    fe: currentMetrics.fe,
    si: currentMetrics.si,
    temp: currentMetrics.temp,
    voltage: currentMetrics.voltage,
  };

  return trend;
}

// Generate all pots
export function generatePots(): Pot[] {
  seed = 12345; // Reset seed for consistency
  const pots: Pot[] = [];
  const today = new Date();

  // Distribution: 3 critical, 12 high, 45 moderate, ~840 normal
  const distribution: { risk: RiskLevel; count: number }[] = [
    { risk: 'critical', count: 3 },
    { risk: 'high', count: 12 },
    { risk: 'moderate', count: 45 },
    { risk: 'shutdown', count: 10 },
  ];

  const riskAssignments: RiskLevel[] = [];
  distribution.forEach(({ risk, count }) => {
    for (let i = 0; i < count; i++) {
      riskAssignments.push(risk);
    }
  });

  // Shuffle risk assignments
  for (let i = riskAssignments.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [riskAssignments[i], riskAssignments[j]] = [riskAssignments[j], riskAssignments[i]];
  }

  let riskIndex = 0;

  for (const phase of [1, 2, 3] as const) {
    for (const area of PHASE_AREAS[phase]) {
      for (let pos = 1; pos <= POTS_PER_AREA; pos++) {
        const targetRisk = riskIndex < riskAssignments.length
          ? riskAssignments[riskIndex++]
          : 'normal';

        const metrics = generateMetrics(targetRisk);
        const actualRisk = targetRisk === 'shutdown' ? 'shutdown' : calculateRiskLevel(metrics);
        const age = randomInt(100, 2200);
        const startDate = subtractDays(today, age);
        const lastTapDaysAgo = randomInt(1, 7);

        const pot: Pot = {
          id: `${phase}-${area}-${pos}`,
          phase,
          area,
          position: pos,
          age,
          startDate: formatDate(startDate),
          lastTapDate: formatDate(subtractDays(today, lastTapDaysAgo)),
          riskLevel: actualRisk,
          aiScore: calculateAiScore(actualRisk),
          metrics,
          trend: generateTrend(30, metrics),
          status: targetRisk === 'shutdown' ? 'shutdown' : 'active',
        };

        pots.push(pot);
      }
    }
  }

  return pots;
}

// Generate V2 pots with extended metrics
export function generatePotsV2(): PotV2[] {
  seed = 12345;
  const basePots = generatePots();

  return basePots.map(pot => ({
    ...pot,
    metrics: generateExtendedMetrics(pot.riskLevel),
    weight: Number(randomInRange(1.5, 2.8).toFixed(2)),
  }));
}

// Generate alerts
export function generateAlerts(pots: Pot[]): Alert[] {
  seed = 54321;
  const alerts: Alert[] = [];
  const today = new Date();

  const criticalPots = pots.filter(p => p.riskLevel === 'critical');
  const highPots = pots.filter(p => p.riskLevel === 'high');
  const moderatePots = pots.filter(p => p.riskLevel === 'moderate');

  const alertTemplates: { severity: AlertSeverity; title: string; description: string; recommendation: string }[] = [
    {
      severity: 'critical',
      title: 'Critical Fe Level',
      description: 'Iron content has exceeded critical threshold of 0.18%',
      recommendation: 'Schedule immediate pot maintenance and cathode inspection',
    },
    {
      severity: 'critical',
      title: 'Critical Si Level',
      description: 'Silicon content has exceeded critical threshold of 0.07%',
      recommendation: 'Check bath chemistry and alumina feed rate',
    },
    {
      severity: 'high',
      title: 'Elevated Fe Trend',
      description: 'Iron content trending toward critical threshold',
      recommendation: 'Monitor closely and prepare for maintenance intervention',
    },
    {
      severity: 'high',
      title: 'Temperature Deviation',
      description: 'Bath temperature outside optimal operating range',
      recommendation: 'Adjust power input and review thermal balance',
    },
    {
      severity: 'moderate',
      title: 'Fe Above Moderate Threshold',
      description: 'Iron content above 0.10%, monitor trend',
      recommendation: 'Increase monitoring frequency',
    },
    {
      severity: 'moderate',
      title: 'Si Approaching Limit',
      description: 'Silicon content approaching moderate threshold',
      recommendation: 'Review alumina quality and feeding schedule',
    },
  ];

  const statuses: AlertStatus[] = ['new', 'acknowledged', 'in_progress', 'resolved'];

  // Generate alerts for problematic pots
  [...criticalPots, ...highPots.slice(0, 8), ...moderatePots.slice(0, 15)].forEach((pot, index) => {
    const template = alertTemplates.find(t =>
      (pot.riskLevel === 'critical' && t.severity === 'critical') ||
      (pot.riskLevel === 'high' && t.severity === 'high') ||
      (pot.riskLevel === 'moderate' && t.severity === 'moderate')
    ) || alertTemplates[0];

    const createdDaysAgo = randomInt(0, 5);
    const status = randomChoice(statuses);

    alerts.push({
      id: `ALT-${String(index + 1).padStart(4, '0')}`,
      potId: pot.id,
      potPhase: pot.phase,
      potArea: pot.area,
      severity: template.severity,
      status,
      title: template.title,
      description: `${template.description}. Current value: ${
        template.title.includes('Fe') ? pot.metrics.fe.toFixed(3) :
        template.title.includes('Si') ? pot.metrics.si.toFixed(3) :
        pot.metrics.temp
      }`,
      recommendation: template.recommendation,
      createdAt: subtractDays(today, createdDaysAgo).toISOString(),
      acknowledgedAt: status !== 'new' ? subtractDays(today, createdDaysAgo - 1).toISOString() : undefined,
      resolvedAt: status === 'resolved' ? subtractDays(today, 0).toISOString() : undefined,
      assignedTo: status !== 'new' ? randomChoice(['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Johnson']) : undefined,
    });
  });

  return alerts;
}

// Generate orders
export function generateOrders(): Order[] {
  seed = 67890;
  const today = new Date();

  const orders: Order[] = [
    {
      id: 'ORD-001',
      productGrade: 'PFA-NT',
      targetQuantity: 42,
      fulfilledQuantity: 21,
      cruciblesRequired: 4,
      cruciblesFulfilled: 2,
      priority: 'high',
      dueDate: formatDate(today),
      status: 'partial',
    },
    {
      id: 'ORD-002',
      productGrade: 'Wire Rod H-EC',
      targetQuantity: 31.5,
      fulfilledQuantity: 10.5,
      cruciblesRequired: 3,
      cruciblesFulfilled: 1,
      priority: 'high',
      dueDate: formatDate(today),
      status: 'partial',
    },
    {
      id: 'ORD-003',
      productGrade: 'Billet',
      targetQuantity: 21,
      fulfilledQuantity: 0,
      cruciblesRequired: 2,
      cruciblesFulfilled: 0,
      priority: 'normal',
      dueDate: formatDate(subtractDays(today, -1)),
      status: 'pending',
    },
    {
      id: 'ORD-004',
      productGrade: 'P1020',
      targetQuantity: 84,
      fulfilledQuantity: 31.5,
      cruciblesRequired: 8,
      cruciblesFulfilled: 3,
      priority: 'normal',
      dueDate: formatDate(subtractDays(today, -1)),
      status: 'partial',
    },
  ];

  return orders;
}

// Generate crucible assignments (V1)
export function generateCrucibleAssignments(pots: Pot[]): CrucibleAssignment[] {
  seed = 11111;
  const assignments: CrucibleAssignment[] = [];
  const grades: ProductGrade[] = ['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'];

  const eligiblePots = pots.filter(p =>
    p.status === 'active' &&
    p.riskLevel !== 'critical' &&
    p.metrics.fe < 0.10
  );

  // Sort by AI score descending
  eligiblePots.sort((a, b) => b.aiScore - a.aiScore);

  let potIndex = 0;

  for (let section = 1; section <= 5; section++) {
    for (let crucible = 1; crucible <= 3; crucible++) {
      if (potIndex >= eligiblePots.length - 4) break;

      const grade = grades[(section + crucible) % 4];
      const constraints = GRADE_CONSTRAINTS[grade];
      const potsForCrucible: string[] = [];
      let totalWeight = 0;
      let totalFe = 0;
      let totalSi = 0;

      // Assign 3-5 pots per crucible
      const numPots = randomInt(3, 5);
      for (let i = 0; i < numPots && potIndex < eligiblePots.length; i++) {
        const pot = eligiblePots[potIndex++];
        if (pot.metrics.fe <= constraints.maxFe && pot.metrics.si <= constraints.maxSi) {
          potsForCrucible.push(pot.id);
          const weight = randomInRange(1.8, 2.5);
          totalWeight += weight;
          totalFe += pot.metrics.fe * weight;
          totalSi += pot.metrics.si * weight;
        }
      }

      if (potsForCrucible.length >= 2) {
        const blendedFe = totalFe / totalWeight;
        const blendedSi = totalSi / totalWeight;

        assignments.push({
          id: `C-${section}${String.fromCharCode(64 + crucible)}`,
          section,
          productGrade: grade,
          pots: potsForCrucible,
          totalWeight: Number(totalWeight.toFixed(2)),
          blendedFe: Number(blendedFe.toFixed(4)),
          blendedSi: Number(blendedSi.toFixed(4)),
          route: `Section ${section} → Crucible Bay → Cast House`,
          constraintsMet: blendedFe <= constraints.maxFe && blendedSi <= constraints.maxSi && totalWeight <= 10.5,
        });
      }
    }
  }

  return assignments;
}

// Generate V2 crucibles
export function generateCruciblesV2(pots: PotV2[]): CrucibleV2[] {
  seed = 22222;
  const crucibles: CrucibleV2[] = [];
  const grades: ProductGrade[] = ['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'];

  for (let i = 0; i < 6; i++) {
    const grade = grades[i % 4];
    const constraints = GRADE_CONSTRAINTS[grade];

    // Get eligible pots for this grade
    const eligiblePots = pots.filter(p =>
      p.status === 'active' &&
      p.metrics.fe <= constraints.maxFe * 1.2 &&
      p.metrics.si <= constraints.maxSi * 1.2
    );

    // Select 3-5 pots
    const numPots = randomInt(3, 5);
    const selectedPots: PotAssignment[] = [];

    for (let j = 0; j < numPots && j < eligiblePots.length; j++) {
      const pot = eligiblePots[j + i * 5];
      if (pot) {
        selectedPots.push({
          potId: pot.id,
          potName: pot.id,
          fe: pot.metrics.fe,
          si: pot.metrics.si,
          vn: pot.metrics.vn,
          cr: pot.metrics.cr,
          ni: pot.metrics.ni,
          weight: pot.weight,
        });
      }
    }

    // Calculate blended values
    const totalWeight = selectedPots.reduce((sum, p) => sum + p.weight, 0);
    const blendedFe = selectedPots.reduce((sum, p) => sum + p.fe * p.weight, 0) / totalWeight;
    const blendedSi = selectedPots.reduce((sum, p) => sum + p.si * p.weight, 0) / totalWeight;
    const blendedVn = selectedPots.reduce((sum, p) => sum + p.vn * p.weight, 0) / totalWeight;
    const blendedCr = selectedPots.reduce((sum, p) => sum + p.cr * p.weight, 0) / totalWeight;
    const blendedNi = selectedPots.reduce((sum, p) => sum + p.ni * p.weight, 0) / totalWeight;

    const violations: string[] = [];
    if (blendedFe > constraints.maxFe) violations.push(`Fe exceeds ${constraints.maxFe}`);
    if (blendedSi > constraints.maxSi) violations.push(`Si exceeds ${constraints.maxSi}`);
    if (totalWeight > 10.5) violations.push('Weight exceeds 10.5 MT');
    if (selectedPots.length < 2) violations.push('Minimum 2 pots required');

    crucibles.push({
      id: `C-${String(i + 1).padStart(3, '0')}`,
      targetGrade: grade,
      pots: selectedPots,
      totalWeight: Number(totalWeight.toFixed(2)),
      blendedFe: Number(blendedFe.toFixed(4)),
      blendedSi: Number(blendedSi.toFixed(4)),
      blendedVn: Number(blendedVn.toFixed(4)),
      blendedCr: Number(blendedCr.toFixed(4)),
      blendedNi: Number(blendedNi.toFixed(4)),
      constraintsMet: violations.length === 0,
      constraintViolations: violations,
    });
  }

  return crucibles;
}

// Generate schedule entries
export function generateSchedule(): ScheduleEntry[] {
  seed = 33333;
  const entries: ScheduleEntry[] = [];
  const today = new Date();

  for (let day = -3; day <= 7; day++) {
    const date = subtractDays(today, -day);

    for (const shift of ['AM', 'PM'] as ShiftType[]) {
      const isPast = day < 0 || (day === 0 && shift === 'AM');
      const isToday = day === 0;

      let status: ScheduleEntry['status'];
      if (isPast) {
        status = 'complete';
      } else if (isToday && shift === 'PM') {
        status = 'in_progress';
      } else if (day <= 2) {
        status = 'planned';
      } else {
        status = 'draft';
      }

      const totalCrucibles = randomInt(12, 18);
      const completedCrucibles = status === 'complete' ? totalCrucibles :
                                  status === 'in_progress' ? randomInt(4, 8) : 0;

      entries.push({
        id: `SCH-${formatDate(date)}-${shift}`,
        date: formatDate(date),
        shift,
        status,
        totalCrucibles,
        completedCrucibles,
        totalOutput: Number((completedCrucibles * randomInRange(8.5, 10.2)).toFixed(1)),
      });
    }
  }

  return entries;
}

// Generate dashboard summary
export function generateDashboardSummary(pots: Pot[], alerts: Alert[]): DashboardSummary {
  const criticalCount = pots.filter(p => p.riskLevel === 'critical').length;
  const highCount = pots.filter(p => p.riskLevel === 'high').length;
  const moderateCount = pots.filter(p => p.riskLevel === 'moderate').length;
  const normalCount = pots.filter(p => p.riskLevel === 'normal').length;
  const shutdownCount = pots.filter(p => p.riskLevel === 'shutdown').length;

  const activeAlerts = alerts.filter(a => a.status !== 'resolved').length;

  // Calculate health score based on pot distribution
  const totalActive = criticalCount + highCount + moderateCount + normalCount;
  const weightedScore = (normalCount * 100 + moderateCount * 60 + highCount * 30 + criticalCount * 10) / totalActive;

  return {
    healthScore: Math.round(weightedScore),
    criticalCount,
    highCount,
    moderateCount,
    normalCount,
    shutdownCount,
    todayOutput: Number(randomInRange(145, 165).toFixed(1)),
    todayCrucibles: randomInt(14, 18),
    fulfillmentRate: Number(randomInRange(85, 95).toFixed(1)),
    activeAlerts,
  };
}
