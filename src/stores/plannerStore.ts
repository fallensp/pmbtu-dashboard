import { create } from 'zustand';
import type { CrucibleV2, PotAssignment, ProductGrade, ShiftType, Order } from '@/types';
import { GRADE_CONSTRAINTS, CRUCIBLE_CONSTRAINTS } from '@/data/constants';

interface PlannerStore {
  // State
  selectedDate: string;
  selectedShift: ShiftType;
  crucibles: CrucibleV2[];
  orders: Order[];
  selectedCrucibleId: string | null;
  isEditOrdersModalOpen: boolean;
  isPotSelectorModalOpen: boolean;

  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedShift: (shift: ShiftType) => void;
  setCrucibles: (crucibles: CrucibleV2[]) => void;
  setOrders: (orders: Order[]) => void;

  // Crucible Actions
  addCrucible: (targetGrade: ProductGrade) => void;
  removeCrucible: (crucibleId: string) => void;
  updateCrucible: (crucibleId: string, updates: Partial<CrucibleV2>) => void;
  clearAllCrucibles: () => void;

  // Pot Assignment Actions
  addPotToCrucible: (crucibleId: string, pot: PotAssignment) => void;
  removePotFromCrucible: (crucibleId: string, potId: string) => void;
  selectCrucible: (crucibleId: string | null) => void;

  // Modal Actions
  openEditOrdersModal: () => void;
  closeEditOrdersModal: () => void;
  openPotSelectorModal: (crucibleId: string) => void;
  closePotSelectorModal: () => void;

  // Order Actions
  updateOrderQuantity: (orderId: string, quantity: number) => void;
}

function calculateBlendedValues(pots: PotAssignment[]) {
  if (pots.length === 0) {
    return { blendedFe: 0, blendedSi: 0, blendedVn: 0, blendedCr: 0, blendedNi: 0, totalWeight: 0 };
  }

  const totalWeight = pots.reduce((sum, p) => sum + p.weight, 0);
  const blendedFe = pots.reduce((sum, p) => sum + p.fe * p.weight, 0) / totalWeight;
  const blendedSi = pots.reduce((sum, p) => sum + p.si * p.weight, 0) / totalWeight;
  const blendedVn = pots.reduce((sum, p) => sum + p.vn * p.weight, 0) / totalWeight;
  const blendedCr = pots.reduce((sum, p) => sum + p.cr * p.weight, 0) / totalWeight;
  const blendedNi = pots.reduce((sum, p) => sum + p.ni * p.weight, 0) / totalWeight;

  return {
    blendedFe: Number(blendedFe.toFixed(4)),
    blendedSi: Number(blendedSi.toFixed(4)),
    blendedVn: Number(blendedVn.toFixed(4)),
    blendedCr: Number(blendedCr.toFixed(4)),
    blendedNi: Number(blendedNi.toFixed(4)),
    totalWeight: Number(totalWeight.toFixed(2)),
  };
}

function validateConstraints(crucible: CrucibleV2): { constraintsMet: boolean; constraintViolations: string[] } {
  const constraints = GRADE_CONSTRAINTS[crucible.targetGrade];
  const violations: string[] = [];

  if (crucible.blendedFe > constraints.maxFe) {
    violations.push(`Fe ${crucible.blendedFe.toFixed(3)} exceeds max ${constraints.maxFe}`);
  }
  if (crucible.blendedSi > constraints.maxSi) {
    violations.push(`Si ${crucible.blendedSi.toFixed(3)} exceeds max ${constraints.maxSi}`);
  }
  if (crucible.totalWeight > CRUCIBLE_CONSTRAINTS.maxWeight) {
    violations.push(`Weight ${crucible.totalWeight} MT exceeds max ${CRUCIBLE_CONSTRAINTS.maxWeight} MT`);
  }
  if (crucible.pots.length < CRUCIBLE_CONSTRAINTS.minPots && crucible.pots.length > 0) {
    violations.push(`Minimum ${CRUCIBLE_CONSTRAINTS.minPots} pots required`);
  }
  if (crucible.pots.length > CRUCIBLE_CONSTRAINTS.maxPots) {
    violations.push(`Maximum ${CRUCIBLE_CONSTRAINTS.maxPots} pots allowed`);
  }

  return { constraintsMet: violations.length === 0, constraintViolations: violations };
}

let crucibleCounter = 1;

export const usePlannerStore = create<PlannerStore>((set) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  selectedShift: 'PM',
  crucibles: [],
  orders: [],
  selectedCrucibleId: null,
  isEditOrdersModalOpen: false,
  isPotSelectorModalOpen: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedShift: (shift) => set({ selectedShift: shift }),
  setCrucibles: (crucibles) => set({ crucibles }),
  setOrders: (orders) => set({ orders }),

  addCrucible: (targetGrade) => {
    const newCrucible: CrucibleV2 = {
      id: `C-${String(crucibleCounter++).padStart(3, '0')}`,
      targetGrade,
      pots: [],
      totalWeight: 0,
      blendedFe: 0,
      blendedSi: 0,
      blendedVn: 0,
      blendedCr: 0,
      blendedNi: 0,
      constraintsMet: false,
      constraintViolations: ['Minimum 2 pots required'],
    };
    set((state) => ({ crucibles: [...state.crucibles, newCrucible] }));
  },

  removeCrucible: (crucibleId) => {
    set((state) => ({
      crucibles: state.crucibles.filter((c) => c.id !== crucibleId),
      selectedCrucibleId: state.selectedCrucibleId === crucibleId ? null : state.selectedCrucibleId,
    }));
  },

  updateCrucible: (crucibleId, updates) => {
    set((state) => ({
      crucibles: state.crucibles.map((c) =>
        c.id === crucibleId ? { ...c, ...updates } : c
      ),
    }));
  },

  clearAllCrucibles: () => {
    set({ crucibles: [], selectedCrucibleId: null });
    crucibleCounter = 1;
  },

  addPotToCrucible: (crucibleId, pot) => {
    set((state) => {
      const crucibles = state.crucibles.map((c) => {
        if (c.id !== crucibleId) return c;

        // Check if pot already exists
        if (c.pots.some((p) => p.potId === pot.potId)) return c;

        const newPots = [...c.pots, pot];
        const blended = calculateBlendedValues(newPots);
        const updatedCrucible = { ...c, pots: newPots, ...blended };
        const validation = validateConstraints(updatedCrucible);

        return { ...updatedCrucible, ...validation };
      });

      return { crucibles };
    });
  },

  removePotFromCrucible: (crucibleId, potId) => {
    set((state) => {
      const crucibles = state.crucibles.map((c) => {
        if (c.id !== crucibleId) return c;

        const newPots = c.pots.filter((p) => p.potId !== potId);
        const blended = calculateBlendedValues(newPots);
        const updatedCrucible = { ...c, pots: newPots, ...blended };
        const validation = validateConstraints(updatedCrucible);

        return { ...updatedCrucible, ...validation };
      });

      return { crucibles };
    });
  },

  selectCrucible: (crucibleId) => set({ selectedCrucibleId: crucibleId }),

  openEditOrdersModal: () => set({ isEditOrdersModalOpen: true }),
  closeEditOrdersModal: () => set({ isEditOrdersModalOpen: false }),

  openPotSelectorModal: (crucibleId) => set({
    isPotSelectorModalOpen: true,
    selectedCrucibleId: crucibleId,
  }),
  closePotSelectorModal: () => set({ isPotSelectorModalOpen: false }),

  updateOrderQuantity: (orderId, quantity) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, targetQuantity: quantity } : o
      ),
    }));
  },
}));
