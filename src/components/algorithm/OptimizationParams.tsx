import React from 'react';
import { AlgorithmParameters } from '../../types';

interface OptimizationParamsProps {
  params: AlgorithmParameters;
  onChange: (params: AlgorithmParameters) => void;
}

const OptimizationParams: React.FC<OptimizationParamsProps> = ({ params, onChange }) => {
  // Handle slider changes
  const handleChange = (paramName: keyof AlgorithmParameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onChange({
      ...params,
      [paramName]: value
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="font-bold mb-4">Optimization Parameters</h3>
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">Team Proximity Weight</label>
            <span className="text-sm text-gray-500">{params.teamProximityWeight}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={params.teamProximityWeight} 
            onChange={handleChange('teamProximityWeight')} 
            className="w-full" 
          />
          <p className="text-xs text-gray-500 mt-1">
            Prioritize seating team members close to each other
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">Technical Stack Alignment</label>
            <span className="text-sm text-gray-500">{params.techStackWeight}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={params.techStackWeight} 
            onChange={handleChange('techStackWeight')} 
            className="w-full" 
          />
          <p className="text-xs text-gray-500 mt-1">
            Seat employees with similar tech skills together
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">Cross-Team Collaboration</label>
            <span className="text-sm text-gray-500">{params.crossTeamWeight}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={params.crossTeamWeight} 
            onChange={handleChange('crossTeamWeight')} 
            className="w-full" 
          />
          <p className="text-xs text-gray-500 mt-1">
            Encourage interaction between different teams
          </p>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">Project Deadline Priority</label>
            <span className="text-sm text-gray-500">{params.deadlineWeight}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={params.deadlineWeight} 
            onChange={handleChange('deadlineWeight')} 
            className="w-full" 
          />
          <p className="text-xs text-gray-500 mt-1">
            Give higher priority to teams with approaching deadlines
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationParams;
