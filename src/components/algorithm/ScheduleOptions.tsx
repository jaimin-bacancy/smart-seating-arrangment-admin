import React from 'react';

interface ScheduleOptionsProps {
  autoRun: boolean;
  frequency: string;
  onAutoRunChange: (autoRun: boolean) => void;
  onFrequencyChange: (frequency: string) => void;
}

const ScheduleOptions: React.FC<ScheduleOptionsProps> = ({
  autoRun,
  frequency,
  onAutoRunChange,
  onFrequencyChange
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Scheduling</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="auto-run" 
            className="mr-2"
            checked={autoRun}
            onChange={(e) => onAutoRunChange(e.target.checked)}
          />
          <label htmlFor="auto-run">Run optimization automatically</label>
        </div>
        
        {autoRun && (
          <div className="pl-6">
            <label className="block text-sm mb-1">Frequency</label>
            <select 
              className="w-full p-2 border rounded"
              value={frequency}
              onChange={(e) => onFrequencyChange(e.target.value)}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="milestone">On project milestones</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleOptions;
