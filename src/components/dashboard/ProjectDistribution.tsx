import React from 'react';
import { Project } from '../../types';
import { WithId } from '../../types/firebase';

interface ProjectDistributionProps {
  projects: WithId<Project>[];
}

const ProjectDistribution: React.FC<ProjectDistributionProps> = ({ projects }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-6">Project Team Distribution</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-gray-100 p-4 rounded shadow-md">
            <h4 className="font-semibold text-lg mb-2">{project.displayName}</h4>
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-medium">Tech Stack:</span> {project.techSkills.join(', ')}
            </p>
            <div>
              <p className="font-medium mb-1">Team Members:</p>
              <ul className="list-disc list-inside text-sm text-gray-800">
                {project.team.map((member) => (
                  <li key={member.id}>{member.displayName}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDistribution;
