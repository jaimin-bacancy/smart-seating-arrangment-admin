import { arrayRemove, arrayUnion, doc, Timestamp } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import FloorPlanEditor from "../components/office/FloorPlanEditor";
import { firestore } from "../config/firebaseConfig";
import { useUI } from "../contexts/UIContext";
import useCollection from "../hooks/useCollection";
import { FloorService } from "../services/floors";
import { LayoutService } from "../services/layouts";
import { OfficeLayout, Zone, ZoneType } from "../types";
import { WithId } from "../types/firebase";

import { useAuth as useAuthContext } from "../contexts/AuthContext";

const OfficeLayoutPage: React.FC = () => {
  const auth = useAuthContext(); // Get the
  // State for selected layout and floor
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const layoutInitialized = React.useRef(false);
  const floorInitialized = React.useRef(false);

  // UI context
  const { showToast } = useUI();

  // Fetch office layouts and floors
  const { documents: layouts, loading: loadingLayouts } =
    useCollection<OfficeLayout>("office_layouts");
  // const { documents: floors, loading: loadingFloors } = useCollection<Floor>(
  //   'floors',
  //   selectedLayoutId ? [{ field: 'layoutId', operator: '==', value: `/office_layouts/${selectedLayoutId}` }] : []
  // );

  const floorQuery = React.useMemo(() => {
    if (!selectedLayoutId) return [];
    return [
      {
        field: "layoutId",
        operator: "==",
        value: doc(firestore, `office_layouts/${selectedLayoutId}`),
      },
    ];
  }, [selectedLayoutId]);

  const { documents: floors, loading: loadingFloors } = useCollection(
    "floors",
    floorQuery
  );

  // Auto-select the first layout and floor if available and none is selected
  // useEffect(() => {
  //   if (!loadingLayouts && layouts.length > 0 && !selectedLayoutId) {
  //     setSelectedLayoutId(layouts[0].id);
  //   }
  // }, [layouts, loadingLayouts, selectedLayoutId]);

  // useEffect(() => {
  //   if (!loadingFloors && floors.length > 0 && !selectedFloorId && selectedLayoutId) {
  //     setSelectedFloorId(floors[0].id);
  //   }
  // }, [floors, loadingFloors, selectedFloorId, selectedLayoutId]);

  useEffect(() => {
    if (
      !layoutInitialized.current &&
      !loadingLayouts &&
      layouts.length > 0 &&
      !selectedLayoutId
    ) {
      setSelectedLayoutId(layouts[0].id);
      layoutInitialized.current = true;
    }
  }, [layouts, loadingLayouts, selectedLayoutId]);

  useEffect(() => {
    if (
      !floorInitialized.current &&
      !loadingFloors &&
      floors.length > 0 &&
      !selectedFloorId &&
      selectedLayoutId
    ) {
      setSelectedFloorId(floors[0].id);
      floorInitialized.current = true;
    }
  }, [floors, loadingFloors, selectedFloorId, selectedLayoutId]);

  // Save floor plan changes
  const handleSaveFloorPlan = () => {
    // In a real app, this would save changes to the floor plan
    showToast("Floor plan saved successfully", "success");
  };

  // Reset floor plan changes
  const handleResetFloorPlan = () => {
    // In a real app, this would reset to the last saved version
    if (
      window.confirm(
        "Are you sure you want to reset? All unsaved changes will be lost."
      )
    ) {
      showToast("Floor plan reset to last saved version", "success");
    }
  };

  // Add a new zone
  const handleAddZone = async (name: string, type: ZoneType, color: string) => {
    if (!selectedFloorId) return;

    try {
      setIsCreating(true);
      const floorRef = firestore.collection("floors").doc(selectedFloorId);

      // Create the new zone
      const zoneRef = await firestore.collection("zones").add({
        name,
        floorId: floorRef,
        type,
        color,
        seats: [],
        createdAt: Timestamp.now(),
      });

      // Update the floor's zones array
      await floorRef.update({
        zones: arrayUnion(zoneRef),
      });

      showToast(`Zone "${name}" created successfully`, "success");
    } catch (error) {
      console.error("Error creating zone:", error);
      showToast("Failed to create zone", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Edit an existing zone
  const handleEditZone = (zone: WithId<Zone>) => {
    // In a real app, this would open a modal or form to edit the zone
    showToast(`Editing zone "${zone.name}"`, "info");
  };

  // Delete a zone
  const handleDeleteZone = async (zoneId: string) => {
    if (
      !selectedFloorId ||
      !confirm("Are you sure you want to delete this zone?")
    ) {
      return;
    }

    try {
      const zoneRef = firestore.collection("zones").doc(zoneId);
      const floorRef = firestore.collection("floors").doc(selectedFloorId);

      // Remove the zone from the floor's zones array
      await floorRef.update({
        zones: arrayRemove(zoneRef),
      });

      // Delete the zone
      await zoneRef.delete();

      showToast("Zone deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting zone:", error);
      showToast("Failed to delete zone", "error");
    }
  };

  // Create a new layout
  const handleCreateLayout = async () => {
    try {
      setIsCreating(true);
      const layoutName = prompt("Enter a name for the new layout:");

      if (!layoutName) return;

      const layoutId = await LayoutService.createLayout(layoutName);
      setSelectedLayoutId(layoutId);
      showToast(`Layout "${layoutName}" created successfully`, "success");
    } catch (error) {
      console.error("Error creating layout:", error);
      showToast("Failed to create layout", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Create a new floor
  const handleCreateFloor = async () => {
    if (!selectedLayoutId) {
      showToast("Please select or create a layout first", "warning");
      return;
    }

    try {
      setIsCreating(true);
      const floorName = prompt("Enter a name for the new floor:");

      if (!floorName) return;

      const floorLevel = parseInt(
        prompt("Enter the floor level (e.g., 1, 2, 3):") || "-1"
      );

      if (floorLevel > -1) {
        const floorId = await FloorService.createFloor(
          floorName,
          floorLevel,
          selectedLayoutId
        );
        setSelectedFloorId(floorId);
        showToast(`Floor "${floorName}" created successfully`, "success");
      }
    } catch (error) {
      console.error("Error creating floor:", error);
      showToast("Failed to create floor", "error");
    } finally {
      setIsCreating(false);
    }
  };

  // Handle seat update
  const handleSeatUpdate = () => {
    // Refresh seat data if needed
    showToast("Seat updated successfully", "success");
  };

  const isEmpty = !loadingLayouts && layouts.length === 0;

  console.log("floors:::", floors);
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Office Layout Management</h2>

        {isEmpty && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleCreateLayout}
            disabled={isCreating}
          >
            Create First Layout
          </button>
        )}
      </div>

      {loadingLayouts || loadingFloors ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading layouts...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            No Office Layouts Found
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first office layout to start managing floors, zones, and
            seats.
          </p>
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleCreateLayout}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create First Layout"}
          </button>
        </div>
      ) : (
        <>
          {/* Layout and Floor Selection */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Layout:
                </label>
                <div className="flex space-x-2">
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedLayoutId || ""}
                    onChange={(e) => {
                      setSelectedLayoutId(e.target.value || null);
                      setSelectedFloorId(null); // Reset floor when layout changes
                    }}
                  >
                    <option value="">-- Select a Layout --</option>
                    {layouts.map((layout) => (
                      <option key={layout.id} value={layout.id}>
                        {layout.name} {layout.isActive ? "(Active)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    onClick={handleCreateLayout}
                    disabled={isCreating}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Floor:
                </label>
                <div className="flex space-x-2">
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedFloorId || ""}
                    onChange={(e) => setSelectedFloorId(e.target.value || null)}
                    disabled={!selectedLayoutId}
                  >
                    <option value="">-- Select a Floor --</option>
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name} (Level {floor.level})
                      </option>
                    ))}
                  </select>
                  <button
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    onClick={handleCreateFloor}
                    disabled={!selectedLayoutId || isCreating}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Floor Plan Editor */}
          {selectedFloorId && (
            <FloorPlanEditor
              selectedFloorId={selectedFloorId}
              currentUserId={auth?.currentUser?.uid}
              onSave={handleSaveFloorPlan}
              onReset={handleResetFloorPlan}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OfficeLayoutPage;
