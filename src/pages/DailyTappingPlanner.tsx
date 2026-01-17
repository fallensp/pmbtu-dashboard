import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderSummaryCards, CrucibleCard, PotSelectorModal } from '@/components/production-v2';
import { usePlannerStore } from '@/stores/plannerStore';
import { mockOrders, mockPotsV2, mockCruciblesV2 } from '@/data/mock';
import { GRADE_CONSTRAINTS } from '@/data/constants';
import type { ProductGrade, ShiftType, PotAssignment } from '@/types';
import {
  Plus,
  Sparkles,
  Trash2,
  Download,
  Printer,
  Save,
  Clock,
  Edit,
} from 'lucide-react';

export function DailyTappingPlanner() {
  const {
    selectedDate,
    selectedShift,
    crucibles,
    orders,
    selectedCrucibleId,
    isEditOrdersModalOpen,
    isPotSelectorModalOpen,
    setSelectedDate,
    setSelectedShift,
    setCrucibles,
    setOrders,
    addCrucible,
    removeCrucible,
    addPotToCrucible,
    removePotFromCrucible,
    openEditOrdersModal,
    closeEditOrdersModal,
    openPotSelectorModal,
    closePotSelectorModal,
    clearAllCrucibles,
  } = usePlannerStore();

  const [addCrucibleGrade, setAddCrucibleGrade] = useState<ProductGrade>('PFA-NT');
  const [editedOrders, setEditedOrders] = useState(orders);

  // Initialize with mock data
  useEffect(() => {
    if (orders.length === 0) {
      setOrders(mockOrders);
    }
    if (crucibles.length === 0) {
      setCrucibles(mockCruciblesV2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get current selected crucible
  const selectedCrucible = crucibles.find((c) => c.id === selectedCrucibleId);

  // Get pots already assigned to any crucible
  const assignedPotIds = useMemo(() => {
    return new Set(crucibles.flatMap((c) => c.pots.map((p) => p.potId)));
  }, [crucibles]);

  // Filter available pots (not already assigned)
  const availablePots = useMemo(() => {
    return mockPotsV2.filter(
      (p) => p.status === 'active' && !assignedPotIds.has(p.id)
    );
  }, [assignedPotIds]);

  // Handle auto-fill for a single crucible
  const handleAutoFillCrucible = (crucibleId: string) => {
    const crucible = crucibles.find((c) => c.id === crucibleId);
    if (!crucible) return;

    const constraints = GRADE_CONSTRAINTS[crucible.targetGrade];
    const eligiblePots = availablePots
      .filter(
        (p) =>
          p.metrics.fe <= constraints.maxFe &&
          p.metrics.si <= constraints.maxSi
      )
      .sort((a, b) => b.aiScore - a.aiScore);

    // Add pots until weight limit or pot limit
    let currentWeight = crucible.totalWeight;
    const potsToAdd: PotAssignment[] = [];

    for (const pot of eligiblePots) {
      if (crucible.pots.length + potsToAdd.length >= 6) break;
      if (currentWeight + pot.weight > 10.5) continue;

      potsToAdd.push({
        potId: pot.id,
        potName: pot.id,
        fe: pot.metrics.fe,
        si: pot.metrics.si,
        vn: pot.metrics.vn,
        cr: pot.metrics.cr,
        ni: pot.metrics.ni,
        weight: pot.weight,
      });
      currentWeight += pot.weight;
    }

    potsToAdd.forEach((pot) => addPotToCrucible(crucibleId, pot));
  };

  // Handle auto-fill all crucibles
  const handleAutoFillAll = () => {
    crucibles.forEach((crucible) => {
      if (crucible.pots.length === 0 || !crucible.constraintsMet) {
        handleAutoFillCrucible(crucible.id);
      }
    });
  };

  // Handle pot selection confirmation
  const handlePotSelectionConfirm = (pots: PotAssignment[]) => {
    if (selectedCrucibleId) {
      pots.forEach((pot) => addPotToCrucible(selectedCrucibleId, pot));
    }
  };

  // Handle edit orders save
  const handleSaveOrders = () => {
    setOrders(editedOrders);
    closeEditOrdersModal();
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Daily Tapping Planner"
        description="V2 - Single page workflow"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save & Submit
            </Button>
          </div>
        }
      />

      {/* Date/Shift Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <Label>Date:</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label>Shift:</Label>
          <Tabs
            value={selectedShift}
            onValueChange={(v) => setSelectedShift(v as ShiftType)}
          >
            <TabsList>
              <TabsTrigger value="PM">PM</TabsTrigger>
              <TabsTrigger value="AM">AM</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Order Summary Cards */}
      <OrderSummaryCards orders={orders} />

      {/* Action Bar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select
                value={addCrucibleGrade}
                onValueChange={(v) => setAddCrucibleGrade(v as ProductGrade)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PFA-NT">PFA-NT</SelectItem>
                  <SelectItem value="Wire Rod H-EC">Wire Rod H-EC</SelectItem>
                  <SelectItem value="Billet">Billet</SelectItem>
                  <SelectItem value="P1020">P1020</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => addCrucible(addCrucibleGrade)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Crucible
              </Button>

              <div className="h-8 w-px bg-gray-200 mx-2" />

              <Button variant="outline" onClick={handleAutoFillAll}>
                <Sparkles className="h-4 w-4 mr-2" />
                AI Auto-Fill All
              </Button>
              <Button variant="outline" onClick={clearAllCrucibles}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>

            <Button variant="outline" onClick={openEditOrdersModal}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Orders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crucible Cards */}
      <div className="space-y-4">
        {crucibles.length === 0 ? (
          <Card className="py-16">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">No crucibles yet</p>
              <p className="text-sm">Add a crucible to start planning</p>
            </div>
          </Card>
        ) : (
          crucibles.map((crucible) => (
            <CrucibleCard
              key={crucible.id}
              crucible={crucible}
              onAddPot={() => openPotSelectorModal(crucible.id)}
              onAutoFill={() => handleAutoFillCrucible(crucible.id)}
              onRemove={() => removeCrucible(crucible.id)}
              onRemovePot={(potId) => removePotFromCrucible(crucible.id, potId)}
            />
          ))
        )}
      </div>

      {/* Footer Actions */}
      {crucibles.length > 0 && (
        <Card className="sticky bottom-4 shadow-lg">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Total Crucibles:</span>
                  <span className="ml-2 font-medium">{crucibles.length}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total Weight:</span>
                  <span className="ml-2 font-medium">
                    {crucibles.reduce((sum, c) => sum + c.totalWeight, 0).toFixed(1)} MT
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Passing:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {crucibles.filter((c) => c.constraintsMet).length}/{crucibles.length}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button
                  disabled={crucibles.some((c) => !c.constraintsMet)}
                >
                  Save & Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pot Selector Modal */}
      {selectedCrucible && (
        <PotSelectorModal
          isOpen={isPotSelectorModalOpen}
          onClose={closePotSelectorModal}
          targetGrade={selectedCrucible.targetGrade}
          availablePots={availablePots}
          selectedPotIds={selectedCrucible.pots.map((p) => p.potId)}
          onConfirm={handlePotSelectionConfirm}
        />
      )}

      {/* Edit Orders Modal */}
      <Dialog open={isEditOrdersModalOpen} onOpenChange={closeEditOrdersModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editedOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4">
                <Label className="w-32">{order.productGrade}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={order.targetQuantity}
                    onChange={(e) =>
                      setEditedOrders(
                        editedOrders.map((o) =>
                          o.id === order.id
                            ? { ...o, targetQuantity: Number(e.target.value) }
                            : o
                        )
                      )
                    }
                    className="w-24"
                  />
                  <span className="text-gray-500">MT</span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditOrdersModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveOrders}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
