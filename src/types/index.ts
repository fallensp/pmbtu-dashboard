// Risk Levels
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'normal' | 'shutdown';

// Pot Types
export interface Pot {
  id: string;
  phase: 1 | 2 | 3;
  area: string;
  position: number;
  riskLevel: RiskLevel;
  aiScore: number;
  age: number;
  startDate: Date;
  lastTapDate: Date;
  metrics: PotMetrics;
  trends: TrendData[];
}

export interface PotMetrics {
  fe: number;
  si: number;
  temperature: number;
  voltage: number;
  molarRatio: number;
  aeFrequency: number;
  feSlope: number;
  siSlope: number;
}

export interface TrendData {
  date: Date;
  fe: number;
  si: number;
  temperature: number;
  voltage: number;
  aiScore: number;
}

// Alert Types
export type AlertSeverity = 'critical' | 'high' | 'moderate';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertType = 'fe_high' | 'si_high' | 'temp_high' | 'temp_low' | 'voltage_spike' | 'ae_frequency' | 'prediction';

export interface Alert {
  id: string;
  potId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  assignee?: string;
}

// Production Types
export type ProductGrade = 'PFA-NT' | 'Wire Rod H-EC' | 'Billet' | 'P1020';
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'partial';

export interface ProductConstraints {
  maxFe: number;
  maxSi: number;
  minPurity?: number;
}

export interface Order {
  id: string;
  grade: ProductGrade;
  quantity: number;
  fulfilled: number;
  dueDate: Date;
  status: OrderStatus;
  priority: 'high' | 'normal' | 'low';
  constraints: ProductConstraints;
}

export interface Crucible {
  id: string;
  section: number;
  pots: string[];
  totalWeight: number;
  blendedFe: number;
  blendedSi: number;
  route: string;
  targetGrade: ProductGrade;
}

export interface TappingArrangement {
  id: string;
  shift: 'AM' | 'PM';
  date: Date;
  status: 'draft' | 'approved' | 'in_progress' | 'completed';
  crucibles: Crucible[];
  optimizationScore: number;
  constraints: ConstraintValidation[];
}

export interface ConstraintValidation {
  name: string;
  passed: boolean;
  message: string;
}

// Schedule Types
export type ShiftStatus = 'completed' | 'in_progress' | 'planned' | 'draft';

export interface ScheduleShift {
  date: Date;
  shift: 'AM' | 'PM';
  status: ShiftStatus;
  crucibleCount: number;
  totalOutput: number;
}

// Filter Types
export interface PotFilters {
  phase: number | null;
  areas: string[];
  riskLevels: RiskLevel[];
  searchQuery: string;
}

export interface AlertFilters {
  severity: AlertSeverity[];
  status: AlertStatus[];
  phase: number | null;
  dateRange: { start: Date | null; end: Date | null };
}

// Summary Types
export interface HealthSummary {
  total: number;
  critical: number;
  high: number;
  moderate: number;
  normal: number;
  shutdown: number;
  overallScore: number;
}

export interface ProductionSummary {
  todayOutput: number;
  targetOutput: number;
  cruciblesCompleted: number;
  cruciblesPlanned: number;
  ordersInProgress: number;
  fulfillmentRate: number;
}

// V2 Production Planning Types
export type FulfillmentStatus = 'pending' | 'partial' | 'fulfilled' | 'exceeded';
export type TaskStatus = 'draft' | 'ready' | 'incomplete';

export interface ProductRequest {
  id: string;
  productGrade: ProductGrade;
  targetMT: number;
  tasksNeeded: number;
  tasksAssigned: number;
  fulfillmentStatus: FulfillmentStatus;
}

export interface TaskV2 {
  id: string;
  productGrade: ProductGrade;
  pots: string[];
  potDetails: TaskPotDetail[];
  totalWeight: number;
  blendedFe: number;
  blendedSi: number;
  status: TaskStatus;
  passesConstraints: boolean;
  constraintMessages: string[];
}

export interface TaskPotDetail {
  potId: string;
  fe: number;
  si: number;
  aiScore: number;
  estimatedWeight: number;
}

export interface ShiftSummary {
  totalTasks: number;
  maxTasks: number;
  totalPots: number;
  maxPots: number;
  totalWeight: number;
  tasksByGrade: Record<ProductGrade, number>;
  isOverLimit: boolean;
}

export interface PlannerState {
  date: Date;
  shift: 'AM' | 'PM';
  productRequests: ProductRequest[];
  tasks: TaskV2[];
  shiftSummary: ShiftSummary;
}
