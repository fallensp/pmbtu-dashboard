import { create } from 'zustand';
import type { RiskLevel, AlertSeverity, AlertStatus } from '@/types';

interface PotFiltersState {
  phase: number | null;
  areas: string[];
  riskLevels: RiskLevel[];
  searchQuery: string;
  setPhase: (phase: number | null) => void;
  toggleArea: (area: string) => void;
  setAreas: (areas: string[]) => void;
  toggleRiskLevel: (level: RiskLevel) => void;
  setRiskLevels: (levels: RiskLevel[]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export const usePotFilters = create<PotFiltersState>((set) => ({
  phase: null,
  areas: [],
  riskLevels: [],
  searchQuery: '',
  setPhase: (phase) => set({ phase, areas: [] }),
  toggleArea: (area) => set((state) => ({
    areas: state.areas.includes(area)
      ? state.areas.filter(a => a !== area)
      : [...state.areas, area]
  })),
  setAreas: (areas) => set({ areas }),
  toggleRiskLevel: (level) => set((state) => ({
    riskLevels: state.riskLevels.includes(level)
      ? state.riskLevels.filter(l => l !== level)
      : [...state.riskLevels, level]
  })),
  setRiskLevels: (riskLevels) => set({ riskLevels }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  resetFilters: () => set({
    phase: null,
    areas: [],
    riskLevels: [],
    searchQuery: '',
  }),
}));

interface AlertFiltersState {
  severity: AlertSeverity[];
  status: AlertStatus[];
  phase: number | null;
  dateStart: Date | null;
  dateEnd: Date | null;
  toggleSeverity: (severity: AlertSeverity) => void;
  toggleStatus: (status: AlertStatus) => void;
  setPhase: (phase: number | null) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  resetFilters: () => void;
}

export const useAlertFilters = create<AlertFiltersState>((set) => ({
  severity: [],
  status: [],
  phase: null,
  dateStart: null,
  dateEnd: null,
  toggleSeverity: (sev) => set((state) => ({
    severity: state.severity.includes(sev)
      ? state.severity.filter(s => s !== sev)
      : [...state.severity, sev]
  })),
  toggleStatus: (st) => set((state) => ({
    status: state.status.includes(st)
      ? state.status.filter(s => s !== st)
      : [...state.status, st]
  })),
  setPhase: (phase) => set({ phase }),
  setDateRange: (dateStart, dateEnd) => set({ dateStart, dateEnd }),
  resetFilters: () => set({
    severity: [],
    status: [],
    phase: null,
    dateStart: null,
    dateEnd: null,
  }),
}));

interface SelectionState {
  selectedPotId: string | null;
  selectedPots: string[];
  setSelectedPot: (id: string | null) => void;
  togglePotSelection: (id: string) => void;
  clearPotSelection: () => void;
  addPots: (ids: string[]) => void;
}

export const useSelection = create<SelectionState>((set) => ({
  selectedPotId: null,
  selectedPots: [],
  setSelectedPot: (selectedPotId) => set({ selectedPotId }),
  togglePotSelection: (id) => set((state) => ({
    selectedPots: state.selectedPots.includes(id)
      ? state.selectedPots.filter(p => p !== id)
      : [...state.selectedPots, id]
  })),
  clearPotSelection: () => set({ selectedPots: [] }),
  addPots: (ids) => set((state) => ({
    selectedPots: [...new Set([...state.selectedPots, ...ids])]
  })),
}));
