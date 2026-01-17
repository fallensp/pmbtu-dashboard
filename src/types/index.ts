// Risk Levels
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'normal' | 'shutdown';

// Product Grades
export type ProductGrade = 'PFA-NT' | 'Wire Rod H-EC' | 'Billet' | 'P1020';

// Alert Status
export type AlertStatus = 'new' | 'acknowledged' | 'in_progress' | 'resolved';

// Alert Severity
export type AlertSeverity = 'critical' | 'high' | 'moderate' | 'low';

// Shift Type
export type ShiftType = 'AM' | 'PM';

// Schedule Status
export type ScheduleStatus = 'complete' | 'in_progress' | 'planned' | 'draft';

// Pot Status
export interface PotMetrics {
  fe: number;          // Iron content (%)
  si: number;          // Silicon content (%)
  temp: number;        // Temperature (°C)
  voltage: number;     // Voltage (V)
  molarRatio: number;  // BR molar ratio
  aeFrequency: number; // Anode effect frequency per day
}

// V2 Extended Metrics
export interface ExtendedMetrics extends PotMetrics {
  vn: number;  // Vanadium
  cr: number;  // Chromium
  ni: number;  // Nickel
}

// Trend Data Point
export interface TrendDataPoint {
  date: string;
  fe: number;
  si: number;
  temp: number;
  voltage: number;
}

// Pot
export interface Pot {
  id: string;
  phase: 1 | 2 | 3;
  area: string;           // AB1, AB2, CD1, CD2, etc.
  position: number;       // Position in area
  age: number;            // Days since start
  startDate: string;      // ISO date
  lastTapDate: string;    // ISO date
  riskLevel: RiskLevel;
  aiScore: number;        // 0-100
  metrics: PotMetrics;
  trend: TrendDataPoint[];
  status: 'active' | 'shutdown' | 'maintenance';
}

// V2 Pot with extended metrics
export interface PotV2 extends Omit<Pot, 'metrics'> {
  metrics: ExtendedMetrics;
  weight: number;  // Available metal weight (MT)
}

// Alert
export interface Alert {
  id: string;
  potId: string;
  potPhase: 1 | 2 | 3;
  potArea: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  recommendation: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
}

// Order
export interface Order {
  id: string;
  productGrade: ProductGrade;
  targetQuantity: number;    // MT
  fulfilledQuantity: number; // MT
  cruciblesRequired: number;
  cruciblesFulfilled: number;
  priority: 'high' | 'normal';
  dueDate: string;
  status: 'pending' | 'partial' | 'fulfilled';
}

// Crucible Assignment (V1)
export interface CrucibleAssignment {
  id: string;
  section: number;          // 1-5
  productGrade: ProductGrade;
  pots: string[];           // Pot IDs
  totalWeight: number;      // MT
  blendedFe: number;        // Blended Fe %
  blendedSi: number;        // Blended Si %
  route: string;            // Route description
  constraintsMet: boolean;
}

// Pot Assignment (V2)
export interface PotAssignment {
  potId: string;
  potName: string;
  fe: number;
  si: number;
  vn: number;
  cr: number;
  ni: number;
  weight: number;
}

// Crucible V2
export interface CrucibleV2 {
  id: string;
  targetGrade: ProductGrade;
  pots: PotAssignment[];
  totalWeight: number;
  blendedFe: number;
  blendedSi: number;
  blendedVn: number;
  blendedCr: number;
  blendedNi: number;
  constraintsMet: boolean;
  constraintViolations: string[];
}

// Schedule Entry
export interface ScheduleEntry {
  id: string;
  date: string;
  shift: ShiftType;
  status: ScheduleStatus;
  totalCrucibles: number;
  completedCrucibles: number;
  totalOutput: number; // MT
}

// Dashboard Summary
export interface DashboardSummary {
  healthScore: number;       // 0-100
  criticalCount: number;
  highCount: number;
  moderateCount: number;
  normalCount: number;
  shutdownCount: number;
  todayOutput: number;       // MT
  todayCrucibles: number;
  fulfillmentRate: number;   // %
  activeAlerts: number;
}

// Filter State
export interface FilterState {
  phase: (1 | 2 | 3)[];
  areas: string[];
  riskLevels: RiskLevel[];
  searchQuery: string;
}

// Product Grade Constraints
export interface GradeConstraints {
  maxFe: number;
  maxSi: number;
  maxVn?: number;
  maxCr?: number;
  maxNi?: number;
}
