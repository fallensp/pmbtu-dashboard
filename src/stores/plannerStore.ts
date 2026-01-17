import { create } from 'zustand';
import type {
  ProductGrade,
  ProductRequest,
  TaskV2,
  TaskPotDetail,
  ShiftSummary,
  FulfillmentStatus,
  TaskStatus
} from '@/types';
import { TASK_CONSTRAINTS, PRODUCT_CONSTRAINTS, PRODUCT_GRADE_INFO } from '@/data/constants';
import { getPots } from '@/data/generators';

const PRODUCT_GRADES: ProductGrade[] = ['PFA-NT', 'Wire Rod H-EC', 'Billet', 'P1020'];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function calculateTasksNeeded(targetMT: number): number {
  if (targetMT <= 0) return 0;
  return Math.ceil(targetMT / TASK_CONSTRAINTS.avgWeightPerTask);
}

function calculateFulfillmentStatus(tasksNeeded: number, tasksAssigned: number): FulfillmentStatus {
  if (tasksAssigned === 0) return 'pending';
  if (tasksAssigned < tasksNeeded) return 'partial';
  if (tasksAssigned > tasksNeeded) return 'exceeded';
  return 'fulfilled';
}

function calculateBlendedChemistry(potDetails: TaskPotDetail[]): { fe: number; si: number } {
  if (potDetails.length === 0) return { fe: 0, si: 0 };

  const totalWeight = potDetails.reduce((sum, p) => sum + p.estimatedWeight, 0);
  if (totalWeight === 0) return { fe: 0, si: 0 };

  const weightedFe = potDetails.reduce((sum, p) => sum + p.fe * p.estimatedWeight, 0) / totalWeight;
  const weightedSi = potDetails.reduce((sum, p) => sum + p.si * p.estimatedWeight, 0) / totalWeight;

  return {
    fe: Number(weightedFe.toFixed(4)),
    si: Number(weightedSi.toFixed(4)),
  };
}

function validateTaskConstraints(
  task: TaskV2,
  productGrade: ProductGrade
): { passes: boolean; messages: string[] } {
  const messages: string[] = [];
  const constraints = PRODUCT_CONSTRAINTS[productGrade];

  // Check pot count
  if (task.pots.length !== TASK_CONSTRAINTS.potsPerTask) {
    messages.push(`Requires exactly ${TASK_CONSTRAINTS.potsPerTask} pots (has ${task.pots.length})`);
  }

  // Check Fe constraint
  if (task.blendedFe > constraints.maxFe) {
    messages.push(`Fe ${task.blendedFe.toFixed(3)}% exceeds max ${constraints.maxFe}%`);
  }

  // Check Si constraint
  if (task.blendedSi > constraints.maxSi) {
    messages.push(`Si ${task.blendedSi.toFixed(3)}% exceeds max ${constraints.maxSi}%`);
  }

  // Check weight
  if (task.totalWeight > TASK_CONSTRAINTS.maxWeight) {
    messages.push(`Weight ${task.totalWeight.toFixed(1)} MT exceeds max ${TASK_CONSTRAINTS.maxWeight} MT`);
  }

  return {
    passes: messages.length === 0,
    messages,
  };
}

function getTaskStatus(task: TaskV2): TaskStatus {
  if (task.pots.length < TASK_CONSTRAINTS.potsPerTask) return 'incomplete';
  if (!task.passesConstraints) return 'draft';
  return 'ready';
}

function calculateShiftSummary(tasks: TaskV2[], _requests: ProductRequest[]): ShiftSummary {
  const tasksByGrade: Record<ProductGrade, number> = {
    'PFA-NT': 0,
    'Wire Rod H-EC': 0,
    'Billet': 0,
    'P1020': 0,
  };

  tasks.forEach(task => {
    tasksByGrade[task.productGrade]++;
  });

  const totalTasks = tasks.length;
  const totalPots = tasks.reduce((sum, t) => sum + t.pots.length, 0);
  const totalWeight = tasks.reduce((sum, t) => sum + t.totalWeight, 0);

  return {
    totalTasks,
    maxTasks: TASK_CONSTRAINTS.maxTasksPerShift,
    totalPots,
    maxPots: TASK_CONSTRAINTS.maxPotsPerShift,
    totalWeight: Number(totalWeight.toFixed(1)),
    tasksByGrade,
    isOverLimit: totalTasks > TASK_CONSTRAINTS.maxTasksPerShift,
  };
}

interface PlannerStore {
  // State
  date: Date;
  shift: 'AM' | 'PM';
  productRequests: ProductRequest[];
  tasks: TaskV2[];
  shiftSummary: ShiftSummary;
  editingTaskId: string | null;

  // Actions
  setDate: (date: Date) => void;
  setShift: (shift: 'AM' | 'PM') => void;
  setProductRequest: (grade: ProductGrade, targetMT: number) => void;
  clearAllRequests: () => void;
  aiAutoFillAll: () => void;
  addTask: (grade: ProductGrade) => void;
  removeTask: (taskId: string) => void;
  setTaskPots: (taskId: string, potIds: string[]) => void;
  addPotToTask: (taskId: string, potId: string) => void;
  removePotFromTask: (taskId: string, potId: string) => void;
  setEditingTask: (taskId: string | null) => void;
  clearAllTasks: () => void;
  recalculateSummary: () => void;
}

function createInitialRequests(): ProductRequest[] {
  return PRODUCT_GRADES.map(grade => ({
    id: generateId(),
    productGrade: grade,
    targetMT: 0,
    tasksNeeded: 0,
    tasksAssigned: 0,
    fulfillmentStatus: 'pending' as FulfillmentStatus,
  }));
}

function createInitialSummary(): ShiftSummary {
  return {
    totalTasks: 0,
    maxTasks: TASK_CONSTRAINTS.maxTasksPerShift,
    totalPots: 0,
    maxPots: TASK_CONSTRAINTS.maxPotsPerShift,
    totalWeight: 0,
    tasksByGrade: { 'PFA-NT': 0, 'Wire Rod H-EC': 0, 'Billet': 0, 'P1020': 0 },
    isOverLimit: false,
  };
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  date: new Date(),
  shift: 'PM',
  productRequests: createInitialRequests(),
  tasks: [],
  shiftSummary: createInitialSummary(),
  editingTaskId: null,

  setDate: (date) => set({ date }),

  setShift: (shift) => set({ shift }),

  setProductRequest: (grade, targetMT) => {
    set((state) => {
      const requests = state.productRequests.map(req => {
        if (req.productGrade !== grade) return req;

        const tasksNeeded = calculateTasksNeeded(targetMT);
        return {
          ...req,
          targetMT,
          tasksNeeded,
          fulfillmentStatus: calculateFulfillmentStatus(tasksNeeded, req.tasksAssigned),
        };
      });

      return { productRequests: requests };
    });
  },

  clearAllRequests: () => {
    set({
      productRequests: createInitialRequests(),
      tasks: [],
      shiftSummary: createInitialSummary(),
    });
  },

  aiAutoFillAll: () => {
    const { productRequests } = get();
    const allPots = getPots();

    // Get eligible pots (not shutdown, not critical)
    const eligiblePots = allPots.filter(p =>
      p.riskLevel !== 'shutdown' &&
      p.riskLevel !== 'critical'
    );

    // Sort eligible pots by AI score (best first)
    const sortedPots = [...eligiblePots].sort((a, b) => b.aiScore - a.aiScore);

    const usedPotIds = new Set<string>();
    const newTasks: TaskV2[] = [];
    let taskCount = 0;

    // Process requests by priority (PFA-NT first, P1020 last)
    const sortedRequests = [...productRequests]
      .filter(r => r.tasksNeeded > 0)
      .sort((a, b) =>
        PRODUCT_GRADE_INFO[a.productGrade].priority -
        PRODUCT_GRADE_INFO[b.productGrade].priority
      );

    for (const request of sortedRequests) {
      const constraints = PRODUCT_CONSTRAINTS[request.productGrade];

      // Find pots that meet this grade's chemistry requirements
      const gradePots = sortedPots.filter(p =>
        !usedPotIds.has(p.id) &&
        p.metrics.fe <= constraints.maxFe &&
        p.metrics.si <= constraints.maxSi
      );

      // Create tasks for this grade
      const tasksToCreate = Math.min(
        request.tasksNeeded,
        TASK_CONSTRAINTS.maxTasksPerShift - taskCount,
        Math.floor(gradePots.length / TASK_CONSTRAINTS.potsPerTask)
      );

      for (let i = 0; i < tasksToCreate; i++) {
        const taskPots = gradePots.slice(
          i * TASK_CONSTRAINTS.potsPerTask,
          (i + 1) * TASK_CONSTRAINTS.potsPerTask
        );

        if (taskPots.length < TASK_CONSTRAINTS.potsPerTask) break;

        taskPots.forEach(p => usedPotIds.add(p.id));

        const potDetails: TaskPotDetail[] = taskPots.map(p => ({
          potId: p.id,
          fe: p.metrics.fe,
          si: p.metrics.si,
          aiScore: p.aiScore,
          estimatedWeight: TASK_CONSTRAINTS.avgWeightPerPot,
        }));

        const { fe, si } = calculateBlendedChemistry(potDetails);
        const totalWeight = Number((potDetails.length * TASK_CONSTRAINTS.avgWeightPerPot).toFixed(1));

        const task: TaskV2 = {
          id: `T-${String(taskCount + 1).padStart(3, '0')}`,
          productGrade: request.productGrade,
          pots: taskPots.map(p => p.id),
          potDetails,
          totalWeight,
          blendedFe: fe,
          blendedSi: si,
          status: 'draft',
          passesConstraints: false,
          constraintMessages: [],
        };

        const validation = validateTaskConstraints(task, request.productGrade);
        task.passesConstraints = validation.passes;
        task.constraintMessages = validation.messages;
        task.status = getTaskStatus(task);

        newTasks.push(task);
        taskCount++;

        if (taskCount >= TASK_CONSTRAINTS.maxTasksPerShift) break;
      }

      if (taskCount >= TASK_CONSTRAINTS.maxTasksPerShift) break;
    }

    // Update requests with assigned task counts
    const updatedRequests = productRequests.map(req => {
      const assigned = newTasks.filter(t => t.productGrade === req.productGrade).length;
      return {
        ...req,
        tasksAssigned: assigned,
        fulfillmentStatus: calculateFulfillmentStatus(req.tasksNeeded, assigned),
      };
    });

    set({
      tasks: newTasks,
      productRequests: updatedRequests,
      shiftSummary: calculateShiftSummary(newTasks, updatedRequests),
    });
  },

  addTask: (grade) => {
    const { tasks } = get();

    if (tasks.length >= TASK_CONSTRAINTS.maxTasksPerShift) return;

    const newTask: TaskV2 = {
      id: `T-${String(tasks.length + 1).padStart(3, '0')}`,
      productGrade: grade,
      pots: [],
      potDetails: [],
      totalWeight: 0,
      blendedFe: 0,
      blendedSi: 0,
      status: 'incomplete',
      passesConstraints: false,
      constraintMessages: [`Requires exactly ${TASK_CONSTRAINTS.potsPerTask} pots (has 0)`],
    };

    set((state) => {
      const newTasks = [...state.tasks, newTask];
      const updatedRequests = state.productRequests.map(req => {
        if (req.productGrade !== grade) return req;
        const assigned = newTasks.filter(t => t.productGrade === grade).length;
        return {
          ...req,
          tasksAssigned: assigned,
          fulfillmentStatus: calculateFulfillmentStatus(req.tasksNeeded, assigned),
        };
      });

      return {
        tasks: newTasks,
        productRequests: updatedRequests,
        shiftSummary: calculateShiftSummary(newTasks, updatedRequests),
        editingTaskId: newTask.id,
      };
    });
  },

  removeTask: (taskId) => {
    set((state) => {
      const taskToRemove = state.tasks.find(t => t.id === taskId);
      if (!taskToRemove) return state;

      const newTasks = state.tasks.filter(t => t.id !== taskId);
      const updatedRequests = state.productRequests.map(req => {
        if (req.productGrade !== taskToRemove.productGrade) return req;
        const assigned = newTasks.filter(t => t.productGrade === req.productGrade).length;
        return {
          ...req,
          tasksAssigned: assigned,
          fulfillmentStatus: calculateFulfillmentStatus(req.tasksNeeded, assigned),
        };
      });

      return {
        tasks: newTasks,
        productRequests: updatedRequests,
        shiftSummary: calculateShiftSummary(newTasks, updatedRequests),
        editingTaskId: state.editingTaskId === taskId ? null : state.editingTaskId,
      };
    });
  },

  setTaskPots: (taskId, potIds) => {
    const allPots = getPots();

    set((state) => {
      const newTasks = state.tasks.map(task => {
        if (task.id !== taskId) return task;

        const selectedPots = potIds
          .map(id => allPots.find(p => p.id === id))
          .filter(Boolean) as typeof allPots;

        const potDetails: TaskPotDetail[] = selectedPots.map(p => ({
          potId: p.id,
          fe: p.metrics.fe,
          si: p.metrics.si,
          aiScore: p.aiScore,
          estimatedWeight: TASK_CONSTRAINTS.avgWeightPerPot,
        }));

        const { fe, si } = calculateBlendedChemistry(potDetails);
        const totalWeight = Number((potDetails.length * TASK_CONSTRAINTS.avgWeightPerPot).toFixed(1));

        const updatedTask: TaskV2 = {
          ...task,
          pots: potIds,
          potDetails,
          totalWeight,
          blendedFe: fe,
          blendedSi: si,
          passesConstraints: false,
          constraintMessages: [],
          status: 'draft',
        };

        const validation = validateTaskConstraints(updatedTask, task.productGrade);
        updatedTask.passesConstraints = validation.passes;
        updatedTask.constraintMessages = validation.messages;
        updatedTask.status = getTaskStatus(updatedTask);

        return updatedTask;
      });

      return {
        tasks: newTasks,
        shiftSummary: calculateShiftSummary(newTasks, state.productRequests),
      };
    });
  },

  addPotToTask: (taskId, potId) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.pots.length >= TASK_CONSTRAINTS.potsPerTask) return;

    const newPotIds = [...task.pots, potId];
    get().setTaskPots(taskId, newPotIds);
  },

  removePotFromTask: (taskId, potId) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newPotIds = task.pots.filter(id => id !== potId);
    get().setTaskPots(taskId, newPotIds);
  },

  setEditingTask: (taskId) => set({ editingTaskId: taskId }),

  clearAllTasks: () => {
    set((state) => {
      const updatedRequests = state.productRequests.map(req => ({
        ...req,
        tasksAssigned: 0,
        fulfillmentStatus: calculateFulfillmentStatus(req.tasksNeeded, 0),
      }));

      return {
        tasks: [],
        productRequests: updatedRequests,
        shiftSummary: createInitialSummary(),
        editingTaskId: null,
      };
    });
  },

  recalculateSummary: () => {
    set((state) => ({
      shiftSummary: calculateShiftSummary(state.tasks, state.productRequests),
    }));
  },
}));

// Helper functions for components
export function getEligiblePotsForGrade(grade: ProductGrade, excludePotIds: string[] = []) {
  const allPots = getPots();
  const constraints = PRODUCT_CONSTRAINTS[grade];

  return allPots
    .filter(p =>
      p.riskLevel !== 'shutdown' &&
      p.riskLevel !== 'critical' &&
      p.metrics.fe <= constraints.maxFe &&
      p.metrics.si <= constraints.maxSi &&
      !excludePotIds.includes(p.id)
    )
    .sort((a, b) => b.aiScore - a.aiScore);
}

export function getTotalTasksNeeded(requests: ProductRequest[]): number {
  return requests.reduce((sum, r) => sum + r.tasksNeeded, 0);
}
