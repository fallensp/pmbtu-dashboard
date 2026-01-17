import {
  generatePots,
  generatePotsV2,
  generateAlerts,
  generateOrders,
  generateCrucibleAssignments,
  generateCruciblesV2,
  generateSchedule,
  generateDashboardSummary,
} from '../generators';

// Generate all mock data
export const mockPots = generatePots();
export const mockPotsV2 = generatePotsV2();
export const mockAlerts = generateAlerts(mockPots);
export const mockOrders = generateOrders();
export const mockCrucibleAssignments = generateCrucibleAssignments(mockPots);
export const mockCruciblesV2 = generateCruciblesV2(mockPotsV2);
export const mockSchedule = generateSchedule();
export const mockDashboardSummary = generateDashboardSummary(mockPots, mockAlerts);

// Helper functions for filtering and querying
export function getPotById(id: string) {
  return mockPots.find(p => p.id === id);
}

export function getPotV2ById(id: string) {
  return mockPotsV2.find(p => p.id === id);
}

export function getAlertsByPotId(potId: string) {
  return mockAlerts.filter(a => a.potId === potId);
}

export function getPotsByPhase(phase: 1 | 2 | 3) {
  return mockPots.filter(p => p.phase === phase);
}

export function getPotsByArea(phase: 1 | 2 | 3, area: string) {
  return mockPots.filter(p => p.phase === phase && p.area === area);
}

export function getActiveAlerts() {
  return mockAlerts.filter(a => a.status !== 'resolved');
}

export function getCriticalAlerts() {
  return mockAlerts.filter(a => a.severity === 'critical' && a.status !== 'resolved');
}

export function getOrdersByGrade(grade: string) {
  return mockOrders.filter(o => o.productGrade === grade);
}

export function getScheduleByDate(date: string) {
  return mockSchedule.filter(s => s.date === date);
}

// Summary statistics by phase
export function getPhaseSummary(phase: 1 | 2 | 3) {
  const phasePots = getPotsByPhase(phase);
  return {
    total: phasePots.length,
    critical: phasePots.filter(p => p.riskLevel === 'critical').length,
    high: phasePots.filter(p => p.riskLevel === 'high').length,
    moderate: phasePots.filter(p => p.riskLevel === 'moderate').length,
    normal: phasePots.filter(p => p.riskLevel === 'normal').length,
    shutdown: phasePots.filter(p => p.riskLevel === 'shutdown').length,
  };
}

// Get pots eligible for a specific grade
export function getEligiblePotsForGrade(grade: string, pots = mockPotsV2) {
  const constraints = {
    'PFA-NT': { maxFe: 0.075, maxSi: 0.05 },
    'Wire Rod H-EC': { maxFe: 0.100, maxSi: 0.05 },
    'Billet': { maxFe: 0.100, maxSi: 0.10 },
    'P1020': { maxFe: 0.100, maxSi: 0.10 },
  }[grade] || { maxFe: 0.10, maxSi: 0.10 };

  return pots.filter(p =>
    p.status === 'active' &&
    p.metrics.fe <= constraints.maxFe &&
    p.metrics.si <= constraints.maxSi
  ).sort((a, b) => b.aiScore - a.aiScore);
}
