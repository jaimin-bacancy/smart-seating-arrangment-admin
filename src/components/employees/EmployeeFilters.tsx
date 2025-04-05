import React from 'react';
import useCollection from '../../hooks/useCollection';
import { Project } from '../../types';
import { projects } from '../../utils/projects';

interface EmployeeFiltersProps {
  departments: string[];
  selectedDepartment: string;
  selectedProject: string;
  techSkillFilter: string;
  onDepartmentChange: (department: string) => void;
  onProjectChange: (project: string) => void;
  onTechSkillChange: (skill: string) => void;
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  departments,
  selectedDepartment,
  selectedProject,
  techSkillFilter,
  onDepartmentChange,
  onProjectChange,
  onTechSkillChange
}) => {
  // Fetch all active projects

  // Common tech skills (in a real app, these might be fetched from a config)
  const commonTechSkills = [
    'React', 'Angular', 'Vue', 'Node.js', 'Python', 
    'Java', 'C#', '.NET', 'AWS', 'Azure', 'DevOps',
    'UI/UX', 'Product Management', 'Scrum Master'
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="font-bold mb-3">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Project</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedProject}
            onChange={(e) => onProjectChange(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.displayName}</option>
            ))}
          </select>
        </div>
        
        {/* Tech Skills Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Tech Skills</label>
          <select 
            className="w-full p-2 border rounded"
            value={techSkillFilter}
            onChange={(e) => onTechSkillChange(e.target.value)}
          >
            <option value="">All Skills</option>
            {commonTechSkills.map((skill, index) => (
              <option key={index} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFilters;
