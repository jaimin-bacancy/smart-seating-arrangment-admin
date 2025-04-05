import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { WithId } from '../../types/firebase';
import useCollection from '../../hooks/useCollection';
import { Project } from '../../types';

interface EmployeeFormProps {
  employee?: WithId<User>;
  onSubmit: (employeeData: Partial<User>) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  onCancel
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<User>>({
    displayName: '',
    email: '',
    role: 'employee' as UserRole,
    department: '',
    employeeId: '',
    techSkills: [],
    currentProjects: []
  });

  // Fetch active projects for selection
  const { documents: projects } = useCollection<Project>(
    'projects',
    [{ field: 'status', operator: '==', value: 'active' }]
  );

  // Fetch potential managers (PMs or DOEs)
  const { documents: potentialManagers } = useCollection<User>(
    'users',
    [{ field: 'role', operator: 'in', value: ['pm', 'doe'] }]
  );

  // Set initial form data if editing an existing employee
  useEffect(() => {
    if (employee) {
      setFormData({
        displayName: employee.displayName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        employeeId: employee.employeeId,
        techSkills: [...employee.techSkills],
        currentProjects: [...employee.currentProjects],
        manager: employee.manager
      });
    }
  }, [employee]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle tech skills selection
  const handleTechSkillChange = (skill: string) => {
    setFormData(prev => {
      const skills = prev.techSkills || [];
      if (skills.includes(skill)) {
        return { ...prev, techSkills: skills.filter(s => s !== skill) };
      } else {
        return { ...prev, techSkills: [...skills, skill] };
      }
    });
  };

  // Handle project selection
  const handleProjectChange = (projectId: string) => {
    setFormData(prev => {
      const currentProjects = prev.currentProjects || [];
      const projectExists = currentProjects.some(p => p.id === projectId);
      
      if (projectExists) {
        return { 
          ...prev, 
          currentProjects: currentProjects.filter(p => p.id !== projectId) 
        };
      } else {
        return { 
          ...prev, 
          currentProjects: [...currentProjects, { id: projectId }] 
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Common tech skills (in a real app, these might be fetched from a config)
  const commonTechSkills = [
    'React', 'Angular', 'Vue', 'Node.js', 'Python', 
    'Java', 'C#', '.NET', 'AWS', 'Azure', 'DevOps',
    'UI/UX', 'Product Management', 'Scrum Master'
  ];

  // Departments
  const departments = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
    'Customer Support', 'HR', 'Finance', 'Operations'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={formData.role || 'employee'}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="employee">Employee</option>
                <option value="pm">Project Manager</option>
                <option value="doe">Department Head</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <select
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Manager</label>
              <select
                name="manager"
                value={formData.manager?.id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  manager: e.target.value ? { id: e.target.value } : undefined 
                }))}
                className="w-full p-2 border rounded"
              >
                <option value="">No Manager</option>
                {potentialManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>
                    {manager.displayName} ({manager.role === 'pm' ? 'PM' : 'DOE'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Skills and Projects */}
        <div>
          <h3 className="text-lg font-medium mb-4">Skills & Projects</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tech Skills</label>
              <div className="border rounded p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {commonTechSkills.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skill-${index}`}
                        checked={(formData.techSkills || []).includes(skill)}
                        onChange={() => handleTechSkillChange(skill)}
                        className="mr-2"
                      />
                      <label htmlFor={`skill-${index}`} className="text-sm">
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Assigned Projects</label>
              <div className="border rounded p-3 max-h-40 overflow-y-auto">
                {projects.length > 0 ? (
                  <div className="space-y-2">
                    {projects.map(project => (
                      <div key={project.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`project-${project.id}`}
                          checked={(formData.currentProjects || []).some(p => p.id === project.id)}
                          onChange={() => handleProjectChange(project.id)}
                          className="mr-2"
                        />
                        <label htmlFor={`project-${project.id}`} className="text-sm">
                          {project.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No active projects available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#E7873C] text-white rounded hover:bg-blue-700"
        >
          {employee ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
