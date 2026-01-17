import type { Order, Crucible, TappingArrangement, ScheduleShift, ProductGrade, ConstraintValidation } from '@/types';
import { PRODUCT_CONSTRAINTS, CRUCIBLE_CONFIG } from '@/data/constants';
import { getPots } from './pot-generator';
import { randomBetween, randomInt, pickRandom } from '@/lib/utils';

export function generateOrders(): Order[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const orders: Order[] = [
    // PFA-NT orders (high priority, strict constraints)
    {
      id: 'ORD-001',
      grade: 'PFA-NT',
      quantity: 42,
      fulfilled: 28,
      dueDate: tomorrow,
      status: 'in_progress',
      priority: 'high',
      constraints: PRODUCT_CONSTRAINTS['PFA-NT'],
    },
    {
      id: 'ORD-002',
      grade: 'PFA-NT',
      quantity: 35,
      fulfilled: 0,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'high',
      constraints: PRODUCT_CONSTRAINTS['PFA-NT'],
    },
    {
      id: 'ORD-003',
      grade: 'PFA-NT',
      quantity: 28,
      fulfilled: 28,
      dueDate: now,
      status: 'completed',
      priority: 'high',
      constraints: PRODUCT_CONSTRAINTS['PFA-NT'],
    },
    {
      id: 'ORD-004',
      grade: 'PFA-NT',
      quantity: 21,
      fulfilled: 0,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'normal',
      constraints: PRODUCT_CONSTRAINTS['PFA-NT'],
    },
    // Wire Rod orders
    {
      id: 'ORD-005',
      grade: 'Wire Rod H-EC',
      quantity: 63,
      fulfilled: 42,
      dueDate: tomorrow,
      status: 'in_progress',
      priority: 'high',
      constraints: PRODUCT_CONSTRAINTS['Wire Rod H-EC'],
    },
    {
      id: 'ORD-006',
      grade: 'Wire Rod H-EC',
      quantity: 50,
      fulfilled: 0,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'normal',
      constraints: PRODUCT_CONSTRAINTS['Wire Rod H-EC'],
    },
    {
      id: 'ORD-007',
      grade: 'Wire Rod H-EC',
      quantity: 45,
      fulfilled: 45,
      dueDate: now,
      status: 'completed',
      priority: 'normal',
      constraints: PRODUCT_CONSTRAINTS['Wire Rod H-EC'],
    },
    // Billet orders
    {
      id: 'ORD-008',
      grade: 'Billet',
      quantity: 84,
      fulfilled: 56,
      dueDate: tomorrow,
      status: 'in_progress',
      priority: 'normal',
      constraints: PRODUCT_CONSTRAINTS['Billet'],
    },
    {
      id: 'ORD-009',
      grade: 'Billet',
      quantity: 70,
      fulfilled: 0,
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'low',
      constraints: PRODUCT_CONSTRAINTS['Billet'],
    },
    // P1020 orders (standard grade, high volume)
    {
      id: 'ORD-010',
      grade: 'P1020',
      quantity: 200,
      fulfilled: 150,
      dueDate: tomorrow,
      status: 'in_progress',
      priority: 'normal',
      constraints: PRODUCT_CONSTRAINTS['P1020'],
    },
    {
      id: 'ORD-011',
      grade: 'P1020',
      quantity: 180,
      fulfilled: 0,
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      priority: 'low',
      constraints: PRODUCT_CONSTRAINTS['P1020'],
    },
  ];

  return orders;
}

function generateCruciblesForSection(section: number, shift: 'AM' | 'PM'): Crucible[] {
  const pots = getPots();
  const eligiblePots = pots.filter(p =>
    p.riskLevel !== 'shutdown' &&
    p.riskLevel !== 'critical' &&
    p.metrics.fe < 0.15
  );

  const crucibles: Crucible[] = [];
  const cruciblesPerSection = randomInt(4, 8);

  for (let i = 0; i < cruciblesPerSection; i++) {
    const numPots = randomInt(CRUCIBLE_CONFIG.minPotsPerCrucible, CRUCIBLE_CONFIG.maxPotsPerCrucible);
    const selectedPots = eligiblePots
      .sort(() => Math.random() - 0.5)
      .slice(0, numPots);

    const totalWeight = Number(randomBetween(8.5, CRUCIBLE_CONFIG.maxCapacity).toFixed(2));
    const blendedFe = Number((
      selectedPots.reduce((sum, p) => sum + p.metrics.fe, 0) / selectedPots.length
    ).toFixed(4));
    const blendedSi = Number((
      selectedPots.reduce((sum, p) => sum + p.metrics.si, 0) / selectedPots.length
    ).toFixed(4));

    // Determine target grade based on blended chemistry
    let targetGrade: ProductGrade = 'P1020';
    if (blendedFe < 0.075 && blendedSi < 0.05) {
      targetGrade = 'PFA-NT';
    } else if (blendedFe < 0.10 && blendedSi < 0.05) {
      targetGrade = 'Wire Rod H-EC';
    } else if (blendedFe < 0.10 && blendedSi < 0.10) {
      targetGrade = pickRandom(['Billet', 'P1020']);
    }

    crucibles.push({
      id: `CRU-${section}-${shift}-${String(i + 1).padStart(2, '0')}`,
      section,
      pots: selectedPots.map(p => p.id),
      totalWeight,
      blendedFe,
      blendedSi,
      route: `R${section}${shift === 'AM' ? 'A' : 'P'}${i + 1}`,
      targetGrade,
    });
  }

  return crucibles;
}

export function generateTappingArrangement(shift: 'AM' | 'PM', date: Date): TappingArrangement {
  const allCrucibles: Crucible[] = [];

  for (let section = 1; section <= CRUCIBLE_CONFIG.sections; section++) {
    allCrucibles.push(...generateCruciblesForSection(section, shift));
  }

  // Validate constraints
  const constraints: ConstraintValidation[] = [
    {
      name: 'Max Crucible Capacity',
      passed: allCrucibles.every(c => c.totalWeight <= CRUCIBLE_CONFIG.maxCapacity),
      message: `All crucibles within ${CRUCIBLE_CONFIG.maxCapacity} MT limit`,
    },
    {
      name: 'Special Products per Section',
      passed: true, // Simplified check
      message: `Max ${CRUCIBLE_CONFIG.maxSpecialProducts} special products per section`,
    },
    {
      name: 'Pot Chemistry Compliance',
      passed: allCrucibles.every(c =>
        c.blendedFe <= PRODUCT_CONSTRAINTS[c.targetGrade].maxFe &&
        c.blendedSi <= PRODUCT_CONSTRAINTS[c.targetGrade].maxSi
      ),
      message: 'All crucibles meet grade chemistry requirements',
    },
    {
      name: 'Route Optimization',
      passed: true,
      message: 'Routes optimized for minimal travel time',
    },
    {
      name: 'Order Fulfillment',
      passed: true,
      message: 'Arrangement aligns with pending orders',
    },
  ];

  const optimizationScore = constraints.filter(c => c.passed).length / constraints.length * 100;

  return {
    id: `ARR-${date.toISOString().split('T')[0]}-${shift}`,
    shift,
    date,
    status: shift === 'AM' ? 'approved' : 'draft',
    crucibles: allCrucibles,
    optimizationScore: Number(optimizationScore.toFixed(1)),
    constraints,
  };
}

export function generateSchedule(weeks: number = 2): ScheduleShift[] {
  const schedule: ScheduleShift[] = [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  for (let day = 0; day < weeks * 7; day++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + day);

    for (const shift of ['AM', 'PM'] as const) {
      let status: ScheduleShift['status'];
      const shiftDate = new Date(date);
      shiftDate.setHours(shift === 'AM' ? 6 : 18, 0, 0, 0);

      if (shiftDate < now) {
        status = 'completed';
      } else if (shiftDate.toDateString() === now.toDateString()) {
        status = shift === 'AM' ? 'completed' : 'in_progress';
      } else if (day < 3) {
        status = 'planned';
      } else {
        status = 'draft';
      }

      schedule.push({
        date,
        shift,
        status,
        crucibleCount: randomInt(25, 35),
        totalOutput: Number(randomBetween(250, 350).toFixed(1)),
      });
    }
  }

  return schedule;
}

let cachedOrders: Order[] | null = null;
let cachedSchedule: ScheduleShift[] | null = null;

export function getOrders(): Order[] {
  if (!cachedOrders) {
    cachedOrders = generateOrders();
  }
  return cachedOrders;
}

export function getSchedule(): ScheduleShift[] {
  if (!cachedSchedule) {
    cachedSchedule = generateSchedule();
  }
  return cachedSchedule;
}
