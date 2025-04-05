import { FileCheck, LayoutGrid, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import OfficeLayoutMap from '../components/dashboard/OfficeLayoutMap';
import OfficeStats from '../components/dashboard/OfficeStats';
import ProjectDistribution from '../components/dashboard/ProjectDistribution';
import { useUI } from '../contexts/UIContext';
import useCollection from '../hooks/useCollection';
import { Project, Seat, User } from '../types';

const Dashboard: React.FC = () => {
  const [officeStats, setOfficeStats] = useState({
    totalEmployees: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    collaborationScore: 0,
    utilizationRate: 0,
  });

  // Fetch users, projects and seats
  const { documents: users, loading: loadingUsers } = useCollection<User>('users');
 
  const { documents: seats, loading: loadingSeats } = useCollection<Seat>('seats');

  const { documents: projects } = useCollection<Project>(
    'projects', 
    [{ field: 'status', operator: '==', value: 'active' }]
  );

  // Calculate statistics
  useEffect(() => {
    if (users.length && !loadingUsers) {
      const totalEmployees = users.length;
      const occupiedSeats = seats.filter(seat => 
        seat.status === 'occupied' || seat.status === 'reserved'
      ).length;
      const availableSeats = seats.filter(seat => 
        seat.status === 'available'
      ).length;
      
      // Calculate utilization rate
      const totalUsableSeats = occupiedSeats + availableSeats;
      const utilizationRate = totalUsableSeats > 0 
        ? Math.round((occupiedSeats / totalUsableSeats) * 100) 
        : 0;
      
      // For collaboration score, this would typically be a more complex calculation
      // This is a simplified placeholder
      const collaborationScore = 87; // Placeholder value
      
      setOfficeStats({
        totalEmployees,
        occupiedSeats,
        availableSeats,
        collaborationScore,
        utilizationRate
      });
    }
  }, [users, seats, loadingUsers, loadingSeats]);

  const isLoading = loadingUsers || loadingSeats;
  const isEmpty = !isLoading && users.length === 0 && projects.length === 0 && seats.length === 0;

  return (
    <div className="p-6 pt-0">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Welcome to Smart Office!</h3>
          <p className="text-gray-500 mb-6">
            Your database is currently empty. Initialize with demo data to explore the features.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="border rounded-lg p-6 text-center">
              <Users className="h-10 w-10 mx-auto mb-4 text-blue-600" />
              <h4 className="font-medium mb-2">Employees</h4>
              <p className="text-gray-500 text-sm">Create employee profiles with roles and skills</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <LayoutGrid className="h-10 w-10 mx-auto mb-4 text-green-600" />
              <h4 className="font-medium mb-2">Office Layout</h4>
              <p className="text-gray-500 text-sm">Set up office floors, zones, and seats</p>
            </div>
            
            <div className="border rounded-lg p-6 text-center">
              <FileCheck className="h-10 w-10 mx-auto mb-4 text-purple-600" />
              <h4 className="font-medium mb-2">Projects</h4>
              <p className="text-gray-500 text-sm">Manage projects and team assignments</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <OfficeStats stats={officeStats} />
          
          {/* Office Layout Preview */}
          <OfficeLayoutMap />
          
          {/* Project Distribution */}
          <ProjectDistribution 
            projects={projects} 
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;