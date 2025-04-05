import React, { useEffect, useState } from 'react';
// import StatCard from '../components/ui/StatCard';
import ProjectBar from '../components/ui/ProjectBar';
import useCollection from '../hooks/useCollection';
import { User, Project, Seat, OfficeStats } from '../types';
import { WithId } from '../types/firebase';

const Dashboard: React.FC = () => {
  const [officeStats, setOfficeStats] = useState({
    totalEmployees: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    collaborationScore: 0,
    utilizationRate: 0,
  });

  // Fetch users, projects and seats
  const { documents: users } = useCollection<User>('users');
  const { documents: projects } = useCollection<Project>(
    'projects', 
    [{ field: 'status', operator: '==', value: 'active' }]
  );
  const { documents: seats } = useCollection<Seat>('seats');

  // Calculate statistics
  useEffect(() => {
    if (users.length && seats.length) {
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
  }, [users, seats]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* <StatCard title="Total Employees" value={officeStats.totalEmployees} />
        <StatCard title="Occupied Seats" value={officeStats.occupiedSeats} />
        <StatCard title="Available Seats" value={officeStats.availableSeats} />
        <StatCard title="Collaboration Score" value={officeStats.collaborationScore} suffix="%" /> */}
      </div>
    </div>
  );
};

export default Dashboard;