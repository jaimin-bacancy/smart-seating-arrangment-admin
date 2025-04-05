import React, { useState, useEffect } from 'react';
import EmployeeTable from '../components/ui/EmployeeTable';
import Pagination from '../components/ui/Pagination';
import useCollection from '../hooks/useCollection';
import { UserService } from '../services/users';
import { User } from '../types';
import { WithId } from '../types/firebase';

const EmployeesPage: React.FC = () => {
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Fetch all users
  const { documents: employees, loading } = useCollection<User>('users');

  // Filter employees based on search term
  useEffect(() => {
    if (employees) {
      const filtered = employees.filter(employee => 
        employee.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
      // Reset to first page when search changes
      setCurrentPage(1);
    }
  }, [employees, searchTerm]);

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Handle employee edit
  const handleEditEmployee = (employee: WithId<User>) => {
    // This would open a modal or navigate to an edit page
    console.log('Edit employee:', employee);
  };

  // Handle employee removal
  const handleRemoveEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        // In a real application, you might want to do a soft delete
        // or handle associated records cleanup
        await UserService.updateUser(employeeId, { 
          // Mark as inactive or similar approach
        });
      } catch (error) {
        console.error('Error removing employee:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Employee Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="px-3 py-2 border rounded w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Add Employee
          </button>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Loading employees...</div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
