import { doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { firestore } from "../../config/firebaseConfig.ts";
import useCollection from "../../hooks/useCollection.ts";
import SeatService from "../../services/seats.ts";

// Define types for Firestore data
interface SeatDocument {
  id: string;
  label: string;
  status: "available" | "occupied" | "reserved" | "maintenance";
  floorId: any; // Firestore reference
  floorName: string;
  zoneId: any; // Firestore reference
  type: string;
  assignedTo?: any; // Optional Firestore reference
  lastModified: any; // Timestamp
}

interface UserDocument {
  id: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  assignedSeat?: any; // Optional Firestore reference
}

// Define local types for rendering
interface Seat {
  id: string;
  label: string;
  available: boolean;
  assignedTo?: string;
  assignedUserName?: string;
}

// Mock components that would be imported in a real application
const CustomText: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  large?: boolean;
  small?: boolean;
}> = ({ children, style, large, small }) => {
  const fontSize = large ? "text-lg" : small ? "text-xs" : "text-sm";
  return (
    <span className={`${fontSize} font-normal`} style={style}>
      {children}
    </span>
  );
};

const FloorPlanEditor: React.FC<{
  selectedFloorId: string;
  currentUserId?: string;
}> = ({ selectedFloorId, currentUserId }) => {
  // Theme colors (simplified for web)
  const appTheme = {
    background: "#fff",
    card: "#f5f5f5",
    text: "#333",
    lightText: "#666",
    themeColor: "#3b82f6", // blue-500
    border: "#e0e0e0",
    gray: "#d1d5db",
    textBorder: "#e5e7eb",
  };

  const [isShowModal, setShowModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [currentUserSeatId, setCurrentUserSeatId] = useState<string | null>(
    null
  );
  const [formattedSeats, setFormattedSeats] = useState<Seat[]>([]);
  const [seatsPerRow] = useState(6);
  const [desks, setDesks] = useState<{ topRow: Seat[]; bottomRow: Seat[] }[]>(
    []
  );
  const [isAssigning, setIsAssigning] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Query to get seats for the selected floor
  const floorQuery = React.useMemo(() => {
    if (!selectedFloorId) return [];
    return [
      {
        field: "floorId",
        operator: "==",
        value: doc(firestore, `floors/${selectedFloorId}`),
      },
    ];
  }, [selectedFloorId]);

  // Query to get all users for dropdown
  const usersQuery = React.useMemo(() => {
    return [];
  }, []);

  const { documents: seatsData, loading: loadingSeats } =
    useCollection<SeatDocument>("seats", floorQuery);

  const { documents: usersData, loading: loadingUsers } =
    useCollection<UserDocument>("users", usersQuery);

  // Process seats data when it changes
  useEffect(() => {
    if (!seatsData || loadingSeats) return;

    // Build map of users for lookup
    const userMap = new Map();
    if (usersData && !loadingUsers) {
      usersData.forEach((user) => {
        userMap.set(user.id, user.displayName);
      });
    }

    // Convert Firestore data to local format
    const processedSeats: Seat[] = seatsData.map((seat) => {
      const assignedToId = seat.assignedTo?.id || null;
      return {
        id: seat.id,
        label: seat.label,
        available: seat.status === "available",
        assignedTo: assignedToId,
        assignedUserName: assignedToId
          ? userMap.get(assignedToId) || "Unknown User"
          : null,
      };
    });

    // Sort seats by their numeric label
    const sortedSeats = [...processedSeats].sort(
      (a, b) => parseInt(a.label) - parseInt(b.label)
    );

    setFormattedSeats(sortedSeats);

    // Find if current user has an assigned seat
    if (currentUserId) {
      const userSeat = processedSeats.find(
        (seat) => seat.assignedTo === currentUserId
      );
      if (userSeat) {
        setCurrentUserSeatId(userSeat.id);
      }
    }
  }, [seatsData, usersData, loadingSeats, loadingUsers, currentUserId]);

  // Format seats into desk layout
  useEffect(() => {
    if (!formattedSeats.length) return;

    const tempDesks = [];
    // Calculate how many complete desks we need (each desk has two rows of 6 seats)
    const totalDesks = Math.ceil(formattedSeats.length / (2 * seatsPerRow));

    for (let d = 0; d < totalDesks; d++) {
      const startIndex = d * 2 * seatsPerRow;
      const topRowEnd = startIndex + seatsPerRow;
      const bottomRowEnd = topRowEnd + seatsPerRow;

      const topRow = formattedSeats.slice(startIndex, topRowEnd);
      const bottomRow = formattedSeats.slice(topRowEnd, bottomRowEnd);

      // Fill in with empty seats if we don't have enough
      const fullTopRow = [...topRow];
      const fullBottomRow = [...bottomRow];

      while (fullTopRow.length < seatsPerRow) {
        fullTopRow.push({
          id: `empty-top-${d}-${fullTopRow.length}`,
          label: "",
          available: false,
        });
      }

      while (fullBottomRow.length < seatsPerRow) {
        fullBottomRow.push({
          id: `empty-bottom-${d}-${fullBottomRow.length}`,
          label: "",
          available: false,
        });
      }

      tempDesks.push({ topRow: fullTopRow, bottomRow: fullBottomRow });
    }

    setDesks(tempDesks);
  }, [formattedSeats, seatsPerRow]);

  const handleSeatPress = (seat: Seat) => {
    if (seat.id.startsWith("empty")) return;

    setSelectedSeat(seat);
    setShowModal(true);
  };

  const handleAssignSeat = async (userId: string) => {
    if (!selectedSeat) return;

    try {
      setIsAssigning(true);
      await SeatService.assignSeatToUser(selectedSeat.id, userId);

      // If assigning to current user, update the currentUserSeatId
      if (userId === currentUserId) {
        setCurrentUserSeatId(selectedSeat.id);
      }

      // Close the modal after successful assignment
      setShowModal(false);

      // Refresh the data (your useCollection hook should handle this automatically)
    } catch (error) {
      console.error("Error assigning seat:", error);
      alert("Failed to assign seat. Please try again.");
    } finally {
      setIsAssigning(false);
      setUserDropdownOpen(false);
    }
  };

  const handleUnassignSeat = async () => {
    if (!selectedSeat) return;

    try {
      setIsAssigning(true);
      await SeatService.unassignSeat(selectedSeat.id);

      // If unassigning the current user's seat, update the currentUserSeatId
      if (selectedSeat.id === currentUserSeatId) {
        setCurrentUserSeatId(null);
      }

      // Close the modal after successful unassignment
      setShowModal(false);

      // Refresh the data (your useCollection hook should handle this automatically)
    } catch (error) {
      console.error("Error unassigning seat:", error);
      alert("Failed to unassign seat. Please try again.");
    } finally {
      setIsAssigning(false);
    }
  };

  const getSeatStyle = (seat: Seat): React.CSSProperties => {
    // If it's an empty placeholder seat
    if (seat.id.startsWith("empty")) {
      return {
        visibility: "hidden",
      };
    }

    // If it's the current user's seat
    if (seat.id === currentUserSeatId) {
      return {
        backgroundColor: "#22c55e", // Tailwind green-500
        color: "#ffffff",
      };
    }

    // If seat is not available
    if (!seat.available) {
      return {
        backgroundColor: appTheme.gray,
        color: appTheme.text,
      };
    }

    // Available seat
    return {
      backgroundColor: "transparent",
      border: `2px solid ${appTheme.border}`,
      color: appTheme.text,
    };
  };

  const RenderLayout = () => {
    if (loadingSeats) {
      return <div className="text-center py-8">Loading seats...</div>;
    }

    if (!desks.length) {
      return (
        <div className="text-center py-8">No seats found for this floor</div>
      );
    }

    return (
      <div className="w-full">
        {desks.map((desk, index) => (
          <div key={index} className="mb-4 w-full">
            <div className="flex justify-evenly">
              {desk.topRow.map((seat) => (
                <button
                  key={seat.id}
                  className="w-10 h-8 rounded text-center flex items-center justify-center mx-0.5 transition-colors"
                  style={getSeatStyle(seat)}
                  onClick={() => handleSeatPress(seat)}
                  disabled={seat.id.startsWith("empty")}
                >
                  <span className="font-bold text-sm">{seat.label}</span>
                </button>
              ))}
            </div>
            <div
              className="my-1.5 border-dashed border-t rounded"
              style={{
                borderColor: appTheme.gray,
              }}
            />
            <div className="flex justify-evenly">
              {desk.bottomRow.map((seat) => (
                <button
                  key={seat.id}
                  className="w-10 h-8 rounded text-center flex items-center justify-center mx-0.5 transition-colors"
                  style={getSeatStyle(seat)}
                  onClick={() => handleSeatPress(seat)}
                  disabled={seat.id.startsWith("empty")}
                >
                  <span className="font-bold text-sm">{seat.label}</span>
                </button>
              ))}
            </div>
            <div className="h-2.5" />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div
        className="p-2.5 rounded-lg"
        style={{ backgroundColor: appTheme.card }}
      >
        <RenderLayout />
      </div>

      {/* Modal */}
      {isShowModal && selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center sm:items-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-lg sm:rounded-lg p-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Seat #{selectedSeat.label}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUserId(null);
                }}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {selectedSeat.assignedUserName && (
                <div className="p-2 bg-gray-100 rounded">
                  <CustomText>
                    Assigned to:{" "}
                    <span className="font-medium">
                      {selectedSeat.assignedUserName}
                    </span>
                  </CustomText>
                </div>
              )}

              {selectedSeat.id === currentUserSeatId && (
                <div className="p-2 bg-green-100 rounded">
                  <CustomText>This is your currently assigned seat</CustomText>
                </div>
              )}

              <div className="pt-2">
                {selectedSeat.available ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select User
                      </label>
                      <div className="relative">
                        <select
                          className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => {
                            const selectedUserId = e.target.value;
                            if (selectedUserId) {
                              setSelectedUserId(selectedUserId);
                              setUserDropdownOpen(false);
                            }
                          }}
                          value={selectedUserId || ""}
                          disabled={isAssigning || loadingUsers}
                        >
                          <option value="">-- Select a user --</option>
                          {!loadingUsers &&
                            usersData &&
                            usersData.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.displayName} - {user.role}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedUserId) {
                          handleAssignSeat(selectedUserId);
                        } else {
                          alert("Please select a user first");
                        }
                      }}
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      disabled={isAssigning || !selectedUserId}
                    >
                      {isAssigning ? "Assigning..." : "Assign to User"}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleUnassignSeat}
                    className="w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    disabled={isAssigning}
                  >
                    {isAssigning ? "Unassigning..." : "Unassign Seat"}
                  </button>
                )}
              </div>
            </div>

            <div className="h-12" />
          </div>
        </div>
      )}

      {/* Add some styles for hiding scrollbar in a clean way */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FloorPlanEditor;
