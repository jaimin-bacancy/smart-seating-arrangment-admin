import React, { useState } from "react";

// Define types
interface Room {
  id: number;
  room: string;
  seats: number;
}

interface Seat {
  id: number;
  available: boolean;
}

interface Desk {
  topRow: Seat[];
  bottomRow: Seat[];
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

const TeamView: React.FC<{ onClusterPress: () => void }> = ({
  onClusterPress,
}) => {
  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-3">Team Optimization</h3>
      <button
        onClick={onClusterPress}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        AI-Optimized Clusters
      </button>
    </div>
  );
};

// Constants
const rooms: Room[] = [
  { id: 1, room: "1501", seats: 72 },
  { id: 2, room: "1502", seats: 72 },
  { id: 3, room: "1503", seats: 72 },
  { id: 4, room: "1504", seats: 72 },
  { id: 5, room: "1601", seats: 72 },
  { id: 6, room: "1602", seats: 72 },
  { id: 8, room: "1603", seats: 72 },
  { id: 7, room: "1604", seats: 72 },
];

const TOTAL_SEATS = 72;
const SEATS_PER_DESK = 12; // 6 + 6
const DESKS = TOTAL_SEATS / SEATS_PER_DESK;

// Generate desk data
const generateDesks = (): Desk[] => {
  const desks: Desk[] = [];
  let seatNum = 1;
  for (let d = 0; d < DESKS; d++) {
    const topRow: Seat[] = [];
    const bottomRow: Seat[] = [];
    for (let i = 0; i < 6; i++) {
      topRow.push({ id: seatNum, available: false });
      seatNum++;
    }
    for (let i = 0; i < 6; i++) {
      bottomRow.push({ id: seatNum, available: true });
      seatNum++;
    }
    desks.push({ topRow, bottomRow });
  }
  return desks;
};

const FloorPlanEditor: React.FC = () => {
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

  const desks = generateDesks();
  const [isShowModal, setShowModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState(3);

  const handleSeatPress = (seat: Seat) => {
    setSelectedSeat(seat);
    setShowModal(true);
  };

  const currentUserSeatId = 15; // Replace with real user seat ID logic

  const currentUserSeatIds = [5]; // You can change this to a dynamic list or prop

  const getSeatStyle = (seat: Seat): React.CSSProperties => {
    const isCurrentUser = currentUserSeatIds.includes(seat.id);

    if (isCurrentUser) {
      return {
        backgroundColor: "#22c55e", // Tailwind green-500
        color: appTheme.background,
      };
    }

    if (!seat.available) {
      return {
        backgroundColor: appTheme.gray,
        color: appTheme.background,
      };
    }

    return {
      backgroundColor: "transparent",
      border: `2px solid ${appTheme.border}`,
      color: appTheme.text,
    };
  };

  const RenderLayout = () => {
    return (
      <div className="w-full">
        {desks.map((desk, index) => (
          <div key={index} className="mb-4 w-full">
            <div className="flex justify-evenly">
              {desk.topRow.map((seat) => {
                const isCurrentUserSeat = seat.id === currentUserSeatId;
                return (
                  <button
                    key={seat.id}
                    className="w-10 h-8 rounded text-center flex items-center justify-center mx-0.5 transition-colors"
                    style={getSeatStyle(seat)}
                    onClick={() => handleSeatPress(seat)}
                  >
                    <span className="font-bold text-sm">{seat.id}</span>
                  </button>
                );
              })}
            </div>
            <div
              className="my-1.5 border-dashed border-t rounded"
              style={{
                borderColor: appTheme.gray,
              }}
            />
            <div className="flex justify-evenly">
              {desk.bottomRow.map((seat) => {
                const isCurrentUserSeat = seat.id === currentUserSeatId;
                return (
                  <button
                    key={seat.id}
                    className="w-10 h-8 rounded text-center flex items-center justify-center mx-0.5 transition-colors"
                    style={getSeatStyle(seat)}
                    onClick={() => handleSeatPress(seat)}
                  >
                    <span className="font-bold text-sm">{seat.id}</span>
                  </button>
                );
              })}
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
      {isShowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center sm:items-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-lg sm:rounded-lg p-4 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Seat #{selectedSeat?.id}</h3>
              <button
                onClick={() => setShowModal(false)}
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
            <CustomText large>
              Status: {selectedSeat?.available ? "✅ Available" : "❌ Occupied"}
            </CustomText>
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
