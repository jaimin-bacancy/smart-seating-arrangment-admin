import React, { useState } from 'react';
import FloorPlanEditor from '../components/office/FloorPlanEditor';
import ZoneManager from '../components/office/ZoneManager';
import useCollection from '../hooks/useCollection';
import { firestore } from '../config/firebaseConfig';
import { Floor, OfficeLayout, Zone, ZoneType } from '../types';
import { WithId } from '../types/firebase';

const OfficeLayoutPage: React.FC = () => {
  // State for selected layout and floor
  const [selectedLayoutId, setSelectedLayoutId] = useState<string | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  
  // Fetch office layouts and floors
  const { documents: layouts } = useCollection<OfficeLayout>('office_layouts');
  const { documents: floors } = useCollection<Floor>(
    'floors',
    selectedLayoutId ? [{ field: 'layoutId', operator: '==', value: selectedLayoutId }] : []
  );

  // Save floor plan changes
  const handleSaveFloorPlan = () => {
    // In a real app, this would save changes to the floor plan
    alert('Floor plan saved successfully');
  };

  // Reset floor plan changes
  const handleResetFloorPlan = () => {
    // In a real app, this would reset to the last saved version
    if (confirm('Are you sure you want to reset? All unsaved changes will be lost.')) {
      alert('Floor plan reset to last saved version');
    }
  };

  // Add a new zone
  const handleAddZone = async (name: string, type: ZoneType, color: string) => {
    if (!selectedFloorId) return;
    
    try {
      const floorRef = firestore.collection('floors').doc(selectedFloorId);
      
      // Create the new zone
      const zoneRef = await firestore.collection('zones').add({
        name,
        floorId: floorRef,
        type,
        color,
        seats: [],
        createdAt: firestore.Timestamp.now()
      });
      
      // Update the floor's zones array
      await floorRef.update({
        zones: firestore.FieldValue.arrayUnion(zoneRef)
      });
      
      alert(`Zone "${name}" created successfully`);
    } catch (error) {
      console.error('Error creating zone:', error);
      alert('Failed to create zone');
    }
  };

  // Edit an existing zone
  const handleEditZone = (zone: WithId<Zone>) => {
    // In a real app, this would open a modal or form to edit the zone
    alert(`Editing zone "${zone.name}"`);
  };

  // Delete a zone
  const handleDeleteZone = async (zoneId: string) => {
    if (!selectedFloorId || !confirm('Are you sure you want to delete this zone?')) {
      return;
    }
    
    try {
      const zoneRef = firestore.collection('zones').doc(zoneId);
      const floorRef = firestore.collection('floors').doc(selectedFloorId);
      
      // Remove the zone from the floor's zones array
      await floorRef.update({
        zones: firestore.FieldValue.arrayRemove(zoneRef)
      });
      
      // Delete the zone
      await zoneRef.delete();
      
      alert('Zone deleted successfully');
    } catch (error) {
      console.error('Error deleting zone:', error);
      alert('Failed to delete zone');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Office Layout Management</h2>
      
      {/* Layout and Floor Selection */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Layout:</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedLayoutId || ''}
              onChange={(e) => {
                setSelectedLayoutId(e.target.value || null);
                setSelectedFloorId(null); // Reset floor when layout changes
              }}
            >
              <option value="">-- Select a Layout --</option>
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>
                  {layout.name} {layout.isActive ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Select Floor:</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedFloorId || ''}
              onChange={(e) => setSelectedFloorId(e.target.value || null)}
              disabled={!selectedLayoutId}
            >
              <option value="">-- Select a Floor --</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name} (Level {floor.level})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Floor Plan Editor */}
      {selectedFloorId && (
        <FloorPlanEditor 
          onSave={handleSaveFloorPlan}
          onReset={handleResetFloorPlan}
        />
      )}
      
      {/* Zone Management and Seat Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ZoneManager 
          floorId={selectedFloorId}
          onAddZone={handleAddZone}
          onEditZone={handleEditZone}
          onDeleteZone={handleDeleteZone}
        />
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-4">Seat Properties</h3>
          <div className="border border-gray-200 rounded p-4 h-64 overflow-y-auto">
            {selectedFloorId ? (
              <p className="text-gray-400">Configure seat types and attributes</p>
            ) : (
              <p className="text-gray-400 text-center">Select a floor to manage seats</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeLayoutPage;
