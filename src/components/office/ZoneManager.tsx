import React from 'react';
import { Zone, ZoneType } from '../../types';
import { WithId } from '../../types/firebase';
import useCollection from '../../hooks/useCollection';

interface ZoneManagerProps {
  floorId: string | null;
  onAddZone: (zoneName: string, zoneType: ZoneType, color: string) => void;
  onEditZone: (zone: WithId<Zone>) => void;
  onDeleteZone: (zoneId: string) => void;
}

const ZoneManager: React.FC<ZoneManagerProps> = ({
  floorId,
  onAddZone,
  onEditZone,
  onDeleteZone
}) => {
  // State for the new zone form
  const [newZoneName, setNewZoneName] = React.useState('');
  const [newZoneType, setNewZoneType] = React.useState<ZoneType>('team_area');
  const [newZoneColor, setNewZoneColor] = React.useState('#4C6EF5');

  // Fetch zones for the selected floor
  const { documents: zones } = useCollection<Zone>(
    'zones',
    floorId ? [{ field: 'floorId', operator: '==', value: floorId }] : []
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newZoneName.trim() && floorId) {
      onAddZone(newZoneName, newZoneType, newZoneColor);
      // Reset form
      setNewZoneName('');
      setNewZoneType('team_area');
      setNewZoneColor('#4C6EF5');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Zone Management</h3>
      
      {floorId ? (
        <div className="space-y-4">
          {/* Zone List */}
          <div className="border border-gray-200 rounded p-4 h-48 overflow-y-auto">
            {zones.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {zones.map(zone => (
                  <li key={zone.id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: zone.color }}
                        ></span>
                        <span>{zone.name}</span>
                        <span className="ml-2 text-xs text-gray-500">({zone.type})</span>
                      </div>
                      <div>
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm mr-2"
                          onClick={() => onEditZone(zone)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800 text-sm"
                          onClick={() => onDeleteZone(zone.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center">No zones created yet</p>
            )}
          </div>
          
          {/* Add Zone Form */}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Zone Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zone Type</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={newZoneType}
                  onChange={(e) => setNewZoneType(e.target.value as ZoneType)}
                >
                  <option value="team_area">Team Area</option>
                  <option value="meeting">Meeting Room</option>
                  <option value="break_room">Break Room</option>
                  <option value="quiet_area">Quiet Area</option>
                  <option value="collaboration">Collaboration Space</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zone Color</label>
                <input 
                  type="color" 
                  className="w-full p-1 border rounded h-10"
                  value={newZoneColor}
                  onChange={(e) => setNewZoneColor(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  Add Zone
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <p className="text-gray-400 text-center">Select a floor to manage zones</p>
      )}
    </div>
  );
};

export default ZoneManager;
