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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, index) => {
            const floor = 1600 + index + 1;
            const availableSeats = Math.floor(Math.random() * 20) + 1;
            const occupiedSeats = Math.floor(Math.random() * 20) + 1;

            return (
              <div key={index} className="bg-gray-200 p-4 rounded shadow-md">
                <h5 className="font-bold text-lg mb-2">{`Floor: ${floor}`}</h5>
                <p>{`Available Seats: ${availableSeats}`}</p>
                <p>{`Occupied Seats: ${occupiedSeats}`}</p>
              </div>
            );
          })}
        </div>
    </div>
  );
};

export default OfficeLayoutMap;
