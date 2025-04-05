import React from 'react';
import useCollection from '../../hooks/useCollection';
import { Floor, Zone, Seat } from '../../types';
import { firestore } from '../../config/firebaseConfig';
import { arrayRemove, arrayUnion, doc, Timestamp } from 'firebase/firestore';

interface OfficeLayoutMapProps {
  floorId?: string;
  interactive?: boolean;
  height?: string;
}

const OfficeLayoutMap: React.FC<OfficeLayoutMapProps> = ({ 
  floorId = 'eE8pu0AbTzD9AmdAFXeu',
  interactive = false,
  height = "h-64"
}) => {
  console.log('floorId:::', floorId)
  // Fetch zones and seats for the floor
  const { documents: zones, loading: loadingZones } = useCollection<Zone>(
    'zones',
    floorId ? [{ field: 'floorId', operator: '==', value: doc(firestore, `/floors/${floorId}`) }] : []
  );
  
  console.log('zones:::', zones)
  const { documents: seats, loading: loadingSeats } = useCollection<Seat>(
    'seats',
    floorId ? [{ field: 'floorId', operator: '==', value: floorId }] : []
  );

  // Get the floor details if floorId is provided
  const { documents: floors } = useCollection<Floor>(
    'floors',
    floorId ? [{ field: 'id', operator: '==', value: floorId }] : []
  );
  
  const floor = floorId && floors.length > 0 ? floors[0] : null;

  // Check if data is still loading
  const isLoading = (floorId && (loadingZones || loadingSeats));

  // Placeholder for the actual interactive map component
  // In a real application, this would be a more sophisticated component
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-8">
      <h3 className="font-bold mb-4">
        {floor ? `Office Layout: ${floor.name}` : 'Office Layout'}
      </h3>
      <div className={`border border-gray-200 rounded ${height} flex items-center justify-center bg-gray-50`}>
        {isLoading ? (
          <div className="text-gray-400">Loading map...</div>
        ) : floorId ? (
          <div className="text-center">
            <p className="text-gray-500 mb-2">
              {zones.length} zones, {seats.length} seats
            </p>
            <p className="text-gray-400">
              {interactive 
                ? 'Interactive Office Layout Map' 
                : 'Office Layout Preview'}
            </p>
          </div>
        ) : (
          <p className="text-gray-400">Select a floor to view the layout</p>
        )}
      </div>
    </div>
  );
};

export default OfficeLayoutMap;
