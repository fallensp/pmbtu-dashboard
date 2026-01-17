import type { GradeConstraints, ProductGrade, RiskLevel } from '@/types';

// Risk Level Colors
export const RISK_COLORS: Record<RiskLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  normal: '#22c55e',
  shutdown: '#9ca3af',
};

// Risk Level Background Colors (lighter versions)
export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  critical: '#fef2f2',
  high: '#fff7ed',
  moderate: '#fefce8',
  normal: '#f0fdf4',
  shutdown: '#f9fafb',
};

// Risk Thresholds
export const RISK_THRESHOLDS = {
  fe: {
    critical: 0.18,
    moderate: 0.10,
  },
  si: {
    critical: 0.07,
    moderate: 0.05,
  },
  temp: {
    min: 960,
    max: 975,
  },
  molarRatio: {
    min: 2.2,
    max: 2.8,
  },
};

// Product Grade Constraints
export const GRADE_CONSTRAINTS: Record<ProductGrade, GradeConstraints> = {
  'PFA-NT': {
    maxFe: 0.075,
    maxSi: 0.05,
    maxVn: 0.0015,
    maxCr: 0.001,
    maxNi: 0.0005,
  },
  'Wire Rod H-EC': {
    maxFe: 0.100,
    maxSi: 0.05,
    maxVn: 0.002,
    maxCr: 0.0015,
    maxNi: 0.001,
  },
  'Billet': {
    maxFe: 0.100,
    maxSi: 0.10,
    maxVn: 0.003,
    maxCr: 0.002,
    maxNi: 0.002,
  },
  'P1020': {
    maxFe: 0.100,
    maxSi: 0.10,
    maxVn: 0.005,
    maxCr: 0.005,
    maxNi: 0.005,
  },
};

// Crucible Constraints
export const CRUCIBLE_CONSTRAINTS = {
  minPots: 2,
  maxPots: 6,
  maxWeight: 10.5, // MT
  minWeight: 4.0,  // MT
};

// Phase Areas
export const PHASE_AREAS: Record<1 | 2 | 3, string[]> = {
  1: ['AB1', 'AB2', 'CD1', 'CD2'],
  2: ['AB1', 'AB2', 'CD1', 'CD2'],
  3: ['AB1', 'AB2', 'CD1', 'CD2'],
};

// Pots per Area
export const POTS_PER_AREA = 75;

// Operating Parameters
export const OPERATING_PARAMS = {
  current: 397,    // kA
  voltage: 4.0,    // V typical
  potLifespan: {
    min: 1800,
    max: 2500,
  },
};

// Chart Colors
export const CHART_COLORS = {
  fe: '#ef4444',     // Red
  si: '#3b82f6',     // Blue
  temp: '#f97316',   // Orange
  voltage: '#8b5cf6', // Purple
  primary: '#2563eb',
  secondary: '#64748b',
};

// Date Formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  short: 'MM/dd',
  iso: 'yyyy-MM-dd',
};

// Metric Units
export const METRIC_UNITS = {
  fe: '%',
  si: '%',
  temp: '°C',
  voltage: 'V',
  weight: 'MT',
  current: 'kA',
};

// Alert Severity Colors
export const ALERT_SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#eab308',
  low: '#22c55e',
};

// Status Colors
export const STATUS_COLORS = {
  new: '#3b82f6',
  acknowledged: '#f97316',
  in_progress: '#eab308',
  resolved: '#22c55e',
};

// Schedule Status Colors
export const SCHEDULE_STATUS_COLORS = {
  complete: '#22c55e',
  in_progress: '#3b82f6',
  planned: '#f97316',
  draft: '#9ca3af',
};
