import React, { useState, useEffect } from 'react';
import { Seat, SeatType, SeatStatus } from '../../types';
import { firestore } from '../../config/firebaseConfig';
import useCollection from '../../hooks/useCollection';
import { User } from '../../types';
import { WithId } from '../../types/firebase';
import { arrayUnion, Timestamp } from 'firebase/firestore';

interface SeatPropertiesProps {
  floorId: string | null;
  zoneId: string | null;
  selectedSeatId: string | null;
  onSeatUpdate: () => void;
}

const SeatProperties: React.FC<SeatPropertiesProps> = ({
  floorId,
  zoneId,
  selectedSeatId,
  onSeatUpdate
}) => {
  // State for seat properties
  const [seatLabel, setSeatLabel] = useState('');
  const [seatType, setSeatType] = useState<SeatType>('desk');
  const [seatStatus, setSeatStatus] = useState<SeatStatus>('available');
  const [assignedUserId, setAssignedUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch employees for assignment
  const { documents: employees } = useCollection<User>('users');

  // Fetch the selected seat
  const { documents: selectedSeats } = useCollection<Seat>(
    'seats',
    selectedSeatId ? [{ field: 'id', operator: '==', value: selectedSeatId }] : []
  );
  
  const selectedSeat = selectedSeats.length > 0 ? selectedSeats[0] : null;

  // Update form when selectedSeat changes
  useEffect(() => {
    if (selectedSeat) {
      setSeatLabel(selectedSeat.label);
      setSeatType(selectedSeat.type);
      setSeatStatus(selectedSeat.status);
      setAssignedUserId(selectedSeat.assignedTo?.id || null);
      setIsEditing(true);
    } else {
      // Reset form for new seats
      setSeatLabel('');
      setSeatType('desk');
      setSeatStatus('available');
      setAssignedUserId(null);
      setIsEditing(false);
    }
  }, [selectedSeat]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // if (!floorId || !zoneId) return;
    
    try {
      // const floorRef = firestore.collection('floors').doc(floorId);
      // const zoneRef = firestore.collection('zones').doc(zoneId);
      const floorRef = firestore.collection('floors').doc("eE8pu0AbTzD9AmdAFXeu");
      const zoneRef = firestore.collection('zones').doc("HFbOwPEu8DaNCVrYtqcE");
      const seatData: Partial<Seat> = {
        label: seatLabel,
        type: seatType,
        status: seatStatus,
        floorId: floorRef,
        zoneId: zoneRef,
        lastModified: Timestamp.now()
      };
      
      // Add assigned user if selected
      if (assignedUserId) {
        seatData.assignedTo = firestore.collection('users').doc(assignedUserId);
        seatData.status = 'occupied';
      } else if (seatStatus === 'occupied') {
        // If status is occupied but no user is assigned, revert to available
        seatData.status = 'available';
      }
      
      if (isEditing && selectedSeatId) {
        // Update existing seat
        await firestore.collection('seats').doc(selectedSeatId).update(seatData);
      } else {
        // Create new seat
        const seatRef = await firestore.collection('seats').add(seatData);
        
        // Add the seat to the zone's seats array
        await zoneRef.update({
          seats: arrayUnion(seatRef)
        });
      }
      
      // Notify parent component and reset form
      onSeatUpdate();
      if (!isEditing) {
        setSeatLabel('');
        setSeatType('desk');
        setSeatStatus('available');
        setAssignedUserId(null);
      }
    } catch (error) {
      console.error('Error saving seat:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Seat Properties</h3>
      
      {true? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Seat Label</label>
              <input
                type="text"
                value={seatLabel}
                onChange={(e) => setSeatLabel(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g., A1, B2, etc."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Seat Type</label>
              <select
                value={seatType}
                onChange={(e) => setSeatType(e.target.value as SeatType)}
                className="w-full p-2 border rounded"
              >
                <option value="desk">Regular Desk</option>
                <option value="standing_desk">Standing Desk</option>
                <option value="meeting">Meeting Spot</option>
                <option value="phone_booth">Phone Booth</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={seatStatus}
                onChange={(e) => setSeatStatus(e.target.value as SeatStatus)}
                className="w-full p-2 border rounded"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            
            {(seatStatus === 'occupied' || seatStatus === 'reserved') && (
              <div>
                <label className="block text-sm font-medium mb-1">Assigned To</label>
                <select
                  value={assignedUserId || ''}
                  onChange={(e) => setAssignedUserId(e.target.value || null)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.displayName} ({employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-2">
              {isEditing && (
                <button
                  type="button"
                  className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                  onClick={() => {
                    // Reset form
                    setIsEditing(false);
                    setSeatLabel('');
                    setSeatType('desk');
                    setSeatStatus('available');
                    setAssignedUserId(null);
                  }}
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                {isEditing ? 'Update Seat' : 'Add Seat'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="border border-gray-200 rounded p-4 h-64 flex items-center justify-center">
          <p className="text-gray-400 text-center">Select a floor and zone to manage seats</p>
        </div>
      )}
    </div>
  );
};

export default SeatProperties;