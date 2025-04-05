// Type definitions for the Smart Office application
import { FirestoreReference, Timestamp } from './firebase';

export type TabType = 'dashboard' | 'layout' | 'employees' | 'algorithm' | 'reports' | 'profile' | 'notifications';

export type UserRole = 'admin' | 'doe' | 'pm' | 'employee';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  employeeId: string;
  techSkills: string[];
  currentProjects: FirestoreReference[];
  manager?: FirestoreReference;
}

export interface OfficeLayout {
  id: string;
  name: string;
  floors: FirestoreReference[];
  isActive: boolean;
  createdAt: Timestamp;
  modifiedAt: Timestamp;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  layoutId: FirestoreReference;
  zones: FirestoreReference[];
  maxSeats: number;
}

export type ZoneType = 'team_area' | 'meeting' | 'break_room' | 'quiet_area' | 'collaboration';

export interface Zone {
  id: string;
  name: string;
  floorId: FirestoreReference;
  type: ZoneType;
  seats: FirestoreReference[];
  color: string;
}

export type SeatType = 'desk' | 'standing_desk' | 'meeting' | 'phone_booth';
export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Seat {
  id: string;
  label: string;
  floorId: FirestoreReference;
  zoneId: FirestoreReference;
  type: SeatType;
  status: SeatStatus;
  assignedTo?: FirestoreReference;
  lastModified: Timestamp;
}

export type ProjectStatus = 'planning' | 'active' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  priority: number; // 1-5
  teamMembers: FirestoreReference[];
  techStack: string[];
  projectManager: FirestoreReference;
  status: ProjectStatus;
}

export interface SeatAssignment {
  userId: FirestoreReference;
  seatId: FirestoreReference;
  reason: string;
}

export interface AlgorithmParameters {
  teamProximityWeight: number; // 0-100
  techStackWeight: number; // 0-100
  crossTeamWeight: number; // 0-100
  deadlineWeight: number; // 0-100
}

export interface SeatingPlan {
  id: string;
  name: string;
  description: string;
  createdBy: FirestoreReference;
  createdAt: Timestamp;
  isActive: boolean;
  effectiveFrom: Timestamp;
  effectiveTo?: Timestamp;
  assignments: SeatAssignment[];
  algorithmParameters: AlgorithmParameters;
  optimizationScore: number;
}

export type NotificationType = 'seat_change' | 'maintenance' | 'announcement';
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface NotificationAction {
  type: string;
  data: Record<string, any>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Timestamp;
  type: NotificationType;
  priority: NotificationPriority;
  recipients: FirestoreReference[];
  readBy: FirestoreReference[];
  action?: NotificationAction;
}

export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SeatChangeRequest {
  id: string;
  requestedBy: FirestoreReference;
  currentSeatId: FirestoreReference;
  preferredZoneId?: FirestoreReference;
  preferredSeatId?: FirestoreReference;
  reason: string;
  status: ChangeRequestStatus;
  approver?: FirestoreReference;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  notes?: string;
}

// UI Statistics type (for dashboard)
export interface OfficeStats {
  totalEmployees: number;
  occupiedSeats: number;
  availableSeats: number;
  collaborationScore: number;
  utilizationRate: number;
}
