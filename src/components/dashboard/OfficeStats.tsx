import React from 'react';
import StatCard from '../ui/StatCard';
import { OfficeStats as OfficeStatsType } from '../../types';

interface OfficeStatsProps {
  stats: OfficeStatsType;
}

const OfficeStats: React.FC<OfficeStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 pt-4">
      <StatCard title="Total Employees" value={stats.totalEmployees} />
      <StatCard title="Occupied Seats" value={stats.occupiedSeats} />
      <StatCard title="Available Seats" value={stats.availableSeats} />
      {/* <StatCard title="Collaboration Score" value={stats.collaborationScore} suffix="%" /> */}
    </div>
  );
};

export default OfficeStats;
