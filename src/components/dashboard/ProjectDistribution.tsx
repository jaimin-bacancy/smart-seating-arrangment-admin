import React from 'react';
import ProjectBar from '../ui/ProjectBar';
import { Project } from '../../types';
import { WithId } from '../../types/firebase';

interface ProjectDistributionProps {
  projects: WithId<Project>[];
  totalEmployees: number;
}

const ProjectDistribution: React.FC<ProjectDistributionProps> = ({ 
  projects, 
  totalEmployees 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Project Team Distribution</h3>
      <div className="space-y-4">
        {projects.length > 0 ? (
          projects.map(project => (
            <ProjectBar 
              key={project.id} 
              project={project} 
              totalEmployees={totalEmployees} 
            />
          ))
        ) : (
          <p className="text-gray-400 text-center">No active projects</p>
        )}
      </div>
    </div>
  );
};

export default ProjectDistribution;
