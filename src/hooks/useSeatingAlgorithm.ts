import { useState } from 'react';
import { firestore } from '../config/firebaseConfig';
import { User, Project, Seat, AlgorithmParameters, SeatAssignment } from '../types';
import { SeatingPlanService } from '../services/seatingPlans';
import { WithId } from '../types/firebase';
import { Timestamp } from 'firebase/firestore';
// Hook for seating optimization algorithm
export const useSeatingAlgorithm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to run the optimization algorithm
  const optimizeSeating = async (
    employees: WithId<User>[],
    projects: WithId<Project>[],
    seats: WithId<Seat>[],
    params: AlgorithmParameters,
    planName: string,
    planDescription: string,
    createdById: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Process employees and their data
      const employeeData = await processEmployeeData(employees, projects);
      
      // Process available seats
      const availableSeats = seats.filter(seat => seat.status === 'available');
      
      // Apply the algorithm to get assignments
      const assignments = generateSeatAssignments(employeeData, availableSeats, params);
      
      // Calculate optimization score
      const optimizationScore = calculateOptimizationScore(assignments, employeeData, params);
      
      // Create the seating plan
      const planId = await createSeatingPlan(
        assignments, 
        params, 
        optimizationScore, 
        planName, 
        planDescription, 
        createdById
      );
      
      setLoading(false);
      return planId;
    } catch (err) {
      // console.error('Error optimizing seating:', err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  };

  // Helper function to process employee data
  const processEmployeeData = async (
    employees: WithId<User>[], 
    projects: WithId<Project>[]
  ) => {
    // Map employees to their projects and tech skills
    const employeeData = employees.map(employee => {
      // Find employee's projects
      const employeeProjects = projects.filter(project => 
        employee.currentProjects.some(projRef => 
          projRef.id === project.id
        )
      );

      return {
        id: employee.id,
        techSkills: employee.techSkills,
        department: employee.department,
        projectIds: employeeProjects.map(p => p.id),
        projectPriorities: employeeProjects.map(p => p.priority)
      };
    });

    return employeeData;
  };

  // Function to generate seat assignments based on algorithm parameters
  const generateSeatAssignments = (
    employeeData: any[], 
    seats: WithId<Seat>[], 
    params: AlgorithmParameters
  ): SeatAssignment[] => {
    // This is a simplified implementation for illustration
    // In a real application, this would be a complex algorithm
    
    const assignments: SeatAssignment[] = [];
    
    // Simplified logic: assign employees to seats
    for (let i = 0; i < Math.min(employeeData.length, seats.length); i++) {
      assignments.push({
        userId: firestore.collection('users').doc(employeeData[i].id),
        seatId: firestore.collection('seats').doc(seats[i].id),
        reason: 'Assigned by optimization algorithm'
      });
    }
    
    return assignments;
  };

  // Function to calculate optimization score
  const calculateOptimizationScore = (
    assignments: SeatAssignment[], 
    employeeData: any[], 
    params: AlgorithmParameters
  ): number => {
    // This is a simplified implementation for illustration
    // In a real application, this would be a complex calculation
    
    // Return a score between 0 and 100
    return 85; // Example score
  };

  // Function to create a seating plan with the assignments
  const createSeatingPlan = async (
    assignments: SeatAssignment[],
    params: AlgorithmParameters,
    optimizationScore: number,
    name: string,
    description: string,
    createdById: string
  ) => {
    const planData = {
      name,
      description,
      createdBy: firestore.collection('users').doc(createdById),
      isActive: false, // Not active until explicitly activated
      effectiveFrom: Timestamp.now(),
      assignments,
      algorithmParameters: params,
      optimizationScore
    };
    
    return SeatingPlanService.createSeatingPlan(planData);
  };

  return { 
    optimizeSeating, 
    loading, 
    error 
  };
};

export default useSeatingAlgorithm;
