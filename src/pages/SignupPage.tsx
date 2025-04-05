import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { useUI } from '../contexts/UIContext';
import { isValidEmail, isValidPassword, getPasswordStrength } from '../utils/validators';
import { UserRole } from '../types';

interface SignupForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  employeeId: string;
  department: string;
  role: UserRole;
}

const SignupPage: React.FC = () => {
  const { showToast } = useUI();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupForm>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: 'Engineering',
    role: 'employee',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Departments
  const departments = [
    'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
    'Customer Support', 'HR', 'Finance', 'Operations'
  ];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate display name
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Full name is required';
    } else if (formData.displayName.length < 3) {
      newErrors.displayName = 'Name must be at least 3 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate employee ID
    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    // Validate department
    if (!formData.department) {
      newErrors.department = 'Department is required';
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
      // Register the user
      await AuthService.registerUser(
        formData.email,
        formData.password,
        {
          displayName: formData.displayName,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          employeeId: formData.employeeId,
          techSkills: [],
          currentProjects: []
        }
      );

      showToast('Account created successfully! Please log in.', 'success');
      
      // Redirect to login page (in a real app, this would navigate to the login page)
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      // console.error('Signup error:', error);
      showToast(error instanceof Error ? error.message : 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get password strength indicator
  const passwordStrength = getPasswordStrength(formData.password);
  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-green-400';
      case 4: return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Display Name */}
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
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : ''}`}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.password ? 'border-red-500' : ''}`}
              placeholder="********"
            />
            {formData.password && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthColor()}`} 
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {passwordStrength.feedback || 'Strong password!'}
                </p>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          
          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="********"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          
          {/* Employee ID */}
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
          
          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.department ? 'border-red-500' : ''}`}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#E7873C] text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
