import React, { useState, useEffect } from 'react';
import EmployeeTable from '../ui/EmployeeTable';
import Pagination from '../ui/Pagination';
import SearchInput from '../ui/SearchInput';
import EmployeeFilters from './EmployeeFilters';
import { User } from '../../types';
import { WithId } from '../../types/firebase';
import { doc, getDoc } from 'firebase/firestore';
interface EmployeeListProps {
  employees: WithId<User>[];
  loading: boolean;
  onEdit: (employee: WithId<User>) => void;
  onRemove: (employeeId: string) => void;
  onAddNew: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  loading,
  onEdit,
  onRemove,
  onAddNew
}) => {
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredEmployees, setFilteredEmployees] = useState<WithId<User>[]>([]);
  
  // State for filters
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [techSkillFilter, setTechSkillFilter] = useState('');

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
          employee.displayName.toLowerCase().includes(search) ||
          employee.email.toLowerCase().includes(search) ||
          employee.employeeId.toLowerCase().includes(search)
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
          employee.currentProjects.some(project => project.id === selectedProject)
        );
      }
      
      // Apply tech skill filter
      if (techSkillFilter) {
        filtered = filtered.filter(employee => 
          employee.techSkills.includes(techSkillFilter)
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

  return (
    <div>
      {/* Search and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <SearchInput 
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search employees..."
        />
        <button 
          className="px-4 py-2 bg-[#E7873C] text-white rounded hover:bg-blue-700"
          onClick={onAddNew}
        >
          Add Employee
        </button>
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
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <EmployeeTable 
              employees={currentEmployees}
              onEdit={onEdit}
              onRemove={onRemove}
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

export default EmployeeList;
