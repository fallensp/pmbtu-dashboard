import { create } from 'zustand';
import type { FilterState, RiskLevel } from '@/types';

interface FilterStore extends FilterState {
  setPhase: (phases: (1 | 2 | 3)[]) => void;
  togglePhase: (phase: 1 | 2 | 3) => void;
  setAreas: (areas: string[]) => void;
  toggleArea: (area: string) => void;
  setRiskLevels: (levels: RiskLevel[]) => void;
  toggleRiskLevel: (level: RiskLevel) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  phase: [1, 2, 3],
  areas: [],
  riskLevels: ['critical', 'high', 'moderate', 'normal', 'shutdown'],
  searchQuery: '',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,

  setPhase: (phases) => set({ phase: phases }),

  togglePhase: (phase) =>
    set((state) => ({
      phase: state.phase.includes(phase)
        ? state.phase.filter((p) => p !== phase)
        : [...state.phase, phase],
    })),

  setAreas: (areas) => set({ areas }),

  toggleArea: (area) =>
    set((state) => ({
      areas: state.areas.includes(area)
        ? state.areas.filter((a) => a !== area)
        : [...state.areas, area],
    })),

  setRiskLevels: (levels) => set({ riskLevels: levels }),

  toggleRiskLevel: (level) =>
    set((state) => ({
      riskLevels: state.riskLevels.includes(level)
        ? state.riskLevels.filter((l) => l !== level)
        : [...state.riskLevels, level],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () => set(initialState),
}));
