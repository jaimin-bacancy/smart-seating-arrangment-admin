import React, { useState, useEffect } from 'react';
import EmployeeTable from '../components/ui/EmployeeTable';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import EmployeeFilters from '../components/employees/EmployeeFilters';
import AddEmployeeModal from '../components/employees/AddEmployeeModal';
import useCollection from '../hooks/useCollection';
import { UserService } from '../services/users';
import { User } from '../types';
import { WithId } from '../types/firebase';
import { useUI } from '../contexts/UIContext';

const EmployeesPage: React.FC = () => {
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredEmployees, setFilteredEmployees] = useState<WithId<User>[]>([]);
  
  // State for filters
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [techSkillFilter, setTechSkillFilter] = useState('');
  
  // UI context for modals
  const { openModal, showToast } = useUI();

  // Fetch all users
  const { documents: employees, loading } = useCollection<User>('users');

  // Get unique departments from employees
  const departments = [...new Set(employees.map(emp => emp.department))];

  // Filter employees based on search term and filters
  useEffect(() => {
    if (employees) {
      let filtered = [...employees];
      
      // Apply search term filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(employee => 
          employee.displayName?.toLowerCase().includes(search) ||
          employee.email?.toLowerCase().includes(search) ||
          employee.employeeId?.toLowerCase().includes(search)
        );
      }
      
      // Apply department filter
      if (selectedDepartment) {
        filtered = filtered.filter(employee => 
          employee.department === selectedDepartment
        );
      }
      
      // Apply project filter
      if (selectedProject) {
        filtered = filtered.filter(employee => 
          employee.currentProjects?.some(project => project.id === selectedProject)
        );
      }
      
      // Apply tech skill filter
      if (techSkillFilter) {
        filtered = filtered.filter(employee => 
          employee.techSkills?.includes(techSkillFilter)
        );
      }
      
      setFilteredEmployees(filtered);
      // Reset to first page when filters change
      setCurrentPage(1);
    }
  }, [employees, searchTerm, selectedDepartment, selectedProject, techSkillFilter]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Handle employee edit
  const handleEditEmployee = (employee: WithId<User>) => {
    // This would open a modal with the employee form pre-filled
    openModal(
      `Edit Employee: ${employee.displayName}`,
      <div className="p-4">
        <p>Edit employee form would go here.</p>
        <p>Employee ID: {employee.id}</p>
      </div>
    );
  };

  // Handle employee removal
  const handleRemoveEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        // In a real application, you would perform a soft delete
        await UserService.updateUser(employeeId, { 
          // Set an 'active' flag to false or similar approach
        });
        
        showToast('Employee removed successfully', 'success');
      } catch (error) {
        // console.error('Error removing employee:', error);
        showToast('Failed to remove employee', 'error');
      }
    }
  };
  
  // Handle add employee button click
  const handleAddEmployee = () => {
    console.log('Add new employee button clicked');
    openModal(
      '',
      <AddEmployeeModal 
        onClose={() => {}} // Modal will be closed by the UI context
        onSuccess={() => {
          // Refresh the employee list if needed
          showToast('Employee added successfully', 'success');
        }}
      />
    );
  };

  return (
    <div className="p-4">      
      <div className="flex justify-between items-center mb-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search employees..."
          className="w-64"
        />
        <div className="space-x-2">
          <button 
            className="px-4 py-2 bg-[#E7873C] text-white rounded hover:bg-blue-700"
            onClick={handleAddEmployee}
          >
            Add Employee
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <EmployeeFilters 
        departments={departments}
        selectedDepartment={selectedDepartment}
        selectedProject={selectedProject}
        techSkillFilter={techSkillFilter}
        onDepartmentChange={setSelectedDepartment}
        onProjectChange={setSelectedProject}
        onTechSkillChange={setTechSkillFilter}
      />
      
      {/* Employee Table */}
      {loading ? (
        <div className="p-4 text-center">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Employees Found</h3>
          <p className="text-gray-500 mb-6">
            Get started by adding employees to your organization or generate sample data.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              className="px-4 py-2 bg-[#E7873C] text-white rounded hover:bg-blue-700"
              onClick={handleAddEmployee}
            >
              Add First Employee
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <EmployeeTable 
              employees={currentEmployees}
              onEdit={handleEditEmployee}
              onRemove={handleRemoveEmployee}
            />
            
            <Pagination 
              totalItems={filteredEmployees.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
          
          {/* Show count of filtered results */}
          <div className="mt-3 text-sm text-gray-500">
            Showing {currentEmployees.length} of {filteredEmployees.length} employees
            {(filteredEmployees.length !== employees.length) && ` (filtered from ${employees.length} total)`}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeesPage;