import React from 'react';

interface FloorPlanEditorProps {
  onSave: () => void;
  onReset: () => void;
}

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({ onSave, onReset }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold">Floor Plan Editor</h3>
        <div className="space-x-2">
          <button 
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm"
            onClick={onSave}
          >
            Save
          </button>
          <button 
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="border border-gray-200 rounded h-96 flex items-center justify-center bg-gray-50">
        {/* This would be replaced with an actual interactive floor plan editor */}
        <p className="text-gray-400">Interactive Floor Plan Editor</p>
      </div>
    </div>
  );
};

export default FloorPlanEditor;
