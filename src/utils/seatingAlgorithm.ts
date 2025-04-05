import { WithId } from '../types/firebase';
import { User, Project, Seat, Zone, AlgorithmParameters, SeatAssignment } from '../types';
import { firestore } from '../config/firebaseConfig';

interface EmployeeData {
  id: string;
  techSkills: string[];
  department: string;
  projectIds: string[];
  projectPriorities: number[];
  teamMembers: string[];
}

interface SeatData {
  id: string;
  label: string;
  zoneId: string;
  zoneType: string;
  floorId: string;
}

interface ZoneData {
  id: string;
  name: string;
  type: string;
  floorId: string;
}

/**
 * Main function to optimize seating arrangements
 */
export const optimizeSeatingPlan = async (
  employees: WithId<User>[],
  projects: WithId<Project>[],
  availableSeats: WithId<Seat>[],
  zones: WithId<Zone>[],
  params: AlgorithmParameters
): Promise<SeatAssignment[]> => {
  // Convert data to simplified formats for algorithm
  const employeeData = processEmployeeData(employees, projects);
  const seatData = processSeatsData(availableSeats, zones);
  const zoneData = processZonesData(zones);
  
  // Generate assignments
  const assignments = generateAssignments(employeeData, seatData, zoneData, params);
  
  // Convert to Firestore references
  return convertToFirestoreReferences(assignments);
};

/**
 * Process employee data for the algorithm
 */
const processEmployeeData = (
  employees: WithId<User>[], 
  projects: WithId<Project>[]
): EmployeeData[] => {
  return employees.map(employee => {
    // Find projects this employee is assigned to
    const employeeProjects = projects.filter(project => 
      project.teamMembers.some(memberRef => memberRef.id === employee.id)
    );
    
    // Get IDs of teammates from all projects
    const teammates = new Set<string>();
    employeeProjects.forEach(project => {
      project.teamMembers.forEach(memberRef => {
        if (memberRef.id !== employee.id) {
          teammates.add(memberRef.id);
        }
      });
    });
    
    return {
      id: employee.id,
      techSkills: employee.techSkills || [],
      department: employee.department,
      projectIds: employeeProjects.map(p => p.id),
      projectPriorities: employeeProjects.map(p => p.priority),
      teamMembers: Array.from(teammates)
    };
  });
};

/**
 * Process seat data for the algorithm
 */
const processSeatsData = (
  seats: WithId<Seat>[], 
  zones: WithId<Zone>[]
): SeatData[] => {
  return seats.map(seat => {
    // Find the zone for this seat
    const zone = zones.find(z => z.id === seat.zoneId.id);
    
    return {
      id: seat.id,
      label: seat.label,
      zoneId: seat.zoneId.id,
      zoneType: zone ? zone.type : 'unknown',
      floorId: seat.floorId.id
    };
  });
};

/**
 * Process zone data for the algorithm
 */
const processZonesData = (zones: WithId<Zone>[]): ZoneData[] => {
  return zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    type: zone.type,
    floorId: zone.floorId.id
  }));
};

/**
 * Generate seat assignments based on optimization parameters
 */
const generateAssignments = (
  employees: EmployeeData[],
  seats: SeatData[],
  zones: ZoneData[],
  params: AlgorithmParameters
): { userId: string; seatId: string }[] => {
  // Create maps for quick lookups
  const employeeMap = new Map(employees.map(e => [e.id, e]));
  
  // Calculate scores for each employee-seat combination
  let assignments: { userId: string; seatId: string; score: number }[] = [];
  
  for (const employee of employees) {
    for (const seat of seats) {
      const zone = zones.find(z => z.id === seat.zoneId);
      if (!zone) continue;
      
      // Calculate score for this employee-seat combination
      const score = calculateScore(employee, seat, zone, employeeMap, params);
      
      assignments.push({
        userId: employee.id,
        seatId: seat.id,
        score
      });
    }
  }
  
  // Sort by score (highest first)
  assignments.sort((a, b) => b.score - a.score);
  
  // Assign seats (greedy algorithm approach)
  const result: { userId: string; seatId: string }[] = [];
  const assignedEmployees = new Set<string>();
  const assignedSeats = new Set<string>();
  
  for (const assignment of assignments) {
    if (!assignedEmployees.has(assignment.userId) && !assignedSeats.has(assignment.seatId)) {
      result.push({
        userId: assignment.userId,
        seatId: assignment.seatId
      });
      assignedEmployees.add(assignment.userId);
      assignedSeats.add(assignment.seatId);
      
      // Stop once all employees are assigned
      if (assignedEmployees.size === employees.length) break;
    }
  }
  
  return result;
};

/**
 * Calculate score for an employee-seat combination
 */
const calculateScore = (
  employee: EmployeeData,
  seat: SeatData,
  zone: ZoneData,
  employeeMap: Map<string, EmployeeData>,
  params: AlgorithmParameters
): number => {
  let score = 0;
  
  // Team proximity score
  if (params.teamProximityWeight > 0) {
    // Check how many team members are in the same zone
    const teamMembersInSameZone = employee.teamMembers.filter(teamMemberId => {
      const teamMember = employeeMap.get(teamMemberId);
      return teamMember && teamMember.id !== employee.id;
    }).length;
    
    // Normalize and apply weight
    const teamProximityScore = (teamMembersInSameZone / Math.max(1, employee.teamMembers.length)) * 100;
    score += teamProximityScore * (params.teamProximityWeight / 100);
  }
  
  // Tech stack alignment score
  if (params.techStackWeight > 0) {
    // For tech stack alignment, we'd ideally check adjacent seats
    // This is a simplified version
    const techSkillScore = employee.techSkills.length > 0 ? 50 : 0; // Placeholder logic
    score += techSkillScore * (params.techStackWeight / 100);
  }
  
  // Cross-team collaboration score
  if (params.crossTeamWeight > 0) {
    // For cross-team, prefer collaborative zones for employees on multiple projects
    const isCollaborativeZone = zone.type === 'collaboration' || zone.type === 'meeting';
    const isMultiProjectEmployee = employee.projectIds.length > 1;
    
    const crossTeamScore = (isCollaborativeZone && isMultiProjectEmployee) ? 100 : 
                           (isCollaborativeZone || isMultiProjectEmployee) ? 50 : 0;
    
    score += crossTeamScore * (params.crossTeamWeight / 100);
  }
  
  // Project deadline priority score
  if (params.deadlineWeight > 0) {
    // Get the highest priority project
    const highestPriority = Math.max(...employee.projectPriorities, 0);
    // Normalize to 0-100 scale (assuming priority is 1-5)
    const priorityScore = (highestPriority / 5) * 100;
    
    score += priorityScore * (params.deadlineWeight / 100);
  }
  
  return score;
};

/**
 * Convert algorithm output to Firestore references
 */
const convertToFirestoreReferences = (
  assignments: { userId: string; seatId: string }[]
): SeatAssignment[] => {
  return assignments.map(assignment => ({
    userId: firestore.collection('users').doc(assignment.userId),
    seatId: firestore.collection('seats').doc(assignment.seatId),
    reason: 'Assigned by AI optimization algorithm'
  }));
};

/**
 * Calculate optimization score for a seating plan
 */
export const calculateOptimizationScore = (
  assignments: SeatAssignment[],
  employees: WithId<User>[],
  projects: WithId<Project>[],
  seats: WithId<Seat>[],
  zones: WithId<Zone>[],
  params: AlgorithmParameters
): number => {
  const employeeData = processEmployeeData(employees, projects);
  const seatData = processSeatsData(seats, zones);
  const zoneData = processZonesData(zones);
  const employeeMap = new Map(employeeData.map(e => [e.id, e]));
  
  // Create a map of employee to assigned seat
  const seatAssignmentMap = new Map<string, string>();
  assignments.forEach(assignment => {
    seatAssignmentMap.set(assignment.userId.id, assignment.seatId.id);
  });
  
  // Calculate total score
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  for (const employee of employeeData) {
    const seatId = seatAssignmentMap.get(employee.id);
    if (!seatId) continue; // Skip unassigned employees
    
    const seat = seatData.find(s => s.id === seatId);
    if (!seat) continue;
    
    const zone = zoneData.find(z => z.id === seat.zoneId);
    if (!zone) continue;
    
    // Calculate score for this assignment
    const assignmentScore = calculateScore(employee, seat, zone, employeeMap, params);
    totalScore += assignmentScore;
    
    // Maximum possible score would be 100 for each parameter
    maxPossibleScore += 100;
  }
  
  // Calculate percentage score
  const optimizationScore = maxPossibleScore > 0 
    ? (totalScore / maxPossibleScore) * 100 
    : 0;
  
  return Math.round(optimizationScore);
};

export default {
  optimizeSeatingPlan,
  calculateOptimizationScore
};
