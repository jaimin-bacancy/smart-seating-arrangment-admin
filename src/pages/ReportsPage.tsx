import React, { useState } from 'react';
import useCollection from '../hooks/useCollection';
import { User, Project, Seat } from '../types';

const ReportsPage: React.FC = () => {
  // State for selected report type
  const [reportType, setReportType] = useState<string>('utilization');
  
  // Date range for reports
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Fetch data for reports
  const { documents: users } = useCollection<User>('users');
  const { documents: projects } = useCollection<Project>('projects');
  const { documents: seats } = useCollection<Seat>('seats');
  
  // Report placeholder (in a real app, these would be actual charts)
  const renderReportContent = () => {
    switch (reportType) {
      case 'utilization':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Seat Utilization Report</h3>
            <div className="h-64 border rounded flex items-center justify-center bg-gray-50">
              <p className="text-gray-400">Seat Utilization Chart</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Summary:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Total seats: {seats.length}</li>
                <li>Occupied seats: {seats.filter(s => s.status === 'occupied').length}</li>
                <li>Reserved seats: {seats.filter(s => s.status === 'reserved').length}</li>
                <li>Available seats: {seats.filter(s => s.status === 'available').length}</li>
                <li>Maintenance seats: {seats.filter(s => s.status === 'maintenance').length}</li>
              </ul>
            </div>
          </div>
        );
        
      case 'collaboration':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Team Collaboration Report</h3>
            <div className="h-64 border rounded flex items-center justify-center bg-gray-50">
              <p className="text-gray-400">Team Collaboration Chart</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Key Insights:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cross-team interactions increased by 22% this month</li>
                <li>Highest collaboration: Frontend and Design teams</li>
                <li>Lowest collaboration: Backend and QA teams</li>
                <li>Recommended action: Adjust seating to improve Backend/QA proximity</li>
              </ul>
            </div>
          </div>
        );
        
      case 'project':
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Project Team Distribution</h3>
            <div className="h-64 border rounded flex items-center justify-center bg-gray-50">
              <p className="text-gray-400">Project Distribution Chart</p>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Active Projects:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {projects
                  .filter(p => p.status === 'active')
                  .map(project => (
                    <li key={project.id}>
                      {project.name}: {project.teamMembers?.length || 0} team members
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center text-gray-500">Select a report type</p>
          </div>
        );
    }
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reports & Analytics</h2>
      
      {/* Report Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type:</label>
            <select 
              className="w-full p-2 border rounded"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="utilization">Seat Utilization</option>
              <option value="collaboration">Team Collaboration</option>
              <option value="project">Project Distribution</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Start Date:</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Date:</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>
      
      {/* Report Content */}
      {renderReportContent()}
      
      {/* Export Options */}
      <div className="mt-6 flex justify-end space-x-3">
        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Export as PDF
        </button>
        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Export as CSV
        </button>
        <button className="px-4 py-2 border rounded hover:bg-gray-50">
          Share Report
        </button>
      </div>
    </div>
  );
};

export default ReportsPage;
