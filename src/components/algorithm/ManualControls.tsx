import React from 'react';

interface ManualControlsProps {
  onRunOptimization: () => void;
  onResetParams: () => void;
  onSaveConfig: () => void;
  isRunning: boolean;
}

const ManualControls: React.FC<ManualControlsProps> = ({
  onRunOptimization,
  onResetParams,
  onSaveConfig,
  isRunning
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Manual Controls</h3>
      <div className="space-y-4">
        <button 
          className={`w-full py-2 ${
            isRunning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#E7873C] hover:bg-blue-700'
          } text-white rounded font-medium`}
          onClick={onRunOptimization}
          disabled={isRunning}
        >
          {isRunning ? 'Optimization Running...' : 'Run Optimization Now'}
        </button>
        <button 
          className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50"
          onClick={onResetParams}
          disabled={isRunning}
        >
          Reset to Default Parameters
        </button>
        <button 
          className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50"
          onClick={onSaveConfig}
          disabled={isRunning}
        >
          Save as New Configuration
        </button>
      </div>
    </div>
  );
};

export default ManualControls;
