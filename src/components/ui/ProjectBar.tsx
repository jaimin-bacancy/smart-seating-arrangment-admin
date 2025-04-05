import React from 'react';
import { Project } from '../../types';

interface ProjectBarProps {
  project: Project;
  totalEmployees: number;
}

const ProjectBar: React.FC<ProjectBarProps> = ({ project, totalEmployees }) => {
  // Calculate percentage of total employees on this project
  const percentage = project.teamMembers?.length 
    ? (project.teamMembers.length / totalEmployees) * 100 
    : 0;

  return (
    <div className="flex items-center mb-3">
      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color || '#4C6EF5' }}></span>
      <span className="w-48">{project.name}</span>
      <div className="flex-grow bg-gray-100 rounded-full h-4">
        <div 
          className="h-4 rounded-full" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: project.color || '#4C6EF5'
          }}
        ></div>
      </div>
      <span className="ml-3 text-gray-600">
        {project.teamMembers?.length || 0} employees
      </span>
    </div>
  );
};

export default ProjectBar;
