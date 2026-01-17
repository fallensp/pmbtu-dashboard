import type { RiskLevel, ProductGrade, ProductConstraints } from '@/types';

// Risk Thresholds
export const THRESHOLDS = {
  fe: {
    critical: 0.18,
    moderate: 0.10,
    normal: 0.075,
  },
  si: {
    critical: 0.07,
    moderate: 0.05,
    normal: 0.04,
  },
  temperature: {
    critical_high: 975,
    critical_low: 960,
    normal_high: 970,
    normal_low: 965,
  },
  molarRatio: {
    critical_high: 2.8,
    critical_low: 2.2,
    normal_high: 2.6,
    normal_low: 2.4,
  },
  voltage: {
    normal: 4.0,
    variance_threshold: 0.1,
  },
  aeFrequency: {
    critical: 3,
    moderate: 1,
  },
} as const;

// Risk Level Colors (matching CSS variables)
export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string; light: string }> = {
  critical: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    light: 'bg-red-50',
  },
  high: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    light: 'bg-orange-50',
  },
  moderate: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    light: 'bg-yellow-50',
  },
  normal: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    light: 'bg-green-50',
  },
  shutdown: {
    bg: 'bg-gray-400',
    text: 'text-gray-400',
    border: 'border-gray-400',
    light: 'bg-gray-50',
  },
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Critical',
  high: 'High Risk',
  moderate: 'Moderate',
  normal: 'Normal',
  shutdown: 'Shutdown',
};

// Phase and Area Configuration
export const PHASES = [1, 2, 3] as const;

export const AREAS_BY_PHASE: Record<number, string[]> = {
  1: ['1AB1', '1AB2', '1CD1', '1CD2'],
  2: ['2AB1', '2AB2', '2CD1', '2CD2'],
  3: ['3AB1', '3AB2', '3CD1', '3CD2'],
};

export const POTS_PER_AREA = 75;

// Product Grade Constraints
export const PRODUCT_CONSTRAINTS: Record<ProductGrade, ProductConstraints> = {
  'PFA-NT': { maxFe: 0.075, maxSi: 0.05 },
  'Wire Rod H-EC': { maxFe: 0.100, maxSi: 0.05 },
  'Billet': { maxFe: 0.100, maxSi: 0.10 },
  'P1020': { maxFe: 0.100, maxSi: 0.10 },
};

export const PRODUCT_COLORS: Record<ProductGrade, string> = {
  'PFA-NT': 'bg-purple-500',
  'Wire Rod H-EC': 'bg-blue-500',
  'Billet': 'bg-teal-500',
  'P1020': 'bg-slate-500',
};

// Crucible Configuration (legacy)
export const CRUCIBLE_CONFIG = {
  maxCapacity: 10.5, // MT
  minPotsPerCrucible: 2,
  maxPotsPerCrucible: 6,
  maxSpecialProducts: 4,
  sections: 5,
} as const;

// V2 Task Configuration
export const TASK_CONSTRAINTS = {
  potsPerTask: 4,           // Exactly 4 pots per task
  maxTasksPerShift: 7,      // Max 7 tasks per shift
  maxPotsPerShift: 28,      // 7 × 4 = 28
  maxWeight: 10.5,          // MT per task
  avgWeightPerPot: 2.5,     // MT average weight per pot
  avgWeightPerTask: 10,     // MT (for calculations)
} as const;

// Product Grade Info for UI
export const PRODUCT_GRADE_INFO: Record<ProductGrade, { label: string; shortLabel: string; priority: number }> = {
  'PFA-NT': { label: 'PFA-NT (Premium)', shortLabel: 'PFA', priority: 1 },
  'Wire Rod H-EC': { label: 'Wire Rod H-EC', shortLabel: 'Wire', priority: 2 },
  'Billet': { label: 'Billet', shortLabel: 'Billet', priority: 3 },
  'P1020': { label: 'P1020 (Standard)', shortLabel: 'P1020', priority: 4 },
};

// Chart Colors
export const CHART_COLORS = {
  fe: '#ef4444',
  si: '#f97316',
  temperature: '#3b82f6',
  voltage: '#22c55e',
  aiScore: '#8b5cf6',
} as const;

// Alert Type Labels
export const ALERT_TYPE_LABELS: Record<string, string> = {
  fe_high: 'High Iron Content',
  si_high: 'High Silicon Content',
  temp_high: 'High Temperature',
  temp_low: 'Low Temperature',
  voltage_spike: 'Voltage Anomaly',
  ae_frequency: 'Anode Effect Frequency',
  prediction: 'AI Prediction Alert',
};
