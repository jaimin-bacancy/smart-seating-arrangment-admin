
import React, { useState } from 'react';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/users';
import { User, UserRole } from '../../types';
import { useUI } from '../../contexts/UIContext';
import { isValidEmail } from '../../utils/validators';

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onClose, onSuccess }) => {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: 'SmartOffice123', // Default password that employee will change upon first login
    role: 'employee' as UserRole,
    department: 'Engineering',
    employeeId: '',
    techSkills: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Departments
  const departments = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
    'Customer Support', 'HR', 'Finance', 'Operations'
  ];

  // Common tech skills
  const commonTechSkills = [
    'React', 'Angular', 'Vue', 'Node.js', 'Python', 
    'Java', 'C#', '.NET', 'AWS', 'Azure', 'DevOps',
    'UI/UX', 'Product Management', 'Scrum Master'
  ];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle tech skill toggle
  const handleSkillToggle = (skill: string) => {
    setFormData(prev => {
      const skills = [...prev.techSkills];
      
      if (skills.includes(skill)) {
        return {
          ...prev,
          techSkills: skills.filter(s => s !== skill)
        };
      } else {
        return {
          ...prev,
          techSkills: [...skills, skill]
        };
      }
    });
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Extract user data
      const userData: Omit<User, 'id'> = {
        displayName: formData.displayName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        employeeId: formData.employeeId,
        techSkills: formData.techSkills,
        currentProjects: []
      };
      
      // Register the user
      await AuthService.registerUser(formData.email, formData.password, userData);
      
      showToast('Employee added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error);
      showToast(error instanceof Error ? error.message : 'Failed to add employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-medium mb-4">Add New Employee</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <h3 className="font-medium text-sm text-gray-500 mb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.displayName ? 'border-red-500' : ''}`}
                  placeholder="John Doe"
                />
                {errors.displayName && (
                  <p className="text-red-500 text-xs mt-1">{errors.displayName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.employeeId ? 'border-red-500' : ''}`}
                  placeholder="EMP-12345"
                />
                {errors.employeeId && (
                  <p className="text-red-500 text-xs mt-1">{errors.employeeId}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="employee">Employee</option>
                  <option value="pm">Project Manager</option>
                  <option value="doe">Department Head</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Default Password
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.password}
                  className="w-full p-2 border rounded bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Employee will be prompted to change on first login
                </p>
              </div>
            </div>
          </div>
          
          {/* Tech Skills */}
          <div>
            <h3 className="font-medium text-sm text-gray-500 mb-3">Technical Skills</h3>
            
            <div className="border rounded p-3 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {commonTechSkills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`skill-${index}`}
                      checked={formData.techSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
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
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEmployeeModal;
